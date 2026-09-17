import { useSectionDraft } from "./useSectionDraft";
import { TextField, SaveBar } from "./Field";
import styles from "./shared.module.scss";

// 커리큘럼의 "공통과정" 안내 문구(제목/설명) 편집 폼.
export function CommonCourseEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("commonCourse");

	return (
		<div className={styles.form}>
			<TextField
				label="공통과정 제목"
				value={draft.title}
				onChange={(v) => setDraft({ ...draft, title: v })}
			/>
			<TextField
				label="공통과정 설명"
				value={draft.desc}
				onChange={(v) => setDraft({ ...draft, desc: v })}
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
