import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { signOut } from "firebase/auth";
import { AppShell } from "./components/layout/AppShell";
import { CohortProvider } from "./context/CohortContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import { useAppUser } from "./hooks/useAppUser";
import { auth } from "./lib/firebase";

// 공개 사이트 번들에서 분리 — 대부분의 방문자는 /admin에 절대 들어가지
// 않으므로, 상당히 큰 CMS 코드를 미리 받게 할 필요가 없다.
const AdminApp = lazy(() => import("./admin/AdminApp").then((m) => ({ default: m.AdminApp })));
const AdminLogin = lazy(() =>
	import("./admin/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);

// URL이 /admin 경로거나 #admin 해시면 관리자 화면 라우트로 판단.
function isAdminRoute(): boolean {
	return (
		window.location.pathname.replace(/\/+$/, "") === "/admin" ||
		window.location.hash === "#admin"
	);
}

// 앱의 최상위 진입점 — 공개 사이트(AppShell)와 관리자 화면(AdminApp/
// AdminLogin) 중 어느 걸 보여줄지 라우팅하고, 로그인 상태(useAppUser)에
// 따라 관리자 화면 접근을 제어한다.
function App() {
	const [adminRoute, setAdminRoute] = useState(isAdminRoute);
	const { authUser, profile, loading } = useAppUser();

	useEffect(() => {
		function onNavChange() {
			setAdminRoute(isAdminRoute());
		}
		window.addEventListener("hashchange", onNavChange);
		window.addEventListener("popstate", onNavChange);
		return () => {
			window.removeEventListener("hashchange", onNavChange);
			window.removeEventListener("popstate", onNavChange);
		};
	}, []);

	function exitAdmin() {
		window.history.pushState({}, "", "/");
		window.location.hash = "";
		setAdminRoute(false);
	}

	let body: ReactNode;
	if (!adminRoute) {
		body = <AppShell />;
	} else if (!loading && authUser && profile) {
		body = <AdminApp profile={profile} onExit={exitAdmin} onLogout={() => signOut(auth)} />;
	} else if (!loading && authUser && !profile) {
		// 로그인은 됐는데 users/{uid} 프로필 문서가 없는 비정상 상태 —
		// 안전하게 강제 로그아웃시킨다.
		signOut(auth);
		body = null;
	} else if (!loading) {
		body = <AdminLogin onExit={exitAdmin} />;
	} else {
		body = null;
	}

	return (
		<SiteContentProvider>
			<CohortProvider>
				<ScheduleProvider>
					<Suspense fallback={null}>{body}</Suspense>
				</ScheduleProvider>
			</CohortProvider>
		</SiteContentProvider>
	);
}

export default App;
