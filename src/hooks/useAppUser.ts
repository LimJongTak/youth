import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { AppUser } from "../types/user";

interface AppUserState {
	authUser: User | null;
	profile: AppUser | null;
	loading: boolean;
}

/**
 * Combines Firebase Auth state with the matching Firestore `users/{uid}`
 * profile doc, which is where the real admin/manager role lives — the role
 * a person picks on the login screen is just UI framing, this is the
 * source of truth used to gate access.
 */
export function useAppUser(): AppUserState {
	const [authUser, setAuthUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<AppUser | null>(null);
	const [authLoading, setAuthLoading] = useState(true);
	// Starts true so the very first render (before onAuthStateChanged has
	// even fired once) doesn't read as "loaded, no profile".
	const [profileLoading, setProfileLoading] = useState(true);

	useEffect(() => {
		return onAuthStateChanged(auth, (u) => {
			setAuthUser(u);
			setAuthLoading(false);
			// Reset profile state in the SAME callback that flips authUser,
			// not in a separate effect keyed on authUser — otherwise there's
			// a render in between where authUser is already set but
			// profileLoading is still stale-false from a prior "signed out"
			// state, which briefly looks like "loaded, no profile" and was
			// tripping the caller's signOut-on-missing-profile safety net.
			setProfile(null);
			setProfileLoading(u !== null);
		});
	}, []);

	useEffect(() => {
		if (!authUser) return;
		return onSnapshot(doc(db, "users", authUser.uid), (snap) => {
			const data = snap.data();
			setProfile(
				data
					? { uid: authUser.uid, username: data.username, role: data.role }
					: null,
			);
			setProfileLoading(false);
		});
	}, [authUser]);

	return { authUser, profile, loading: authLoading || (Boolean(authUser) && profileLoading) };
}
