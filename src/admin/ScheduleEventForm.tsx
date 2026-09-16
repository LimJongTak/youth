import { useState, type FormEvent } from "react";
import type { ScheduleEvent, ScheduleEventDraft } from "../types/schedule";
import styles from "./CohortForm.module.scss";

interface ScheduleEventFormProps {
	cohortId: string;
	initial: ScheduleEvent | null;
	/** Pre-fills the date when adding from a calendar-day click. */
	defaultDate?: string;
	onSubmit: (event: ScheduleEventDraft) => void;
	onCancel: () => void;
}

function emptyDraft(cohortId: string, defaultDate?: string): ScheduleEventDraft {
	return {
		cohortId,
		title: "",
		startDate: defaultDate ?? "",
		endDate: defaultDate ?? "",
		startTime: "",
		endTime: "",
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
	const [draft, setDraft] = useState<ScheduleEventDraft>(
		initial ? { ...initial } : emptyDraft(cohortId, defaultDate),
	);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const endDate = draft.endDate || draft.startDate;
		onSubmit({ ...draft, endDate });
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="ev-title">제목 (강의명 또는 일정명)</label>
				<input
					id="ev-title"
					type="text"
					required
					placeholder="예: 공통(교양) 또는 수료식"
					value={draft.title}
					onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-start-date">시작일</label>
				<input
					id="ev-start-date"
					type="date"
					required
					value={draft.startDate}
					onChange={(e) =>
						setDraft((d) => ({
							...d,
							startDate: e.target.value,
							endDate: d.endDate && d.endDate >= e.target.value ? d.endDate : e.target.value,
						}))
					}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-end-date">
					종료일 <span>(하루짜리면 비워두면 시작일과 같아져요)</span>
				</label>
				<input
					id="ev-end-date"
					type="date"
					min={draft.startDate || undefined}
					value={draft.endDate}
					onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-start-time">시작시간 (수업이 아니면 생략)</label>
				<input
					id="ev-start-time"
					type="time"
					value={draft.startTime ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-end-time">종료시간</label>
				<input
					id="ev-end-time"
					type="time"
					value={draft.endTime ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-location">강의장소</label>
				<input
					id="ev-location"
					type="text"
					placeholder="예: 광양 커뮤니티센터"
					value={draft.location ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="ev-instructor">교수/강사</label>
				<input
					id="ev-instructor"
					type="text"
					placeholder="예: 홍길동 교수"
					value={draft.instructor ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, instructor: e.target.value }))}
				/>
			</div>

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="ev-memo">비고</label>
				<textarea
					id="ev-memo"
					placeholder="참고사항이 있다면 입력하세요."
					value={draft.memo ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, memo: e.target.value }))}
				/>
			</div>

			<div className={styles.actions}>
				<button type="button" className={styles.btnGhost} onClick={onCancel}>
					취소
				</button>
				<button type="submit" className={styles.btnPrimary}>
					{initial ? "저장" : "일정 추가"}
				</button>
			</div>
		</form>
	);
}
