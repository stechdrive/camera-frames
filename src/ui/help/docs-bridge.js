// Dev-only bridge for driving help screenshot capture. Mounted on
// globalThis.__CF_DOCS__ from src/main.js when import.meta.env.DEV is true.
// The bridge is orchestrated from outside the page (e.g. Claude Preview
// preview_eval) and exposes stable helpers scenarios can rely on.

const SCENARIO_MODULE_PATH = "/test/docs-capture.js";

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
	};

	return bridge;
}
