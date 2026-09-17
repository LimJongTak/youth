import * as XLSX from "xlsx";
import type { ScheduleEventDraft } from "../types/schedule";
import { toDateKey } from "./calendar";
import { DEFAULT_DOT_COLOR } from "./schedule";

// 다운로드용 양식과 내보내기 파일 모두에 쓰는 열 순서 — 내보낸 파일을
// 그대로 다시 가져오기 할 수 있어야 하므로 둘을 항상 같게 유지해야 한다.
const COLUMNS = [
	"제목",
	"시작일",
	"종료일",
	"시작시간",
	"종료시간",
	"강의장소",
	"교수/강사",
	"비고",
	"색상",
] as const;

const EXAMPLE_ROWS = [
	[
		"공통(교양)",
		"2026-10-06",
		"2026-10-06",
		"10:00",
		"13:00",
		"광양 커뮤니티센터",
		"홍길동 교수",
		"",
		DEFAULT_DOT_COLOR,
	],
	// 같은 과목이 여러 날짜에 반복될 때는 시작일 칸에 콤마로 구분해 날짜를
	// 나열하면 한 행으로 여러 일정을 한 번에 등록할 수 있다 (종료일은 무시됨).
	// 시작시간/종료시간도 같은 개수로 콤마 나열하면 날짜마다 다른 시간을
	// 지정할 수 있고, 하나만 적으면 모든 날짜에 그 시간이 똑같이 적용된다.
	// 색상은 "#RRGGBB" 형식 하나만 적으면 되고, 비워두면 기본 색상이 된다.
	[
		"AI와 코딩",
		"2026-09-10, 2026-09-17, 2026-09-21",
		"",
		"14:00, 10:00, 18:00",
		"17:00, 13:00, 21:00",
		"국립순천대학교",
		"김철수 교수",
		"같은 제목으로 여러 날짜(시간도 각각)를 한 번에 등록하려면 이렇게 콤마로 나열하세요",
		"#f5a623",
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
		draft.color,
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
		{ wch: 9 }, // 색상
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

// 날짜/시간 셀은 엑셀에서 그 형식으로 지정돼 있으면 JS Date로 들어오고
// (cellDates:true로 읽음), 아니면 일반 텍스트로 들어온다 — 관리자가
// 자유 형식으로 값을 붙여넣는 경우가 흔하다.
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

// 한 행으로 같은 수업을 여러 비연속 날짜에 등록할 수 있게 함(예: "AI와
// 코딩"이 9/10, 9/17, 9/21에 있는 경우) — 날짜마다 행을 따로 만들 필요
// 없이 시작일 셀을 콤마/줄바꿈/한글 쉼표 기준으로 나눠 각각 파싱한다.
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
		// cellDates가 Date로 바꾸지 못한 "시간만 있는" 엑셀 셀 — 하루를 소수로
		// 나타낸 값이다 (0.5 == 12:00).
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

// cellToDateKeys의 짝 — 여러 날짜인 행은 매번 같은 시간이 아닌 경우가
// 많으므로 시작시간/종료시간도 날짜 순서에 맞춰 콤마로 나열할 수 있다.
// 값을 하나만 적으면(시간이 실제로 안 바뀌는 흔한 경우) 모든 날짜에
// 그대로 적용된다.
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

// "#RGB" 또는 "#RRGGBB" 형식(앞의 #은 있어도 없어도 됨)만 허용 — 그 외
// 값은 "지정 안 함"으로 처리해, 오타가 잘못된 CSS 값으로 조용히 새어들지
// 않고 기본 색상으로 대체되게 한다.
function cellToColor(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash) ? withHash : undefined;
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
		const rowNum = index + 2; // 헤더가 1행이므로
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
			color: cellToColor(row["색상"]),
		};

		if (dateKeys.length === 1) {
			// 날짜가 하나면 — 종료일은 원래 의미(기간) 그대로이고, 비어
			// 있으면 시작일과 같은 값으로 처리한다.
			const endDate = cellToDateKey(row["종료일"]) ?? dateKeys[0];
			drafts.push({
				...common,
				startDate: dateKeys[0],
				endDate,
				startTime: cellToTime(row["시작시간"]),
				endTime: cellToTime(row["종료시간"]),
			});
		} else {
			// 한 행에 콤마로 구분된 여러 날짜 — 각각 같은 내용의 하루짜리
			// 일정으로 만들어진다. 종료일은 개별 날짜들에는 적용되는
			// 개념이 아니라서 여기선 무시된다. 시간은 날짜 순서에 맞춰
			// 매칭되고, 하나만 지정됐으면 모든 날짜에 재사용된다.
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
