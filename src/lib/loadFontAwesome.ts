// The public site itself uses inline SVG icons now, but two spots still need
// the full Font Awesome set: admin screens, and the CMS-editable "참여 혜택"
// cards (an admin can type any Font Awesome class name as that card's icon,
// so it can't be a fixed SVG). Both call this instead of loading the
// stylesheet eagerly for every visitor via index.html.
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
