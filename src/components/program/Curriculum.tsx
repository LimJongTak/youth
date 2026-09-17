import { useState } from "react";
import { createPortal } from "react-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { defaultSiteContent } from "../../data/defaultSiteContent";
import type { Track } from "../../types/siteContent";
import { SectionHead } from "../layout/SectionHead";
import { Icon } from "../icons/Icon";
import styles from "./Curriculum.module.scss";

// 커리큘럼 섹션 — 공통과정 안내와 초급/중급/고급 트랙 탭, "자세히"를 누르면
// 공통+트랙 과목 전체 목록을 모달로 보여준다.
export function Curriculum() {
	const { content } = useSiteContent();
	const { commonCourse, tracks } = content;
	const [activeTab, setActiveTab] = useState<Track["id"]>("basic");
	const [detailOpen, setDetailOpen] = useState(false);
	const activeTrack = tracks.find((track) => track.id === activeTab) ?? tracks[0];

	// "이수 과목" 필드가 생기기 전에 저장된 Firestore 콘텐츠에는 이 값이
	// 없을 수 있음 — 관리자가 CMS에서 채워 넣기 전까지는 대응하는 시드
	// 트랙 값으로 대체해서 상세 카드가 비어 보이지 않게 한다.
	const trackCourses =
		activeTrack?.courses && activeTrack.courses.length > 0
			? activeTrack.courses
			: defaultSiteContent.tracks.find((t) => t.id === activeTrack?.id)?.courses ?? [];

	// commonCourse.desc는 "과목A · 과목B" 형태로 저장돼 있음 — 상세 카드에서
	// 트랙 자체 과목들과 함께 공통 과목 2개를 각각 따로 나열할 수 있도록
	// 다시 분리한다.
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
				title="공통과정 + 선택 트랙"
				description="공통과정 이수 후, 3가지 트랙 중 하나를 선택해 심화 학습합니다."
			/>

			<div className={styles.commonStrip}>
				<Icon name="book-open" />
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
							<Icon name="chevron-right" />
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
								<Icon name="times" />
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
										<Icon name="check-circle" />
										<span>{subject}</span>
									</li>
								))}
							</ul>

							<span className={styles.detailGroupLabel}>{activeTrack.tabLabel} 전문과정</span>
							<ul className={styles.detailList}>
								{trackCourses.map((course) => (
									<li key={course.name}>
										<Icon name="check-circle" />
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
