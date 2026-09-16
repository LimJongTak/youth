import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type MainTab = "home" | "program" | "schedule" | "benefit" | "contact";
export type ProgramSubTab = "about" | "curriculum";

interface NavigationValue {
	tab: MainTab;
	setTab: (tab: MainTab) => void;
	programSubTab: ProgramSubTab;
	goToProgram: (subTab?: ProgramSubTab) => void;
	setProgramSubTab: (subTab: ProgramSubTab) => void;
	goToContact: () => void;
	/** Which cohort (and optionally which date, YYYY-MM-DD) the 스케줄 tab
	 * should open showing — set by the 일정 card on the 홈 tab so switching
	 * tabs lands on the same cohort/day the visitor was just previewing. */
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
