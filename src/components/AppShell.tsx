import { useEffect, useState } from "react";
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

const sectionIds = bottomNav.map((item) => item.id);

export function AppShell() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [appEl, setAppEl] = useState<HTMLDivElement | null>(null);

	const activeSection = useActiveSection(sectionIds);
	const appRect = useElementRect(appEl);

	// The page scrolls normally now (no inner scroll container to lock), so
	// the drawer's open-state locks the real body scroll instead.
	useEffect(() => {
		document.body.style.overflow = drawerOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [drawerOpen]);

	return (
		<div className={styles.shell}>
			<div className={styles.app} ref={setAppEl}>
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
