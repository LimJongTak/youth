import { useState, type FormEvent } from "react";
import type { ScheduleEvent, ScheduleEventDraft } from "../../types/schedule";
import { DEFAULT_DOT_COLOR } from "../../lib/schedule";
// 기수 등록 폼의 필드/버튼 스타일을 그대로 재사용 — 관리자 폼마다 같은
// CSS를 중복 작성하지 않고도 화면들이 통일된 느낌을 유지한다.
import styles from "../cohorts/CohortForm.module.scss";
import formStyles from "./ScheduleEventForm.module.scss";

interface ScheduleEventFormProps {
	cohortId: string;
	initial: ScheduleEvent | null;
	/** 캘린더의 날짜를 클릭해서 추가할 때 그 날짜로 미리 채워줌. */
	defaultDate?: string;
	/** 수정 시, initial과 "같은 내용 여러 날짜"로 묶인 일정 전체(initial
	 * 포함). 2개 이상이면 묶음 전체를 한 번에 수정하는 옵션을 보여준다. */
	series?: ScheduleEvent[];
	/** 항상 배열로 전달됨 — 하루/기간 일정이면 원소 1개, 같은 내용 여러
	 * 날짜면 여러 개. 묶음 수정 시 기존 날짜는 id가 채워져 있고, 새로
	 * 추가한 날짜는 id가 없다. scope는 수정 범위(이 일정만/묶음 전체). */
	onSubmit: (events: SubmittedEvent[], scope: "single" | "multi") => void;
	onCancel: () => void;
}

export type SubmittedEvent = ScheduleEventDraft & { id?: string };

type CommonFields = Omit<ScheduleEventDraft, "startDate" | "endDate" | "startTime" | "endTime">;

interface MultiRow {
	/** 묶음 수정 시 기존 일정의 문서 ID — 새로 추가한 날짜는 없음. */
	id?: string;
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
		color: DEFAULT_DOT_COLOR,
		displayStyle: "dot",
	};
}

export function ScheduleEventForm({
	cohortId,
	initial,
	defaultDate,
	series,
	onSubmit,
	onCancel,
}: ScheduleEventFormProps) {
	// 새로 추가할 때는 항상, 수정할 때는 같은 내용으로 묶인 일정이 여러
	// 개일 때만 "여러 날짜" 모드를 고를 수 있다.
	const hasSeries = !!initial && !!series && series.length > 1;
	const [mode, setMode] = useState<"single" | "multi">("single");
	const [common, setCommon] = useState<CommonFields>(
		initial
			? {
					cohortId,
					title: initial.title,
					location: initial.location ?? "",
					instructor: initial.instructor ?? "",
					memo: initial.memo ?? "",
					color: initial.color ?? DEFAULT_DOT_COLOR,
					displayStyle: initial.displayStyle ?? "dot",
				}
			: emptyCommon(cohortId),
	);
	const [startDate, setStartDate] = useState(initial?.startDate ?? defaultDate ?? "");
	const [endDate, setEndDate] = useState(initial?.endDate ?? defaultDate ?? "");
	const [startTime, setStartTime] = useState(initial?.startTime ?? "");
	const [endTime, setEndTime] = useState(initial?.endTime ?? "");
	// 날짜마다 각자 시간을 가짐 — 수업이 매번 정확히 같은 시간에 반복되는
	// 경우는 드물어서, 모든 날짜에 시간 하나만 공유하는 걸로는 부족하다.
	const [multiRows, setMultiRows] = useState<MultiRow[]>(() =>
		hasSeries
			? series.map((e) => ({ id: e.id, date: e.startDate, startTime: e.startTime ?? "", endTime: e.endTime ?? "" }))
			: [{ date: defaultDate ?? "", startTime: "", endTime: "" }],
	);

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
			// 여러 날짜 등록은 날짜마다 별개의 하루짜리 일정이라 "막대"가
			// 의미 없으므로(이어지는 기간이 아님) 항상 점으로 표시한다.
			onSubmit(
				validMultiRows.map((row) => ({
					...common,
					id: row.id,
					displayStyle: "dot",
					startDate: row.date,
					endDate: row.date,
					startTime: row.startTime || undefined,
					endTime: row.endTime || undefined,
				})),
				"multi",
			);
			return;
		}
		const resolvedEndDate = endDate || startDate;
		onSubmit([
			{
				...common,
				// 기간이 아닌 하루짜리 일정은 막대로 표시할 게 없으므로 항상
				// 점으로 저장 — 폼에서 기간이었다가 종료일을 지워 하루짜리로
				// 바뀐 경우까지 포함.
				displayStyle: resolvedEndDate !== startDate ? common.displayStyle : "dot",
				startDate,
				endDate: resolvedEndDate,
				startTime: startTime || undefined,
				endTime: endTime || undefined,
			},
		], "single");
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			{(!initial || hasSeries) && (
				<div className={`${styles.field} ${styles.wide}`}>
					<div className={formStyles.modeToggle} role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={mode === "single"}
							className={`${formStyles.modeBtn} ${mode === "single" ? formStyles.active : ""}`}
							onClick={() => setMode("single")}
						>
							{initial ? "이 날짜만 수정" : "하루 · 기간"}
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={mode === "multi"}
							className={`${formStyles.modeBtn} ${mode === "multi" ? formStyles.active : ""}`}
							onClick={() => setMode("multi")}
						>
							{initial ? `같은 일정 ${series!.length}개 모두 수정` : "같은 내용 여러 날짜"}
						</button>
					</div>
					{initial && mode === "multi" && (
						<p className={formStyles.seriesHint}>
							아래 날짜 목록에서 날짜를 추가하거나 빼면, 저장할 때 해당 일정이 함께 추가·삭제돼요.
						</p>
					)}
				</div>
			)}

			<div className={styles.field}>
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

			<div className={styles.field}>
				<label htmlFor="ev-color">캘린더 점 색상</label>
				<div className={formStyles.colorRow}>
					<input
						id="ev-color"
						type="color"
						className={formStyles.colorInput}
						value={common.color || DEFAULT_DOT_COLOR}
						onChange={(e) => setCommon((c) => ({ ...c, color: e.target.value }))}
					/>
					<span className={formStyles.colorValue}>{common.color || DEFAULT_DOT_COLOR}</span>
				</div>
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

					{endDate && endDate !== startDate && (
						<div className={`${styles.field} ${styles.wide}`}>
							<label>캘린더 표시 방식</label>
							<div className={formStyles.modeToggle} role="tablist">
								<button
									type="button"
									role="tab"
									aria-selected={common.displayStyle !== "bar"}
									className={`${formStyles.modeBtn} ${
										common.displayStyle !== "bar" ? formStyles.active : ""
									}`}
									onClick={() => setCommon((c) => ({ ...c, displayStyle: "dot" }))}
								>
									점으로 표시
								</button>
								<button
									type="button"
									role="tab"
									aria-selected={common.displayStyle === "bar"}
									className={`${formStyles.modeBtn} ${
										common.displayStyle === "bar" ? formStyles.active : ""
									}`}
									onClick={() => setCommon((c) => ({ ...c, displayStyle: "bar" }))}
								>
									막대로 표시
								</button>
							</div>
						</div>
					)}

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
							<div className={formStyles.dateRow} key={row.id ?? index}>
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
						? mode === "multi"
							? `${validMultiRows.length || ""}개 날짜 모두 저장`
							: "저장"
						: mode === "multi"
							? `${validMultiRows.length || ""}개 날짜에 추가`
							: "일정 추가"}
				</button>
			</div>
		</form>
	);
}
