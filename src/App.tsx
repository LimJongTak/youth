import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { signOut } from "firebase/auth";
import { AppShell } from "./components/layout/AppShell";
import { CohortProvider } from "./context/CohortContext";
import { SiteContentProvider } from "./context/SiteContentContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import { useAppUser } from "./hooks/useAppUser";
import { auth } from "./lib/firebase";

// Split out of the public-site bundle — most visitors never hit /admin,
// so its (fairly large) CMS code shouldn't cost them anything upfront.
const AdminApp = lazy(() => import("./admin/AdminApp").then((m) => ({ default: m.AdminApp })));
const AdminLogin = lazy(() =>
	import("./admin/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);

function isAdminRoute(): boolean {
	return (
		window.location.pathname.replace(/\/+$/, "") === "/admin" ||
		window.location.hash === "#admin"
	);
}

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
