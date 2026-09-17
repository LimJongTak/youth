// 관리자 계정 권한 타입 — admin(관리자)은 계정 관리까지, manager(매니저)는
// 기수/콘텐츠/일정 관리까지만 가능 (Firestore 보안 규칙에서도 동일하게 제한).
export type Role = "admin" | "manager";

export interface AppUser {
	uid: string;
	username: string;
	role: Role;
}

export const roleLabel: Record<Role, string> = {
	admin: "관리자",
	manager: "매니저",
};
