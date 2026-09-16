import { useCallback, useEffect, useState } from "react";

// Chrome/Edge fire this before showing their own install UI; capturing it
// lets us trigger the native prompt from our own button instead. Not yet
// part of the standard TS DOM lib.
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIos(): boolean {
	if (typeof navigator === "undefined") return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
}

// Set by the inline script in index.html, which listens from the very
// first paint — this component may mount well after that event already
// fired, so a listener attached only here could miss it entirely.
declare global {
	interface Window {
		__deferredInstallPrompt?: BeforeInstallPromptEvent;
	}
}

function isStandalone(): boolean {
	if (typeof window === "undefined") return false;
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		// iOS Safari's legacy standalone flag — no display-mode support there.
		(window.navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export function useInstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [installed, setInstalled] = useState(isStandalone);

	useEffect(() => {
		// Already captured before this component mounted.
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
