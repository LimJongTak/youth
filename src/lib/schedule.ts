import { isDateInRange } from "./calendar";
import type { ScheduleEvent } from "../types/schedule";

/** How an event's time reads on the calendar: a time range for a class
 * slot, "종일" for a single day with no time set, or the date span itself
 * for a multi-day event (a time range wouldn't mean much there).
 */
export function formatEventTime(event: ScheduleEvent): string {
	if (event.startDate !== event.endDate) return "기간 일정";
	if (event.startTime) return `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`;
	return "종일";
}

// Matches tokens.scss's $teal — the dot color an event gets when nobody
// picked one (including every event created before this field existed).
export const DEFAULT_DOT_COLOR = "#14b8a6";

type ColorableRange = Pick<ScheduleEvent, "startDate" | "endDate" | "color">;

/** The colored dots a calendar cell should show for one day — one dot per
 * event that covers that date (a multi-day event contributes a dot on
 * every day it spans, not just its first), each tinted with that event's
 * own color.
 */
export function getDayDotColors(key: string, events: ColorableRange[]): string[] {
	return events
		.filter((e) => isDateInRange(key, e.startDate, e.endDate))
		.map((e) => e.color || DEFAULT_DOT_COLOR);
}
