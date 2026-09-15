import { useSectionDraft } from "./useSectionDraft";
import { TextField, SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import type { Track } from "../../types/siteContent";
import styles from "./shared.module.scss";

const levelOptions: { value: Track["id"]; label: string; badgeClass: string }[] = [
	{ value: "basic", label: "초급", badgeClass: "lvBasic" },
	{ value: "mid", label: "중급", badgeClass: "lvMid" },
	{ value: "adv", label: "고급", badgeClass: "lvAdv" },
];

function emptyTrack(): Track {
	return {
		id: "basic",
		tabLabel: "초급",
		badge: "BASIC",
		badgeClass: "lvBasic",
		title: "",
		subtitle: "",
		hours: [],
		total: "",
		courses: [],
	};
}

export function TracksEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("tracks");

	function updateTrack(index: number, patch: Partial<Track>) {
		setDraft(draft.map((track, i) => (i === index ? { ...track, ...patch } : track)));
	}

	function removeTrack(index: number) {
		setDraft(draft.filter((_, i) => i !== index));
	}

	return (
		<div className={styles.form}>
			{draft.map((track, index) => (
				<div className={styles.itemCard} key={index}>
					<div className={styles.itemHead}>
						<span className={styles.itemBadge}>트랙 {index + 1}</span>
						<button
							type="button"
							className={styles.removeBtn}
							onClick={() => removeTrack(index)}
							title="삭제"
						>
							<i className="fas fa-trash" />
						</button>
					</div>

					<label className={styles.field}>
						난이도 (탭 색상 · 배지 문구에 함께 반영됩니다)
						<select
							value={track.id}
							onChange={(e) => {
								const opt = levelOptions.find((o) => o.value === e.target.value)!;
								updateTrack(index, { id: opt.value, badgeClass: opt.badgeClass });
							}}
						>
							{levelOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</label>

					<div className={styles.row2}>
						<TextField
							label="탭 이름 (예: 초급)"
							value={track.tabLabel}
							onChange={(v) => updateTrack(index, { tabLabel: v })}
						/>
						<TextField
							label="배지 문구 (예: BASIC)"
							value={track.badge}
							onChange={(v) => updateTrack(index, { badge: v })}
						/>
					</div>

					<TextField
						label="트랙 제목"
						value={track.title}
						onChange={(v) => updateTrack(index, { title: v })}
					/>
					<TextField
						label="트랙 부제목"
						value={track.subtitle}
						onChange={(v) => updateTrack(index, { subtitle: v })}
					/>

					<RepeatableList
						items={track.hours}
						onChange={(hours) => updateTrack(index, { hours })}
						fields={[
							{ key: "value", label: "시간 (예: 30H)" },
							{ key: "label", label: "구분 (예: 교양)" },
						]}
						emptyItem={() => ({ value: "", label: "" })}
						itemLabel={(item, i) => item.label || `시간 항목 ${i + 1}`}
						addLabel="시간 항목 추가"
					/>

					<TextField
						label="총 교육시간 (예: 105시간)"
						value={track.total}
						onChange={(v) => updateTrack(index, { total: v })}
					/>

					<label className={styles.field}>
						이 트랙만의 과목 (자세히 보기 카드에 표시 — 공통과정 2과목은 자동으로 함께 표시됩니다)
					</label>
					<RepeatableList
						items={track.courses}
						onChange={(courses) => updateTrack(index, { courses })}
						fields={[
							{ key: "name", label: "과목명 (예: 심층강화학습)" },
							{ key: "kind", label: "구분 (예: 전문과정 / 몰입과정)" },
						]}
						emptyItem={() => ({ name: "", kind: "" })}
						itemLabel={(item, i) => item.name || `과목 ${i + 1}`}
						addLabel="과목 추가"
					/>
				</div>
			))}
			<button type="button" className={styles.addBtn} onClick={() => setDraft([...draft, emptyTrack()])}>
				<i className="fas fa-plus" />
				트랙 추가
			</button>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
