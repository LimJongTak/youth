import type { MainTab } from "../context/NavigationContext";
import type { IconName } from "../components/icons/Icon";

export interface NavItem {
	id: MainTab;
	label: string;
	icon: IconName;
}

// The bottom bar now switches between real tab pages instead of scrolling
// to an anchor — 문의 moved to the top bar, and 신청/체크리스트 live inside
// the 홈 tab, so only these four remain.
export const bottomNav: NavItem[] = [
	{ id: "home", label: "홈", icon: "home" },
	{ id: "program", label: "프로그램", icon: "graduation-cap" },
	{ id: "schedule", label: "스케줄", icon: "calendar" },
	{ id: "benefit", label: "혜택", icon: "gift" },
];
