// 과정 관련 타입 정의 — 관리자 CMS와 공개 사이트가 공통으로 사용.
export type CohortStatus = "recruiting" | "upcoming" | "closed";

/** 과정 대표 이미지로 고를 수 있는 기본 디자인. */
export type CoverPreset = "beginner" | "growing" | "advanced" | "general";

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
	/** 과정 카드/상세 대표 이미지로 쓸 기본 디자인. 없으면 과정명으로 자동 선택. */
	coverPreset?: CoverPreset;
	/** 전체 과정 카드 미리보기 이미지(4:3, 800×600 WebP data URL). 있으면 기본 디자인 대신 표시. */
	cardImage?: string;
	/** 과정 상세 화면 상단 이미지(16:10, 1200×750 WebP data URL). 없으면 카드 이미지 → 기본 디자인 순. */
	detailImage?: string;
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

export const coverPresetLabel: Record<CoverPreset, string> = {
	beginner: "Beginner · 입문",
	growing: "Growing · 성장",
	advanced: "Advanced · 심화",
	general: "기본",
};

/** 지정된 기본 디자인이 없으면 과정명(AI Beginner/Growing/Advanced)으로 추정한다. */
export function resolveCoverPreset(cohort: Pick<Cohort, "name" | "generation" | "coverPreset">): CoverPreset {
	if (cohort.coverPreset) return cohort.coverPreset;
	const name = cohortName(cohort).toLowerCase();
	if (name.includes("begin")) return "beginner";
	if (name.includes("grow")) return "growing";
	if (name.includes("adv")) return "advanced";
	return "general";
}
