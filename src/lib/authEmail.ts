// Firebase Auth's email/password provider requires an email-shaped
// identifier, but the product wants plain "아이디" (username) login. This
// deterministically maps a username to a fake-but-valid email under a
// pseudo-domain reserved for this app, so nothing is ever actually mailed.
const AUTH_EMAIL_DOMAIN = "youth-admin.local";

export function toAuthEmail(username: string): string {
	return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}
