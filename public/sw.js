// Minimal service worker — exists only so the browser counts this site as
// installable (Chrome's "beforeinstallprompt"/install-banner eligibility
// looks for a registered worker with a fetch handler). It intentionally
// does no caching: every request just falls through to the network, so the
// site never risks serving stale content.
self.addEventListener("fetch", () => {});
