import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Dynamic subset build: splits every weight into small unicode-range
// chunks so the browser only downloads the glyphs it actually renders,
// instead of one ~2MB variable-font file up front.
import "pretendard/dist/web/static/pretendard-dynamic-subset.css";
import "./styles/global.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
