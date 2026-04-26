import {
	VIEWPORT_LOD_SCALE_DEFAULT,
	VIEWPORT_LOD_SCALE_MAX,
	VIEWPORT_LOD_SCALE_MIN,
	VIEWPORT_LOD_SCALE_STEP,
	VIEWPORT_LOD_SCALE_STORAGE_KEY,
} from "../constants.js";

const EXPORT_READINESS_BASE_WARMUP_PASSES = 2;
const EXPORT_READINESS_BASE_MAX_WAIT_MS = 1500;
const EXPORT_READINESS_MAX_WARMUP_PASSES = 3;
const EXPORT_READINESS_MAX_WAIT_MS = 2000;

function roundToStep(value, step = VIEWPORT_LOD_SCALE_STEP) {
	return Math.round(value / step) * step;
}

function clampNumber(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export function clampViewportLodScale(raw) {
	const numeric = Number(raw);
	if (!Number.isFinite(numeric)) {
		return VIEWPORT_LOD_SCALE_DEFAULT;
	}
	const clamped = clampNumber(
		numeric,
		VIEWPORT_LOD_SCALE_MIN,
		VIEWPORT_LOD_SCALE_MAX,
	);
	return Number(roundToStep(clamped).toFixed(2));
}

export function formatViewportLodScaleLabel(scale) {
	const numeric = Number(scale);
	if (!Number.isFinite(numeric)) {
		return Number(VIEWPORT_LOD_SCALE_DEFAULT).toFixed(2);
	}
	return numeric.toFixed(2);
}

export function resolveEffectiveViewportLodScale({ userScale = null } = {}) {
	if (userScale === null || userScale === undefined) {
		return VIEWPORT_LOD_SCALE_DEFAULT;
	}
	return clampViewportLodScale(userScale);
}

export function resolveExportViewportLodScale(previewScale) {
	return clampViewportLodScale(
		Math.max(clampViewportLodScale(previewScale), VIEWPORT_LOD_SCALE_DEFAULT),
	);
}

export function buildViewportLodExportReadinessPolicy(previewScale) {
	const exportLodScale = resolveExportViewportLodScale(previewScale);
	const readinessScale = exportLodScale / VIEWPORT_LOD_SCALE_DEFAULT;
	return {
		minWarmupPasses: 0,
		splatWarmupPasses: clampNumber(
			Math.ceil(EXPORT_READINESS_BASE_WARMUP_PASSES * readinessScale),
			EXPORT_READINESS_BASE_WARMUP_PASSES,
			EXPORT_READINESS_MAX_WARMUP_PASSES,
		),
		maxWaitMs: clampNumber(
			Math.round(EXPORT_READINESS_BASE_MAX_WAIT_MS * readinessScale),
			EXPORT_READINESS_BASE_MAX_WAIT_MS,
			EXPORT_READINESS_MAX_WAIT_MS,
		),
	};
}

export function readPersistedViewportLodUserScale({ storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return null;
	}
	try {
		const rawValue = store.getItem(VIEWPORT_LOD_SCALE_STORAGE_KEY);
		if (!rawValue) {
			return null;
		}
		const parsed = JSON.parse(rawValue);
		const candidate = parsed?.userScale;
		if (candidate === null || candidate === undefined) {
			return null;
		}
		const numeric = Number(candidate);
		if (!Number.isFinite(numeric)) {
			return null;
		}
		return clampViewportLodScale(numeric);
	} catch {
		return null;
	}
}

export function writePersistedViewportLodUserScale(value, { storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return;
	}
	try {
		if (value === null || value === undefined) {
			store.removeItem(VIEWPORT_LOD_SCALE_STORAGE_KEY);
			return;
		}
		const payload = JSON.stringify({ userScale: clampViewportLodScale(value) });
		store.setItem(VIEWPORT_LOD_SCALE_STORAGE_KEY, payload);
	} catch {
		// localStorage is either unavailable or quota exceeded; the preview
		// quality preference will fall back to the default on next load.
	}
}

function getDefaultStorage() {
	if (typeof window === "undefined") {
		return null;
	}
	try {
		return window.localStorage ?? null;
	} catch {
		return null;
	}
}
