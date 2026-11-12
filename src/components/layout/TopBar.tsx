import { useNavigation, type MainTab } from "../../context/NavigationContext";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./TopBar.module.scss";

// 홈을 제외한 화면의 상단 바 — 커피앱 상세 화면 헤더처럼 왼쪽 뒤로가기,
// 가운데 화면 제목, 오른쪽 문의 버튼. (홈은 자체 어두운 헤더가 있어서
// 이 바를 쓰지 않는다.)
const TITLES: Record<MainTab, string> = {
	home: "청년도약 부트캠프",
	program: "프로그램",
	schedule: "스케줄",
	benefit: "참여 혜택",
	contact: "문의하기",
};

export function TopBar() {
	const { tab, setTab, goToContact, detailCohortId, closeCohortDetail } = useNavigation();
	const inDetail = detailCohortId !== null;

	function handleBack() {
		if (inDetail) closeCohortDetail();
		else setTab("home");
	}

	function handleContactClick() {
		logEvent("contact_click", { source: "topbar" });
		goToContact();
	}

	return (
		<header className={styles.topbar}>
			<button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="뒤로가기">
				<Icon name="chevron-left" />
			</button>
			<h1 className={styles.title}>{inDetail ? "과정 상세" : TITLES[tab]}</h1>
			{tab === "contact" && !inDetail ? (
				<span className={styles.iconBtn} aria-hidden="true" />
			) : (
				<button
					type="button"
					className={styles.iconBtn}
					onClick={handleContactClick}
					aria-label="문의하기"
				>
					<Icon name="headset" />
				</button>
			)}
		</header>
	);
}
