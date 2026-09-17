import type { ReactNode } from "react";
import styles from "./SectionHead.module.scss";

// 각 섹션 상단에 공통으로 쓰는 제목/설명 헤더 컴포넌트.
interface SectionHeadProps {
	eyebrow?: string;
	title?: ReactNode;
	description?: string;
	eyebrowClassName?: string;
	/** 제목과 같은 줄, 오른쪽 끝에 표시할 선택적 컨트롤. */
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
					{eyebrow && (
						<span className={`${styles.eyebrow} ${eyebrowClassName ?? ""}`}>{eyebrow}</span>
					)}
					{title && <h2>{title}</h2>}
				</div>
				{action && <div className={styles.headAction}>{action}</div>}
			</div>
			{description && <p>{description}</p>}
		</div>
	);
}
