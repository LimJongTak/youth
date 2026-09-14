import { useSectionDraft } from "./useSectionDraft";
import { SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import styles from "./shared.module.scss";

export function FaqsEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("faqs");

	return (
		<div className={styles.form}>
			<RepeatableList
				items={draft}
				onChange={setDraft}
				fields={[
					{ key: "q", label: "질문" },
					{ key: "a", label: "답변", type: "textarea" },
				]}
				emptyItem={() => ({ q: "", a: "" })}
				itemLabel={(item, i) => item.q || `질문 ${i + 1}`}
				addLabel="질문 추가"
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
