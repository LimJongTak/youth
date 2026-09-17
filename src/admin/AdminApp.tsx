import { useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { statusLabel, type Cohort } from "../types/cohort";
import { roleLabel, type AppUser } from "../types/user";
import { CohortForm } from "./cohorts/CohortForm";
import { AccountManagement } from "./accounts/AccountManagement";
import { ContentEditor } from "./content/ContentEditor";
import { AnalyticsPanel } from "./analytics/AnalyticsPanel";
import { ScheduleManager } from "./schedule/ScheduleManager";
import { EmptyState } from "../components/common/EmptyState";
import { ensureFontAwesomeLoaded } from "../lib/loadFontAwesome";
import styles from "./AdminApp.module.scss";

// Admin screens still use Font Awesome — load it here, when this lazy chunk
// first evaluates, instead of in index.html where every visitor would pay
// for it upfront.
ensureFontAwesomeLoaded();

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

type Tab = "cohorts" | "content" | "schedule" | "analytics" | "accounts";

const NAV_ITEMS: { id: Tab; label: string; icon: string; adminOnly?: boolean }[] = [
	{ id: "cohorts", label: "기수 관리", icon: "fa-users" },
	{ id: "content", label: "콘텐츠 관리", icon: "fa-file-alt" },
	{ id: "schedule", label: "일정 관리", icon: "fa-calendar-alt" },
	{ id: "analytics", label: "통계", icon: "fa-chart-bar" },
	{ id: "accounts", label: "계정 관리", icon: "fa-user-shield", adminOnly: true },
];

export function AdminApp({ profile, onExit, onLogout }: AdminAppProps) {
	const { cohorts, addCohort, updateCohort, removeCohort, setFeatured, setScheduleDefault } = useCohorts();
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

	const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
	const currentNav = visibleNavItems.find((item) => item.id === tab);

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

			<div className={styles.body}>
				<aside className={styles.sidebar}>
					<nav className={styles.nav} role="tablist" aria-label="관리자 메뉴">
						{visibleNavItems.map((item) => (
							<button
								key={item.id}
								type="button"
								role="tab"
								aria-selected={tab === item.id}
								className={`${styles.navItem} ${tab === item.id ? styles.navItemActive : ""}`}
								onClick={() => setTab(item.id)}
							>
								<i className={`fas ${item.icon}`} />
								{item.label}
							</button>
						))}
					</nav>
				</aside>

				<main className={styles.content}>
					<div className={styles.contentHead}>
						<h1>{currentNav?.label}</h1>
					</div>

					<div className={styles.disclosure}>
						<i className="fas fa-info-circle" />
						<span>
							여기서의 변경사항은 <strong>Firebase Firestore</strong>에 실시간으로
							저장되어, 공개 사이트를 보는 모든 사람에게 즉시 반영됩니다. 저장은 로그인한
							관리자/매니저만 가능합니다 (Firestore 보안 규칙으로 제한).
						</span>
					</div>

					{tab === "accounts" && isAdmin ? (
						<AccountManagement />
					) : tab === "content" ? (
						<ContentEditor />
					) : tab === "schedule" ? (
						<ScheduleManager />
					) : tab === "analytics" ? (
						<AnalyticsPanel />
					) : (
						<>
							{!showForm && cohorts.length > 0 && (
								<div className={styles.summaryStrip}>
									<span>
										<strong>{cohorts.filter((c) => c.status === "recruiting").length}</strong> 모집중
									</span>
									<span>
										<strong>{cohorts.filter((c) => c.status === "upcoming").length}</strong> 모집예정
									</span>
									<span>
										<strong>{cohorts.filter((c) => c.status === "closed").length}</strong> 모집마감
									</span>
								</div>
							)}

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
												{cohort.scheduleDefault && (
													<span className={styles.scheduleTag}>일정 기본</span>
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
												{!cohort.scheduleDefault && (
													<button
														className={styles.iconBtn}
														title="일정 탭 기본 기수로 설정"
														onClick={() => setScheduleDefault(cohort.id)}
													>
														<i className="fas fa-calendar-check" />
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
										<EmptyState message="등록된 기수가 없습니다. 기수를 추가해 주세요." />
									)}
								</div>
							)}
						</>
					)}
				</main>
			</div>
		</div>
	);
}
