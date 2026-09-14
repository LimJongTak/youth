import { useEffect, useState } from "react";

function formatNow(): string {
	const now = new Date();
	const h = now.getHours().toString().padStart(2, "0");
	const m = now.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

/** Live HH:MM clock for the decorative fake status bar. */
export function useClock(): string {
	const [time, setTime] = useState(formatNow);

	useEffect(() => {
		const id = setInterval(() => setTime(formatNow()), 15000);
		return () => clearInterval(id);
	}, []);

	return time;
}
