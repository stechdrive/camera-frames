function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function findDiscardAction(overlay) {
	if (!overlay?.actions) return null;
	return (
		overlay.actions.find((action) =>
			/discard|破棄|保存せず/i.test(action?.label ?? ""),
		) ?? null
	);
}

function readStoreProjectSummary(store) {
	const activeShot = store?.workspace?.activeShotCamera?.value ?? null;
	return {
		activeShotCameraId: store?.workspace?.activeShotCameraId?.value ?? null,
		activeShotCameraName: activeShot?.name ?? null,
		shotCameraCount: store?.workspace?.shotCameras?.value?.length ?? null,
		frameCount: store?.frames?.count?.value ?? null,
		activeFrameId: store?.frames?.activeId?.value ?? null,
		activeFrameName: store?.frames?.active?.value?.name ?? null,
		exportFormat: store?.shotCamera?.exportFormat?.value ?? null,
		outputFrame: {
			widthScale: store?.renderBox?.widthScale?.value ?? null,
			heightScale: store?.renderBox?.heightScale?.value ?? null,
			viewZoom: store?.renderBox?.viewZoom?.value ?? null,
			anchor: store?.renderBox?.anchor?.value ?? null,
		},
	};
}

export function createDevTestBridge({ store, getController }) {
	function controller() {
		return getController?.() ?? null;
	}

	function assertController() {
		const current = controller();
		if (!current) throw new Error("Controller not ready");
		return current;
	}

	async function waitForReady({ frames = 8, delayMs = 0 } = {}) {
		for (let i = 0; i < frames; i++) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}
		if (delayMs > 0) {
			await sleep(delayMs);
		}
	}

	async function waitForOverlayDismissed({ timeoutMs = 30000 } = {}) {
		const start = Date.now();
		while (Date.now() - start < timeoutMs) {
			const overlay = store.overlay.value;
			if (!overlay) return true;
			if (overlay.kind !== "progress") return true;
			await sleep(60);
		}
		return false;
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
				await sleep(150);
				return true;
			}
			await sleep(50);
		}
		return false;
	}

	async function openProjectFile(file, { skipReplaceConfirm = false } = {}) {
		const current = assertController();
		if (skipReplaceConfirm && typeof current.openProjectSource === "function") {
			await current.openProjectSource(file, { skipReplaceConfirm: true });
		} else {
			await current.handleAssetInputChange({
				currentTarget: { files: [file] },
			});
			await tryAutoConfirmOverlay();
		}
		await waitForOverlayDismissed();
		await waitForReady({ frames: 16 });
		return {
			ok: true,
			fileName: file.name,
			size: file.size,
			summary: readStoreProjectSummary(store),
		};
	}

	async function loadProject(path, options = {}) {
		assertController();
		const response = await fetch(path, { cache: "no-store" });
		if (!response.ok) {
			return {
				ok: false,
				error: `fetch failed: ${response.status} ${response.statusText}`,
			};
		}
		const blob = await response.blob();
		const filename = path.split("/").pop() || "project.ssproj";
		return await loadProjectBlob(blob, filename, options);
	}

	async function loadProjectBlob(blob, filename, options = {}) {
		const file = new File([blob], filename || "project.ssproj", {
			type: blob.type || "application/x-camera-frames-project",
		});
		return await openProjectFile(file, options);
	}

	function readProjectSummary() {
		return readStoreProjectSummary(store);
	}

	return {
		get store() {
			return store;
		},
		get controller() {
			return controller();
		},
		waitForReady,
		waitForOverlayDismissed,
		tryAutoConfirmOverlay,
		openProjectFile,
		loadProject,
		loadProjectBlob,
		readProjectSummary,
	};
}
