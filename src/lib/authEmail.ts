// Firebase Auth의 이메일/비밀번호 로그인은 이메일 형식의 아이디가 필요하지만,
// 서비스에서는 단순 "아이디" 로그인을 원한다. 그래서 아이디를 이 앱 전용
// 가상 도메인의 (실제로 메일이 가지는 않는) 가짜지만 유효한 이메일 형식으로
// 항상 같은 규칙으로 변환한다.
const AUTH_EMAIL_DOMAIN = "youth-admin.local";

export function toAuthEmail(username: string): string {
	return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}
