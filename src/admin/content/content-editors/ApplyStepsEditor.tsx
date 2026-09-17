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
					// 순서가 바뀌어도 단계 번호가 그 위치와 항상 일치하도록 —
					// 공개 사이트의 번호 배지가 늘 1, 2, 3... 순서로 보이게 함.
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
