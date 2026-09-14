import { bottomNav } from "../data/content";
import styles from "./BottomNav.module.scss";

interface BottomNavProps {
	active: string;
}

export function BottomNav({ active }: BottomNavProps) {
	return (
		<nav className={styles.bottomnav}>
			<ul>
				{bottomNav.map((item) => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							className={`${styles.link} ${active === item.id ? styles.active : ""}`}
						>
							<i className={`fas ${item.icon}`} />
							{item.label}
						</a>
					</li>
				))}
			</ul>
			<div className={styles.homeIndicator}>
				<span />
			</div>
		</nav>
	);
}
