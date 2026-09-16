import { useState } from "react";
import { createPortal } from "react-dom";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { logEvent } from "../lib/analytics";
import styles from "./InstallButton.module.scss";

export function InstallButton() {
	const { installed, canPrompt, isIos, promptInstall } = useInstallPrompt();
	const [showGuide, setShowGuide] = useState(false);
	// Not a real page like the other tabs, so there's no "current tab" to
	// stay highlighted — it's just pressed-feedback for as long as the
	// install prompt/guide is open, then back to gray once that's done,
	// whether the visitor installed or cancelled.
	const [pressed, setPressed] = useState(false);

	// Already running as an installed app — nothing left to offer.
	if (installed) return null;

	function closeGuide() {
		setShowGuide(false);
		setPressed(false);
	}

	async function handleClick() {
		setPressed(true);
		if (canPrompt) {
			const outcome = await promptInstall();
			logEvent("install_prompt", { outcome });
			setPressed(false);
			return;
		}
		logEvent("install_guide_open", { platform: isIos ? "ios" : "other" });
		setShowGuide(true);
	}

	return (
		<>
			<li>
				<button
					type="button"
					className={`${styles.link} ${pressed ? styles.active : ""}`}
					onClick={handleClick}
				>
					<i className="fas fa-download" />
					설치
				</button>
			</li>

			{showGuide &&
				createPortal(
					<div className={styles.overlay} onClick={closeGuide}>
						<div className={styles.card} onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className={styles.close}
								onClick={closeGuide}
								aria-label="닫기"
							>
								<i className="fas fa-times" />
							</button>

							<h4 className={styles.title}>홈 화면에 추가하기</h4>
							<p className={styles.desc}>
								앱처럼 아이콘을 눌러 바로 열 수 있도록 홈 화면에 추가해보세요.
							</p>

							{isIos ? (
								<ol className={styles.steps}>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-share-square" />
										</span>
										<span>Safari 하단의 공유 버튼을 눌러주세요.</span>
									</li>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-plus-square" />
										</span>
										<span>메뉴에서 &lsquo;홈 화면에 추가&rsquo;를 선택해주세요.</span>
									</li>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-check" />
										</span>
										<span>오른쪽 위 &lsquo;추가&rsquo;를 누르면 완료돼요.</span>
									</li>
								</ol>
							) : (
								<ol className={styles.steps}>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-ellipsis-v" />
										</span>
										<span>브라우저 메뉴(⋮)를 열어주세요.</span>
									</li>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-plus-square" />
										</span>
										<span>&lsquo;앱 설치&rsquo; 또는 &lsquo;홈 화면에 추가&rsquo;를 선택해주세요.</span>
									</li>
									<li>
										<span className={styles.stepIcon}>
											<i className="fas fa-check" />
										</span>
										<span>안내에 따라 추가를 완료해주세요.</span>
									</li>
								</ol>
							)}
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
