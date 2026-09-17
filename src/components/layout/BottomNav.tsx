import { bottomNav } from "../../data/content";
import { useNavigation } from "../../context/NavigationContext";
import { InstallButton } from "./InstallButton";
import { Icon } from "../icons/Icon";
import styles from "./BottomNav.module.scss";

// 하단 탭 내비게이션 — data/content.ts의 bottomNav 목록을 그대로 렌더링하고,
// 설치 버튼(InstallButton)을 마지막에 덧붙인다.
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
