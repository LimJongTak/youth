import type { CSSProperties } from "react";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	className?: string;
}

/** A pulsing placeholder block — stands in for content still loading from
 * Firestore so a visitor sees "this is loading" instead of a false "there's
 * nothing here" for the brief window before the first snapshot arrives.
 */
export function Skeleton({ width = "100%", height = 14, className }: SkeletonProps) {
	const style: CSSProperties = { width, height };
	return <span className={`${styles.skeleton} ${className ?? ""}`} style={style} />;
}
