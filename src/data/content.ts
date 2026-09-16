import type { MainTab } from "../context/NavigationContext";

export interface NavItem {
	id: MainTab;
	label: string;
	icon: string;
}

// The bottom bar now switches between real tab pages instead of scrolling
// to an anchor — 문의 moved to the top bar, and 신청/체크리스트 live inside
// the 홈 tab, so only these four remain.
export const bottomNav: NavItem[] = [
	{ id: "home", label: "홈", icon: "fa-home" },
	{ id: "program", label: "프로그램", icon: "fa-graduation-cap" },
	{ id: "schedule", label: "스케줄", icon: "fa-calendar-alt" },
	{ id: "benefit", label: "혜택", icon: "fa-gift" },
];
