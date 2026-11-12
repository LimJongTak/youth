import { useMemo, useState, type CSSProperties } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useNavigation } from "../../context/NavigationContext";
import {
	cohortName,
	compareCohortsNewestFirst,
	statusLabel,
	type CohortStatus,
} from "../../types/cohort";
import { CourseArt } from "./CourseArt";
import { Icon } from "../icons/Icon";
import styles from "./CourseGrid.module.scss";

// 커피앱 홈의 "카테고리 칩 + 2열 상품 그리드" 자리 — 상품 대신 과정 카드를
// 보여주고, 카드를 누르면 상품 상세처럼 과정 상세 화면이 열린다.
type Filter = "all" | CohortStatus;

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "전체 과정" },
	{ id: "recruiting", label: statusLabel.recruiting },
	{ id: "upcoming", label: statusLabel.upcoming },
	{ id: "closed", label: statusLabel.closed },
];

export function CourseGrid() {
	const { cohorts, select } = useCohorts();
	const { openCohortDetail } = useNavigation();
	const [filter, setFilter] = useState<Filter>("all");
	// 처음엔 헤더 애니메이션 뒤에 이어서, 칩을 누른 뒤엔 바로 등장.
	const [touched, setTouched] = useState(false);

	const sorted = useMemo(() => cohorts.slice().sort(compareCohortsNewestFirst), [cohorts]);
	// 해당 상태의 과정이 하나도 없는 칩은 굳이 보여주지 않는다.
	const visibleFilters = FILTERS.filter(
		(f) => f.id === "all" || sorted.some((c) => c.status === f.id),
	);
	const list = filter === "all" ? sorted : sorted.filter((c) => c.status === filter);

	if (cohorts.length === 0) return null;

	function open(id: string) {
		select(id);
		openCohortDetail(id);
	}

	return (
		<section className={styles.section} id="courses">
			<div className={styles.chipRow} role="tablist" aria-label="과정 상태">
				{visibleFilters.map((f) => (
					<button
						key={f.id}
						type="button"
						role="tab"
						aria-selected={filter === f.id}
						className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
						onClick={() => {
							setFilter(f.id);
							setTouched(true);
						}}
					>
						{f.label}
					</button>
				))}
			</div>

			<div className={styles.grid} key={filter}>
				{list.map((cohort, index) => (
					<article
						className={`${styles.card} anim-rise`}
						style={{ "--d": `${(touched ? 0 : 380) + index * 80}ms` } as CSSProperties}
						key={cohort.id}
					>
						<button
							type="button"
							className={styles.cardHit}
							onClick={() => open(cohort.id)}
							aria-label={`${cohortName(cohort)} 상세 보기`}
						/>
						<div className={styles.artWrap}>
							<CourseArt cohort={cohort} />
							<span className={styles.statusBadge}>
								<span className={`${styles.statusDot} ${styles[cohort.status]}`} />
								{statusLabel[cohort.status]}
							</span>
						</div>
						<h3 className={styles.name}>{cohortName(cohort)}</h3>
						<p className={styles.sub}>{cohort.eduPeriod}</p>
						<div className={styles.bottom}>
							<span className={styles.price}>
								<small>모집</small>
								{cohort.capacity}
							</span>
							<span className={styles.plusBtn} aria-hidden="true">
								<Icon name="plus" />
							</span>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
