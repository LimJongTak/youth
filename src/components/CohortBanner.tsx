import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { statusLabel } from "../types/cohort";
import { SectionHead } from "./SectionHead";
import styles from "./CohortBanner.module.scss";

const dotClass: Record<string, string> = {
	recruiting: styles.dotRecruiting,
	upcoming: styles.dotUpcoming,
	closed: styles.dotClosed,
};

const badgeClass: Record<string, string> = {
	recruiting: styles.badgeRecruiting,
	upcoming: styles.badgeUpcoming,
	closed: styles.badgeClosed,
};

export function CohortBanner() {
	const { cohorts, selected, select } = useCohorts();
	const { content } = useSiteContent();
	const { applySteps, contact } = content;

	if (cohorts.length === 0) return null;

	const canApply = selected.status === "recruiting" && Boolean(selected.applyUrl);

	return (
		<section className="section" id="cohort">
			<SectionHead
				eyebrow="COHORT"
				title="기수 안내 · 신청"
				description="여러 기수가 함께 진행될 수 있어요. 기수를 선택해 일정을 확인하고 바로 신청하세요."
			/>

			<div className={styles.chipRow} role="tablist">
				{cohorts
					.slice()
					.sort((a, b) => b.generation - a.generation)
					.map((cohort) => (
						<button
							key={cohort.id}
							role="tab"
							aria-selected={selected.id === cohort.id}
							className={`${styles.chip} ${selected.id === cohort.id ? styles.active : ""}`}
							onClick={() => select(cohort.id)}
						>
							<span className={`${styles.dot} ${dotClass[cohort.status]}`} />
							{cohort.generation}기 · {statusLabel[cohort.status]}
						</button>
					))}
			</div>

			<div className={styles.card}>
				<div className={styles.cardHead}>
					<h4>{selected.generation}기 교육생</h4>
					<span className={`${styles.badge} ${badgeClass[selected.status]}`}>
						{statusLabel[selected.status]}
					</span>
				</div>
				<div className={styles.rows}>
					<div className={styles.row}>
						<span>모집인원</span>
						<span>{selected.capacity}</span>
					</div>
					<div className={styles.row}>
						<span>모집기간</span>
						<span>{selected.recruitPeriod}</span>
					</div>
					<div className={styles.row}>
						<span>교육기간</span>
						<span>{selected.eduPeriod}</span>
					</div>
					<div className={styles.row}>
						<span>교육시간</span>
						<span>{selected.eduHours}</span>
					</div>
					<div className={styles.row}>
						<span>교육장소</span>
						<span>{selected.location}</span>
					</div>
				</div>
				{selected.note && <p className={styles.note}>* {selected.note}</p>}
			</div>

			<div className={`${styles.card} ${styles.stepsCard}`}>
				<p className={styles.stepsTitle}>신청 방법</p>
				{applySteps.map((step, index) => (
					<div className={styles.step} key={step.num}>
						<div className={styles.stepMarker}>
							<div className={styles.num}>{step.num}</div>
							{index < applySteps.length - 1 && <div className={styles.line} />}
						</div>
						<div className={styles.stepBody}>
							<strong>{step.title}</strong>
							<p>{step.desc}</p>
						</div>
					</div>
				))}
			</div>

			<div className={styles.ctaCard}>
				{canApply ? (
					<a
						className="btn btn-primary btn-block"
						href={selected.applyUrl}
						rel="noopener"
					>
						<i className="fas fa-paper-plane" />
						{selected.generation}기 신청하기
					</a>
				) : (
					<p className={styles.mutedNote}>
						현재 {selected.generation}기는 모집 중이 아니에요. 다른 기수를 선택하거나
						카카오톡으로 문의해보세요.
					</p>
				)}
				<a
					className="btn btn-kakao btn-block"
					href={contact.kakaoUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					<i className="fas fa-comment" />
					카카오톡 문의하기
				</a>
			</div>
		</section>
	);
}
