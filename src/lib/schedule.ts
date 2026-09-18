import { isDateInRange, shiftDateKey } from "./calendar";
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
type DisplayableRange = ColorableRange & Pick<ScheduleEvent, "displayStyle">;

/** 하루치 캘린더 칸에 표시할 색상 점 목록 — 그날에 걸쳐 있는 일정마다 점
 * 하나씩(여러 날짜에 걸친 일정이면 그 기간의 모든 날짜에 점이 찍힘),
 * 각 일정 고유 색으로 표시.
 */
export function getDayDotColors(key: string, events: ColorableRange[]): string[] {
	return events
		.filter((e) => isDateInRange(key, e.startDate, e.endDate))
		.map((e) => e.color || DEFAULT_DOT_COLOR);
}

export interface DayBar {
	color: string;
	/** 전날에도 같은 일정이 이어져서, 그 칸과 이어 붙어 보이도록 막대를
	 * 칸 왼쪽 바깥(그리드 간격)까지 늘려야 하는지. */
	leftConnect: boolean;
	rightConnect: boolean;
}

export interface DayIndicators {
	/** "점"으로 표시할 일정 색상 목록. */
	dots: string[];
	/** "막대"로 표시할 일정 목록 — 여러 날짜에 걸친 일정을 이어진 막대로
	 * 보여줄 때 사용(예: 신청기간). */
	bars: DayBar[];
}

/** 하루치 캘린더 칸에 표시할 점/막대 목록 — 일정마다 등록 시 고른
 * displayStyle("dot" 기본값 또는 "bar")에 따라 둘 중 하나로 분류된다.
 * weekday(0=일~6=토)는 막대가 그 주의 첫/마지막 칸인지 판단해, 주가
 * 바뀌는 경계에서는 막대를 끊어 보이게 하기 위함.
 */
export function getDayIndicators(key: string, weekday: number, events: DisplayableRange[]): DayIndicators {
	const todays = events.filter((e) => isDateInRange(key, e.startDate, e.endDate));
	const dots: string[] = [];
	const bars: DayBar[] = [];

	for (const event of todays) {
		const color = event.color || DEFAULT_DOT_COLOR;
		if (event.displayStyle === "bar") {
			bars.push({
				color,
				leftConnect: weekday !== 0 && isDateInRange(shiftDateKey(key, -1), event.startDate, event.endDate),
				rightConnect: weekday !== 6 && isDateInRange(shiftDateKey(key, 1), event.startDate, event.endDate),
			});
		} else {
			dots.push(color);
		}
	}

	return { dots, bars };
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
