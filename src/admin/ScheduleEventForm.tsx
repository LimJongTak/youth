import { useState, type FormEvent } from "react";
import type { ScheduleEvent, ScheduleEventDraft } from "../types/schedule";
import styles from "./CohortForm.module.scss";
import formStyles from "./ScheduleEventForm.module.scss";

interface ScheduleEventFormProps {
	cohortId: string;
	initial: ScheduleEvent | null;
	/** Pre-fills the date when adding from a calendar-day click. */
	defaultDate?: string;
	/** Always an array — one entry when editing or adding a single/range
	 * event, several when adding the same content on multiple dates. */
	onSubmit: (events: ScheduleEventDraft[]) => void;
	onCancel: () => void;
}

type CommonFields = Omit<ScheduleEventDraft, "startDate" | "endDate" | "startTime" | "endTime">;

interface MultiRow {
	date: string;
	startTime: string;
	endTime: string;
}

function emptyCommon(cohortId: string): CommonFields {
	return {
		cohortId,
		title: "",
		location: "",
		instructor: "",
		memo: "",
	};
}

export function ScheduleEventForm({
	cohortId,
	initial,
	defaultDate,
	onSubmit,
	onCancel,
}: ScheduleEventFormProps) {
	// Editing always targets one existing document, so only a fresh "add"
	// offers the multi-date shortcut.
	const [mode, setMode] = useState<"single" | "multi">("single");
	const [common, setCommon] = useState<CommonFields>(
		initial
			? {
					cohortId,
					title: initial.title,
					location: initial.location ?? "",
					instructor: initial.instructor ?? "",
					memo: initial.memo ?? "",
				}
			: emptyCommon(cohortId),
	);
	const [startDate, setStartDate] = useState(initial?.startDate ?? defaultDate ?? "");
	const [endDate, setEndDate] = useState(initial?.endDate ?? defaultDate ?? "");
	const [startTime, setStartTime] = useState(initial?.startTime ?? "");
	const [endTime, setEndTime] = useState(initial?.endTime ?? "");
	// Each date keeps its own time — a course rarely repeats at the exact
	// same hour every session, so one shared time for all dates isn't
	// enough here.
	const [multiRows, setMultiRows] = useState<MultiRow[]>([
		{ date: defaultDate ?? "", startTime: "", endTime: "" },
	]);

	function updateMultiRow(index: number, patch: Partial<MultiRow>) {
		setMultiRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	}
	function addMultiRow() {
		setMultiRows((prev) => [...prev, { date: "", startTime: "", endTime: "" }]);
	}
	function removeMultiRow(index: number) {
		setMultiRows((prev) => prev.filter((_, i) => i !== index));
	}

	const validMultiRows = multiRows.filter((row) => row.date);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (mode === "multi") {
			if (validMultiRows.length === 0) return;
			onSubmit(
				validMultiRows.map((row) => ({
					...common,
					startDate: row.date,
					endDate: row.date,
					startTime: row.startTime || undefined,
					endTime: row.endTime || undefined,
				})),
			);
			return;
		}
		onSubmit([
			{
				...common,
				startDate,
				endDate: endDate || startDate,
				startTime: startTime || undefined,
				endTime: endTime || undefined,
			},
		]);
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			{!initial && (
				<div className={`${styles.field} ${styles.wide}`}>
					<div className={formStyles.modeToggle} role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={mode === "single"}
							className={`${formStyles.modeBtn} ${mode === "single" ? formStyles.active : ""}`}
							onClick={() => setMode("single")}
						>
							하루 · 기간
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={mode === "multi"}
							className={`${formStyles.modeBtn} ${mode === "multi" ? formStyles.active : ""}`}
							onClick={() => setMode("multi")}
						>
							같은 내용 여러 날짜
						</button>
					</div>
				</div>
			)}

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="ev-title">제목 (강의명 또는 일정명)</label>
				<input
					id="ev-title"
					type="text"
					required
					placeholder="예: 공통(교양) 또는 수료식"
					value={common.title}
					onChange={(e) => setCommon((c) => ({ ...c, title: e.target.value }))}
				/>
			</div>

			{mode === "single" ? (
				<>
					<div className={styles.field}>
						<label htmlFor="ev-start-date">시작일</label>
						<input
							id="ev-start-date"
							type="date"
							required
							value={startDate}
							onChange={(e) => {
								const next = e.target.value;
								setStartDate(next);
								setEndDate((prev) => (prev && prev >= next ? prev : next));
							}}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="ev-end-date">
							종료일 <span>(하루짜리면 비워두면 시작일과 같아져요)</span>
						</label>
						<input
							id="ev-end-date"
							type="date"
							min={startDate || undefined}
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="ev-start-time">시작시간 (수업이 아니면 생략)</label>
						<input
							id="ev-start-time"
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="ev-end-time">종료시간</label>
						<input
							id="ev-end-time"
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
						/>
					</div>
				</>
			) : (
				<div className={`${styles.field} ${styles.wide}`}>
					<label>
						날짜·시간 목록{" "}
						<span>(같은 제목·장소로 등록하되, 날짜마다 시간은 다르게 지정할 수 있어요)</span>
					</label>
					<div className={formStyles.dateList}>
						{multiRows.map((row, index) => (
							<div className={formStyles.dateRow} key={index}>
								<input
									type="date"
									required
									value={row.date}
									onChange={(e) => updateMultiRow(index, { date: e.target.value })}
								/>
								<input
									type="time"
									className={formStyles.timeInput}
									aria-label="시작시간"
									value={row.startTime}
									onChange={(e) => updateMultiRow(index, { startTime: e.target.value })}
								/>
								<span className={formStyles.timeSep}>~</span>
								<input
									type="time"
									className={formStyles.timeInput}
									aria-label="종료시간"
									value={row.endTime}
									onChange={(e) => updateMultiRow(index, { endTime: e.target.value })}
								/>
								{multiRows.length > 1 && (
									<button
										type="button"
										className={formStyles.removeDateBtn}
										onClick={() => removeMultiRow(index)}
										aria-label="이 날짜 삭제"
									>
										<i className="fas fa-times" />
									</button>
								)}
							</div>
						))}
					</div>
					<button type="button" className={formStyles.addDateBtn} onClick={addMultiRow}>
						<i className="fas fa-plus" />
						날짜 추가
					</button>
				</div>
			)}

			<div className={styles.field}>
				<label htmlFor="ev-location">강의장소</label>
				<input
					id="ev-location"
					type="text"
					placeholder="예: 광양 커뮤니티센터"
					value={common.location ?? ""}
					onChange={(e) => setCommon((c) => ({ ...c, location: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-instructor">교수/강사</label>
				<input
					id="ev-instructor"
					type="text"
					placeholder="예: 홍길동 교수"
					value={common.instructor ?? ""}
					onChange={(e) => setCommon((c) => ({ ...c, instructor: e.target.value }))}
				/>
			</div>

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="ev-memo">비고</label>
				<textarea
					id="ev-memo"
					placeholder="참고사항이 있다면 입력하세요."
					value={common.memo ?? ""}
					onChange={(e) => setCommon((c) => ({ ...c, memo: e.target.value }))}
				/>
			</div>

			<div className={styles.actions}>
				<button type="button" className={styles.btnGhost} onClick={onCancel}>
					취소
				</button>
				<button
					type="submit"
					className={styles.btnPrimary}
					disabled={mode === "multi" && validMultiRows.length === 0}
				>
					{initial
						? "저장"
						: mode === "multi"
							? `${validMultiRows.length || ""}개 날짜에 추가`
							: "일정 추가"}
				</button>
			</div>
		</form>
	);
}
