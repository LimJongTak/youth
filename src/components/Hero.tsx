import { useState, type MouseEvent } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { useNavigation } from "../context/NavigationContext";
import { statusLabel } from "../types/cohort";
import { logEvent } from "../lib/analytics";
import styles from "./Hero.module.scss";

export function Hero() {
	const { selected, cohorts } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;
	const { goToProgram, setTab } = useNavigation();
	const [showNoActive, setShowNoActive] = useState(false);

	const recruiting = cohorts.filter((c) => c.status === "recruiting");
	// Exactly one recruiting cohort → go straight to its application link.
	// Several → fall back to the cohort picker so the visitor can choose.
	// None → the anchor is inert; onClick shows a message instead of
	// scrolling to an empty-feeling section.
	const applyHref =
		recruiting.length === 1 ? recruiting[0].applyUrl : "#cohort";

	function handleApplyClick(event: MouseEvent<HTMLAnchorElement>) {
		if (recruiting.length === 0) {
			event.preventDefault();
			setShowNoActive(true);
			window.setTimeout(() => setShowNoActive(false), 3000);
			return;
		}
		logEvent("apply_click", { source: "hero" });
	}

	return (
		<section className={styles.hero} id="hero">
			<h1 className={styles.title}>
				{hero.titleBefore}
				<br />
				<em>{hero.titleEmphasis}</em>
				{hero.titleAfter}
			</h1>
			<p className={styles.lead}>{hero.lead}</p>
			<a href="#cohort" className={styles.cohortPing}>
				<i className="fas fa-circle" />
				{selected.generation}기 {statusLabel[selected.status]} · {selected.recruitPeriod}
			</a>
			<div className={styles.ctaRow}>
				<a className="btn btn-primary" href={applyHref} onClick={handleApplyClick}>
					<i className="fas fa-paper-plane" />
					지금 신청하기
				</a>
				<button
					type="button"
					className="btn btn-ghost"
					onClick={() => goToProgram("curriculum")}
				>
					<i className="fas fa-layer-group" />
					커리큘럼
				</button>
				<button type="button" className="btn btn-ghost" onClick={() => setTab("benefit")}>
					<i className="fas fa-gift" />
					참여 혜택
				</button>
			</div>
			{showNoActive && (
				<p className={styles.noActiveMsg}>현재 운영 중인 기수가 없습니다.</p>
			)}
		</section>
	);
}
