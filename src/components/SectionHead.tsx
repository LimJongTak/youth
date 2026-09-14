import type { ReactNode } from "react";
import styles from "./SectionHead.module.scss";

interface SectionHeadProps {
	eyebrow: string;
	title: ReactNode;
	description?: string;
	eyebrowClassName?: string;
}

export function SectionHead({
	eyebrow,
	title,
	description,
	eyebrowClassName,
}: SectionHeadProps) {
	return (
		<div className={styles.head}>
			<span className={`${styles.eyebrow} ${eyebrowClassName ?? ""}`}>{eyebrow}</span>
			<h2>{title}</h2>
			{description && <p>{description}</p>}
		</div>
	);
}
