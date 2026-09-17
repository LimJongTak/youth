import type { ReactNode } from "react";
import styles from "./shared.module.scss";

// 모든 콘텐츠 편집 폼이 공유하는 기본 입력 필드·저장 버튼 컴포넌트.

interface TextFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	type?: string;
}

export function TextField({ label, value, onChange, placeholder, type = "text" }: TextFieldProps) {
	return (
		<label className={styles.field}>
			{label}
			<input
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
			/>
		</label>
	);
}

interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function TextAreaField({ label, value, onChange, placeholder }: TextAreaFieldProps) {
	return (
		<label className={styles.field}>
			{label}
			<textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
		</label>
	);
}

interface SaveBarProps {
	onSave: () => void;
	saving: boolean;
	success: boolean;
	error: string | null;
	children?: ReactNode;
}

export function SaveBar({ onSave, saving, success, error, children }: SaveBarProps) {
	return (
		<div className={styles.saveBar}>
			{children}
			<button className={styles.saveBtn} onClick={onSave} disabled={saving}>
				{saving ? "저장 중..." : "저장"}
			</button>
			{error && <p className={styles.error}>{error}</p>}
			{success && !error && <p className={styles.success}>저장되었습니다.</p>}
		</div>
	);
}
