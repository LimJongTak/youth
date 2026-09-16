import { useState, type FormEvent } from "react";
import type { Cohort, CohortStatus } from "../../types/cohort";
import { statusLabel } from "../../types/cohort";
import styles from "./CohortForm.module.scss";

interface CohortFormProps {
	initial: Cohort | null;
	onSubmit: (cohort: Cohort) => void;
	onCancel: () => void;
}

function emptyDraft(): Omit<Cohort, "id"> {
	return {
		generation: 1,
		status: "upcoming",
		capacity: "",
		recruitPeriod: "",
		eduPeriod: "",
		eduHours: "",
		location: "",
		note: "",
		applyUrl: "",
		featured: false,
	};
}

export function CohortForm({ initial, onSubmit, onCancel }: CohortFormProps) {
	const [draft, setDraft] = useState<Omit<Cohort, "id">>(
		initial ? { ...initial } : emptyDraft(),
	);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const id = initial?.id ?? `gen-${Date.now()}`;
		onSubmit({ ...draft, id });
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={styles.field}>
				<label htmlFor="generation">기수(회차)</label>
				<input
					id="generation"
					type="number"
					min={1}
					required
					value={draft.generation}
					onChange={(e) =>
						setDraft((d) => ({ ...d, generation: Number(e.target.value) }))
					}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="status">모집 상태</label>
				<select
					id="status"
					value={draft.status}
					onChange={(e) =>
						setDraft((d) => ({ ...d, status: e.target.value as CohortStatus }))
					}
				>
					{(Object.keys(statusLabel) as CohortStatus[]).map((key) => (
						<option key={key} value={key}>
							{statusLabel[key]}
						</option>
					))}
				</select>
			</div>

			<div className={styles.field}>
				<label htmlFor="capacity">모집인원</label>
				<input
					id="capacity"
					type="text"
					required
					placeholder="예: 총 30명"
					value={draft.capacity}
					onChange={(e) => setDraft((d) => ({ ...d, capacity: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="recruitPeriod">모집기간</label>
				<input
					id="recruitPeriod"
					type="text"
					required
					placeholder="예: 2026.09.14(월) ~ 09.30(수)"
					value={draft.recruitPeriod}
					onChange={(e) => setDraft((d) => ({ ...d, recruitPeriod: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="eduPeriod">교육기간</label>
				<input
					id="eduPeriod"
					type="text"
					required
					placeholder="예: 2026.10.06(화) ~ 12.12(토)"
					value={draft.eduPeriod}
					onChange={(e) => setDraft((d) => ({ ...d, eduPeriod: e.target.value }))}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="eduHours">교육시간</label>
				<input
					id="eduHours"
					type="text"
					required
					placeholder="예: 105~150시간 (트랙별 상이)"
					value={draft.eduHours}
					onChange={(e) => setDraft((d) => ({ ...d, eduHours: e.target.value }))}
				/>
			</div>

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="location">교육장소 (줄바꿈으로 여러 줄 입력 가능)</label>
				<textarea
					id="location"
					required
					placeholder={"예: 광양 커뮤니티센터(공통과정)\n국립순천대학교(전문·몰입교과)"}
					value={draft.location}
					onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
				/>
			</div>

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="applyUrl">신청 링크 (구글 폼 등)</label>
				<input
					id="applyUrl"
					type="url"
					required
					placeholder="예: https://docs.google.com/forms/d/e/..../viewform"
					value={draft.applyUrl}
					onChange={(e) => setDraft((d) => ({ ...d, applyUrl: e.target.value }))}
				/>
			</div>

			<div className={`${styles.field} ${styles.wide}`}>
				<label htmlFor="note">비고</label>
				<textarea
					id="note"
					placeholder="예: 선착순 모집으로 인해 조기 마감될 수 있습니다."
					value={draft.note ?? ""}
					onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
				/>
			</div>

			<label className={styles.checkboxRow}>
				<input
					type="checkbox"
					checked={draft.featured}
					onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
				/>
				공개 사이트의 기본 노출 기수로 설정
			</label>

			<div className={styles.actions}>
				<button type="button" className={styles.btnGhost} onClick={onCancel}>
					취소
				</button>
				<button type="submit" className={styles.btnPrimary}>
					{initial ? "저장" : "기수 추가"}
				</button>
			</div>
		</form>
	);
}
