// Dev-only bridge for driving help screenshot capture. Mounted on
// globalThis.__CF_DOCS__ from src/main.js when import.meta.env.DEV is true.
// The bridge is orchestrated from outside the page (e.g. Claude Preview
// preview_eval) and exposes stable helpers scenarios can rely on.

import { domToPng } from "modern-screenshot";

const SCENARIO_MODULE_PATH = "/test/docs-capture.js";
const SCREENSHOT_ENDPOINT = "/__screenshot";
const DEFAULT_CAPTURE_PIXEL_RATIO = 1;

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

	function setAnnotations(items) {
		const resolved = (items ?? []).map((item) => {
			const label = item.label ?? "";
			if (item.selector) {
				const element = document.querySelector(item.selector);
				if (!element) {
					return { n: item.n, label, x: 0, y: 0, missing: true };
				}
				const rect = element.getBoundingClientRect();
				return {
					n: item.n,
					label,
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2,
				};
			}
			return {
				n: item.n,
				label,
				x: Number.isFinite(item.x) ? item.x : 0,
				y: Number.isFinite(item.y) ? item.y : 0,
			};
		});
		store.docsAnnotations.value = resolved;
	}

	function clearAnnotations() {
		if (store.docsAnnotations.value.length > 0) {
			store.docsAnnotations.value = [];
		}
	}

	async function resetState() {
		const controller = getController();
		clearAnnotations();
		controller?.closeHelp?.();
		controller?.closeViewportPieMenu?.();
		if (store.overlay.value) {
			store.overlay.value = null;
		}
		// Close the floating Tool Rail menu if open.
		const triggers = document.querySelectorAll(".workbench-menu.is-open .workbench-menu__trigger");
		for (const trigger of triggers) {
			trigger.click();
		}
	}

	async function runScenario(name, options = {}) {
		const mod = await import(
			/* @vite-ignore */ `${SCENARIO_MODULE_PATH}?cb=${Date.now()}`
		);
		const scenarios = mod.scenarios || mod.default?.scenarios || {};
		const fn = scenarios[name];
		if (typeof fn !== "function") {
			throw new Error(`Unknown scenario: ${name}`);
		}
		if (options.resetBeforeRun !== false) {
			await resetState();
		}
		await fn(bridge, options);
		await waitForReady();
	}

	async function listScenarios() {
		const mod = await import(
			/* @vite-ignore */ `${SCENARIO_MODULE_PATH}?cb=${Date.now()}`
		);
		const scenarios = mod.scenarios || mod.default?.scenarios || {};
		return Object.keys(scenarios);
	}

	async function capturePng({ pixelRatio = DEFAULT_CAPTURE_PIXEL_RATIO } = {}) {
		await waitForReady({ frames: 4 });
		const appShell = document.querySelector(".app-shell");
		if (!appShell) {
			throw new Error("capturePng: .app-shell not found");
		}
		const spriteHost = document.getElementById("workbench-icon-sprite-host");
		let spriteClone = null;
		if (spriteHost) {
			spriteClone = spriteHost.cloneNode(true);
			spriteClone.id = "workbench-icon-sprite-host-capture-clone";
			appShell.appendChild(spriteClone);
		}
		try {
			return await domToPng(appShell, {
				scale: pixelRatio,
				backgroundColor: "#08111d",
				font: false,
			});
		} finally {
			if (spriteClone?.parentNode) {
				spriteClone.parentNode.removeChild(spriteClone);
			}
		}
	}

	async function saveScreenshot(name, { lang = "ja", pixelRatio } = {}) {
		const dataUrl = await capturePng({ pixelRatio });
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
				`saveScreenshot(${name}) failed: ${payload?.error ?? response.statusText}`,
			);
		}
		return payload;
	}

	async function captureScenario(name, options = {}) {
		await runScenario(name);
		await waitForReady({ frames: 4, delayMs: options.settleMs ?? 0 });
		return saveScreenshot(name, { lang: options.lang, pixelRatio: options.pixelRatio });
	}

	async function captureAllScenarios(options = {}) {
		const names = await listScenarios();
		const results = [];
		for (const name of names) {
			try {
				const info = await captureScenario(name, options);
				results.push({ name, ok: true, path: info.path, bytes: info.bytes });
			} catch (error) {
				results.push({ name, ok: false, error: error.message ?? String(error) });
			}
		}
		await resetState();
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
		setAnnotations,
		clearAnnotations,
		resetState,
		runScenario,
		listScenarios,
		capturePng,
		saveScreenshot,
		captureScenario,
		captureAllScenarios,
	};

	return bridge;
}
