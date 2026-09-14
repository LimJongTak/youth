import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import type { Track } from "../types/siteContent";
import { SectionHead } from "./SectionHead";
import styles from "./Curriculum.module.scss";

export function Curriculum() {
	const { content } = useSiteContent();
	const { commonCourse, tracks } = content;
	const [activeTab, setActiveTab] = useState<Track["id"]>("basic");
	const activeTrack = tracks.find((track) => track.id === activeTab) ?? tracks[0];

	return (
		<section className="section" id="curriculum">
			<SectionHead
				eyebrow="CURRICULUM"
				title="공통과정 + 선택 트랙"
				description="공통과정 이수 후, 3가지 트랙 중 하나를 선택해 심화 학습합니다."
			/>

			<div className={styles.commonStrip}>
				<i className="fas fa-book-open" />
				<div>
					<strong>{commonCourse.title}</strong>
					<span>{commonCourse.desc}</span>
				</div>
			</div>

			<div className={styles.tabs} role="tablist">
				{tracks.map((track) => (
					<button
						key={track.id}
						role="tab"
						aria-selected={activeTab === track.id}
						className={`${styles.tabBtn} ${activeTab === track.id ? styles.active : ""}`}
						onClick={() => setActiveTab(track.id)}
					>
						{track.tabLabel}
					</button>
				))}
			</div>

			{activeTrack && (
				<div className="card">
					<span className={`${styles.badge} ${styles[activeTrack.badgeClass]}`}>
						{activeTrack.badge}
					</span>
					<h4 className={styles.trackTitle}>{activeTrack.title}</h4>
					<p className={styles.trackSubtitle}>{activeTrack.subtitle}</p>
					<div className={styles.hourGrid}>
						{activeTrack.hours.map((chip) => (
							<div className={styles.hourChip} key={chip.label}>
								<strong>{chip.value}</strong>
								<span>{chip.label}</span>
							</div>
						))}
					</div>
					<div className={styles.totalHours}>
						<span>총 교육시간</span>
						<strong>{activeTrack.total}</strong>
					</div>
				</div>
			)}
		</section>
	);
}
