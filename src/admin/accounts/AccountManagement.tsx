import { useEffect, useState, type FormEvent } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toAuthEmail } from "../../lib/authEmail";
import type { AppUser, Role } from "../../types/user";
import { roleLabel } from "../../types/user";
import styles from "./AccountManagement.module.scss";

const roleTagClass: Record<Role, string> = {
	admin: styles.roleAdmin,
	manager: styles.roleManager,
};

export function AccountManagement() {
	const [accounts, setAccounts] = useState<AppUser[]>([]);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<Role>("manager");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		return onSnapshot(collection(db, "users"), (snapshot) => {
			setAccounts(
				snapshot.docs.map((d) => ({
					uid: d.id,
					username: d.data().username,
					role: d.data().role,
				})),
			);
		});
	}, []);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSuccess(null);
		setSubmitting(true);
		try {
			const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string;
			// A raw REST call — deliberately NOT the Firebase Auth SDK's
			// createUserWithEmailAndPassword, which would sign the browser in
			// as the newly created account and kick the current admin out of
			// their own session. This keeps the admin's session untouched.
			const res = await fetch(
				`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: toAuthEmail(username),
						password,
						returnSecureToken: true,
					}),
				},
			);
			const data = await res.json();
			if (!res.ok) {
				const message: string = data?.error?.message ?? "";
				if (message.startsWith("EMAIL_EXISTS")) {
					setError("이미 존재하는 아이디입니다.");
				} else if (message.startsWith("WEAK_PASSWORD")) {
					setError("비밀번호는 6자 이상이어야 합니다.");
				} else {
					setError("계정 생성에 실패했습니다.");
				}
				return;
			}
			await setDoc(doc(db, "users", data.localId), { username, role });
			setSuccess(`"${username}" (${roleLabel[role]}) 계정을 생성했습니다.`);
			setUsername("");
			setPassword("");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div>
			<div className={styles.list}>
				{accounts.map((account) => (
					<div className={styles.row} key={account.uid}>
						<i className="fas fa-user" />
						<span className={styles.username}>{account.username}</span>
						<span className={`${styles.roleTag} ${roleTagClass[account.role]}`}>
							{roleLabel[account.role]}
						</span>
					</div>
				))}
				{accounts.length === 0 && <p>계정 목록을 불러오는 중...</p>}
			</div>

			<form className={styles.form} onSubmit={handleSubmit}>
				<label className={styles.field}>
					아이디
					<input
						type="text"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</label>
				<label className={styles.field}>
					비밀번호
					<input
						type="password"
						required
						minLength={6}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</label>
				<label className={`${styles.field} ${styles.wide}`}>
					권한
					<select value={role} onChange={(e) => setRole(e.target.value as Role)}>
						<option value="manager">매니저 (기수 콘텐츠 관리)</option>
						<option value="admin">관리자 (계정 관리 포함 전체 권한)</option>
					</select>
				</label>
				{error && <p className={styles.error}>{error}</p>}
				{success && <p className={styles.success}>{success}</p>}
				<button className={styles.submit} type="submit" disabled={submitting}>
					{submitting ? "생성 중..." : "계정 생성"}
				</button>
			</form>
		</div>
	);
}
