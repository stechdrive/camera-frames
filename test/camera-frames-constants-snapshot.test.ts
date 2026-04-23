import assert from "node:assert/strict";
import {
	ANCHORS,
	AUTO_LOD_MIN_SPLATS,
	AUTO_VIEW_ZOOM_MARGIN,
	AUTO_WORKBENCH_MIN_SAFE_ZOOM,
	BASE_FRAME,
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	DEFAULT_CAMERA_VIEW_ZOOM,
	DEFAULT_FPS_MOVE_SPEED,
	DEFAULT_GRID_DIVISIONS,
	DEFAULT_GRID_SIZE_METERS,
	DEFAULT_POINTER_SCROLL_SPEED,
	DEFAULT_POINTER_SLIDE_SPEED,
	FRAME_MAX_COUNT,
	FRAME_OUTLINE_WIDTH_PX,
	MAX_CAMERA_VIEW_ZOOM_PCT,
	MAX_OUTPUT_FRAME_DIMENSION,
	MAX_OUTPUT_FRAME_HEIGHT_PCT,
	MAX_OUTPUT_FRAME_WIDTH_PCT,
	MIN_CAMERA_VIEW_ZOOM_PCT,
	MIN_OUTPUT_FRAME_SCALE_PCT,
	MOBILE_UI_SCALE_DEFAULT,
	MOBILE_UI_SCALE_MAX,
	MOBILE_UI_SCALE_MIN,
	MOBILE_UI_SCALE_STEP,
	MOBILE_UI_SCALE_STORAGE_KEY,
	MODEL_EXTENSIONS,
	OUTPUT_FRAME_MIN_VISIBLE_PX,
	PROJECT_PACKAGE_EXTENSION,
	SCENE_UNIT_BADGE,
	SPLAT_EXTENSIONS,
	VIEWPORT_LOD_SCALE_DEFAULT,
	VIEWPORT_LOD_SCALE_MAX,
	VIEWPORT_LOD_SCALE_MIN,
	VIEWPORT_LOD_SCALE_STEP,
	VIEWPORT_LOD_SCALE_STORAGE_KEY,
	VIEWPORT_PIXEL_RATIO,
	WORKBENCH_GAP_PX,
	WORKBENCH_PANEL_MAX_WIDTH_PX,
	WORKBENCH_RAIL_WIDTH_PX,
	WORKBENCH_SAFE_GUTTER_PX,
	WORKBENCH_STACK_BREAKPOINT_PX,
} from "../src/constants.js";

/*
 * Constants export-shape snapshot test.
 *
 * Purpose: freeze the public API of constants.js so that
 * module-splitting work immediately detects renames, removals,
 * or accidental value changes.
 */

// ---------- BASE_RENDER_BOX ----------
{
	assert.equal(BASE_RENDER_BOX.width, 1754);
	assert.equal(BASE_RENDER_BOX.height, 1240);
	assert.ok(Object.isFrozen(BASE_RENDER_BOX), "BASE_RENDER_BOX must be frozen");
	console.log("  constants: BASE_RENDER_BOX OK");
}

// ---------- BASE_FRAME ----------
{
	assert.equal(BASE_FRAME.width, 1536);
	assert.equal(BASE_FRAME.height, 864);
	assert.ok(Object.isFrozen(BASE_FRAME), "BASE_FRAME must be frozen");
	console.log("  constants: BASE_FRAME OK");
}

// ---------- scalar constants ----------
{
	assert.equal(FRAME_OUTLINE_WIDTH_PX, 2);
	assert.equal(FRAME_MAX_COUNT, 20);
	assert.equal(PROJECT_PACKAGE_EXTENSION, "ssproj");
	assert.equal(MAX_OUTPUT_FRAME_DIMENSION, 16000);
	assert.equal(MIN_OUTPUT_FRAME_SCALE_PCT, 100);
	assert.equal(
		MAX_OUTPUT_FRAME_WIDTH_PCT,
		Math.floor((MAX_OUTPUT_FRAME_DIMENSION / BASE_RENDER_BOX.width) * 100),
	);
	assert.equal(
		MAX_OUTPUT_FRAME_HEIGHT_PCT,
		Math.floor((MAX_OUTPUT_FRAME_DIMENSION / BASE_RENDER_BOX.height) * 100),
	);
	assert.equal(DEFAULT_CAMERA_VIEW_ZOOM, 1);
	assert.equal(MIN_CAMERA_VIEW_ZOOM_PCT, 20);
	assert.equal(MAX_CAMERA_VIEW_ZOOM_PCT, 200);
	assert.equal(AUTO_VIEW_ZOOM_MARGIN, 0.96);
	assert.equal(AUTO_WORKBENCH_MIN_SAFE_ZOOM, 0.55);
	assert.equal(WORKBENCH_STACK_BREAKPOINT_PX, 960);
	assert.equal(WORKBENCH_SAFE_GUTTER_PX, 16);
	assert.equal(WORKBENCH_GAP_PX, 10);
	assert.equal(WORKBENCH_PANEL_MAX_WIDTH_PX, 360);
	assert.equal(WORKBENCH_RAIL_WIDTH_PX, 52);
	assert.equal(OUTPUT_FRAME_MIN_VISIBLE_PX, 1);
	assert.equal(DEFAULT_CAMERA_NEAR, 0.1);
	assert.equal(DEFAULT_CAMERA_FAR, 1000);
	assert.equal(DEFAULT_FPS_MOVE_SPEED, 2.5);
	assert.equal(DEFAULT_POINTER_SLIDE_SPEED, 0.006);
	assert.equal(DEFAULT_POINTER_SCROLL_SPEED, 0.0015);
	assert.equal(DEFAULT_GRID_SIZE_METERS, 12);
	assert.equal(DEFAULT_GRID_DIVISIONS, 24);
	assert.equal(VIEWPORT_PIXEL_RATIO, 1);
	assert.equal(SCENE_UNIT_BADGE, "1u = 1m");
	assert.equal(MOBILE_UI_SCALE_MIN, 0.7);
	assert.equal(MOBILE_UI_SCALE_MAX, 2.0);
	assert.equal(MOBILE_UI_SCALE_STEP, 0.01);
	assert.equal(MOBILE_UI_SCALE_DEFAULT, 1.0);
	assert.equal(MOBILE_UI_SCALE_STORAGE_KEY, "camera-frames.mobileUiScale");
	assert.equal(VIEWPORT_LOD_SCALE_MIN, 0.6);
	assert.equal(VIEWPORT_LOD_SCALE_MAX, 1.2);
	assert.equal(VIEWPORT_LOD_SCALE_STEP, 0.01);
	assert.equal(VIEWPORT_LOD_SCALE_DEFAULT, 1.1);
	assert.equal(
		VIEWPORT_LOD_SCALE_STORAGE_KEY,
		"camera-frames.viewportLodScale",
	);
	console.log("  constants: scalar values OK");
}

// ---------- SPLAT_EXTENSIONS ----------
{
	const expected = ["ply", "spz", "splat", "ksplat", "zip", "sog", "rad"];
	assert.ok(SPLAT_EXTENSIONS instanceof Set, "SPLAT_EXTENSIONS must be a Set");
	assert.equal(SPLAT_EXTENSIONS.size, expected.length);
	for (const ext of expected) {
		assert.ok(SPLAT_EXTENSIONS.has(ext), `SPLAT_EXTENSIONS missing "${ext}"`);
	}
	console.log("  constants: SPLAT_EXTENSIONS OK");
}

// ---------- MODEL_EXTENSIONS ----------
{
	const expected = ["glb", "gltf"];
	assert.ok(MODEL_EXTENSIONS instanceof Set, "MODEL_EXTENSIONS must be a Set");
	assert.equal(MODEL_EXTENSIONS.size, expected.length);
	for (const ext of expected) {
		assert.ok(MODEL_EXTENSIONS.has(ext), `MODEL_EXTENSIONS missing "${ext}"`);
	}
	console.log("  constants: MODEL_EXTENSIONS OK");
}

// ---------- ANCHORS ----------
{
	const expectedKeys = [
		"top-left",
		"top-center",
		"top-right",
		"middle-left",
		"center",
		"middle-right",
		"bottom-left",
		"bottom-center",
		"bottom-right",
	];
	assert.deepEqual(Object.keys(ANCHORS).sort(), expectedKeys.sort());
	assert.deepEqual(ANCHORS.center, { x: 0.5, y: 0.5 });
	assert.deepEqual(ANCHORS["top-left"], { x: 0, y: 0 });
	assert.deepEqual(ANCHORS["bottom-right"], { x: 1, y: 1 });
	console.log("  constants: ANCHORS OK");
}

// ---------- AUTO_LOD_MIN_SPLATS ----------
{
	assert.equal(
		typeof AUTO_LOD_MIN_SPLATS,
		"number",
		"AUTO_LOD_MIN_SPLATS must be numeric",
	);
	assert.ok(
		AUTO_LOD_MIN_SPLATS >= 0,
		"AUTO_LOD_MIN_SPLATS must be non-negative",
	);
	// Sanity check — a threshold below 1k would run LoD bake on trivially
	// small assets and waste allocations; above 10M it would never fire in
	// practice.
	assert.ok(
		AUTO_LOD_MIN_SPLATS >= 1_000 && AUTO_LOD_MIN_SPLATS <= 10_000_000,
		"AUTO_LOD_MIN_SPLATS must sit between 1k and 10M",
	);
	console.log("  constants: AUTO_LOD_MIN_SPLATS OK");
}

console.log("constants snapshot test passed!");
