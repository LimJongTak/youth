import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { toAuthEmail } from "../lib/authEmail";
import type { Role } from "../types/user";
import styles from "./AdminLogin.module.scss";

interface AdminLoginProps {
	onExit: () => void;
}

export function AdminLogin({ onExit }: AdminLoginProps) {
	const [role, setRole] = useState<Role>("admin");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await signInWithEmailAndPassword(auth, toAuthEmail(username), password);
		} catch {
			setError("아이디 또는 비밀번호가 올바르지 않습니다.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h2 className={styles.title}>관리자 로그인</h2>
				<p className={styles.subtitle}>기수 정보를 관리하려면 로그인하세요.</p>

				<div className={styles.roleTabs} role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={role === "admin"}
						className={`${styles.roleTab} ${role === "admin" ? styles.roleTabActive : ""}`}
						onClick={() => setRole("admin")}
					>
						관리자로 로그인
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={role === "manager"}
						className={`${styles.roleTab} ${role === "manager" ? styles.roleTabActive : ""}`}
						onClick={() => setRole("manager")}
					>
						매니저로 로그인
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<label className={styles.field}>
						아이디
						<input
							type="text"
							required
							autoComplete="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</label>
					<label className={styles.field}>
						비밀번호
						<input
							type="password"
							required
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>
					{error && <p className={styles.error}>{error}</p>}
					<button className={styles.submit} type="submit" disabled={submitting}>
						{submitting ? "로그인 중..." : `${role === "admin" ? "관리자" : "매니저"}로 로그인`}
					</button>
				</form>
				<a className={styles.back} href="#" onClick={onExit}>
					← 공개 사이트로 돌아가기
				</a>
			</div>
		</div>
	);
}
