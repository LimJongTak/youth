import { useNavigation } from "../../context/NavigationContext";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./TopBar.module.scss";

export function TopBar() {
	const { tab, goToContact } = useNavigation();

	function handleContactClick() {
		logEvent("contact_click", { source: "topbar" });
		goToContact();
	}

	return (
		<header className={styles.topbar}>
			<div className={styles.brand}>
				<span className={styles.brandLine1}>국립순천대학교 인공지능분야</span>
				<span className={styles.brandLine2}>청년도약 인재양성 부트캠프</span>
			</div>
			<button
				type="button"
				className={`${styles.contactBtn} ${tab === "contact" ? styles.contactBtnActive : ""}`}
				onClick={handleContactClick}
			>
				<Icon name="headset" />
				문의
			</button>
		</header>
	);
}
