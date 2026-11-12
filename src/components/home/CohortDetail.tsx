import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useSiteContent } from "../../context/SiteContentContext";
import { useSchedule } from "../../context/ScheduleContext";
import { useNavigation } from "../../context/NavigationContext";
import { cohortName, statusLabel } from "../../types/cohort";
import { logEvent } from "../../lib/analytics";
import { getMonthGrid, isDateInRange, parseDateKey, toDateKey, WEEKDAY_LABELS } from "../../lib/calendar";
import { formatEventTime, getDayIndicators } from "../../lib/schedule";
import { CourseArt } from "./CourseArt";
import { Icon, type IconName } from "../icons/Icon";
import { Skeleton } from "../common/Skeleton";
import { commonSubjects, trackCourses, trackForCohort } from "../../lib/curriculum";
import styles from "./CohortDetail.module.scss";

// 과정 상세 화면 — 커피앱 상품 상세 화면 구성을 따른다:
// 큰 대표 이미지 → 이름/상태 → 소개 → 사이즈 선택 자리의 "교육 안내/일정"
// 선택 버튼 → 하단 고정 바(가격 자리에 모집기간, 구매 버튼 자리에 신청하기).
type Panel = "info" | "schedule";

export function CohortDetail({ cohortId }: { cohortId: string }) {
	const { cohorts } = useCohorts();
	const { content } = useSiteContent();
	const { events, loading: scheduleLoading } = useSchedule();
	const { goToSchedule, closeCohortDetail } = useNavigation();
	const cohort = cohorts.find((c) => c.id === cohortId);

	const [panel, setPanel] = useState<Panel>("info");
	const todayKey = toDateKey(new Date());
	const [previewMonth, setPreviewMonth] = useState(() => {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() };
	});
	const [previewDate, setPreviewDate] = useState<string | null>(todayKey);

	useEffect(() => {
		window.scrollTo({ top: 0 });
	}, [cohortId]);

	// 관리자가 보는 중에 이 과정을 삭제한 경우 — 상세 화면을 그냥 닫는다.
	useEffect(() => {
		if (!cohort) closeCohortDetail();
	}, [cohort, closeCohortDetail]);

	const cohortEvents = useMemo(
		() => events.filter((e) => e.cohortId === cohortId),
		[events, cohortId],
	);
	const previewWeeks = useMemo(
		() => getMonthGrid(previewMonth.year, previewMonth.month),
		[previewMonth],
	);
	const previewDateEvents = useMemo(() => {
		if (!previewDate) return [];
		return cohortEvents
			.filter((e) => isDateInRange(previewDate, e.startDate, e.endDate))
			.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
	}, [cohortEvents, previewDate]);

	if (!cohort) return null;

	function shiftPreviewMonth(delta: number) {
		setPreviewMonth(({ year, month }) => {
			const next = new Date(year, month + delta, 1);
			return { year: next.getFullYear(), month: next.getMonth() };
		});
		setPreviewDate(null);
	}

	const canApply = cohort.status === "recruiting" && Boolean(cohort.applyUrl);
	// 이 과정에 해당하는 커리큘럼 트랙(프로그램 탭의 초급/중급/고급과 같은 데이터).
	const track = trackForCohort(content, cohort);
	const common = commonSubjects(content);
	const ownCourses = track ? trackCourses(track) : [];
	const infoRows: { icon: IconName; label: string; value: string }[] = [
		{ icon: "users", label: "모집인원", value: cohort.capacity },
		{ icon: "paper-plane", label: "모집기간", value: cohort.recruitPeriod },
		{ icon: "calendar", label: "교육기간", value: cohort.eduPeriod },
		{ icon: "clock", label: "교육시간", value: cohort.eduHours },
		{ icon: "map-pin", label: "교육장소", value: cohort.location },
	];

	return (
		<div className={styles.detail}>
			<div className={styles.body}>
				<CourseArt cohort={cohort} size="hero" />

				<div className={styles.titleRow}>
					<div className={styles.titleText}>
						<h1>{cohortName(cohort)}</h1>
						<p>교육생 {statusLabel[cohort.status]}</p>
					</div>
					<div className={styles.features} aria-hidden="true">
						<span>
							<Icon name="graduation-cap" />
						</span>
						<span>
							<Icon name="book-open" />
						</span>
						<span>
							<Icon name="gift" />
						</span>
					</div>
				</div>

				<div className={styles.ratingRow}>
					<span className={`${styles.statusDot} ${styles[cohort.status]}`} />
					<strong>{statusLabel[cohort.status]}</strong>
					<span>· {cohort.recruitPeriod}</span>
				</div>

				<hr className={styles.divider} />

				<h2 className={styles.heading}>과정 소개</h2>
				<p className={styles.desc}>
					{content.hero.lead}
					{cohort.note && (
						<>
							{" "}
							<span className={styles.descNote}>{cohort.note}</span>
						</>
					)}
				</p>

				{track && (
					<section className={styles.curriculum} aria-label="커리큘럼">
						<div className={styles.currHead}>
							<h2 className={styles.heading}>커리큘럼</h2>
							<span className={styles.currTotal}>
								총 <strong>{track.total}</strong>
							</span>
						</div>
						<div className={styles.trackCard}>
							<span className={styles.trackLevel}>{track.tabLabel} 트랙</span>
							<strong className={styles.trackTitle}>{track.title}</strong>
							<p className={styles.trackSub}>{track.subtitle}</p>
							<div className={styles.hourGrid}>
								{track.hours.map((chip) => (
									<div className={styles.hourChip} key={chip.label}>
										<strong>{chip.value}</strong>
										<span>{chip.label}</span>
									</div>
								))}
							</div>
						</div>

						<div className={styles.courseGroup}>
							<span className={styles.groupLabel}>
								{content.commonCourse.title || "공통과정 (필수)"}
								<em>{common.length}과목</em>
							</span>
							<ol className={styles.courseList}>
								{common.map((subject, index) => (
									<li key={subject}>
										<span className={styles.courseNum}>{String(index + 1).padStart(2, "0")}</span>
										<span className={styles.courseName}>{subject}</span>
										<span className={`${styles.kind} ${styles.kindCommon}`}>공통</span>
									</li>
								))}
							</ol>
						</div>

						{ownCourses.length > 0 && (
							<div className={styles.courseGroup}>
								<span className={styles.groupLabel}>
									{track.tabLabel} 트랙 과정
									<em>{ownCourses.length}과목</em>
								</span>
								<ol className={styles.courseList}>
									{ownCourses.map((course, index) => (
										<li key={course.name}>
											<span className={styles.courseNum}>
												{String(common.length + index + 1).padStart(2, "0")}
											</span>
											<span className={styles.courseName}>{course.name}</span>
											{course.kind && (
												<span
													className={`${styles.kind} ${
														course.kind.includes("몰입") ? styles.kindImmersive : ""
													}`}
												>
													{course.kind}
												</span>
											)}
										</li>
									))}
								</ol>
							</div>
						)}

						<p className={styles.currNote}>
							공통과정 {common.length}과목과 {track.tabLabel} 트랙 과정을 모두 이수하면 수료할 수 있어요.
						</p>
					</section>
				)}

				<h2 className={styles.heading}>상세 정보</h2>
				<div className={styles.sizeRow} role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={panel === "info"}
						className={`${styles.sizeBtn} ${panel === "info" ? styles.sizeActive : ""}`}
						onClick={() => setPanel("info")}
					>
						교육 안내
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={panel === "schedule"}
						className={`${styles.sizeBtn} ${panel === "schedule" ? styles.sizeActive : ""}`}
						onClick={() => setPanel("schedule")}
					>
						일정
					</button>
				</div>

				{panel === "info" ? (
					<ul className={styles.infoList} key="info">
						{infoRows.map((row, index) => (
							<li
								key={row.label}
								className="anim-rise"
								style={{ "--d": `${index * 60}ms` } as CSSProperties}
							>
								<span className={styles.infoThumb}>
									<Icon name={row.icon} />
								</span>
								<span className={styles.infoText}>
									<small>{row.label}</small>
									<strong>{row.value}</strong>
								</span>
							</li>
						))}
					</ul>
				) : (
					<div className={`${styles.schedulePreview} anim-rise`} key="schedule">
						<div className={styles.miniHead}>
							<button
								type="button"
								className={styles.miniNavBtn}
								onClick={() => shiftPreviewMonth(-1)}
								aria-label="이전 달"
							>
								<Icon name="chevron-left" />
							</button>
							<span>
								{previewMonth.year}년 {previewMonth.month + 1}월
							</span>
							<button
								type="button"
								className={styles.miniNavBtn}
								onClick={() => shiftPreviewMonth(1)}
								aria-label="다음 달"
							>
								<Icon name="chevron-right" />
							</button>
						</div>

						<div className={styles.miniGrid}>
							{WEEKDAY_LABELS.map((w) => (
								<span className={styles.miniWeekday} key={w}>
									{w}
								</span>
							))}
							{previewWeeks.flat().map(({ date, inMonth }) => {
								const key = toDateKey(date);
								const { dots, bars } = getDayIndicators(key, date.getDay(), cohortEvents);
								return (
									<button
										type="button"
										key={key}
										className={`${styles.miniDay} ${!inMonth ? styles.miniDayOut : ""} ${
											key === todayKey ? styles.miniDayToday : ""
										} ${previewDate === key ? styles.miniDaySelected : ""}`}
										onClick={() => setPreviewDate(key)}
									>
										<span>{date.getDate()}</span>
										{bars.map((bar, i) => (
											<span
												key={i}
												className={`${styles.miniBar} ${bar.leftConnect ? styles.miniBarLeftConnect : ""} ${
													bar.rightConnect ? styles.miniBarRightConnect : ""
												}`}
												style={{ background: bar.color, bottom: `${2 + i * 4}px` }}
											/>
										))}
										{dots.length > 0 && (
											<span className={styles.miniDots}>
												{dots.slice(0, 3).map((color, i) => (
													<span
														key={i}
														className={styles.miniDot}
														style={{ background: color }}
													/>
												))}
											</span>
										)}
									</button>
								);
							})}
						</div>

						<div className={styles.previewPanel}>
							<strong className={styles.previewHead}>
								{previewDate
									? `${parseDateKey(previewDate).getMonth() + 1}월 ${parseDateKey(previewDate).getDate()}일`
									: "날짜를 선택하세요"}
							</strong>
							{previewDate && scheduleLoading && <Skeleton height={20} />}
							{previewDate && !scheduleLoading && previewDateEvents.length === 0 && (
								<p className={styles.note}>등록된 일정이 없습니다.</p>
							)}
							{previewDate && !scheduleLoading && previewDateEvents.length > 0 && (
								<div className={styles.previewList}>
									{previewDateEvents.map((event) => (
										<div className={styles.previewRow} key={event.id}>
											<span
												className={styles.previewColorDot}
												style={{ background: event.color || undefined }}
											/>
											<span className={styles.previewTime}>{formatEventTime(event)}</span>
											<span className={styles.previewTitle}>{event.title}</span>
										</div>
									))}
								</div>
							)}
						</div>

						<button
							type="button"
							className={styles.detailBtn}
							onClick={() => goToSchedule(cohort.id, previewDate ?? undefined)}
						>
							스케줄에서 자세히 보기
							<Icon name="chevron-right" />
						</button>
					</div>
				)}

				{cohort.status === "recruiting" && (
					<div className={styles.warningNote}>
						<Icon name="warning" />
						<span>
							모집기간은 <strong>{cohort.recruitPeriod}</strong>이며, 선착순 모집으로 조기
							마감될 수 있습니다.
						</span>
					</div>
				)}
			</div>

			{/* 커피앱 상세 화면의 하단 구매 바 — 가격 자리에 모집기간, 구매 버튼 자리에 신청하기 */}
			<div className={styles.buyBar}>
				<div className={styles.price}>
					<small>모집기간</small>
					<strong>{cohort.recruitPeriod}</strong>
				</div>
				{canApply ? (
					<a
						className={styles.buyBtn}
						href={cohort.applyUrl}
						rel="noopener"
						onClick={() => logEvent("apply_click", { source: "cohort_banner" })}
					>
						신청하기
					</a>
				) : (
					<a
						className={`${styles.buyBtn} ${styles.buyBtnKakao}`}
						href={content.contact.kakaoUrl}
						onClick={() => logEvent("kakao_click", { source: "cohort_banner" })}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Icon name="kakao" />
						카카오톡 문의
					</a>
				)}
			</div>
		</div>
	);
}
