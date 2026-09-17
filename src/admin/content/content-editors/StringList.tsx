import styles from "./shared.module.scss";

// "혜택 목록"처럼 단순 문자열 여러 개를 추가/수정/삭제하는 입력 컴포넌트.

interface StringListProps {
	label: string;
	items: string[];
	onChange: (items: string[]) => void;
}

export function StringList({ label, items, onChange }: StringListProps) {
	function update(index: number, value: string) {
		onChange(items.map((item, i) => (i === index ? value : item)));
	}
	function remove(index: number) {
		onChange(items.filter((_, i) => i !== index));
	}
	function add() {
		onChange([...items, ""]);
	}

	return (
		<div className={styles.field}>
			{label}
			<div className={styles.form}>
				{items.map((item, index) => (
					<div className={styles.stringRow} key={index}>
						<input value={item} onChange={(e) => update(index, e.target.value)} />
						<button
							type="button"
							className={styles.removeBtn}
							onClick={() => remove(index)}
							title="삭제"
						>
							<i className="fas fa-trash" />
						</button>
					</div>
				))}
				<button type="button" className={styles.addBtn} onClick={add}>
					<i className="fas fa-plus" />
					항목 추가
				</button>
			</div>
		</div>
	);
}
