import * as XLSX from "xlsx";
import type { ScheduleEventDraft } from "../types/schedule";
import { toDateKey } from "./calendar";

// Column order for both the downloadable template and any export — keep
// these two in sync, since an exported file should re-import cleanly.
const COLUMNS = ["제목", "시작일", "종료일", "시작시간", "종료시간", "강의장소", "교수/강사", "비고"] as const;

const EXAMPLE_ROWS = [
	["공통(교양)", "2026-10-06", "2026-10-06", "10:00", "13:00", "광양 커뮤니티센터", "홍길동 교수", ""],
	// 같은 과목이 여러 날짜에 반복될 때는 시작일 칸에 콤마로 구분해 날짜를
	// 나열하면 한 행으로 여러 일정을 한 번에 등록할 수 있다 (종료일은 무시됨).
	// 시작시간/종료시간도 같은 개수로 콤마 나열하면 날짜마다 다른 시간을
	// 지정할 수 있고, 하나만 적으면 모든 날짜에 그 시간이 똑같이 적용된다.
	[
		"AI와 코딩",
		"2026-09-10, 2026-09-17, 2026-09-21",
		"",
		"14:00, 10:00, 18:00",
		"17:00, 13:00, 21:00",
		"국립순천대학교",
		"김철수 교수",
		"같은 제목으로 여러 날짜(시간도 각각)를 한 번에 등록하려면 이렇게 콤마로 나열하세요",
	],
];

function draftToRow(draft: ScheduleEventDraft): (string | undefined)[] {
	return [
		draft.title,
		draft.startDate,
		draft.endDate,
		draft.startTime,
		draft.endTime,
		draft.location,
		draft.instructor,
		draft.memo,
	];
}

function buildWorkbook(rows: (string | undefined)[][]) {
	const sheet = XLSX.utils.aoa_to_sheet([[...COLUMNS], ...rows]);
	sheet["!cols"] = [
		{ wch: 20 }, // 제목
		{ wch: 12 }, // 시작일
		{ wch: 12 }, // 종료일
		{ wch: 8 }, // 시작시간
		{ wch: 8 }, // 종료시간
		{ wch: 20 }, // 강의장소
		{ wch: 14 }, // 교수/강사
		{ wch: 24 }, // 비고
	];
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, "일정");
	return workbook;
}

export function downloadScheduleTemplate(cohortLabel: string) {
	const workbook = buildWorkbook(EXAMPLE_ROWS);
	XLSX.writeFile(workbook, `일정_양식_${cohortLabel}.xlsx`);
}

export function exportScheduleToExcel(events: ScheduleEventDraft[], cohortLabel: string) {
	const workbook = buildWorkbook(events.map(draftToRow));
	XLSX.writeFile(workbook, `일정_${cohortLabel}.xlsx`);
}

// A date/time cell comes back as a JS Date when the workbook cell is
// formatted as one (we read with cellDates:true), or as plain text
// otherwise — admins pasting free-form values is the common case.
function cellToDateKey(value: unknown): string | null {
	if (value instanceof Date) return toDateKey(value);
	if (typeof value === "string") {
		const trimmed = value.trim().replaceAll(".", "-").replaceAll("/", "-");
		return /^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)
			? trimmed
					.split("-")
					.map((part, i) => (i === 0 ? part : part.padStart(2, "0")))
					.join("-")
			: null;
	}
	return null;
}

// Lets one row register the same class on several non-contiguous dates
// (e.g. "AI와 코딩" meeting 9/10, 9/17, 9/21) instead of needing one row
// per date — split the 시작일 cell on commas/newlines/Korean-comma and
// parse each piece as its own date.
function cellToDateKeys(value: unknown): string[] {
	if (value instanceof Date) {
		const key = toDateKey(value);
		return [key];
	}
	if (typeof value === "string") {
		return value
			.split(/[,\n、]+/)
			.map((token) => cellToDateKey(token))
			.filter((key): key is string => key !== null);
	}
	return [];
}

function cellToTime(value: unknown): string | undefined {
	if (value instanceof Date) {
		return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
	}
	if (typeof value === "number") {
		// Excel time-only cell that cellDates couldn't resolve to a Date —
		// it's a day-fraction (0.5 == 12:00).
		const totalMinutes = Math.round(value * 24 * 60);
		const h = Math.floor(totalMinutes / 60) % 24;
		const m = totalMinutes % 60;
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		return /^\d{1,2}:\d{2}$/.test(trimmed) ? trimmed.padStart(5, "0") : trimmed || undefined;
	}
	return undefined;
}

// Companion to cellToDateKeys — a multi-date row rarely repeats at the same
// hour every time, so 시작시간/종료시간 can hold their own comma-separated
// list lined up with the dates. A single value still applies to every date
// (the common case where the time really doesn't change).
function cellToTimeList(value: unknown): (string | undefined)[] {
	if (value instanceof Date || typeof value === "number") {
		return [cellToTime(value)];
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return [];
		return trimmed.split(/[,\n、]+/).map((token) => cellToTime(token));
	}
	return [];
}

function cellToText(value: unknown): string | undefined {
	if (value === null || value === undefined) return undefined;
	const text = String(value).trim();
	return text || undefined;
}

export interface ParsedScheduleImport {
	drafts: ScheduleEventDraft[];
	errors: string[];
}

export async function parseScheduleExcel(file: File, cohortId: string): Promise<ParsedScheduleImport> {
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

	const drafts: ScheduleEventDraft[] = [];
	const errors: string[] = [];

	rows.forEach((row, index) => {
		const rowNum = index + 2; // header is row 1
		const title = cellToText(row["제목"]);
		if (!title) {
			errors.push(`${rowNum}행: 제목이 비어 있어 건너뜁니다.`);
			return;
		}

		const dateKeys = cellToDateKeys(row["시작일"]);
		if (dateKeys.length === 0) {
			errors.push(`${rowNum}행: 시작일 형식을 읽을 수 없어 건너뜁니다 (예: 2026-10-06).`);
			return;
		}

		const common = {
			cohortId,
			title,
			location: cellToText(row["강의장소"]),
			instructor: cellToText(row["교수/강사"]),
			memo: cellToText(row["비고"]),
		};

		if (dateKeys.length === 1) {
			// A single date — 종료일 still means what it always has (a
			// range), including a blank cell falling back to the start date.
			const endDate = cellToDateKey(row["종료일"]) ?? dateKeys[0];
			drafts.push({
				...common,
				startDate: dateKeys[0],
				endDate,
				startTime: cellToTime(row["시작시간"]),
				endTime: cellToTime(row["종료시간"]),
			});
		} else {
			// Several comma-separated dates in one row — each becomes its
			// own single-day event with the same content; 종료일 doesn't
			// apply to a set of discrete dates, so it's ignored here. Times
			// line up with the dates by position; if only one time was
			// given, it's reused for every date.
			const startTimes = cellToTimeList(row["시작시간"]);
			const endTimes = cellToTimeList(row["종료시간"]);
			dateKeys.forEach((date, i) => {
				drafts.push({
					...common,
					startDate: date,
					endDate: date,
					startTime: startTimes.length === dateKeys.length ? startTimes[i] : startTimes[0],
					endTime: endTimes.length === dateKeys.length ? endTimes[i] : endTimes[0],
				});
			});
		}
	});

	return { drafts, errors };
}
