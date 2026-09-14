import { useClock } from "../hooks/useClock";
import styles from "./StatusBar.module.scss";

/** Purely decorative iOS-style status bar — sells the "native app" illusion. */
export function StatusBar() {
	const time = useClock();

	return (
		<div className={styles.statusbar}>
			<span>{time}</span>
			<span className={styles.icons}>
				<i className="fas fa-signal" />
				<i className="fas fa-wifi" />
				<i className="fas fa-battery-full" />
			</span>
		</div>
	);
}
