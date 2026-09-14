import { useSectionDraft } from "./useSectionDraft";
import { SaveBar } from "./Field";
import { RepeatableList } from "./RepeatableList";
import styles from "./shared.module.scss";

export function ApplyStepsEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("applySteps");

	return (
		<div className={styles.form}>
			<RepeatableList
				items={draft}
				onChange={(items) =>
					// Keep step numbers in sync with their position so the
					// numbered badges on the public site always read 1, 2, 3...
					setDraft(items.map((item, i) => ({ ...item, num: i + 1 })))
				}
				fields={[
					{ key: "title", label: "단계 제목" },
					{ key: "desc", label: "설명", type: "textarea" },
				]}
				emptyItem={() => ({ num: draft.length + 1, title: "", desc: "" })}
				itemLabel={(item) => `${item.num}단계`}
				addLabel="단계 추가"
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
