import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
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

export function AnalyticsPanel() {
	const [events, setEvents] = useState<AnalyticsEvent[]>([]);
	const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
	const [usernames, setUsernames] = useState<Record<string, string>>({});

	useEffect(() => {
		const unsubEvents = onSnapshot(
			query(collection(db, "analyticsEvents"), orderBy("at", "desc"), limit(500)),
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

	const counts = events.reduce<Record<string, number>>((acc, event) => {
		acc[event.name] = (acc[event.name] ?? 0) + 1;
		return acc;
	}, {});

	const pageViews = counts.page_view ?? 0;
	const applyClicks = counts.apply_click ?? 0;
	const kakaoClicks = counts.kakao_click ?? 0;

	return (
		<div>
			<div className={styles.disclosure}>
				<i className="fas fa-info-circle" />
				<span>
					외부 서비스 없이 사이트 자체(Firestore)에 기록되는 최소한의 방문·클릭
					통계입니다. 최근 최대 500건 기준입니다.
				</span>
			</div>

			<div className={styles.statGrid}>
				<div className={styles.statCard}>
					<strong>{pageViews}</strong>
					<span>방문 (page_view)</span>
				</div>
				<div className={styles.statCard}>
					<strong>{applyClicks}</strong>
					<span>신청 버튼 클릭</span>
				</div>
				<div className={styles.statCard}>
					<strong>{kakaoClicks}</strong>
					<span>카카오톡 문의 클릭</span>
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
				{auditLog.length === 0 && <p className={styles.empty}>변경 이력이 없습니다.</p>}
			</div>
		</div>
	);
}
