import assert from "node:assert/strict";
import {
	cloneLightingState,
	createDefaultLightingState,
	normalizeLightingState,
} from "../src/lighting-model.js";

{
	const defaults = createDefaultLightingState();
	assert.equal(defaults.ambient, 0.55);
	assert.equal(defaults.modelLight.enabled, true);
	assert.equal(defaults.modelLight.intensity, 1.4);
}

{
	const normalized = normalizeLightingState({
		ambient: 99,
		modelLight: {
			enabled: false,
			intensity: -5,
			azimuthDeg: 540,
			elevationDeg: 120,
		},
	});
	assert.equal(normalized.ambient, 2);
	assert.equal(normalized.modelLight.enabled, false);
	assert.equal(normalized.modelLight.intensity, 0);
	assert.equal(normalized.modelLight.azimuthDeg, 180);
	assert.equal(normalized.modelLight.elevationDeg, 89);
}

{
	const clone = cloneLightingState({
		ambient: 0.4,
		modelLight: {
			enabled: true,
			intensity: 1.2,
			azimuthDeg: -45,
			elevationDeg: 15,
		},
	});
	clone.modelLight.azimuthDeg = 10;
	const source = normalizeLightingState({
		ambient: 0.4,
		modelLight: {
			enabled: true,
			intensity: 1.2,
			azimuthDeg: -45,
			elevationDeg: 15,
		},
	});
	assert.equal(source.modelLight.azimuthDeg, -45);
}

console.log("✅ CAMERA_FRAMES lighting model tests passed!");
