import { useMemo, useRef, useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSchedule } from "../context/ScheduleContext";
import { getMonthGrid, isDateInRange, parseDateKey, toDateKey, WEEKDAY_LABELS } from "../lib/calendar";
import { getDayIndicator } from "../lib/schedule";
import {
	downloadScheduleTemplate,
	exportScheduleToExcel,
	parseScheduleExcel,
	type ParsedScheduleImport,
} from "../lib/scheduleExcel";
import type { ScheduleEvent, ScheduleEventDraft } from "../types/schedule";
import { ScheduleEventForm } from "./ScheduleEventForm";
import styles from "./ScheduleManager.module.scss";

function formatEventTime(event: ScheduleEvent): string {
	if (event.startDate !== event.endDate) {
		return `${event.startDate.slice(5).replace("-", ".")} ~ ${event.endDate.slice(5).replace("-", ".")}`;
	}
	if (event.startTime) return `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`;
	return "종일";
}

export function ScheduleManager() {
	const { cohorts } = useCohorts();
	const { events, addEvent, updateEvent, removeEvent, addMany } = useSchedule();
	const sortedCohorts = useMemo(
		() => cohorts.slice().sort((a, b) => b.generation - a.generation),
		[cohorts],
	);

	const [cohortId, setCohortId] = useState(() => sortedCohorts[0]?.id ?? "");
	const activeCohortId = cohorts.some((c) => c.id === cohortId) ? cohortId : sortedCohorts[0]?.id ?? "";

	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth());
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [editing, setEditing] = useState<ScheduleEvent | null>(null);
	const [addingDate, setAddingDate] = useState<string | null>(null);
	const showForm = editing !== null || addingDate !== null;

	const [importPreview, setImportPreview] = useState<ParsedScheduleImport | null>(null);
	const [importing, setImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	async function handleDelete(event: ScheduleEvent) {
		if (!window.confirm(`'${event.title}' 일정을 삭제할까요?`)) return;
		try {
			await removeEvent(event.id);
		} catch (error) {
			console.error(error);
			window.alert("일정을 삭제하지 못했어요. 로그인 상태를 확인하고 다시 시도해주세요.");
		}
	}

	async function handleFormSubmit(drafts: ScheduleEventDraft[]) {
		try {
			if (editing) {
				await updateEvent({ ...drafts[0], id: editing.id });
			} else if (drafts.length === 1) {
				await addEvent(drafts[0]);
			} else {
				await addMany(drafts);
			}
			setEditing(null);
			setAddingDate(null);
		} catch (error) {
			console.error(error);
			window.alert("일정을 저장하지 못했어요. 로그인 상태를 확인하고 다시 시도해주세요.");
		}
	}

	async function handleFileChange(fileEvent: React.ChangeEvent<HTMLInputElement>) {
		const file = fileEvent.target.files?.[0];
		fileEvent.target.value = "";
		if (!file) return;
		const result = await parseScheduleExcel(file, activeCohortId);
		setImportPreview(result);
	}

	async function confirmImport() {
		if (!importPreview || importPreview.drafts.length === 0) return;
		setImporting(true);
		try {
			await addMany(importPreview.drafts);
			setImportPreview(null);
		} catch (error) {
			console.error(error);
			window.alert("엑셀 일정을 가져오지 못했어요. 로그인 상태를 확인하고 다시 시도해주세요.");
		} finally {
			setImporting(false);
		}
	}

	const activeCohort = cohorts.find((c) => c.id === activeCohortId);

	return (
		<div className={styles.wrap}>
			<div className={styles.toolbar}>
				<div className={styles.cohortPicker}>
					<label htmlFor="schedule-cohort">기수</label>
					<select
						id="schedule-cohort"
						value={activeCohortId}
						onChange={(e) => {
							setCohortId(e.target.value);
							setSelectedDate(null);
							setImportPreview(null);
						}}
					>
						{sortedCohorts.map((c) => (
							<option key={c.id} value={c.id}>
								{c.generation}기
							</option>
						))}
					</select>
				</div>

				<div className={styles.toolbarActions}>
					<button
						type="button"
						className={styles.actionBtn}
						onClick={() => {
							setAddingDate(selectedDate ?? toDateKey(today));
							setEditing(null);
						}}
					>
						<i className="fas fa-plus" />
						일정 추가
					</button>
					<button
						type="button"
						className={styles.actionBtn}
						onClick={() => downloadScheduleTemplate(activeCohort ? `${activeCohort.generation}기` : "일정")}
					>
						<i className="fas fa-file-excel" />
						엑셀 양식 다운로드
					</button>
					<button type="button" className={styles.actionBtn} onClick={() => fileInputRef.current?.click()}>
						<i className="fas fa-upload" />
						엑셀 업로드
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".xlsx,.xls"
						hidden
						onChange={handleFileChange}
					/>
					<button
						type="button"
						className={styles.actionBtn}
						disabled={cohortEvents.length === 0}
						onClick={() =>
							exportScheduleToExcel(cohortEvents, activeCohort ? `${activeCohort.generation}기` : "일정")
						}
					>
						<i className="fas fa-file-export" />
						엑셀로 내보내기
					</button>
				</div>
			</div>

			{importPreview && (
				<div className={styles.importPanel}>
					<div className={styles.importHead}>
						<h4>엑셀 미리보기 — {importPreview.drafts.length}건 가져올 수 있어요</h4>
						<button type="button" className={styles.iconBtn} onClick={() => setImportPreview(null)}>
							<i className="fas fa-times" />
						</button>
					</div>

					{importPreview.errors.length > 0 && (
						<ul className={styles.importErrors}>
							{importPreview.errors.map((err) => (
								<li key={err}>{err}</li>
							))}
						</ul>
					)}

					{importPreview.drafts.length > 0 && (
						<div className={styles.importList}>
							{importPreview.drafts.map((d, i) => (
								<div className={styles.importRow} key={i}>
									<span className={styles.importDate}>
										{d.startDate}
										{d.endDate !== d.startDate ? ` ~ ${d.endDate}` : ""}
									</span>
									<span className={styles.importTime}>
										{d.startTime ? `${d.startTime}${d.endTime ? `-${d.endTime}` : ""}` : "종일"}
									</span>
									<span className={styles.importTitle}>{d.title}</span>
									<span className={styles.importMeta}>
										{[d.location, d.instructor].filter(Boolean).join(" · ")}
									</span>
								</div>
							))}
						</div>
					)}

					<div className={styles.actions}>
						<button type="button" className={styles.btnGhost} onClick={() => setImportPreview(null)}>
							취소
						</button>
						<button
							type="button"
							className={styles.btnPrimary}
							disabled={importPreview.drafts.length === 0 || importing}
							onClick={confirmImport}
						>
							{importing ? "가져오는 중..." : `${importPreview.drafts.length}건 가져오기`}
						</button>
					</div>
				</div>
			)}

			<div className={styles.calendarHead}>
				<button type="button" className={styles.iconBtn} onClick={() => changeMonth(-1)}>
					<i className="fas fa-chevron-left" />
				</button>
				<strong>
					{year}년 {month + 1}월
				</strong>
				<button type="button" className={styles.iconBtn} onClick={() => changeMonth(1)}>
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
					const count = cohortEvents.filter((e) => isDateInRange(key, e.startDate, e.endDate)).length;
					const indicator = getDayIndicator(key, date.getDay(), cohortEvents);
					return (
						<button
							type="button"
							key={key}
							className={`${styles.day} ${!inMonth ? styles.dayOut : ""} ${
								selectedDate === key ? styles.daySelected : ""
							}`}
							onClick={() => setSelectedDate(key)}
						>
							<span>{date.getDate()}</span>
							{count > 0 && <span className={styles.dayCount}>{count}</span>}
							{indicator.hasBar && (
								<span
									className={`${styles.dayBar} ${
										indicator.barLeftConnect ? styles.barLeftConnect : ""
									} ${indicator.barRightConnect ? styles.barRightConnect : ""}`}
								/>
							)}
						</button>
					);
				})}
			</div>

			<div className={styles.dayPanel}>
				<div className={styles.dayPanelHead}>
					<h4>
						{selectedDate
							? `${parseDateKey(selectedDate).getMonth() + 1}월 ${parseDateKey(selectedDate).getDate()}일 일정`
							: "날짜를 선택하세요"}
					</h4>
					{selectedDate && (
						<button
							type="button"
							className={styles.addDayBtn}
							onClick={() => {
								setAddingDate(selectedDate);
								setEditing(null);
							}}
						>
							<i className="fas fa-plus" />이 날짜에 추가
						</button>
					)}
				</div>

				{selectedDate && (
					<div className={styles.eventList}>
						{selectedDateEvents.length === 0 && (
							<p className={styles.empty}>등록된 일정이 없습니다.</p>
						)}
						{selectedDateEvents.map((event) => (
							<div className={styles.eventRow} key={event.id}>
								<span className={styles.eventTime}>{formatEventTime(event)}</span>
								<div className={styles.eventMain}>
									<strong>{event.title}</strong>
									{(event.location || event.instructor) && (
										<span>{[event.location, event.instructor].filter(Boolean).join(" · ")}</span>
									)}
								</div>
								<div className={styles.eventActions}>
									<button
										type="button"
										className={styles.iconBtn}
										onClick={() => {
											setEditing(event);
											setAddingDate(null);
										}}
									>
										<i className="fas fa-pen" />
									</button>
									<button
										type="button"
										className={`${styles.iconBtn} ${styles.danger}`}
										onClick={() => handleDelete(event)}
									>
										<i className="fas fa-trash" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{showForm && activeCohortId && (
				<div className={styles.modalOverlay} onClick={() => { setEditing(null); setAddingDate(null); }}>
					<div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
						<h3>{editing ? "일정 수정" : "일정 추가"}</h3>
						<ScheduleEventForm
							cohortId={activeCohortId}
							initial={editing}
							defaultDate={addingDate ?? undefined}
							onSubmit={handleFormSubmit}
							onCancel={() => {
								setEditing(null);
								setAddingDate(null);
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
