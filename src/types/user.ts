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
