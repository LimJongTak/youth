import { useCallback, useEffect, useState } from "react";
import { logEvent } from "../lib/analytics";

// Chrome/Edge가 자체 설치 UI를 보여주기 전에 이 이벤트를 발생시킴 —
// 이걸 가로채면 우리 버튼에서 네이티브 설치 프롬프트를 띄울 수 있다.
// 아직 TS 표준 DOM 타입에는 포함돼 있지 않음.
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIos(): boolean {
	if (typeof navigator === "undefined") return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
}

// index.html의 인라인 스크립트가 첫 렌더링 시점부터 미리 듣고 있다가
// 설정해주는 값 — 이 컴포넌트는 그 이벤트가 이미 발생한 한참 뒤에
// 마운트될 수도 있어서, 여기서만 리스너를 달면 이벤트를 아예 놓칠 수 있음.
declare global {
	interface Window {
		__deferredInstallPrompt?: BeforeInstallPromptEvent;
	}
}

function isStandalone(): boolean {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		// iOS Safari의 옛날 방식 standalone 플래그 — 거긴 display-mode를 지원 안 함.
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export function useInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [installed, setInstalled] = useState(isStandalone);

	useEffect(() => {
		// 이 컴포넌트가 마운트되기 전에 이미 잡아둔 값이 있는 경우.
		if (window.__deferredInstallPrompt) {
			setDeferredPrompt(window.__deferredInstallPrompt);
		}

		function handleBeforeInstallPrompt(event: Event) {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		}
		function handleAppInstalled() {
			setInstalled(true);
			setDeferredPrompt(null);
			window.__deferredInstallPrompt = undefined;
			// 우리 "설치" 버튼을 거치지 않고 브라우저 자체 설치 UI로 설치한
			// 경우까지 포함해, 실제로 설치가 완료됐을 때만 브라우저가 이
			// 이벤트를 쏴준다 — 관리자 통계의 "설치 수"는 이 값 하나로만 센다.
			logEvent("app_installed");
		}
		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const promptInstall = useCallback(async () => {
		if (!deferredPrompt) return null;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		setDeferredPrompt(null);
		window.__deferredInstallPrompt = undefined;
		return outcome;
	}, [deferredPrompt]);

	return {
		installed,
		canPrompt: deferredPrompt !== null,
		isIos: isIos(),
		promptInstall,
	};
}
