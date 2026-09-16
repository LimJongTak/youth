/** One row on the training calendar — a class session or a general event
 * (OT, field trip, graduation, etc). The same shape covers both: a general
 * event just leaves the class-only fields (time/location/instructor) empty.
 */
export interface ScheduleEvent {
	id: string;
	cohortId: string;
	/** 강의명 for a class, or the event's own title (e.g. "수료식"). */
	title: string;
	/** YYYY-MM-DD */
	startDate: string;
	/** YYYY-MM-DD — same as startDate for a single-day item. */
	endDate: string;
	/** HH:MM, 24h. Omitted for an all-day/multi-day event. */
	startTime?: string;
	endTime?: string;
	location?: string;
	instructor?: string;
	memo?: string;
}

export type ScheduleEventDraft = Omit<ScheduleEvent, "id">;
