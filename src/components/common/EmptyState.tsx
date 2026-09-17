import { Icon, type IconName } from "../icons/Icon";
import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
	icon?: IconName;
	message: string;
}

/** A quiet "nothing here yet" placeholder — an icon plus one line of text,
 * used wherever a list/panel would otherwise just render a bare sentence.
 */
export function EmptyState({ icon = "calendar", message }: EmptyStateProps) {
	return (
		<div className={styles.empty}>
			<Icon name={icon} className={styles.icon} />
			<p>{message}</p>
		</div>
	);
}
