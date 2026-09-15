export interface HeroContent {
	titleBefore: string;
	titleEmphasis: string;
	titleAfter: string;
	lead: string;
	stats: { label: string; value: string }[];
}

export interface AboutContent {
	description: string;
	bodyHighlight: string;
	body: string;
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
	/** e.g. "전문과정" or "몰입과정" — shown as a small tag next to the name. */
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
	/** This track's own subjects, shown in the "자세히" detail card (the
	 * shared 공통과정 subjects are shown alongside them, parsed from
	 * `commonCourse.desc`). */
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
	about: AboutContent;
	checklist: ChecklistItem[];
	commonCourse: CommonCourse;
	tracks: Track[];
	benefits: BenefitCard[];
	journey: TimelineStep[];
	applySteps: ApplyStep[];
	contact: ContactInfo;
}
