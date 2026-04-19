import assert from "node:assert/strict";
import {
	MOBILE_UI_SCALE_DEFAULT,
	MOBILE_UI_SCALE_MAX,
	MOBILE_UI_SCALE_MIN,
	MOBILE_UI_SCALE_STEP,
	MOBILE_UI_SCALE_STORAGE_KEY,
} from "../src/constants.js";
import {
	VIEWPORT_PIE_COARSE_SCALE,
	VIEWPORT_PIE_RADIUS,
	getViewportPieMetrics,
} from "../src/engine/viewport-pie.js";
import {
	clampMobileUiScale,
	computeAutoMobileUiScale,
	formatMobileUiScaleLabel,
	readPersistedMobileUiUserScale,
	resolveEffectiveMobileUiScale,
	writePersistedMobileUiUserScale,
} from "../src/ui/mobile-ui-scale.js";

/*
 * Mobile UI scale behavior test.
 *
 * Covers the pure helpers that compute and persist the mobile-only UI scale
 * and verifies that the scale multiplies through the viewport pie metrics
 * alongside the existing coarse-pointer multiplier. Desktop (non-coarse)
 * callers must still receive radius = VIEWPORT_PIE_RADIUS, no matter what
 * user scale the store holds.
 */

// ---------- constants ----------
{
	assert.equal(MOBILE_UI_SCALE_MIN, 0.7);
	assert.equal(MOBILE_UI_SCALE_MAX, 2.0);
	assert.equal(MOBILE_UI_SCALE_STEP, 0.01);
	assert.equal(MOBILE_UI_SCALE_DEFAULT, 1.0);
	assert.equal(MOBILE_UI_SCALE_STORAGE_KEY, "camera-frames.mobileUiScale");
	console.log("  mobile-ui-scale: constants OK");
}

// ---------- clampMobileUiScale ----------
{
	assert.equal(clampMobileUiScale(1), 1.0);
	assert.equal(clampMobileUiScale(0.1), MOBILE_UI_SCALE_MIN);
	assert.equal(clampMobileUiScale(5), MOBILE_UI_SCALE_MAX);
	assert.equal(clampMobileUiScale(Number.NaN), MOBILE_UI_SCALE_DEFAULT);
	assert.equal(clampMobileUiScale("1.37"), 1.37);
	assert.equal(clampMobileUiScale(1.234), 1.23);
	console.log("  mobile-ui-scale: clampMobileUiScale OK");
}

// ---------- formatMobileUiScaleLabel ----------
{
	assert.equal(formatMobileUiScaleLabel(1), "1.00");
	assert.equal(formatMobileUiScaleLabel(1.2), "1.20");
	assert.equal(formatMobileUiScaleLabel(0.7), "0.70");
	assert.equal(formatMobileUiScaleLabel(Number.NaN), "1.00");
	console.log("  mobile-ui-scale: formatMobileUiScaleLabel OK");
}

// ---------- resolveEffectiveMobileUiScale ----------
{
	assert.equal(
		resolveEffectiveMobileUiScale({ userScale: null, autoScale: 0.95 }),
		0.95,
	);
	assert.equal(
		resolveEffectiveMobileUiScale({ userScale: 1.4, autoScale: 0.9 }),
		1.4,
	);
	assert.equal(
		resolveEffectiveMobileUiScale({ userScale: undefined, autoScale: 1 }),
		1,
	);
	assert.equal(
		resolveEffectiveMobileUiScale({ userScale: 5, autoScale: 1 }),
		MOBILE_UI_SCALE_MAX,
	);
	console.log("  mobile-ui-scale: resolveEffectiveMobileUiScale OK");
}

// ---------- computeAutoMobileUiScale ----------
{
	// Desktop (non-coarse) always returns 1.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 1440,
			screenWidth: 1440,
			coarsePointer: false,
		}),
		MOBILE_UI_SCALE_DEFAULT,
	);

	// Wide coarse device (i.e. mouse on a Windows tablet > 1180px) keeps 1.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 1400,
			screenWidth: 1400,
			coarsePointer: true,
		}),
		MOBILE_UI_SCALE_DEFAULT,
	);

	// Normal iPhone / Android viewport -> slightly under 1 to favor work area.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 390,
			screenWidth: 390,
			coarsePointer: true,
		}),
		0.95,
	);

	// Very narrow phone -> nudged up so targets remain tappable.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 320,
			screenWidth: 320,
			coarsePointer: true,
		}),
		1.05,
	);

	// Mid-sized tablet -> denser so more content fits.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 820,
			screenWidth: 820,
			coarsePointer: true,
		}),
		0.9,
	);

	// Android style: viewport way wider than "screen.width" -> compensate.
	const compensated = computeAutoMobileUiScale({
		viewportWidth: 980,
		screenWidth: 412,
		coarsePointer: true,
	});
	assert.ok(
		compensated >= 0.8 && compensated <= 1.0,
		`expected ratio-corrected scale in [0.8, 1.0], got ${compensated}`,
	);

	// Invalid viewport width falls back to default.
	assert.equal(
		computeAutoMobileUiScale({
			viewportWidth: 0,
			screenWidth: 0,
			coarsePointer: true,
		}),
		MOBILE_UI_SCALE_DEFAULT,
	);
	console.log("  mobile-ui-scale: computeAutoMobileUiScale OK");
}

// ---------- persistence round-trip ----------
{
	const memory = new Map();
	const storage = {
		getItem: (key) => (memory.has(key) ? memory.get(key) : null),
		setItem: (key, value) => {
			memory.set(key, value);
		},
		removeItem: (key) => {
			memory.delete(key);
		},
	};

	// Empty storage resolves to null (auto-mode).
	assert.equal(readPersistedMobileUiUserScale({ storage }), null);

	// Persist a valid value and read it back.
	writePersistedMobileUiUserScale(1.2, { storage });
	assert.equal(memory.size, 1);
	assert.equal(readPersistedMobileUiUserScale({ storage }), 1.2);

	// Out-of-range values are clamped on write.
	writePersistedMobileUiUserScale(5, { storage });
	assert.equal(readPersistedMobileUiUserScale({ storage }), MOBILE_UI_SCALE_MAX);

	// Null clears the entry.
	writePersistedMobileUiUserScale(null, { storage });
	assert.equal(memory.size, 0);
	assert.equal(readPersistedMobileUiUserScale({ storage }), null);

	// Corrupt payload resolves to null without throwing.
	memory.set(MOBILE_UI_SCALE_STORAGE_KEY, "not-json");
	assert.equal(readPersistedMobileUiUserScale({ storage }), null);

	// Entry missing userScale resolves to null.
	memory.set(MOBILE_UI_SCALE_STORAGE_KEY, JSON.stringify({ foo: 1 }));
	assert.equal(readPersistedMobileUiUserScale({ storage }), null);

	console.log("  mobile-ui-scale: persistence round-trip OK");
}

// ---------- getViewportPieMetrics multiply behavior ----------
{
	const desktop = getViewportPieMetrics({ coarse: false, uiScale: 1 });
	assert.equal(desktop.scale, 1);
	assert.equal(desktop.radius, VIEWPORT_PIE_RADIUS);

	// Desktop with uiScale > 1 still returns 1 from the store path, but the
	// helper itself should multiply when asked to (other callers may use it).
	const desktopWithUi = getViewportPieMetrics({ coarse: false, uiScale: 1.5 });
	assert.equal(desktopWithUi.scale, 1.5);

	const coarseOnly = getViewportPieMetrics({ coarse: true, uiScale: 1 });
	assert.equal(coarseOnly.scale, VIEWPORT_PIE_COARSE_SCALE);
	assert.equal(coarseOnly.radius, VIEWPORT_PIE_RADIUS * VIEWPORT_PIE_COARSE_SCALE);

	const coarseWithUserScale = getViewportPieMetrics({
		coarse: true,
		uiScale: 1.5,
	});
	assert.ok(
		Math.abs(coarseWithUserScale.scale - VIEWPORT_PIE_COARSE_SCALE * 1.5) < 1e-9,
		"coarse scale must multiply with uiScale",
	);

	// Invalid uiScale falls back to 1.
	const invalid = getViewportPieMetrics({ coarse: true, uiScale: 0 });
	assert.equal(invalid.scale, VIEWPORT_PIE_COARSE_SCALE);
	const negative = getViewportPieMetrics({ coarse: false, uiScale: -1 });
	assert.equal(negative.scale, 1);

	console.log("  mobile-ui-scale: pie metrics multiply OK");
}

console.log("✅ CAMERA_FRAMES mobile UI scale tests passed!");
