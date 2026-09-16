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
