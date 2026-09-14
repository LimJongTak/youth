export interface NavItem {
	id: string;
	label: string;
	icon: string;
}

export const drawerNav: NavItem[] = [
	{ id: "hero", label: "홈", icon: "fa-home" },
	{ id: "cohort", label: "기수 안내", icon: "fa-users" },
	{ id: "about", label: "프로그램 소개", icon: "fa-info-circle" },
	{ id: "target", label: "모집대상 체크", icon: "fa-clipboard-check" },
	{ id: "curriculum", label: "커리큘럼", icon: "fa-layer-group" },
	{ id: "benefit", label: "참여 혜택", icon: "fa-gift" },
	{ id: "journey", label: "참여 여정", icon: "fa-route" },
	{ id: "faq", label: "자주 묻는 질문", icon: "fa-question-circle" },
	{ id: "contact", label: "문의처", icon: "fa-phone" },
];

export const bottomNav: NavItem[] = [
	{ id: "hero", label: "홈", icon: "fa-home" },
	{ id: "curriculum", label: "커리큘럼", icon: "fa-layer-group" },
	{ id: "benefit", label: "혜택", icon: "fa-gift" },
	{ id: "cohort", label: "신청", icon: "fa-paper-plane" },
	{ id: "contact", label: "문의", icon: "fa-phone" },
];
