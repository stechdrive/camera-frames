// Dev-only bridge for driving help screenshot capture. Mounted on
// globalThis.__CF_DOCS__ from src/main.js when import.meta.env.DEV is
// true. The bridge is orchestrated from outside the page (e.g. Claude
// Preview preview_eval) and exposes the fixture capture pipeline used
// by docs/help/FIXTURE_ROADMAP.md plus a lightweight project loader
// for regenerating static backdrop PNGs.

import { domToPng } from "modern-screenshot";

const SCREENSHOT_ENDPOINT = "/__screenshot";
const DEFAULT_CAPTURE_PIXEL_RATIO = 1;
const DOCS_PAGE_PATH = "/docs.html";
const DEFAULT_FIXTURE_CAPTURE_TIMEOUT_MS = 15000;
const DEFAULT_IFRAME_POLL_MS = 32;

export function createDocsBridge({ store, getController }) {
	async function waitForReady({ frames = 8, delayMs = 0 } = {}) {
		for (let i = 0; i < frames; i++) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
		if (delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	async function waitForOverlayDismissed({ timeoutMs = 30000 } = {}) {
		const start = Date.now();
		while (Date.now() - start < timeoutMs) {
			const overlay = store.overlay.value;
			if (!overlay) return;
			if (overlay.kind !== "progress") return;
			await new Promise((resolve) => setTimeout(resolve, 60));
		}
	}

	function findDiscardAction(overlay) {
		if (!overlay?.actions) return null;
		return (
			overlay.actions.find((action) =>
				/discard|破棄|保存せず/i.test(action?.label ?? ""),
			) ?? null
		);
	}

	async function tryAutoConfirmOverlay({ timeoutMs = 2000 } = {}) {
		const start = Date.now();
		while (Date.now() - start < timeoutMs) {
			const overlay = store.overlay.value;
			if (
				overlay?.kind === "confirm" &&
				Array.isArray(overlay.actions) &&
				overlay.actions.length > 0
			) {
				// Prefer a "discard"-style action so we never end up in a nested
				// save flow. Fall back to any non-primary, non-cancel action, then
				// finally force-close the overlay.
				const discardAction = findDiscardAction(overlay);
				const fallbackAction =
					overlay.actions.find(
						(action) =>
							!action?.primary &&
							!/cancel|キャンセル/i.test(action?.label ?? ""),
					) ?? null;
				const chosen = discardAction ?? fallbackAction;
				try {
					if (chosen && typeof chosen.onClick === "function") {
						await chosen.onClick();
					} else {
						store.overlay.value = null;
					}
				} catch (_error) {
					store.overlay.value = null;
				}
				await new Promise((resolve) => setTimeout(resolve, 150));
				return true;
			}
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
		return false;
	}

	async function loadProject(path) {
		const controller = getController();
		if (!controller) throw new Error("Controller not ready");
		const response = await fetch(path, { cache: "no-store" });
		if (!response.ok) {
			throw new Error(`Failed to fetch ${path}: ${response.status}`);
		}
		const blob = await response.blob();
		const filename = path.split("/").pop() || "project.ssproj";
		const file = new File([blob], filename, { type: blob.type });
		controller.handleAssetInputChange({
			currentTarget: { files: [file] },
		});
		// Auto-dismiss any "replace current project?" confirm that the app
		// raises when loading a new project on top of an existing one.
		await tryAutoConfirmOverlay();
		await waitForOverlayDismissed();
		await waitForReady({ frames: 16 });
	}

	async function postScreenshotDataUrl(name, dataUrl, { lang = "ja" } = {}) {
		const url = `${SCREENSHOT_ENDPOINT}?name=${encodeURIComponent(name)}&lang=${encodeURIComponent(lang)}`;
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ dataUrl }),
		});
		const text = await response.text();
		let payload;
		try {
			payload = JSON.parse(text);
		} catch (_error) {
			payload = { ok: false, error: text };
		}
		if (!response.ok || !payload?.ok) {
			throw new Error(
				`postScreenshotDataUrl(${name}) failed: ${payload?.error ?? response.statusText}`,
			);
		}
		return payload;
	}

	// -- iframe-based fixture capture pipeline --

	function createDocsIframe(search, { visible = true } = {}) {
		const iframe = document.createElement("iframe");
		iframe.src = `${DOCS_PAGE_PATH}${search ?? ""}`;
		iframe.style.cssText = visible
			? "position:fixed;left:0;top:0;width:100vw;height:100vh;border:0;z-index:2147483647;background:#08111d;"
			: "position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;";
		return iframe;
	}

	function waitForIframeLoaded(iframe) {
		return new Promise((resolve, reject) => {
			const cleanup = () => {
				iframe.removeEventListener("load", onLoad);
				iframe.removeEventListener("error", onError);
			};
			const onLoad = () => {
				cleanup();
				resolve();
			};
			const onError = () => {
				cleanup();
				reject(new Error(`waitForIframeLoaded: ${iframe.src} failed to load`));
			};
			iframe.addEventListener("load", onLoad);
			iframe.addEventListener("error", onError);
		});
	}

	async function waitForIframeProp(
		iframe,
		propName,
		predicate,
		{ timeoutMs = DEFAULT_FIXTURE_CAPTURE_TIMEOUT_MS, pollMs = DEFAULT_IFRAME_POLL_MS } = {},
	) {
		const start = Date.now();
		while (Date.now() - start < timeoutMs) {
			const value = iframe.contentWindow?.[propName];
			if (predicate(value)) return value;
			await new Promise((resolve) => setTimeout(resolve, pollMs));
		}
		throw new Error(
			`waitForIframeProp(${propName}): condition not met within ${timeoutMs}ms`,
		);
	}

	// Preact sets form state via DOM properties (.checked, .value) but does not
	// always mirror those onto HTML attributes. DOM-to-image libraries (and our
	// modern-screenshot capture) serialise attributes, not live properties, so
	// without this sync step captured PNGs show checkboxes as unchecked and
	// <select> dropdowns as their first option regardless of the runtime state.
	function syncFormStateToAttributes(root) {
		if (!root?.querySelectorAll) return;
		const inputs = root.querySelectorAll(
			"input[type='checkbox'], input[type='radio']",
		);
		for (const input of inputs) {
			if (input.checked) input.setAttribute("checked", "");
			else input.removeAttribute("checked");
		}
		for (const input of root.querySelectorAll(
			"input[type='text'], input[type='number'], input[type='range'], input:not([type])",
		)) {
			input.setAttribute("value", input.value ?? "");
		}
		for (const select of root.querySelectorAll("select")) {
			const selectedValue = select.value;
			for (const option of select.options) {
				if (option.value === selectedValue) option.setAttribute("selected", "");
				else option.removeAttribute("selected");
			}
		}
		for (const textarea of root.querySelectorAll("textarea")) {
			textarea.textContent = textarea.value ?? "";
		}
	}

	// modern-screenshot's style-serialisation pass does not reliably copy
	// `white-space: nowrap` into the inlined style attribute it writes on
	// each cloned element. As a result short flex children with Japanese
	// labels (e.g. the Reference panel's "下絵を非表示" button) wrap mid-word
	// at capture time even though the live DOM renders them on a single
	// line. Walking the subtree once and copying the computed value onto
	// the live element's inline style guarantees the attribute survives
	// serialisation. Runs on the iframe DOM before each capture — the
	// iframe is discarded immediately after, so there is no lasting
	// effect on the app.
	function pinWhiteSpaceNowrapBeforeCapture(root) {
		if (!root?.querySelectorAll) return;
		const win = root.ownerDocument?.defaultView;
		if (!win) return;
		const candidates = root.querySelectorAll("*");
		for (const element of candidates) {
			if (!(element instanceof win.HTMLElement)) continue;
			const computed = win.getComputedStyle(element);
			if (computed.whiteSpace === "nowrap" && !element.style.whiteSpace) {
				element.style.whiteSpace = "nowrap";
			}
		}
	}

	async function captureFixture(id, options = {}) {
		const {
			lang = "ja",
			pixelRatio = DEFAULT_CAPTURE_PIXEL_RATIO,
			timeoutMs = DEFAULT_FIXTURE_CAPTURE_TIMEOUT_MS,
			settleMs = 0,
		} = options;
		if (typeof id !== "string" || id === "") {
			throw new Error("captureFixture: id must be a non-empty string");
		}
		const search = `?fixture=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`;
		const iframe = createDocsIframe(search, { visible: true });
		document.body.appendChild(iframe);
		try {
			await waitForIframeLoaded(iframe);
			await waitForIframeProp(
				iframe,
				"__DOCS_FIXTURE_READY",
				(value) => value === true,
				{ timeoutMs },
			);
			if (settleMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, settleMs));
			}
			const target = iframe.contentDocument?.querySelector(".docs-stage");
			if (!target) {
				throw new Error(
					`captureFixture(${id}): .docs-stage not found — is the id registered?`,
				);
			}
			syncFormStateToAttributes(target);
			pinWhiteSpaceNowrapBeforeCapture(target);
			const dataUrl = await domToPng(target, {
				scale: pixelRatio,
				backgroundColor: "#08111d",
				font: false,
			});
			return await postScreenshotDataUrl(id, dataUrl, { lang });
		} finally {
			iframe.remove();
		}
	}

	async function listFixtureIds({ timeoutMs = DEFAULT_FIXTURE_CAPTURE_TIMEOUT_MS } = {}) {
		const iframe = createDocsIframe("", { visible: false });
		document.body.appendChild(iframe);
		try {
			await waitForIframeLoaded(iframe);
			const ids = await waitForIframeProp(
				iframe,
				"__DOCS_FIXTURE_IDS",
				(value) => Array.isArray(value),
				{ timeoutMs },
			);
			return ids.slice();
		} finally {
			iframe.remove();
		}
	}

	async function captureAllFixtures(options = {}) {
		const ids = await listFixtureIds({ timeoutMs: options.timeoutMs });
		const results = [];
		for (const id of ids) {
			try {
				const info = await captureFixture(id, options);
				results.push({ id, ok: true, path: info.path, bytes: info.bytes });
			} catch (error) {
				results.push({
					id,
					ok: false,
					error: error?.message ?? String(error),
				});
			}
		}
		return results;
	}

	const bridge = {
		get store() {
			return store;
		},
		get controller() {
			return getController();
		},
		waitForReady,
		waitForOverlayDismissed,
		loadProject,
		postScreenshotDataUrl,
		captureFixture,
		listFixtureIds,
		captureAllFixtures,
	};

	return bridge;
}
