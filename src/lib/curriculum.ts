import { defaultSiteContent } from "../data/defaultSiteContent";
import type { SiteContent, Track, TrackCourse } from "../types/siteContent";
import { cohortName, resolveCoverPreset, type Cohort, type CoverPreset } from "../types/cohort";

// 프로그램 탭(Curriculum)과 홈 과정 상세 화면이 같은 커리큘럼 데이터를
// 쓰도록 모아둔 헬퍼.

/** commonCourse.desc("과목A · 과목B")를 과목 목록으로 분리. */
export function commonSubjects(content: SiteContent): string[] {
	return content.commonCourse.desc
		.split("·")
		.map((subject) => subject.trim())
		.filter(Boolean);
}

/** 트랙 고유 과목 — CMS에 아직 없으면 같은 트랙의 시드 값으로 대체. */
export function trackCourses(track: Track): TrackCourse[] {
	if (track.courses && track.courses.length > 0) return track.courses;
	return defaultSiteContent.tracks.find((t) => t.id === track.id)?.courses ?? [];
}

const PRESET_TRACK: Partial<Record<CoverPreset, Track["id"]>> = {
	beginner: "basic",
	growing: "mid",
	advanced: "adv",
};

/**
 * 과정(기수)에 해당하는 커리큘럼 트랙 — 과정명이 트랙 배지("AI Growing 과정")와
 * 같으면 그 트랙, 아니면 과정 단계(Beginner/Growing/Advanced)로 연결한다.
 */
export function trackForCohort(
	content: SiteContent,
	cohort: Pick<Cohort, "name" | "generation" | "coverPreset">,
): Track | null {
	const name = cohortName(cohort).replace(/\s+/g, "").toLowerCase();
	const byBadge = content.tracks.find((t) => t.badge.replace(/\s+/g, "").toLowerCase() === name);
	if (byBadge) return byBadge;
	const trackId = PRESET_TRACK[resolveCoverPreset(cohort)];
	return content.tracks.find((t) => t.id === trackId) ?? null;
}
