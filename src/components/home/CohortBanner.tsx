import { useMemo, useState } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useSiteContent } from "../../context/SiteContentContext";
import { useSchedule } from "../../context/ScheduleContext";
import { useNavigation } from "../../context/NavigationContext";
import { statusLabel } from "../../types/cohort";
import { logEvent } from "../../lib/analytics";
import { getMonthGrid, isDateInRange, parseDateKey, toDateKey, WEEKDAY_LABELS } from "../../lib/calendar";
import { formatEventTime, getDayIndicator } from "../../lib/schedule";
import { SectionHead } from "../layout/SectionHead";
import styles from "./CohortBanner.module.scss";

type CardTab = "info" | "schedule";

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
	const { applySteps, contact, checklist } = content;
	const { events } = useSchedule();
	const { goToSchedule } = useNavigation();
	const [cardTab, setCardTab] = useState<CardTab>("info");
	const todayKey = toDateKey(new Date());
	const [previewMonth, setPreviewMonth] = useState(() => {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() };
	});
	const [previewDate, setPreviewDate] = useState<string | null>(todayKey);

	const cohortEvents = useMemo(
		() => events.filter((e) => e.cohortId === selected.id),
		[events, selected.id],
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

	function shiftPreviewMonth(delta: number) {
		setPreviewMonth(({ year, month }) => {
			const next = new Date(year, month + delta, 1);
			return { year: next.getFullYear(), month: next.getMonth() };
		});
		setPreviewDate(null);
	}

	if (cohorts.length === 0) return null;

	const canApply = selected.status === "recruiting" && Boolean(selected.applyUrl);

	return (
		<section className="section" id="cohort">
			<SectionHead title="기수 안내 및 신청" />

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
							onClick={() => {
								select(cohort.id);
								setCardTab("info");
							}}
						>
							<span className={`${styles.dot} ${dotClass[cohort.status]}`} />
							교육생 {statusLabel[cohort.status]}({cohort.generation}기)
						</button>
					))}
			</div>

			<div className={styles.card}>
				<div className={styles.cardSwitcher} role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={cardTab === "info"}
						className={`${styles.cardTabBtn} ${cardTab === "info" ? styles.active : ""}`}
						onClick={() => setCardTab("info")}
					>
						교육 안내
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={cardTab === "schedule"}
						className={`${styles.cardTabBtn} ${cardTab === "schedule" ? styles.active : ""}`}
						onClick={() => setCardTab("schedule")}
					>
						일정
					</button>
				</div>

				{cardTab === "info" ? (
					<>
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
					</>
				) : (
					<div className={styles.schedulePreview}>
						<div className={styles.miniHead}>
							<button
								type="button"
								className={styles.miniNavBtn}
								onClick={() => shiftPreviewMonth(-1)}
								aria-label="이전 달"
							>
								<i className="fas fa-chevron-left" />
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
								<i className="fas fa-chevron-right" />
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
								const indicator = getDayIndicator(key, date.getDay(), cohortEvents);
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
										{indicator.hasBar && (
											<span
												className={`${styles.miniBar} ${
													indicator.barLeftConnect ? styles.miniBarLeftConnect : ""
												} ${indicator.barRightConnect ? styles.miniBarRightConnect : ""}`}
											/>
										)}
										{indicator.hasDot && <span className={styles.miniDot} />}
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
							{previewDate && previewDateEvents.length === 0 && (
								<p className={styles.note}>등록된 일정이 없습니다.</p>
							)}
							{previewDate && previewDateEvents.length > 0 && (
								<div className={styles.previewList}>
									{previewDateEvents.map((event) => (
										<div className={styles.previewRow} key={event.id}>
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
							onClick={() => goToSchedule(selected.id, previewDate ?? undefined)}
						>
							자세히 보기
							<i className="fas fa-chevron-right" />
						</button>
					</div>
				)}
			</div>

			<div className={styles.checklistBlock}>
				<SectionHead
					title={
						<>
							나도 신청할 수 있을까? <br />
							모집대상 확인
						</>
					}
					description="아래 항목에 해당하는지 하나씩 확인해보세요."
				/>
				<div className={styles.card}>
					<h4 className={styles.checklistHeading}>모집대상 확인</h4>
					<div className={styles.checklistList}>
						{checklist.map((item) => (
							<div className={styles.checklistItem} key={item.title}>
								<span className={styles.checklistBox}>
									<i className="fas fa-check" />
								</span>
								<span>
									<strong>{item.title}</strong>
									<small>{item.desc}</small>
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className={styles.warningNote}>
				<i className="fas fa-exclamation-triangle" />
				<span>
					{selected.generation}기 모집기간은 <strong>{selected.recruitPeriod}</strong>
					이며, 선착순 모집으로 조기 마감될 수 있습니다.
				</span>
			</div>

			<div className={styles.ctaCard}>
				{canApply ? (
					<a
						className="btn btn-primary btn-block"
						href={selected.applyUrl}
						rel="noopener"
						onClick={() => logEvent("apply_click", { source: "cohort_banner" })}
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
					onClick={() => logEvent("kakao_click", { source: "cohort_banner" })}
					target="_blank"
					rel="noopener noreferrer"
				>
					<i className="fas fa-comment" />
					카카오톡 문의하기
				</a>
			</div>

			<div className={`${styles.card} ${styles.stepsCard}`}>
				<h4 className={styles.stepsHeading}>신청 방법</h4>
				<div className={styles.stepsInner}>
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
			</div>
		</section>
	);
}
