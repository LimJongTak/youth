import { useState } from "react";
import { createPortal } from "react-dom";
import { useSiteContent } from "../context/SiteContentContext";
import { defaultSiteContent } from "../data/defaultSiteContent";
import type { Track } from "../types/siteContent";
import { SectionHead } from "./SectionHead";
import styles from "./Curriculum.module.scss";

export function Curriculum() {
	const { content } = useSiteContent();
	const { commonCourse, tracks } = content;
	const [activeTab, setActiveTab] = useState<Track["id"]>("basic");
	const [detailOpen, setDetailOpen] = useState(false);
	const activeTrack = tracks.find((track) => track.id === activeTab) ?? tracks[0];

	// Firestore content saved before the "이수 과목" field existed won't have
	// it yet — fall back to the matching seed track so the detail card still
	// has something to show until an admin fills it in via the CMS.
	const trackCourses =
		activeTrack?.courses && activeTrack.courses.length > 0
			? activeTrack.courses
			: defaultSiteContent.tracks.find((t) => t.id === activeTrack?.id)?.courses ?? [];

	// commonCourse.desc is written as "과목A · 과목B" — split it back out so
	// the detail card can list the 2 common subjects individually alongside
	// the track's own subjects.
	const commonSubjects = commonCourse.desc
		.split("·")
		.map((subject) => subject.trim())
		.filter(Boolean);

	function selectTab(id: Track["id"]) {
		setActiveTab(id);
		setDetailOpen(false);
	}

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
						onClick={() => selectTab(track.id)}
					>
						{track.tabLabel}
					</button>
				))}
			</div>

			{activeTrack && (
				<div className="card">
					<div className={styles.cardHead}>
						<span className={`${styles.badge} ${styles[activeTrack.badgeClass]}`}>
							{activeTrack.badge}
						</span>
						<button type="button" className={styles.detailBtn} onClick={() => setDetailOpen(true)}>
							자세히
							<i className="fas fa-chevron-right" />
						</button>
					</div>
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

			{detailOpen &&
				activeTrack &&
				createPortal(
					<div className={styles.detailOverlay} onClick={() => setDetailOpen(false)}>
						<div className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className={styles.detailClose}
								onClick={() => setDetailOpen(false)}
								aria-label="닫기"
							>
								<i className="fas fa-times" />
							</button>
							<span className={`${styles.badge} ${styles[activeTrack.badgeClass]}`}>
								{activeTrack.badge}
							</span>
							<h4 className={styles.detailTitle}>{activeTrack.title} 커리큘럼</h4>
							<p className={styles.detailDesc}>
								{activeTrack.tabLabel} 과정을 수료하려면 아래 과목을 모두 이수해야 합니다.
							</p>

							<span className={styles.detailGroupLabel}>
								공통과정 ({commonSubjects.length}과목)
							</span>
							<ul className={styles.detailList}>
								{commonSubjects.map((subject) => (
									<li key={subject}>
										<i className="fas fa-check-circle" />
										<span>{subject}</span>
									</li>
								))}
							</ul>

							<span className={styles.detailGroupLabel}>{activeTrack.tabLabel} 전문과정</span>
							<ul className={styles.detailList}>
								{trackCourses.map((course) => (
									<li key={course.name}>
										<i className="fas fa-check-circle" />
										<span>{course.name}</span>
										{course.kind && <span className={styles.detailKind}>{course.kind}</span>}
									</li>
								))}
							</ul>
						</div>
					</div>,
					document.body,
				)}
		</section>
	);
}
