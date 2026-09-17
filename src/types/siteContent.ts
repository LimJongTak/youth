// 관리자 CMS(콘텐츠 관리)에서 편집하는 공개 사이트 문구/데이터 타입 모음.
// Firestore의 siteContent 문서 구조와 1:1로 대응된다.
export interface HeroContent {
	titleBefore: string;
	titleEmphasis: string;
	titleAfter: string;
	lead: string;
	stats: { label: string; value: string }[];
}

export interface ChecklistItem {
	title: string;
	desc: string;
	defaultChecked?: boolean;
}

export interface HourChip {
	value: string;
	label: string;
}

export interface TrackCourse {
	name: string;
	/** 예: "전문과정", "몰입과정" — 과목명 옆에 작은 태그로 표시됨. */
	kind: string;
}

export interface Track {
	id: "basic" | "mid" | "adv";
	tabLabel: string;
	badge: string;
	badgeClass: string;
	title: string;
	subtitle: string;
	hours: HourChip[];
	total: string;
	/** 이 트랙만의 과목 목록 — "자세히" 상세 카드에 표시됨 (공통과정 과목은
	 * `commonCourse.desc`에서 파싱해 함께 보여줌). */
	courses: TrackCourse[];
}

export interface CommonCourse {
	title: string;
	desc: string;
}

export interface BenefitCard {
	icon: string;
	title: string;
	items: string[];
}

export interface TimelineStep {
	title: string;
	desc: string;
}

export interface ApplyStep {
	num: number;
	title: string;
	desc: string;
}

export interface ContactInfo {
	org: string;
	email: string;
	address: string;
	officialUrl: string;
	kakaoUrl: string;
}

export interface SiteContent {
	hero: HeroContent;
	checklist: ChecklistItem[];
	commonCourse: CommonCourse;
	tracks: Track[];
	benefits: BenefitCard[];
	journey: TimelineStep[];
	applySteps: ApplyStep[];
	contact: ContactInfo;
}
