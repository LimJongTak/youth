import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { EmptyState } from "../../components/common/EmptyState";
import { buildBuckets, PERIOD_CONFIG, type Period } from "./dateBuckets";
import styles from "./AnalyticsPanel.module.scss";

interface AnalyticsEvent {
	name: string;
	source?: string;
	path?: string;
	at: Timestamp | null;
}

interface AuditEntry {
	uid: string;
	section: string;
	at: Timestamp | null;
}

const sectionLabel: Record<string, string> = {
	hero: "히어로",
	about: "프로그램 안내",
	checklist: "모집대상 체크리스트",
	commonCourse: "공통과정",
	tracks: "커리큘럼 트랙",
	benefits: "참여 혜택",
	journey: "참여 여정",
	applySteps: "신청 방법",
	contact: "문의처",
};

function formatDate(ts: Timestamp | null) {
	if (!ts) return "방금 전";
	return ts.toDate().toLocaleString("ko-KR", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// 그래프 최고값을 그대로 쓰지 않고 "깔끔한" 값(1/2/5 × 10^n)으로 올림 —
// 유일하게 표시하는 눈금 라벨이 읽기 편한 숫자가 되도록.
function niceCeil(value: number): number {
	if (value <= 0) return 1;
	const exp = Math.floor(Math.log10(value));
	const base = 10 ** exp;
	const fraction = value / base;
	const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
	return niceFraction * base;
}

export function AnalyticsPanel() {
	const [events, setEvents] = useState<AnalyticsEvent[]>([]);
	const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
	const [usernames, setUsernames] = useState<Record<string, string>>({});
	const [period, setPeriod] = useState<Period>("day");

	// 방문 통계(analyticsEvents)와 콘텐츠 변경 이력(auditLog)을 Firestore와
	// 실시간 동기화. 이 통계 탭 하나가 관리자 화면의 "주요 기능" 중 하나다.
	useEffect(() => {
		// 진짜 페이지네이션이 아니라 실용적인 상한선일 뿐 — 지금 트래픽
		// 수준에서는 문제없다. 나중에 방문자가 훨씬 늘어나면 "최근 N건을
		// 가져와 클라이언트에서 구간 나누기" 대신 서버 쪽 날짜 범위 쿼리로
		// 바꿔야 한다.
		const unsubEvents = onSnapshot(
			query(collection(db, "analyticsEvents"), orderBy("at", "desc"), limit(3000)),
			(snap) => setEvents(snap.docs.map((d) => d.data() as AnalyticsEvent)),
		);
		const unsubAudit = onSnapshot(
			query(collection(db, "auditLog"), orderBy("at", "desc"), limit(20)),
			(snap) => setAuditLog(snap.docs.map((d) => d.data() as AuditEntry)),
		);
		const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
			const map: Record<string, string> = {};
			snap.docs.forEach((d) => {
				map[d.id] = d.data().username;
			});
			setUsernames(map);
		});
		return () => {
			unsubEvents();
			unsubAudit();
			unsubUsers();
		};
	}, []);

	const buckets = useMemo(() => buildBuckets(period), [period]);

	// 선택한 기간(일/주/월/년)의 각 구간마다 방문(page_view) 수를 집계 —
	// 방문 추이 막대그래프에 쓰이는 데이터.
	const series = useMemo(
		() =>
			buckets.map((bucket) => {
				const count = events.filter((e) => {
					if (e.name !== "page_view" || !e.at) return false;
					const at = e.at.toDate();
					return at >= bucket.start && at < bucket.end;
				}).length;
				return { ...bucket, count };
			}),
		[buckets, events],
	);

	const maxCount = Math.max(1, ...series.map((s) => s.count));
	const axisMax = niceCeil(maxCount);
	const peakIndex = series.reduce(
		(best, s, i) => (s.count > series[best].count ? i : best),
		0,
	);

	// 통계 카드들도 그래프가 지금 보여주는 것과 같은 기간 범위로 계산 —
	// 화면에 보이는 숫자들이 항상 서로 일치하도록.
	const windowStart = buckets[0].start;
	const windowEnd = buckets[buckets.length - 1].end;
	const windowEvents = useMemo(
		() =>
			events.filter((e) => {
				if (!e.at) return false;
				const at = e.at.toDate();
				return at >= windowStart && at < windowEnd;
			}),
		[events, windowStart, windowEnd],
	);
	const counts = windowEvents.reduce<Record<string, number>>((acc, event) => {
		acc[event.name] = (acc[event.name] ?? 0) + 1;
		return acc;
	}, {});
	const pageViews = counts.page_view ?? 0;
	const applyClicks = counts.apply_click ?? 0;
	const kakaoClicks = counts.kakao_click ?? 0;
	const hasAnyEvents = events.length > 0;

	return (
		<div>
			<div className={styles.disclosure}>
				<i className="fas fa-info-circle" />
				<span>
					외부 서비스 없이 사이트 자체(Firestore)에 기록되는 최소한의 방문·클릭
					통계입니다. 최근 최대 3,000건 기준입니다.
				</span>
			</div>

			<div className={styles.chartCard}>
				<div className={styles.chartHead}>
					<h3>기간별 방문 추이</h3>
					<div className={styles.periodTabs} role="tablist">
						{(Object.keys(PERIOD_CONFIG) as Period[]).map((p) => (
							<button
								key={p}
								type="button"
								role="tab"
								aria-selected={period === p}
								className={`${styles.periodTab} ${period === p ? styles.periodTabActive : ""}`}
								onClick={() => setPeriod(p)}
							>
								{PERIOD_CONFIG[p].label}
							</button>
						))}
					</div>
				</div>

				{hasAnyEvents ? (
					<>
						<div className={styles.plotArea}>
							{series.map((bucket, i) => {
								const heightPct = (bucket.count / axisMax) * 100;
								return (
									<div className={styles.barCol} key={bucket.label + i}>
										{i === peakIndex && bucket.count > 0 && (
											<span className={styles.barValue}>{bucket.count.toLocaleString()}</span>
										)}
										<button
											type="button"
											className={styles.barHit}
											style={{ height: `${Math.max(heightPct, 1.5)}%` }}
										>
											<span className={styles.tooltip}>
												{bucket.label} · {bucket.count.toLocaleString()}건
											</span>
										</button>
									</div>
								);
							})}
						</div>
						<div className={styles.axisLabels}>
							{series.map((bucket, i) => (
								<span className={styles.axisLabel} key={bucket.label + i}>
									{bucket.label}
								</span>
							))}
						</div>
					</>
				) : (
					<EmptyState icon="calendar" message="아직 기록된 방문 데이터가 없습니다." />
				)}
			</div>

			<div className={styles.statGrid}>
				<div className={styles.statCard}>
					<strong>{pageViews.toLocaleString()}</strong>
					<span>{PERIOD_CONFIG[period].rangeLabel} 방문</span>
				</div>
				<div className={styles.statCard}>
					<strong>{applyClicks.toLocaleString()}</strong>
					<span>{PERIOD_CONFIG[period].rangeLabel} 신청 버튼 클릭</span>
				</div>
				<div className={styles.statCard}>
					<strong>{kakaoClicks.toLocaleString()}</strong>
					<span>{PERIOD_CONFIG[period].rangeLabel} 카카오톡 클릭</span>
				</div>
				<div className={styles.statCard}>
					<strong>{pageViews > 0 ? `${Math.round((applyClicks / pageViews) * 100)}%` : "-"}</strong>
					<span>방문 대비 신청 전환율</span>
				</div>
			</div>

			<h3 className={styles.subhead}>최근 콘텐츠 변경 이력</h3>
			<div className={styles.list}>
				{auditLog.map((entry, i) => (
					<div className={styles.row} key={i}>
						<i className="fas fa-pen" />
						<span className={styles.who}>{usernames[entry.uid] ?? "알 수 없음"}</span>
						<span className={styles.what}>{sectionLabel[entry.section] ?? entry.section}</span>
						<span className={styles.when}>{formatDate(entry.at)}</span>
					</div>
				))}
				{auditLog.length === 0 && <EmptyState icon="book-open" message="변경 이력이 없습니다." />}
			</div>
		</div>
	);
}
