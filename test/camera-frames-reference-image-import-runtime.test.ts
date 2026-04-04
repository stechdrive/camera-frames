import assert from "node:assert/strict";
import { createReferenceImageImportRuntime } from "../src/controllers/reference-image/import-runtime.js";

function createRuntime({ mode = "camera", previewSessionVisible = true } = {}) {
	const store = {
		mode: { value: mode },
		referenceImages: {
			previewLayers: { value: [] },
			previewSessionVisible: { value: previewSessionVisible },
			assetCount: { value: 6 },
			items: {
				value: Array.from({ length: 6 }, (_, index) => ({ id: index })),
			},
		},
	};
	let updateUiCount = 0;
	const runtime = createReferenceImageImportRuntime({
		store,
		t: () => "",
		setStatus: () => {},
		updateUi: () => {
			updateUiCount += 1;
		},
		ensureCameraMode: () => {},
		getActiveShotCameraDocument: () => null,
		getOutputSizeState: () => null,
		getDocument: () => ({ presets: [], assets: [] }),
		setDocument: () => {},
		syncUiState: () => {},
		setSelectionState: () => {},
		ensureActiveShotPresetBinding: () => {},
	});
	return { runtime, store, getUpdateUiCount: () => updateUiCount };
}

{
	const { runtime, getUpdateUiCount } = createRuntime({ mode: "viewport" });
	const originalWarn = console.warn;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const warnings = [];
	console.warn = (...args) => {
		warnings.push(args);
	};
	globalThis.requestAnimationFrame = (callback) => {
		callback(0);
		return 1;
	};

	try {
		runtime.refreshUiAfterLayout({ expectedVisibleItems: 6 });
		assert.equal(warnings.length, 0);
		assert.equal(getUpdateUiCount(), 1);
	} finally {
		console.warn = originalWarn;
		if (originalRequestAnimationFrame) {
			globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		} else {
			globalThis.requestAnimationFrame = undefined;
		}
	}
}

{
	const { runtime, getUpdateUiCount } = createRuntime({ mode: "camera" });
	const originalWarn = console.warn;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const warnings = [];
	console.warn = (...args) => {
		warnings.push(args);
	};
	globalThis.requestAnimationFrame = (callback) => {
		callback(0);
		return 1;
	};

	try {
		runtime.refreshUiAfterLayout({ expectedVisibleItems: 6 });
		assert.equal(warnings.length, 1);
		assert.equal(
			warnings[0][0],
			"[CAMERA_FRAMES] reference-image preview remained empty after import",
		);
		assert.equal(getUpdateUiCount(), 5);
	} finally {
		console.warn = originalWarn;
		if (originalRequestAnimationFrame) {
			globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		} else {
			globalThis.requestAnimationFrame = undefined;
		}
	}
}

console.log("✅ CAMERA_FRAMES reference image import runtime tests passed!");
