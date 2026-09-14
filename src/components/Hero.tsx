import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { statusLabel } from "../types/cohort";
import logoUrl from "../assets/logo-mark.png";
import styles from "./Hero.module.scss";

export function Hero() {
	const { selected } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;

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
				<a className="btn btn-primary" href="#cohort">
					<i className="fas fa-paper-plane" />
					지금 신청하기
				</a>
				<a className="btn btn-ghost" href="#curriculum">
					<i className="fas fa-layer-group" />
					커리큘럼 보기
				</a>
			</div>
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
