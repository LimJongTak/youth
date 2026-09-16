import styles from "./shared.module.scss";

interface FieldSpec<T> {
	key: keyof T;
	label: string;
	type?: "text" | "textarea" | "number" | "checkbox";
}

interface RepeatableListProps<T> {
	items: T[];
	onChange: (items: T[]) => void;
	fields: FieldSpec<T>[];
	emptyItem: () => T;
	itemLabel: (item: T, index: number) => string;
	addLabel: string;
}

export function RepeatableList<T extends object>({
	items,
	onChange,
	fields,
	emptyItem,
	itemLabel,
	addLabel,
}: RepeatableListProps<T>) {
	function updateItem(index: number, key: keyof T, value: unknown) {
		onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
	}

	function removeItem(index: number) {
		onChange(items.filter((_, i) => i !== index));
	}

	function addItem() {
		onChange([...items, emptyItem()]);
	}

	return (
		<div className={styles.form}>
			{items.map((item, index) => (
				<div className={styles.itemCard} key={index}>
					<div className={styles.itemHead}>
						<span className={styles.itemBadge}>{itemLabel(item, index)}</span>
						<button
							type="button"
							className={styles.removeBtn}
							onClick={() => removeItem(index)}
							title="삭제"
						>
							<i className="fas fa-trash" />
						</button>
					</div>
					{fields.map((field) => {
						const value = item[field.key];
						if (field.type === "checkbox") {
							return (
								<label className={styles.checkboxRow} key={String(field.key)}>
									<input
										type="checkbox"
										checked={Boolean(value)}
										onChange={(e) => updateItem(index, field.key, e.target.checked)}
									/>
									{field.label}
								</label>
							);
						}
						if (field.type === "textarea") {
							return (
								<label className={styles.field} key={String(field.key)}>
									{field.label}
									<textarea
										value={String(value ?? "")}
										onChange={(e) => updateItem(index, field.key, e.target.value)}
									/>
								</label>
							);
						}
						return (
							<label className={styles.field} key={String(field.key)}>
								{field.label}
								<input
									type={field.type === "number" ? "number" : "text"}
									value={String(value ?? "")}
									onChange={(e) =>
										updateItem(
											index,
											field.key,
											field.type === "number" ? Number(e.target.value) : e.target.value,
										)
									}
								/>
							</label>
						);
					})}
				</div>
			))}
			<button type="button" className={styles.addBtn} onClick={addItem}>
				<i className="fas fa-plus" />
				{addLabel}
			</button>
		</div>
	);
}
