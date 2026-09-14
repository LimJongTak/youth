import { useSectionDraft } from "./useSectionDraft";
import { SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import styles from "./shared.module.scss";

export function JourneyEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("journey");

	return (
		<div className={styles.form}>
			<RepeatableList
				items={draft}
				onChange={setDraft}
				fields={[
					{ key: "title", label: "단계 제목" },
					{ key: "desc", label: "설명", type: "textarea" },
				]}
				emptyItem={() => ({ title: "", desc: "" })}
				itemLabel={(item, i) => item.title || `단계 ${i + 1}`}
				addLabel="단계 추가"
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
