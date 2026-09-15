import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Hero } from "./Hero";
import { CohortBanner } from "./CohortBanner";
import { About } from "./About";
import { TargetChecklist } from "./TargetChecklist";
import { Curriculum } from "./Curriculum";
import { Benefits } from "./Benefits";
import { Journey } from "./Journey";
import { Contact } from "./Contact";
import { bottomNav } from "../data/content";
import { useActiveSection } from "../hooks/useActiveSection";
import styles from "./AppShell.module.scss";

const sectionIds = bottomNav.map((item) => item.id);

export function AppShell() {
	const activeSection = useActiveSection(sectionIds);

	return (
		<div className={styles.shell}>
			<div className={styles.app}>
				<TopBar />

				<main>
					<Hero />
					<CohortBanner />
					<About />
					<TargetChecklist />
					<Curriculum />
					<Benefits />
					<Journey />
					<Contact />
				</main>

				<BottomNav active={activeSection} />
			</div>
		</div>
	);
}
