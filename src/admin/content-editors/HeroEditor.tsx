import { useSectionDraft } from "./useSectionDraft";
import { TextField, TextAreaField, SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import styles from "./shared.module.scss";

export function HeroEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("hero");

	return (
		<div className={styles.form}>
			<TextField
				label="제목 (강조 전)"
				value={draft.titleBefore}
				onChange={(v) => setDraft({ ...draft, titleBefore: v })}
			/>
			<TextField
				label="제목 (강조 부분, 색상 강조됨)"
				value={draft.titleEmphasis}
				onChange={(v) => setDraft({ ...draft, titleEmphasis: v })}
			/>
			<TextField
				label="제목 (강조 후)"
				value={draft.titleAfter}
				onChange={(v) => setDraft({ ...draft, titleAfter: v })}
			/>
			<TextAreaField
				label="부제목 문구"
				value={draft.lead}
				onChange={(v) => setDraft({ ...draft, lead: v })}
			/>
			<RepeatableList
				items={draft.stats}
				onChange={(stats) => setDraft({ ...draft, stats })}
				fields={[
					{ key: "value", label: "값 (예: 만 19~34세)" },
					{ key: "label", label: "설명 (예: 모집 대상)" },
				]}
				emptyItem={() => ({ value: "", label: "" })}
				itemLabel={(_item, i) => `통계 카드 ${i + 1}`}
				addLabel="통계 카드 추가"
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
