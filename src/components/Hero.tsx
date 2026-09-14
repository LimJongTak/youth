import { useState, type MouseEvent } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { statusLabel } from "../types/cohort";
import logoUrl from "../assets/logo-mark.png";
import styles from "./Hero.module.scss";

export function Hero() {
	const { selected, cohorts } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;
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
		}
	}

	return (
		<section className={styles.hero} id="hero">
			<img className={styles.logoMark} src={logoUrl} alt="국립순천대학교 AI인재양성부트캠프사업단" />
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
				<a className="btn btn-ghost" href="#curriculum">
					<i className="fas fa-layer-group" />
					커리큘럼 보기
				</a>
			</div>
			{showNoActive && (
				<p className={styles.noActiveMsg}>현재 운영 중인 기수가 없습니다.</p>
			)}
			<div className={styles.statRow}>
				{hero.stats.map((stat) => (
					<div className={styles.statCard} key={stat.label}>
						<strong>{stat.value}</strong>
						<span>{stat.label}</span>
					</div>
				))}
			</div>
		</section>
	);
}
