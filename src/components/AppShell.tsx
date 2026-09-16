import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Hero } from "./Hero";
import { CohortBanner } from "./CohortBanner";
import { TargetChecklist } from "./TargetChecklist";
import { ProgramTab } from "./ProgramTab";
import { Schedule } from "./Schedule";
import { Benefits } from "./Benefits";
import { Journey } from "./Journey";
import { Contact } from "./Contact";
import { NavigationProvider, useNavigation } from "../context/NavigationContext";
import { logEvent } from "../lib/analytics";
import styles from "./AppShell.module.scss";

export function AppShell() {
	return (
		<NavigationProvider>
			<Shell />
		</NavigationProvider>
	);
}

function Shell() {
	const { tab } = useNavigation();

	useEffect(() => {
		logEvent("page_view");
	}, []);

	useEffect(() => {
		logEvent("tab_view", { tab });
		window.scrollTo({ top: 0 });
	}, [tab]);

	return (
		<div className={styles.shell}>
			<div className={styles.app}>
				<TopBar />

				<main>
					{tab === "home" && (
						<>
							<Hero />
							<CohortBanner />
							<TargetChecklist />
						</>
					)}
					{tab === "program" && <ProgramTab />}
					{tab === "schedule" && <Schedule />}
					{tab === "benefit" && (
						<>
							<Benefits />
							<Journey />
						</>
					)}
					{tab === "contact" && <Contact />}
				</main>

				<BottomNav />
			</div>
		</div>
	);
}
