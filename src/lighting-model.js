export const DEFAULT_LIGHTING_AMBIENT = 1.1;
export const DEFAULT_MODEL_LIGHT_INTENSITY = 2.0;
export const DEFAULT_MODEL_LIGHT_AZIMUTH_DEG = 36.87;
export const DEFAULT_MODEL_LIGHT_ELEVATION_DEG = 45;

function clamp(value, min, max, fallback) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}
	return Math.min(max, Math.max(min, nextValue));
}

function normalizeAngleDegrees(value, fallback = 0) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}
	let normalized = ((((nextValue + 180) % 360) + 360) % 360) - 180;
	if (normalized === -180) {
		normalized = 180;
	}
	return normalized;
}

export function createDefaultLightingState() {
	return {
		ambient: DEFAULT_LIGHTING_AMBIENT,
		modelLight: {
			enabled: true,
			intensity: DEFAULT_MODEL_LIGHT_INTENSITY,
			azimuthDeg: DEFAULT_MODEL_LIGHT_AZIMUTH_DEG,
			elevationDeg: DEFAULT_MODEL_LIGHT_ELEVATION_DEG,
		},
	};
}

export function cloneLightingState(state = null) {
	const normalized = normalizeLightingState(state);
	return {
		ambient: normalized.ambient,
		modelLight: {
			enabled: normalized.modelLight.enabled,
			intensity: normalized.modelLight.intensity,
			azimuthDeg: normalized.modelLight.azimuthDeg,
			elevationDeg: normalized.modelLight.elevationDeg,
		},
	};
}

export function normalizeLightingState(state = null) {
	const defaults = createDefaultLightingState();
	const modelLight = state?.modelLight ?? {};
	return {
		ambient: clamp(state?.ambient, 0, 2.5, defaults.ambient),
		modelLight: {
			enabled:
				typeof modelLight.enabled === "boolean"
					? modelLight.enabled
					: defaults.modelLight.enabled,
			intensity: clamp(
				modelLight.intensity,
				0,
				3,
				defaults.modelLight.intensity,
			),
			azimuthDeg: normalizeAngleDegrees(
				modelLight.azimuthDeg,
				defaults.modelLight.azimuthDeg,
			),
			elevationDeg: clamp(
				modelLight.elevationDeg,
				-89,
				89,
				defaults.modelLight.elevationDeg,
			),
		},
	};
}

export function lightingStatesEqual(a, b) {
	const left = normalizeLightingState(a);
	const right = normalizeLightingState(b);
	return (
		left.ambient === right.ambient &&
		left.modelLight.enabled === right.modelLight.enabled &&
		left.modelLight.intensity === right.modelLight.intensity &&
		left.modelLight.azimuthDeg === right.modelLight.azimuthDeg &&
		left.modelLight.elevationDeg === right.modelLight.elevationDeg
	);
}

export function isDefaultLightingState(state) {
	return lightingStatesEqual(state, createDefaultLightingState());
}
