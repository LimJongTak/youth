import { useSectionDraft } from "./useSectionDraft";
import { TextField, TextAreaField, SaveBar } from "./Field";
import styles from "./shared.module.scss";

export function AboutEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("about");

	return (
		<div className={styles.form}>
			<TextAreaField
				label="섹션 소개 문구 (제목 아래 작은 설명)"
				value={draft.description}
				onChange={(v) => setDraft({ ...draft, description: v })}
			/>
			<TextField
				label="본문 강조 문구 (굵게 표시되는 앞부분)"
				value={draft.bodyHighlight}
				onChange={(v) => setDraft({ ...draft, bodyHighlight: v })}
			/>
			<TextAreaField
				label="본문 (강조 문구 뒤에 이어지는 내용)"
				value={draft.body}
				onChange={(v) => setDraft({ ...draft, body: v })}
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
