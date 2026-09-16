import { isDateInRange, shiftDateKey } from "./calendar";
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

export interface DayIndicator {
	/** Covered by a multi-day event — rendered as a bar, not a dot. */
	hasBar: boolean;
	/** Has a single-day event and no bar already covers it. */
	hasDot: boolean;
	/** The bar should bleed into the grid gap on that side to look
	 * unbroken, because the same event also covers the neighboring day
	 * (and that neighbor is still in the same calendar row). */
	barLeftConnect: boolean;
	barRightConnect: boolean;
}

type RangeLike = Pick<ScheduleEvent, "startDate" | "endDate">;

/** What a calendar cell should show for one day: a continuous bar for a
 * multi-day event (so a 3-day session reads as one span, not three dots),
 * or a plain dot for a single-day one. `weekday` (0=Sun..6=Sat) tells us
 * whether there's a visual neighbor to bridge the bar into — a week's
 * first/last column always caps its own bar segment.
 */
export function getDayIndicator(key: string, weekday: number, events: RangeLike[]): DayIndicator {
	const multiDay = events.filter((e) => e.startDate !== e.endDate);
	const hasBar = multiDay.some((e) => isDateInRange(key, e.startDate, e.endDate));
	const hasDot = !hasBar && events.some((e) => e.startDate === e.endDate && e.startDate === key);

	const barLeftConnect =
		hasBar &&
		weekday !== 0 &&
		multiDay.some((e) => isDateInRange(shiftDateKey(key, -1), e.startDate, e.endDate));
	const barRightConnect =
		hasBar &&
		weekday !== 6 &&
		multiDay.some((e) => isDateInRange(shiftDateKey(key, 1), e.startDate, e.endDate));

	return { hasBar, hasDot, barLeftConnect, barRightConnect };
}
