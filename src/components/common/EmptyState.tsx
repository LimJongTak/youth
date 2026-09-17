import { Icon, type IconName } from "../icons/Icon";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
	icon?: IconName;
	message: string;
}

/** "아직 아무것도 없음"을 담백하게 보여주는 자리표시자 — 아이콘 하나와
 * 한 줄짜리 문구로 구성되며, 목록/패널이 그냥 밋밋한 문장 한 줄만
 * 보여주던 곳에 대신 사용한다.
 */
export function EmptyState({ icon = "calendar", message }: EmptyStateProps) {
	return (
		<div className={styles.empty}>
			<Icon name={icon} className={styles.icon} />
			<p>{message}</p>
		</div>
	);
}
