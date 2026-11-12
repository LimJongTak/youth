import { useState } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import styles from "./Onboarding.module.scss";

// 커피앱 첫 화면("Get Started")을 따른 첫 방문 인트로 — 한 번 "시작하기"를
// 누르면 이 브라우저에서는 다시 보이지 않는다.
const STORAGE_KEY = "youth.onboarded";

function hasSeen(): boolean {
	try {
		return window.localStorage.getItem(STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

export function Onboarding() {
	const { content } = useSiteContent();
	const { hero } = content;
	const [open, setOpen] = useState(() => !hasSeen());
	const [leaving, setLeaving] = useState(false);

	if (!open) return null;

	function start() {
		try {
			window.localStorage.setItem(STORAGE_KEY, "1");
		} catch {
			// 저장소를 못 쓰는 환경이면 이번 방문 동안만 닫힌 상태로 둔다.
		}
		setLeaving(true);
		window.setTimeout(() => setOpen(false), 280);
	}

	return (
		<div className={`${styles.screen} ${leaving ? styles.leaving : ""}`} role="dialog" aria-modal="true">
			<div className={styles.art} aria-hidden="true">
				<span className={styles.orb1} />
				<span className={styles.orb2} />
				<span className={styles.orb3} />
			</div>

			{/* 부트캠프 마스코트 — 배경을 투명하게 따낸 이미지 */}
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

			<div className={styles.panel}>
				<h1 className={styles.title}>
					{hero.titleBefore}
					<br />
					<em>{hero.titleEmphasis}</em>
				</h1>
				<p className={styles.lead}>{hero.lead}</p>
				<button type="button" className={styles.startBtn} onClick={start}>
					시작하기
				</button>
			</div>
		</div>
	);
}
