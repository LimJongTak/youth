import { useState } from "react";
import { StatusBar } from "./StatusBar";
import { TopBar } from "./TopBar";
import { Drawer } from "./Drawer";
import { BottomNav } from "./BottomNav";
import { Hero } from "./Hero";
import { CohortBanner } from "./CohortBanner";
import { About } from "./About";
import { TargetChecklist } from "./TargetChecklist";
import { Curriculum } from "./Curriculum";
import { Benefits } from "./Benefits";
import { Journey } from "./Journey";
import { Faq } from "./Faq";
import { Contact } from "./Contact";
import { bottomNav } from "../data/content";
import { useActiveSection } from "../hooks/useActiveSection";
import { useElementRect } from "../hooks/useElementRect";
import styles from "./AppShell.module.scss";

export function AppShell() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [appEl, setAppEl] = useState<HTMLDivElement | null>(null);

	const sectionIds = bottomNav.map((item) => item.id);
	const activeSection = useActiveSection(sectionIds, appEl);
	const appRect = useElementRect(appEl);

	return (
		<div className={styles.deviceWrap}>
			<div
				className={`${styles.app} ${drawerOpen ? styles.locked : ""}`}
				ref={setAppEl}
			>
				<span className={styles.notch} aria-hidden="true" />

				<StatusBar />
				<Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} rect={appRect} />
				<TopBar onMenuClick={() => setDrawerOpen(true)} />

				<main>
					<Hero />
					<CohortBanner />
					<About />
					<TargetChecklist />
					<Curriculum />
					<Benefits />
					<Journey />
					<Faq />
					<Contact />
				</main>

				<BottomNav active={activeSection} />
			</div>
		</div>
	);
}
