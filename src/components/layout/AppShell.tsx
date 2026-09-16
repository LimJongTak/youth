import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Hero } from "../home/Hero";
import { CohortBanner } from "../home/CohortBanner";
import { ProgramTab } from "../program/ProgramTab";
import { Schedule } from "../schedule/Schedule";
import { Benefits } from "../benefit/Benefits";
import { Journey } from "../benefit/Journey";
import { Contact } from "../contact/Contact";
import { NavigationProvider, useNavigation } from "../../context/NavigationContext";
import { logEvent } from "../../lib/analytics";
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
