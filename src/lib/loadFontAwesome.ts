// 공개 사이트 자체는 이제 인라인 SVG 아이콘을 쓰지만, Font Awesome 전체
// 세트가 여전히 필요한 곳이 두 군데 있다: 관리자 화면, 그리고 CMS에서
// 편집하는 "참여 혜택" 카드(관리자가 아무 Font Awesome 클래스명이나
// 입력할 수 있어서 고정 SVG로 대체할 수 없음). 두 곳 모두 index.html에서
// 모든 방문자에게 무조건 로드하는 대신 이 함수를 호출해서 필요할 때만 불러온다.
let loaded = false;

export function ensureFontAwesomeLoaded() {
	if (loaded || typeof document === "undefined") return;
	if (document.getElementById("fontawesome-css")) {
		loaded = true;
		return;
	}
	const link = document.createElement("link");
	link.id = "fontawesome-css";
	link.rel = "stylesheet";
	link.href = "/assets/css/fontawesome-all.min.css";
	document.head.appendChild(link);
	loaded = true;
}
