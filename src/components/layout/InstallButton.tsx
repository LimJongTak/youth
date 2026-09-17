import { useState } from "react";
import { createPortal } from "react-dom";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./InstallButton.module.scss";

// 하단 내비게이션의 "설치" 버튼 — PWA 홈 화면 추가를 안드로이드는 네이티브
// 프롬프트로, iOS는 수동 안내(공유 → 홈 화면에 추가)로 도와준다.
export function InstallButton() {
	const { installed, canPrompt, isIos, promptInstall } = useInstallPrompt();
	const [showGuide, setShowGuide] = useState(false);
	// 다른 탭들과 달리 실제 페이지가 아니라서 계속 강조 표시될 "현재 탭"이
	// 없음 — 설치 프롬프트/안내가 열려 있는 동안만 눌린 상태로 보여주고,
	// 설치했든 취소했든 닫히면 다시 회색으로 돌아간다.
	const [pressed, setPressed] = useState(false);

	// 이미 설치된 앱으로 실행 중이면 — 더 보여줄 게 없음.
	if (installed) return null;

	function closeGuide() {
		setShowGuide(false);
		setPressed(false);
	}

	function handleClick() {
		setPressed(true);
		logEvent("install_guide_open", { platform: isIos ? "ios" : canPrompt ? "prompt" : "other" });
		setShowGuide(true);
	}

	async function handleInstallNow() {
		const outcome = await promptInstall();
		logEvent("install_prompt", { outcome });
		closeGuide();
	}

	return (
		<>
			<li>
				<button
					type="button"
					className={`${styles.link} ${pressed ? styles.active : ""}`}
					onClick={handleClick}
				>
					<Icon name="download" />
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
								<Icon name="times" />
							</button>

							<h4 className={styles.title}>홈 화면에 추가하기</h4>
							<p className={styles.desc}>
								앱처럼 아이콘을 눌러 바로 열 수 있도록 홈 화면에 추가해보세요.
							</p>

							{canPrompt && (
								<button type="button" className={styles.installCta} onClick={handleInstallNow}>
									<Icon name="download" />
									앱 설치하기
								</button>
							)}

							{!canPrompt &&
								(isIos ? (
									<ol className={styles.steps}>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="share-square" />
											</span>
											<span>Safari 하단의 공유 버튼을 눌러주세요.</span>
										</li>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="plus-square" />
											</span>
											<span>메뉴에서 &lsquo;홈 화면에 추가&rsquo;를 선택해주세요.</span>
										</li>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="check" />
											</span>
											<span>오른쪽 위 &lsquo;추가&rsquo;를 누르면 완료돼요.</span>
										</li>
									</ol>
								) : (
									<ol className={styles.steps}>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="ellipsis-vertical" />
											</span>
											<span>브라우저 메뉴(⋮)를 열어주세요.</span>
										</li>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="plus-square" />
											</span>
											<span>&lsquo;앱 설치&rsquo; 또는 &lsquo;홈 화면에 추가&rsquo;를 선택해주세요.</span>
										</li>
										<li>
											<span className={styles.stepIcon}>
												<Icon name="check" />
											</span>
											<span>안내에 따라 추가를 완료해주세요.</span>
										</li>
									</ol>
								))}
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
