import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { Hero } from "../home/Hero";
import { CohortBanner } from "../home/CohortBanner";
import { ProgramTab } from "../program/ProgramTab";
import { Schedule } from "../schedule/Schedule";
import { Benefits } from "../benefit/Benefits";
import { Journey } from "../benefit/Journey";
import { Contact } from "../contact/Contact";
import { NavigationProvider, useNavigation } from "../../context/NavigationContext";
import { logEvent } from "../../lib/analytics";
import styles from "./AppShell.module.scss";

// 공개 사이트 전체 뼈대 — 상단바/하단 탭 사이에서 현재 탭(NavigationContext)에
// 맞는 화면만 마운트한다. 탭별로 조건부 렌더링하기 때문에, 예를 들어
// 스케줄 탭 컴포넌트는 사용자가 실제로 그 탭을 열었을 때만 마운트된다.
export function AppShell() {
	return (
		<NavigationProvider>
			<Shell />
		</NavigationProvider>
	);
}

function Shell() {
	const { tab } = useNavigation();

	// 페이지 첫 진입 시 방문(page_view) 기록.
	useEffect(() => {
		logEvent("page_view");
	}, []);

	// 탭을 전환할 때마다 어떤 탭을 봤는지 기록하고, 스크롤을 맨 위로.
	useEffect(() => {
		logEvent("tab_view", { tab });
		window.scrollTo({ top: 0 });
	}, [tab]);

	return (
		<div className={styles.shell}>
			<div className={styles.app}>
				<TopBar />

				<main>
					{tab === "home" && (
						<>
							<Hero />
							<CohortBanner />
						</>
					)}
					{tab === "program" && <ProgramTab />}
					{tab === "schedule" && <Schedule />}
					{tab === "benefit" && (
						<>
							<Benefits />
							<Journey />
						</>
					)}
					{tab === "contact" && <Contact />}
				</main>

				<BottomNav />
			</div>
		</div>
	);
}
