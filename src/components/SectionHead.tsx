import type { ReactNode } from "react";
import styles from "./SectionHead.module.scss";

interface SectionHeadProps {
	eyebrow: string;
	title?: ReactNode;
	description?: string;
	eyebrowClassName?: string;
	/** Optional control rendered top-right, aligned with the title. */
	action?: ReactNode;
}

export function SectionHead({
	eyebrow,
	title,
	description,
	eyebrowClassName,
	action,
}: SectionHeadProps) {
	return (
		<div className={styles.head}>
			<div className={styles.headRow}>
				<div className={styles.headText}>
					<span className={`${styles.eyebrow} ${eyebrowClassName ?? ""}`}>{eyebrow}</span>
					{title && <h2>{title}</h2>}
				</div>
				{action && <div className={styles.headAction}>{action}</div>}
			</div>
			{description && <p>{description}</p>}
		</div>
	);
}
