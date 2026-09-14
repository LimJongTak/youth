import { useSectionDraft } from "./useSectionDraft";
import { SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import styles from "./shared.module.scss";

export function ChecklistEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("checklist");

	return (
		<div className={styles.form}>
			<RepeatableList
				items={draft}
				onChange={setDraft}
				fields={[
					{ key: "title", label: "항목 제목" },
					{ key: "desc", label: "설명" },
					{ key: "defaultChecked", label: "처음부터 체크되어 있음", type: "checkbox" },
				]}
				emptyItem={() => ({ title: "", desc: "", defaultChecked: false })}
				itemLabel={(item, i) => item.title || `체크 항목 ${i + 1}`}
				addLabel="체크 항목 추가"
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
