import type { CSSProperties } from "react";
import styles from "./Skeleton.module.scss";

interface SkeletonProps {
	width?: string | number;
	height?: string | number;
	className?: string;
}

/** 깜빡이는(pulse) 회색 자리표시 블록 — Firestore에서 아직 로딩 중인
 * 콘텐츠 자리에 대신 보여줘서, 첫 스냅샷이 도착하기 전 짧은 순간 동안
 * "여기 아무것도 없음"으로 잘못 보이는 대신 "로딩 중"임을 알려준다.
 */
export function Skeleton({ width = "100%", height = 14, className }: SkeletonProps) {
	const style: CSSProperties = { width, height };
	return <span className={`${styles.skeleton} ${className ?? ""}`} style={style} />;
}
