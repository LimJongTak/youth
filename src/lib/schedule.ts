import { isDateInRange } from "./calendar";
import type { ScheduleEvent } from "../types/schedule";

// 일정(Schedule) 관련 표시용 유틸 — 공개 사이트 일정 탭, 홈 미리보기,
// 관리자 일정 관리 화면에서 공용으로 사용.

/** 캘린더에 표시할 일정 시간 문구: 수업이면 시간 범위, 시간이 없으면
 * "종일", 여러 날에 걸친 일정이면 기간 자체(시간 범위는 의미가 없으므로).
 */
export function formatEventTime(event: ScheduleEvent): string {
	if (event.startDate !== event.endDate) return "기간 일정";
	if (event.startTime) return `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`;
	return "종일";
}

// tokens.scss의 $teal과 동일한 값 — 색상을 지정하지 않은 일정(이 필드가
// 생기기 전에 만든 일정 포함)이 캘린더에서 갖는 기본 점 색상.
export const DEFAULT_DOT_COLOR = "#14b8a6";

type ColorableRange = Pick<ScheduleEvent, "startDate" | "endDate" | "color">;

/** 하루치 캘린더 칸에 표시할 색상 점 목록 — 그날에 걸쳐 있는 일정마다 점
 * 하나씩(여러 날짜에 걸친 일정이면 그 기간의 모든 날짜에 점이 찍힘),
 * 각 일정 고유 색으로 표시.
 */
export function getDayDotColors(key: string, events: ColorableRange[]): string[] {
	return events
		.filter((e) => isDateInRange(key, e.startDate, e.endDate))
		.map((e) => e.color || DEFAULT_DOT_COLOR);
}

/** 해당 날짜에 걸쳐 있는 모든 일정을 시작 시간 순으로 반환 — 날짜를
 * 선택했을 때 그날의 상세 일정 목록을 보여주는 데 사용.
 */
export function getDayEvents<T extends ColorableRange & { startTime?: string }>(
	key: string,
	events: T[],
): T[] {
	return events
		.filter((e) => isDateInRange(key, e.startDate, e.endDate))
		.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
}
