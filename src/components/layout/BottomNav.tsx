import { bottomNav } from "../../data/content";
import { useNavigation } from "../../context/NavigationContext";
import { InstallButton } from "./InstallButton";
import { Icon } from "../icons/Icon";
import styles from "./BottomNav.module.scss";

export function BottomNav() {
	const { tab, setTab, goToProgram } = useNavigation();

	return (
		<nav className={styles.bottomnav}>
			<ul>
				{bottomNav.map((item) => (
					<li key={item.id}>
						<button
							type="button"
							className={`${styles.link} ${tab === item.id ? styles.active : ""}`}
							onClick={() => (item.id === "program" ? goToProgram() : setTab(item.id))}
						>
							<Icon name={item.icon} />
							{item.label}
						</button>
					</li>
				))}
				<InstallButton />
			</ul>
			<div className={styles.homeIndicator}>
				<span />
			</div>
		</nav>
	);
}
