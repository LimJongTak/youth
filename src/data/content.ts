import type { MainTab } from "../context/NavigationContext";
import type { IconName } from "../components/icons/Icon";

export interface NavItem {
	id: MainTab;
	label: string;
	icon: IconName;
}

// 하단 바는 이제 앵커로 스크롤하는 대신 실제 탭 페이지를 전환한다 —
// 문의는 상단바로 옮겨졌고, 신청/체크리스트는 홈 탭 안에 있어서 이
// 네 개만 남았다.
export const bottomNav: NavItem[] = [
	{ id: "home", label: "홈", icon: "home" },
	{ id: "program", label: "프로그램", icon: "graduation-cap" },
	{ id: "schedule", label: "스케줄", icon: "calendar" },
	{ id: "benefit", label: "혜택", icon: "gift" },
];
