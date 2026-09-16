import * as XLSX from "xlsx";
import type { ScheduleEventDraft } from "../types/schedule";
import { toDateKey } from "./calendar";

// Column order for both the downloadable template and any export — keep
// these two in sync, since an exported file should re-import cleanly.
const COLUMNS = ["제목", "시작일", "종료일", "시작시간", "종료시간", "강의장소", "교수/강사", "비고"] as const;

const EXAMPLE_ROW = [
	"공통(교양)",
	"2026-10-06",
	"2026-10-06",
	"10:00",
	"13:00",
	"광양 커뮤니티센터",
	"홍길동 교수",
	"",
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
	const workbook = buildWorkbook([EXAMPLE_ROW]);
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
		const startDate = cellToDateKey(row["시작일"]);
		if (!title) {
			errors.push(`${rowNum}행: 제목이 비어 있어 건너뜁니다.`);
			return;
		}
		if (!startDate) {
			errors.push(`${rowNum}행: 시작일 형식을 읽을 수 없어 건너뜁니다 (예: 2026-10-06).`);
			return;
		}
		const endDate = cellToDateKey(row["종료일"]) ?? startDate;

		drafts.push({
			cohortId,
			title,
			startDate,
			endDate,
			startTime: cellToTime(row["시작시간"]),
			endTime: cellToTime(row["종료시간"]),
			location: cellToText(row["강의장소"]),
			instructor: cellToText(row["교수/강사"]),
			memo: cellToText(row["비고"]),
		});
	});

	return { drafts, errors };
}
