export type CohortStatus = "recruiting" | "upcoming" | "closed";

export interface Cohort {
	id: string;
	generation: number;
	status: CohortStatus;
	capacity: string;
	recruitPeriod: string;
	eduPeriod: string;
	eduHours: string;
	location: string;
	note?: string;
	/** Google Form (or other) application link for this cohort. */
	applyUrl: string;
	/** Shown as the default/highlighted cohort on the public site. */
	featured: boolean;
	/** Shown first when a visitor opens the 일정 tab (independent of `featured`). */
	scheduleDefault?: boolean;
}

export const statusLabel: Record<CohortStatus, string> = {
	recruiting: "모집중",
	upcoming: "모집예정",
	closed: "모집마감",
};
