import { useMemo, useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSchedule } from "../context/ScheduleContext";
import { useNavigation } from "../context/NavigationContext";
import {
	getMonthGrid,
	isDateInRange,
	parseDateKey,
	toDateKey,
	WEEKDAY_LABELS,
} from "../lib/calendar";
import { formatEventTime, getDayIndicator } from "../lib/schedule";
import { SectionHead } from "./SectionHead";
import styles from "./Schedule.module.scss";

export function Schedule() {
	const { cohorts, selected } = useCohorts();
	const { events } = useSchedule();
	const { scheduleCohortId, scheduleDate } = useNavigation();

	const sortedCohorts = useMemo(
		() => cohorts.slice().sort((a, b) => b.generation - a.generation),
		[cohorts],
	);

	// AppShell only mounts this tab's content while it's active, so these
	// initial values are all that's needed to land on the cohort/day the
	// 홈 탭's 일정 preview was showing.
	const [cohortId, setCohortId] = useState(() => scheduleCohortId ?? selected?.id ?? "");

	const activeCohortId = cohorts.some((c) => c.id === cohortId) ? cohortId : sortedCohorts[0]?.id ?? "";
	const activeCohort = cohorts.find((c) => c.id === activeCohortId);

	const today = new Date();
	const initialDate = scheduleDate ? parseDateKey(scheduleDate) : today;
	const [year, setYear] = useState(initialDate.getFullYear());
	const [month, setMonth] = useState(initialDate.getMonth());
	const [selectedDate, setSelectedDate] = useState<string | null>(scheduleDate ?? toDateKey(today));

	const cohortEvents = useMemo(
		() => events.filter((e) => e.cohortId === activeCohortId),
		[events, activeCohortId],
	);

	const weeks = useMemo(() => getMonthGrid(year, month), [year, month]);

	function changeMonth(delta: number) {
		const next = new Date(year, month + delta, 1);
		setYear(next.getFullYear());
		setMonth(next.getMonth());
		setSelectedDate(null);
	}

	const selectedDateEvents = useMemo(() => {
		if (!selectedDate) return [];
		return cohortEvents
			.filter((e) => isDateInRange(selectedDate, e.startDate, e.endDate))
			.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
	}, [cohortEvents, selectedDate]);

	return (
		<section className="section" id="schedule">
			<SectionHead
				title="교육 일정"
				description="기수를 선택하고 날짜를 눌러 그날의 시간표를 확인하세요."
			/>

			{cohorts.length > 0 && (
				<div className={styles.chipRow} role="tablist">
					{sortedCohorts.map((c) => (
						<button
							key={c.id}
							role="tab"
							aria-selected={activeCohortId === c.id}
							className={`${styles.chip} ${activeCohortId === c.id ? styles.active : ""}`}
							onClick={() => {
								setCohortId(c.id);
								setSelectedDate(null);
							}}
						>
							{c.generation}기
						</button>
					))}
				</div>
			)}

			<div className={styles.calendarHead}>
				<button type="button" className={styles.navBtn} onClick={() => changeMonth(-1)} aria-label="이전 달">
					<i className="fas fa-chevron-left" />
				</button>
				<strong>
					{year}년 {month + 1}월
				</strong>
				<button type="button" className={styles.navBtn} onClick={() => changeMonth(1)} aria-label="다음 달">
					<i className="fas fa-chevron-right" />
				</button>
			</div>

			<div className={styles.grid}>
				{WEEKDAY_LABELS.map((w) => (
					<div className={styles.weekday} key={w}>
						{w}
					</div>
				))}
				{weeks.flat().map(({ date, inMonth }) => {
					const key = toDateKey(date);
					const indicator = getDayIndicator(key, date.getDay(), cohortEvents);
					const isToday = key === toDateKey(today);
					return (
						<button
							type="button"
							key={key}
							className={`${styles.day} ${!inMonth ? styles.dayOut : ""} ${
								selectedDate === key ? styles.daySelected : ""
							} ${isToday ? styles.dayToday : ""}`}
							onClick={() => setSelectedDate(key)}
						>
							<span>{date.getDate()}</span>
							{indicator.hasBar && (
								<span
									className={`${styles.dayBar} ${
										indicator.barLeftConnect ? styles.barLeftConnect : ""
									} ${indicator.barRightConnect ? styles.barRightConnect : ""}`}
								/>
							)}
							{indicator.hasDot && <span className={styles.dayDot} />}
						</button>
					);
				})}
			</div>

			<div className={styles.dayPanel}>
				<h4>
					{selectedDate
						? `${parseDateKey(selectedDate).getMonth() + 1}월 ${parseDateKey(selectedDate).getDate()}일 ${
								activeCohort ? `· ${activeCohort.generation}기` : ""
							}`
						: "날짜를 선택하세요"}
				</h4>

				{selectedDate && selectedDateEvents.length === 0 && (
					<p className={styles.empty}>등록된 일정이 없습니다.</p>
				)}

				{selectedDate && selectedDateEvents.length > 0 && (
					<div className={styles.eventList}>
						{selectedDateEvents.map((event) => (
							<div className={styles.eventRow} key={event.id}>
								<span className={styles.eventTime}>{formatEventTime(event)}</span>
								<div className={styles.eventMain}>
									<strong>{event.title}</strong>
									{(event.location || event.instructor) && (
										<span>{[event.location, event.instructor].filter(Boolean).join(" · ")}</span>
									)}
									{event.memo && <span className={styles.memo}>{event.memo}</span>}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
