import { useSectionDraft } from "./useSectionDraft";
import { TextField, SaveBar } from "./Field";
import { StringList } from "./StringList";
import type { BenefitCard } from "../../types/siteContent";
import styles from "./shared.module.scss";

function emptyBenefit(): BenefitCard {
	return {
		icon: "fa-star",
		gradient: "linear-gradient(135deg,#4aa8ff,#2e6fd6)",
		title: "",
		items: [],
	};
}

export function BenefitsEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("benefits");

	function updateBenefit(index: number, patch: Partial<BenefitCard>) {
		setDraft(draft.map((b, i) => (i === index ? { ...b, ...patch } : b)));
	}

	function removeBenefit(index: number) {
		setDraft(draft.filter((_, i) => i !== index));
	}

	return (
		<div className={styles.form}>
			{draft.map((benefit, index) => (
				<div className={styles.itemCard} key={index}>
					<div className={styles.itemHead}>
						<span className={styles.itemBadge}>혜택 카드 {index + 1}</span>
						<button
							type="button"
							className={styles.removeBtn}
							onClick={() => removeBenefit(index)}
							title="삭제"
						>
							<i className="fas fa-trash" />
						</button>
					</div>
					<TextField
						label="카드 제목"
						value={benefit.title}
						onChange={(v) => updateBenefit(index, { title: v })}
					/>
					<StringList
						label="혜택 목록"
						items={benefit.items}
						onChange={(items) => updateBenefit(index, { items })}
					/>
					<TextField
						label="아이콘 (Font Awesome 클래스명, 예: fa-briefcase)"
						value={benefit.icon}
						onChange={(v) => updateBenefit(index, { icon: v })}
					/>
					<TextField
						label="배경 색상 (CSS 그라데이션)"
						value={benefit.gradient}
						onChange={(v) => updateBenefit(index, { gradient: v })}
					/>
				</div>
			))}
			<button
				type="button"
				className={styles.addBtn}
				onClick={() => setDraft([...draft, emptyBenefit()])}
			>
				<i className="fas fa-plus" />
				혜택 카드 추가
			</button>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
