import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

// 공개 사이트의 탭 전환(하단 내비게이션) 상태를 관리하는 컨텍스트.
export type MainTab = "home" | "program" | "schedule" | "benefit" | "contact";
export type ProgramSubTab = "about" | "curriculum";

interface NavigationValue {
	tab: MainTab;
	setTab: (tab: MainTab) => void;
	programSubTab: ProgramSubTab;
	goToProgram: (subTab?: ProgramSubTab) => void;
	setProgramSubTab: (subTab: ProgramSubTab) => void;
	goToContact: () => void;
	/** 스케줄 탭을 열었을 때 어떤 기수(및 선택적으로 어떤 날짜, YYYY-MM-DD)를
	 * 보여줄지 — 홈 탭의 일정 카드에서 설정해줘서, 탭을 전환해도 방금
	 * 미리보던 기수/날짜가 그대로 이어지게 한다. */
	scheduleCohortId: string | null;
	scheduleDate: string | null;
	goToSchedule: (cohortId?: string, date?: string) => void;
}

const NavigationContext = createContext<NavigationValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
	const [tab, setTab] = useState<MainTab>("home");
	const [programSubTab, setProgramSubTab] = useState<ProgramSubTab>("curriculum");
	const [scheduleCohortId, setScheduleCohortId] = useState<string | null>(null);
	const [scheduleDate, setScheduleDate] = useState<string | null>(null);

	const value = useMemo<NavigationValue>(
		() => ({
			tab,
			setTab,
			programSubTab,
			setProgramSubTab,
			goToProgram: (subTab: ProgramSubTab = "curriculum") => {
				setProgramSubTab(subTab);
				setTab("program");
			},
			goToContact: () => setTab("contact"),
			scheduleCohortId,
			scheduleDate,
			goToSchedule: (cohortId?: string, date?: string) => {
				if (cohortId) setScheduleCohortId(cohortId);
				setScheduleDate(date ?? null);
				setTab("schedule");
			},
		}),
		[tab, programSubTab, scheduleCohortId, scheduleDate],
	);

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationValue {
	const ctx = useContext(NavigationContext);
	if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
	return ctx;
}
