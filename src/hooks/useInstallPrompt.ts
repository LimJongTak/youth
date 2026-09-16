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
		function handleBeforeInstallPrompt(event: Event) {
			event.preventDefault();
			setDeferredPrompt(event as BeforeInstallPromptEvent);
		}
		function handleAppInstalled() {
			setInstalled(true);
			setDeferredPrompt(null);
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
		return outcome;
	}, [deferredPrompt]);

	return {
		installed,
		canPrompt: deferredPrompt !== null,
		isIos: isIos(),
		promptInstall,
	};
}
