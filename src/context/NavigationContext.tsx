import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type MainTab = "home" | "program" | "benefit" | "contact";
export type ProgramSubTab = "about" | "curriculum";

interface NavigationValue {
	tab: MainTab;
	setTab: (tab: MainTab) => void;
	programSubTab: ProgramSubTab;
	goToProgram: (subTab?: ProgramSubTab) => void;
	setProgramSubTab: (subTab: ProgramSubTab) => void;
	goToContact: () => void;
}

const NavigationContext = createContext<NavigationValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
	const [tab, setTab] = useState<MainTab>("home");
	const [programSubTab, setProgramSubTab] = useState<ProgramSubTab>("about");

	const value = useMemo<NavigationValue>(
		() => ({
			tab,
			setTab,
			programSubTab,
			setProgramSubTab,
			goToProgram: (subTab: ProgramSubTab = "about") => {
				setProgramSubTab(subTab);
				setTab("program");
			},
			goToContact: () => setTab("contact"),
		}),
		[tab, programSubTab],
	);

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationValue {
	const ctx = useContext(NavigationContext);
	if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
	return ctx;
}
