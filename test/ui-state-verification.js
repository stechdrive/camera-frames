/**
 * UI State Verification Script
 *
 * Runs inside the browser via preview_eval or console.
 * Verifies that store state matches expected values from project.json
 * after loading cf-test.ssproj.
 *
 * Usage (Claude Preview):
 *   1. preview_start("camera-frames-dev")
 *   2. preview_eval: await __cfLoadProject()
 *   3. preview_eval: __cfVerifyState(__CF_EXPECTED)
 *
 * Usage (browser console):
 *   1. Copy-paste this file into console
 *   2. await __cfLoadProject()
 *   3. __cfVerifyState(__CF_EXPECTED)
 */

// ============================================================
// Step 1: Load project file via handleAssetInputChange
// ============================================================

async function __cfLoadProject(path = "/.local/cf-test/cf-test.ssproj") {
	const test = globalThis.__CF_TEST__;
	if (!test) {
		return { ok: false, error: "__CF_TEST__ not found. Is this a dev build?" };
	}

	try {
		test.controller.startNewProject();

		const response = await fetch(path);
		if (!response.ok) {
			return {
				ok: false,
				error: `fetch failed: ${response.status} ${response.statusText}`,
			};
		}

		const blob = await response.blob();
		const fileName = path.split("/").pop() || "project.ssproj";
		const file = new File([blob], fileName);

		const mockInput = document.createElement("input");
		mockInput.type = "file";
		const dt = new DataTransfer();
		dt.items.add(file);
		mockInput.files = dt.files;

		await test.controller.handleAssetInputChange({ currentTarget: mockInput });
		await new Promise((r) => setTimeout(r, 2000));

		return {
			ok: true,
			fileName,
			size: blob.size,
			shotCameras: test.store.workspace.shotCameras.value.length,
		};
	} catch (err) {
		return { ok: false, error: String(err) };
	}
}

// ============================================================
// Step 2: Verify store state
// ============================================================

function __cfVerifyState(expected) {
	const test = globalThis.__CF_TEST__;
	if (!test) {
		return {
			pass: 0,
			fail: 1,
			errors: ["__CF_TEST__ not found"],
		};
	}

	const store = test.store;
	const results = { pass: 0, fail: 0, errors: [] };

	function check(label, actual, expected) {
		if (typeof expected === "number" && typeof actual === "number") {
			if (Math.abs(actual - expected) < 0.01) {
				results.pass += 1;
				return;
			}
		} else if (actual === expected) {
			results.pass += 1;
			return;
		}

		results.fail += 1;
		results.errors.push(
			`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
		);
	}

	function checkGte(label, actual, min) {
		if (actual >= min) {
			results.pass += 1;
		} else {
			results.fail += 1;
			results.errors.push(`${label}: expected >= ${min}, got ${actual}`);
		}
	}

	const cam = store.workspace.activeShotCamera.value;

	// --- workspace ---
	check(
		"activeShotCameraId",
		store.workspace.activeShotCameraId.value,
		expected.activeShotCameraId,
	);
	check("activeShotCamera.name", cam?.name, expected.cameraName);
	checkGte(
		"shotCameras.length",
		store.workspace.shotCameras.value.length,
		expected.minShotCameras,
	);

	// --- lens ---
	check("baseFovX", store.baseFovX.value, expected.baseFovX);

	// --- clipping ---
	check(
		"clippingMode",
		store.shotCamera.clippingMode.value,
		expected.clippingMode,
	);
	check("near", store.shotCamera.near.value, expected.near);

	// --- output frame ---
	check("widthScale", store.renderBox.widthScale.value, expected.widthScale);
	check(
		"heightScale",
		store.renderBox.heightScale.value,
		expected.heightScale,
	);
	check("viewZoom", store.renderBox.viewZoom.value, expected.viewZoom);
	check("anchor", store.renderBox.anchor.value, expected.anchor);

	// --- export settings ---
	check(
		"exportName",
		store.shotCamera.exportName.value,
		expected.exportName,
	);
	check(
		"exportFormat",
		store.shotCamera.exportFormat.value,
		expected.exportFormat,
	);
	check(
		"exportGridOverlay",
		store.shotCamera.exportGridOverlay.value,
		expected.exportGridOverlay,
	);
	check(
		"exportModelLayers",
		store.shotCamera.exportModelLayers.value,
		expected.exportModelLayers,
	);
	check(
		"exportSplatLayers",
		store.shotCamera.exportSplatLayers.value,
		expected.exportSplatLayers,
	);

	// --- frames ---
	check("frames.count", store.frames.count.value, expected.frameCount);
	check(
		"frames.activeId",
		store.frames.activeId.value,
		expected.activeFrameId,
	);
	check(
		"frames.active.name",
		store.frames.active.value?.name,
		expected.activeFrameName,
	);

	// --- frame mask / trajectory ---
	check("frames.maskMode", store.frames.maskMode.value, expected.maskMode);
	check("frames.maskShape", store.frames.maskShape.value, expected.maskShape);
	check(
		"frames.trajectoryMode",
		store.frames.trajectoryMode.value,
		expected.trajectoryMode,
	);
	check(
		"frames.trajectoryExportSource",
		store.frames.trajectoryExportSource.value,
		expected.trajectoryExportSource,
	);
	check(
		"frames.trajectoryNodeCount",
		Object.keys(store.frames.trajectoryNodesByFrameId.value ?? {}).length,
		expected.trajectoryNodeCount,
	);

	return results;
}

// ============================================================
// Expected values for cf-test.ssproj (from project.json snapshot)
// ============================================================

const __CF_EXPECTED = {
	activeShotCameraId: "shot-camera-1",
	cameraName: "Camera 1",
	minShotCameras: 3,
	baseFovX: 60.849,
	clippingMode: "auto",
	near: 0.1,
	widthScale: 1,
	heightScale: 1,
	viewZoom: 0.96,
	anchor: "center",
	exportName: "cf-%cam",
	exportFormat: "psd",
	exportGridOverlay: true,
	exportModelLayers: true,
	exportSplatLayers: true,
	frameCount: 1,
	activeFrameId: "frame-1",
	activeFrameName: "FRAME A",
	// --- frame mask / trajectory (shot-camera-1 has a single frame; defaults apply) ---
	maskMode: "off",
	maskShape: "bounds",
	trajectoryMode: "line",
	trajectoryExportSource: "none",
	trajectoryNodeCount: 0,
};
