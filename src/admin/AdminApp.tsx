import { useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { statusLabel, type Cohort } from "../types/cohort";
import { roleLabel, type AppUser } from "../types/user";
import { CohortForm } from "./CohortForm";
import { AccountManagement } from "./AccountManagement";
import { ContentEditor } from "./ContentEditor";
import styles from "./AdminApp.module.scss";

const badgeClass: Record<string, string> = {
	recruiting: styles.badgeRecruiting,
	upcoming: styles.badgeUpcoming,
	closed: styles.badgeClosed,
};

interface AdminAppProps {
	profile: AppUser;
	onExit: () => void;
	onLogout: () => void;
}

type Tab = "cohorts" | "content" | "accounts";

export function AdminApp({ profile, onExit, onLogout }: AdminAppProps) {
	const { cohorts, addCohort, updateCohort, removeCohort, setFeatured } = useCohorts();
	const [tab, setTab] = useState<Tab>("cohorts");
	const [editing, setEditing] = useState<Cohort | null>(null);
	const [creating, setCreating] = useState(false);

	const sorted = cohorts.slice().sort((a, b) => b.generation - a.generation);
	const showForm = creating || editing !== null;
	const isAdmin = profile.role === "admin";

	function handleSubmit(cohort: Cohort) {
		if (editing) {
			updateCohort(cohort);
		} else {
			addCohort(cohort);
		}
		setEditing(null);
		setCreating(false);
	}

	function handleDelete(cohort: Cohort) {
		if (window.confirm(`${cohort.generation}기 정보를 삭제할까요?`)) {
			removeCohort(cohort.id);
		}
	}

	return (
		<div className={styles.page}>
			<div className={styles.bar}>
				<div>
					<strong>{roleLabel[profile.role]} · {profile.username}</strong>
					<span>청년도약 인재양성 부트캠프 CMS</span>
				</div>
				<div className={styles.barActions}>
					<button className={styles.backLink} onClick={onExit}>
						<i className="fas fa-arrow-left" />
						공개 사이트로 돌아가기
					</button>
					<button className={styles.backLink} onClick={onLogout}>
						<i className="fas fa-sign-out-alt" />
						로그아웃
					</button>
				</div>
			</div>

			<div className={styles.content}>
				<div className={styles.disclosure}>
					<i className="fas fa-info-circle" />
					<span>
						여기서의 변경사항은 <strong>Firebase Firestore</strong>에 실시간으로
						저장되어, 공개 사이트를 보는 모든 사람에게 즉시 반영됩니다. 저장은 로그인한
						관리자/매니저만 가능합니다 (Firestore 보안 규칙으로 제한).
					</span>
				</div>

				<div className={styles.tabs}>
					<button
						className={`${styles.tabBtn} ${tab === "cohorts" ? styles.tabActive : ""}`}
						onClick={() => setTab("cohorts")}
					>
						기수 관리
					</button>
					<button
						className={`${styles.tabBtn} ${tab === "content" ? styles.tabActive : ""}`}
						onClick={() => setTab("content")}
					>
						콘텐츠 관리
					</button>
					{isAdmin && (
						<button
							className={`${styles.tabBtn} ${tab === "accounts" ? styles.tabActive : ""}`}
							onClick={() => setTab("accounts")}
						>
							계정 관리
						</button>
					)}
				</div>

				{tab === "accounts" && isAdmin ? (
					<AccountManagement />
				) : tab === "content" ? (
					<ContentEditor />
				) : (
					<>
						<div className={styles.toolbar}>
							<h2>기수 목록 ({cohorts.length})</h2>
							{!showForm && (
								<button
									className={styles.addBtn}
									onClick={() => {
										setCreating(true);
										setEditing(null);
									}}
								>
									<i className="fas fa-plus" />
									기수 추가
								</button>
							)}
						</div>

						{showForm ? (
							<CohortForm
								initial={editing}
								onSubmit={handleSubmit}
								onCancel={() => {
									setEditing(null);
									setCreating(false);
								}}
							/>
						) : (
							<div className={styles.list}>
								{sorted.map((cohort) => (
									<div className={styles.row} key={cohort.id}>
										<div className={styles.rowMain}>
											<span className={styles.gen}>{cohort.generation}기</span>
											<span
												className={`${styles.badge} ${badgeClass[cohort.status]}`}
											>
												{statusLabel[cohort.status]}
											</span>
											{cohort.featured && (
												<span className={styles.featuredTag}>기본 노출</span>
											)}
											<span className={styles.meta}>
												{cohort.recruitPeriod} · {cohort.capacity}
											</span>
										</div>
										<div className={styles.rowActions}>
											{!cohort.featured && (
												<button
													className={styles.iconBtn}
													title="기본 노출 기수로 설정"
													onClick={() => setFeatured(cohort.id)}
												>
													<i className="fas fa-star" />
												</button>
											)}
											<button
												className={styles.iconBtn}
												title="수정"
												onClick={() => {
													setEditing(cohort);
													setCreating(false);
												}}
											>
												<i className="fas fa-pen" />
											</button>
											<button
												className={`${styles.iconBtn} ${styles.danger}`}
												title="삭제"
												onClick={() => handleDelete(cohort)}
											>
												<i className="fas fa-trash" />
											</button>
										</div>
									</div>
								))}
								{sorted.length === 0 && (
									<p className={styles.empty}>
										등록된 기수가 없습니다. 기수를 추가해 주세요.
									</p>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
