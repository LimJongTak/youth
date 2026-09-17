import { useMemo, useRef, useState, type TouchEvent } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useSchedule } from "../../context/ScheduleContext";
import { useNavigation } from "../../context/NavigationContext";
import {
	getMonthGrid,
	parseDateKey,
	toDateKey,
	WEEKDAY_LABELS,
} from "../../lib/calendar";
import { DEFAULT_DOT_COLOR, formatEventTime, getDayDotColors, getDayEvents } from "../../lib/schedule";
import { SectionHead } from "../layout/SectionHead";
import { Icon } from "../icons/Icon";
import { EmptyState } from "../common/EmptyState";
import { Skeleton } from "../common/Skeleton";
import styles from "./Schedule.module.scss";

// 공개 사이트 "스케줄" 탭 — 기수를 고르고 달력에서 날짜를 눌러 그날의
// 시간표를 확인한다. 좌우 스와이프/화살표로 월 이동, 이번 달이 아닐 땐
// "오늘" 바로가기, 달력 아래엔 이번 달 일정 제목-색상 범례를 보여준다.
export function Schedule() {
	const { cohorts, selected } = useCohorts();
	const { events, loading: scheduleLoading } = useSchedule();
	const { scheduleCohortId, scheduleDate } = useNavigation();

	const sortedCohorts = useMemo(
		() => cohorts.slice().sort((a, b) => b.generation - a.generation),
		[cohorts],
	);

	// AppShell은 이 탭이 활성화됐을 때만 내용을 마운트하므로, 아래 초기값만
	// 설정해두면 홈 탭의 일정 미리보기가 보여주던 기수/날짜로 그대로 이어서
	// 열린다. 관리자가 명시적으로 지정하지 않았다면, 사이트 전체의
	// `featured` 기수 대신 가장 오래된(가장 낮은 기수) 기수를 먼저 연다 —
	// 보통 그쪽에 실제 일정 데이터가 있기 때문.
	const scheduleDefaultCohortId = cohorts.find((c) => c.scheduleDefault)?.id;
	const oldestCohortId = sortedCohorts[sortedCohorts.length - 1]?.id;
	const [cohortId, setCohortId] = useState(
		() => scheduleCohortId ?? scheduleDefaultCohortId ?? oldestCohortId ?? selected?.id ?? "",
	);

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

	const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

	function goToToday() {
		setYear(today.getFullYear());
		setMonth(today.getMonth());
		setSelectedDate(toDateKey(today));
	}

	// 달력 그리드 어디서든 좌우로 스와이프하면 화살표를 누른 것과 똑같이
	// 월이 이동한다 — 터치 화면 사용자가 본능적으로 시도하는 동작.
	const touchStartX = useRef<number | null>(null);
	function handleTouchStart(event: TouchEvent) {
		touchStartX.current = event.touches[0].clientX;
	}
	function handleTouchEnd(event: TouchEvent) {
		if (touchStartX.current === null) return;
		const delta = event.changedTouches[0].clientX - touchStartX.current;
		touchStartX.current = null;
		const SWIPE_THRESHOLD = 48;
		if (delta > SWIPE_THRESHOLD) changeMonth(-1);
		else if (delta < -SWIPE_THRESHOLD) changeMonth(1);
	}

	const selectedDateEvents = useMemo(
		() => (selectedDate ? getDayEvents(selectedDate, cohortEvents) : []),
		[cohortEvents, selectedDate],
	);

	// 달력 아래에 보여줄 범례: 이번 달에 보이는 일정 제목마다 하나씩 —
	// 매번 날짜를 눌러보지 않아도 점 색깔이 무슨 의미인지 한눈에 알 수 있게.
	const monthLegend = useMemo(() => {
		const monthStart = toDateKey(new Date(year, month, 1));
		const monthEnd = toDateKey(new Date(year, month + 1, 0));
		const colorByTitle = new Map<string, string>();
		for (const event of cohortEvents) {
			if (event.endDate < monthStart || event.startDate > monthEnd) continue;
			if (!colorByTitle.has(event.title)) {
				colorByTitle.set(event.title, event.color || DEFAULT_DOT_COLOR);
			}
		}
		return Array.from(colorByTitle, ([title, color]) => ({ title, color }));
	}, [cohortEvents, year, month]);

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
					<Icon name="chevron-left" />
				</button>
				<div className={styles.calendarHeadCenter}>
					<strong>
						{year}년 {month + 1}월
					</strong>
					{!isCurrentMonth && (
						<button type="button" className={styles.todayBtn} onClick={goToToday}>
							오늘
						</button>
					)}
				</div>
				<button type="button" className={styles.navBtn} onClick={() => changeMonth(1)} aria-label="다음 달">
					<Icon name="chevron-right" />
				</button>
			</div>

			<div
				className={styles.grid}
				key={`${year}-${month}`}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				{WEEKDAY_LABELS.map((w) => (
					<div className={styles.weekday} key={w}>
						{w}
					</div>
				))}
				{weeks.flat().map(({ date, inMonth }) => {
					const key = toDateKey(date);
					const dotColors = getDayDotColors(key, cohortEvents);
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
							{dotColors.length > 0 && (
								<span className={styles.dayDots}>
									{dotColors.slice(0, 4).map((color, i) => (
										<span
											key={i}
											className={styles.dayDot}
											style={{ background: color }}
										/>
									))}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{monthLegend.length > 0 && (
				<div className={styles.legend}>
					{monthLegend.map((item) => (
						<span className={styles.legendItem} key={item.title}>
							<span className={styles.legendDot} style={{ background: item.color }} />
							{item.title}
						</span>
					))}
				</div>
			)}

			<div className={styles.dayPanel}>
				<h4>
					{selectedDate
						? `${parseDateKey(selectedDate).getMonth() + 1}월 ${parseDateKey(selectedDate).getDate()}일 ${
								activeCohort ? `· ${activeCohort.generation}기` : ""
							}`
						: "날짜를 선택하세요"}
				</h4>

				{selectedDate && scheduleLoading && (
					<div className={styles.eventList}>
						<Skeleton height={52} />
						<Skeleton height={52} />
					</div>
				)}

				{selectedDate && !scheduleLoading && selectedDateEvents.length === 0 && (
					<EmptyState message="등록된 일정이 없습니다." />
				)}

				{selectedDate && !scheduleLoading && selectedDateEvents.length > 0 && (
					<div className={styles.eventList}>
						{selectedDateEvents.map((event) => (
							<div className={styles.eventRow} key={event.id}>
								<span
									className={styles.eventColorDot}
									style={{ background: event.color || undefined }}
								/>
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
