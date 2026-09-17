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
 * Firebase Auth 로그인 상태와, 실제 admin/manager 권한이 저장된 Firestore
 * `users/{uid}` 프로필 문서를 합쳐서 제공한다 — 로그인 화면에서 고르는
 * 권한은 그냥 UI 표시일 뿐이고, 접근 제어의 기준(source of truth)은 이
 * 프로필 문서다.
 */
export function useAppUser(): AppUserState {
	const [authUser, setAuthUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<AppUser | null>(null);
	const [authLoading, setAuthLoading] = useState(true);
	// 처음엔 true로 시작 — onAuthStateChanged가 아직 한 번도 실행되기 전인
	// 첫 렌더링이 "로딩 끝, 프로필 없음"으로 잘못 읽히지 않게 하기 위함.
	const [profileLoading, setProfileLoading] = useState(true);

	useEffect(() => {
		return onAuthStateChanged(auth, (u) => {
			setAuthUser(u);
			setAuthLoading(false);
			// 프로필 상태 초기화는 authUser를 바꾸는 바로 이 콜백 안에서
			// 해야 한다 — authUser를 의존성으로 하는 별도 effect에서 하면
			// 안 됨. 그렇게 하면 authUser는 이미 설정됐는데 profileLoading은
			// 이전 "로그아웃" 상태의 오래된 false값 그대로인 렌더링이 잠깐
			// 발생하고, 이게 "로딩 끝, 프로필 없음"처럼 보여서 호출부의
			// "프로필 없으면 로그아웃" 안전장치를 잘못 건드리게 됐었다.
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
