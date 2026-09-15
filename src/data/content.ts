export interface NavItem {
	id: string;
	label: string;
	icon: string;
}

export const bottomNav: NavItem[] = [
	{ id: "hero", label: "홈", icon: "fa-home" },
	{ id: "cohort", label: "신청", icon: "fa-paper-plane" },
	{ id: "curriculum", label: "커리큘럼", icon: "fa-layer-group" },
	{ id: "benefit", label: "혜택", icon: "fa-gift" },
	{ id: "contact", label: "문의", icon: "fa-phone" },
];
