import { useEffect, useState } from "react";

/**
 * 값을 `key`로 localStorage에도 그대로 반영하는 useState — 처음 읽을 땐
 * `initial` 값으로 시작한다. Firestore 연동 전, 백엔드가 없던 초기
 * 버전에서 쓰던 브라우저 로컬 저장 방식이며, 지금은 실제로 쓰는 곳이
 * 없다(현재는 AdminApp의 안내문처럼 모든 변경사항이 Firestore에 저장됨).
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
			// 저장소를 못 쓰는 경우(시크릿 모드, 용량 초과 등) — 조용히
			// 무시한다. 메모리상의 state는 이번 세션 동안은 그대로 동작함.
		}
	}, [key, value]);

	return [value, setValue] as const;
}
