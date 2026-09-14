import { useEffect, useState } from "react";

/**
 * A useState that mirrors its value to localStorage under `key`, seeding
 * from `initial` the first time it's read. This is the only persistence
 * layer this project has — there is no backend/database yet, so admin
 * edits live in the current browser only (see AdminApp for the disclosure
 * shown to the user).
 */
export function useLocalStorage<T>(key: string, initial: T) {
	const [value, setValue] = useState<T>(() => {
		try {
			const raw = window.localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as T) : initial;
		} catch {
			return initial;
		}
	});

	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// Storage unavailable (private mode, quota, etc.) — fail silently,
			// the in-memory state still works for the current session.
		}
	}, [key, value]);

	return [value, setValue] as const;
}
