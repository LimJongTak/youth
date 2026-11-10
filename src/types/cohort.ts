// 과정 관련 타입 정의 — 관리자 CMS와 공개 사이트가 공통으로 사용.
export type CohortStatus = "recruiting" | "upcoming" | "closed";

export interface Cohort {
	id: string;
	/** 과정명 (예: "AI Growing 과정"). 자유 텍스트. */
	name?: string;
	/** @deprecated 예전 숫자 기수(1, 2, …). `name`이 없는 옛 문서 표시용으로만 남겨둔다. */
	generation?: number;
	status: CohortStatus;
	capacity: string;
	recruitPeriod: string;
	eduPeriod: string;
	eduHours: string;
	location: string;
	note?: string;
	/** 구글 폼 등 이 과정의 신청 링크. */
	applyUrl: string;
	/** 공개 사이트에서 기본으로 보여줄/강조할 과정인지 여부. */
	featured: boolean;
	/** 방문자가 일정 탭을 열었을 때 처음 보여줄 과정인지 여부 (`featured`와는 별개). */
	scheduleDefault?: boolean;
}

export const statusLabel: Record<CohortStatus, string> = {
	recruiting: "모집중",
	upcoming: "모집예정",
	closed: "모집마감",
};

/** 화면에 보여줄 과정명 — `name`이 없는 옛 문서는 숫자 기수를 "N기"로 표시. */
export function cohortName(cohort: Pick<Cohort, "name" | "generation">): string {
	const name = cohort.name?.trim();
	if (name) return name;
	return cohort.generation != null ? `${cohort.generation}기` : "";
}

/** 최근에 만든 과정이 먼저 오도록 정렬 (id가 gen-1, gen-2, gen-<타임스탬프> 형태). */
export function compareCohortsNewestFirst(a: Cohort, b: Cohort): number {
	return b.id.localeCompare(a.id, undefined, { numeric: true });
}
