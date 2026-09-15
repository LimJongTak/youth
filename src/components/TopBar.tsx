import { useSiteContent } from "../context/SiteContentContext";
import styles from "./TopBar.module.scss";

export function TopBar() {
	const { content } = useSiteContent();

	return (
		<header className={styles.topbar}>
			<div className={styles.brand}>
				<span className={styles.brandLine1}>국립순천대학교 인공지능분야</span>
				<span className={styles.brandLine2}>청년도약 인재양성 부트캠프</span>
			</div>
			<a
				className={`${styles.iconBtn} ${styles.kakaoBtn}`}
				href={content.contact.kakaoUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="카카오톡으로 문의하기"
			>
				<i className="fas fa-comment" />
			</a>
		</header>
	);
}
