import { useEffect, useState, type FormEvent } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toAuthEmail } from "../../lib/authEmail";
import type { AppUser, Role } from "../../types/user";
import { roleLabel } from "../../types/user";
import styles from "./AccountManagement.module.scss";

// 관리자 "계정 관리" 탭 — 관리자만 접근 가능. 새 관리자/매니저 계정을
// 만들고 기존 계정 목록을 확인한다.

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
			// Firebase Auth SDK의 createUserWithEmailAndPassword를 안 쓰고
			// REST API를 직접 호출 — SDK를 쓰면 새로 만든 계정으로 브라우저가
			// 자동 로그인되면서 지금 작업 중인 관리자 본인의 세션이 끊긴다.
			// REST 호출은 관리자의 로그인 세션을 그대로 유지해준다.
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
