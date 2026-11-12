import { Fragment, useState, type CSSProperties, type MouseEvent } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useSiteContent } from "../../context/SiteContentContext";
import { useNavigation } from "../../context/NavigationContext";
import { cohortName, statusLabel } from "../../types/cohort";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./HomeHeader.module.scss";

// 홈 탭 최상단 — 커피앱 홈 화면 구성을 따른다:
// 크림 톤 헤더(위치 라벨 자리에 기관명, 프로필 자리에 문의 버튼, 둥실 떠
// 있는 마스코트),
// 검색창 자리에 "지금 모집중인 과정" 바 + 카라멜색 신청 버튼,
// 그리고 헤더 경계에 반쯤 걸쳐 올라오는 프로모션 배너(CMS 헤드라인).
export function HomeHeader() {
	const { cohorts, selected } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;
	const { goToContact, openCohortDetail } = useNavigation();
	const [showNoActive, setShowNoActive] = useState(false);

	const recruiting = cohorts.filter((c) => c.status === "recruiting");
	const spotlight = recruiting.find((c) => c.id === selected.id) ?? recruiting[0] ?? selected;

	// 모집중 과정이 정확히 하나면 바로 그 신청 링크로, 여러 개면 아래 과정
	// 그리드로 이동해 직접 고르게 하고, 없으면 안내 문구만 잠깐 보여준다.
	const applyHref = recruiting.length === 1 ? recruiting[0].applyUrl : "#courses";

	function handleApplyClick(event: MouseEvent<HTMLAnchorElement>) {
		if (recruiting.length === 0) {
			event.preventDefault();
			setShowNoActive(true);
			window.setTimeout(() => setShowNoActive(false), 3000);
			return;
		}
		logEvent("apply_click", { source: "hero" });
	}

	// 순차 등장 지연값(ms) — .anim-rise가 --d 변수로 읽는다.
	const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

	const titleLines = [hero.titleEmphasis, hero.titleAfter].filter((line) => line.trim());

	return (
		<>
			<section className={styles.header} id="hero">
				<span className={styles.blob1} aria-hidden="true" />
				<span className={styles.blob2} aria-hidden="true" />

				<div className={`${styles.topRow} anim-rise`}>
					<div className={styles.place}>
						<span className={styles.placeLabel}>국립순천대학교 인공지능분야</span>
						<strong className={styles.placeName}>청년도약 인재양성 부트캠프</strong>
					</div>
					<button
						type="button"
						className={styles.avatarBtn}
						onClick={() => {
							logEvent("contact_click", { source: "topbar" });
							goToContact();
						}}
						aria-label="문의하기"
					>
						<Icon name="headset" />
					</button>
				</div>

				<div className={styles.greetRow}>
					<p className={`${styles.greeting} anim-rise`} style={delay(80)}>
						{hero.titleBefore}
					</p>
					<div className={styles.mascotWrap}>
						<span className={styles.mascotGlow} aria-hidden="true" />
						<img
							className={styles.mascot}
							src="/assets/img/mascot.webp"
							alt="청년도약 인재양성 부트캠프 마스코트"
							width={720}
							height={871}
							decoding="async"
						/>
					</div>
				</div>

				<div className={`${styles.searchRow} anim-rise`} style={delay(160)}>
					<button
						type="button"
						className={styles.searchBar}
						onClick={() => openCohortDetail(spotlight.id)}
					>
						<span
							className={`${styles.liveDot} ${
								spotlight.status === "recruiting" ? styles.liveDotOn : ""
							}`}
						/>
						<span className={styles.searchText}>
							{recruiting.length > 0
								? `교육생 ${statusLabel[spotlight.status]} · ${cohortName(spotlight)}`
								: "현재 모집 중인 과정이 없어요"}
						</span>
						<span className={styles.searchSub}>{spotlight.recruitPeriod}</span>
					</button>
					<a
						className={styles.filterBtn}
						href={applyHref}
						onClick={handleApplyClick}
						aria-label="지금 신청하기"
					>
						<Icon name="paper-plane" />
					</a>
				</div>
				{showNoActive && <p className={styles.noActiveMsg}>현재 운영 중인 과정이 없습니다.</p>}
			</section>

			<div className={`${styles.promoWrap} anim-rise`} style={delay(240)}>
				<div className={styles.promo}>
					<span className={styles.shine} aria-hidden="true" />
					<span className={styles.promoTag}>{hero.stats[1]?.value || "전액 무료"}</span>
					<h1 className={styles.promoTitle}>
						{titleLines.map((line, index) => (
							<Fragment key={line}>
								{index > 0 && <br />}
								<span className={styles.promoLine}>{line}</span>
							</Fragment>
						))}
					</h1>
					<p className={styles.promoLead}>{hero.lead}</p>
				</div>
			</div>

			{hero.stats.length > 0 && (
				<div className={styles.stats}>
					{hero.stats.map((stat, index) => (
						<div
							className={`${styles.stat} anim-rise`}
							style={delay(320 + index * 70)}
							key={stat.label}
						>
							<strong>{stat.value}</strong>
							<span>{stat.label}</span>
						</div>
					))}
				</div>
			)}
		</>
	);
}
