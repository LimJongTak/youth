import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 동적 서브셋 빌드: 폰트 굵기마다 유니코드 범위별 작은 청크로 나눠져
// 있어서, 약 2MB짜리 가변 폰트 파일 전체를 미리 받는 대신 브라우저가
// 실제로 렌더링하는 글자만 내려받는다.
import "pretendard/dist/web/static/pretendard-dynamic-subset.css";
import "./styles/global.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

// 프로덕션에서만 서비스워커 등록 — 개발 모드에서 등록하면 `npm run dev`를
// 재시작해도 서비스워커가 계속 요청을 가로채서 HMR이 꼬이게 된다.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch(() => {});
	});
}
