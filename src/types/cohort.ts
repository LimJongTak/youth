// 기수(회차) 관련 타입 정의 — 관리자 CMS와 공개 사이트가 공통으로 사용.
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
	/** 구글 폼 등 이 기수의 신청 링크. */
	applyUrl: string;
	/** 공개 사이트에서 기본으로 보여줄/강조할 기수인지 여부. */
	featured: boolean;
	/** 방문자가 일정 탭을 열었을 때 처음 보여줄 기수인지 여부 (`featured`와는 별개). */
	scheduleDefault?: boolean;
}

export const statusLabel: Record<CohortStatus, string> = {
	recruiting: "모집중",
	upcoming: "모집예정",
	closed: "모집마감",
};
