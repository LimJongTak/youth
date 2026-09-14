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

export interface Track {
	id: "basic" | "mid" | "adv";
	tabLabel: string;
	badge: string;
	badgeClass: string;
	title: string;
	subtitle: string;
	hours: HourChip[];
	total: string;
}

export interface CommonCourse {
	title: string;
	desc: string;
}

export interface BenefitCard {
	icon: string;
	gradient: string;
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

export interface FaqItem {
	q: string;
	a: string;
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
	faqs: FaqItem[];
	contact: ContactInfo;
}

export const SITE_CONTENT_SECTIONS: (keyof SiteContent)[] = [
	"hero",
	"about",
	"checklist",
	"commonCourse",
	"tracks",
	"benefits",
	"journey",
	"applySteps",
	"faqs",
	"contact",
];
