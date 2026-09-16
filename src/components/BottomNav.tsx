import { bottomNav } from "../data/content";
import { useNavigation } from "../context/NavigationContext";
import styles from "./BottomNav.module.scss";

export function BottomNav() {
	const { tab, setTab } = useNavigation();

	return (
		<nav className={styles.bottomnav}>
			<ul>
				{bottomNav.map((item) => (
					<li key={item.id}>
						<button
							type="button"
							className={`${styles.link} ${tab === item.id ? styles.active : ""}`}
							onClick={() => setTab(item.id)}
						>
							<i className={`fas ${item.icon}`} />
							{item.label}
						</button>
					</li>
				))}
			</ul>
			<div className={styles.homeIndicator}>
				<span />
			</div>
		</nav>
	);
}
