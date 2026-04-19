import {
	MOBILE_UI_SCALE_DEFAULT,
	MOBILE_UI_SCALE_MAX,
	MOBILE_UI_SCALE_MIN,
	MOBILE_UI_SCALE_STORAGE_KEY,
} from "../constants.js";

const DESKTOP_WIDTH_THRESHOLD_PX = 1180;
const AUTO_COMPACT_WIDTH_TABLET_PX = 600;
const AUTO_COMPACT_WIDTH_PHONE_PX = 360;
const AUTO_VIEWPORT_ZOOM_OUT_TRIGGER = 1.05;
const AUTO_SCALE_TABLET = 0.9;
const AUTO_SCALE_PHONE_LARGE = 0.95;
const AUTO_SCALE_PHONE_SMALL = 1.05;
const AUTO_SCALE_CLAMP_MIN = 0.8;
const AUTO_SCALE_CLAMP_MAX = 1.3;

function roundToStep(value, step = 0.01) {
	return Math.round(value / step) * step;
}

export function clampMobileUiScale(raw) {
	const numeric = Number(raw);
	if (!Number.isFinite(numeric)) {
		return MOBILE_UI_SCALE_DEFAULT;
	}
	const clamped = Math.min(
		MOBILE_UI_SCALE_MAX,
		Math.max(MOBILE_UI_SCALE_MIN, numeric),
	);
	return Number(roundToStep(clamped, 0.01).toFixed(2));
}

export function formatMobileUiScaleLabel(scale) {
	const numeric = Number(scale);
	if (!Number.isFinite(numeric)) {
		return Number(MOBILE_UI_SCALE_DEFAULT).toFixed(2);
	}
	return numeric.toFixed(2);
}

export function computeAutoMobileUiScale({
	viewportWidth = 0,
	screenWidth = 0,
	coarsePointer = false,
} = {}) {
	const width = Number(viewportWidth);
	if (!Number.isFinite(width) || width <= 0) {
		return MOBILE_UI_SCALE_DEFAULT;
	}
	if (!coarsePointer || width > DESKTOP_WIDTH_THRESHOLD_PX) {
		return MOBILE_UI_SCALE_DEFAULT;
	}

	const screen = Number(screenWidth);
	if (Number.isFinite(screen) && screen > 0) {
		const ratio = width / screen;
		if (ratio > AUTO_VIEWPORT_ZOOM_OUT_TRIGGER) {
			const corrected = 1 / ratio;
			const bounded = Math.min(
				AUTO_SCALE_CLAMP_MAX,
				Math.max(AUTO_SCALE_CLAMP_MIN, corrected),
			);
			return Number(roundToStep(bounded, 0.01).toFixed(2));
		}
	}

	if (width < AUTO_COMPACT_WIDTH_PHONE_PX) {
		return AUTO_SCALE_PHONE_SMALL;
	}
	if (width < AUTO_COMPACT_WIDTH_TABLET_PX) {
		return AUTO_SCALE_PHONE_LARGE;
	}
	return AUTO_SCALE_TABLET;
}

export function readPersistedMobileUiUserScale({ storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return null;
	}
	try {
		const rawValue = store.getItem(MOBILE_UI_SCALE_STORAGE_KEY);
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
		return clampMobileUiScale(numeric);
	} catch {
		return null;
	}
}

export function writePersistedMobileUiUserScale(value, { storage } = {}) {
	const store = storage ?? getDefaultStorage();
	if (!store) {
		return;
	}
	try {
		if (value === null || value === undefined) {
			store.removeItem(MOBILE_UI_SCALE_STORAGE_KEY);
			return;
		}
		const payload = JSON.stringify({ userScale: clampMobileUiScale(value) });
		store.setItem(MOBILE_UI_SCALE_STORAGE_KEY, payload);
	} catch {
		// localStorage is either unavailable or quota exceeded; preference will
		// fall back to the auto estimate on next load.
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

export function resolveEffectiveMobileUiScale({
	userScale = null,
	autoScale = MOBILE_UI_SCALE_DEFAULT,
} = {}) {
	if (userScale === null || userScale === undefined) {
		return clampMobileUiScale(autoScale);
	}
	return clampMobileUiScale(userScale);
}
