import { BASE_FRAME } from "../constants.js";
import {
	getPointsBounds,
	getRectCornersFromAnchor,
	normalizeRotationDegrees,
} from "./frame-transform.js";

export const COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME = "selected-frame";
export const COMPOSITION_GUIDE_SCOPE_ALL_FRAMES = "all-frames";

export const COMPOSITION_GUIDE_PATTERN_THIRDS = "thirds";
export const COMPOSITION_GUIDE_PATTERN_GOLDEN = "golden";
export const COMPOSITION_GUIDE_PATTERN_CENTER = "center";
export const COMPOSITION_GUIDE_PATTERN_GRID = "grid";

export const COMPOSITION_GUIDE_DEFAULT_STATE = Object.freeze({
	enabled: false,
	scope: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	pattern: COMPOSITION_GUIDE_PATTERN_THIRDS,
});

const GOLDEN_INSET_RATIO = 1 / ((1 + Math.sqrt(5)) / 2) ** 2;
const GRID_TARGET_SPACING_PX = 96;
const GRID_MIN_DIVISIONS = 2;
const GRID_MAX_DIVISIONS = 32;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function getFrameScale(frame) {
	const nextScale = Number(frame?.scale);
	return Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;
}

export function normalizeCompositionGuideScope(value) {
	return value === COMPOSITION_GUIDE_SCOPE_ALL_FRAMES
		? COMPOSITION_GUIDE_SCOPE_ALL_FRAMES
		: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME;
}

export function normalizeCompositionGuidePattern(value) {
	switch (value) {
		case COMPOSITION_GUIDE_PATTERN_GOLDEN:
		case COMPOSITION_GUIDE_PATTERN_CENTER:
		case COMPOSITION_GUIDE_PATTERN_GRID:
			return value;
		default:
			return COMPOSITION_GUIDE_PATTERN_THIRDS;
	}
}

export function sanitizeCompositionGuideState(value = null) {
	return {
		enabled: Boolean(value?.enabled),
		scope: normalizeCompositionGuideScope(value?.scope),
		pattern: normalizeCompositionGuidePattern(value?.pattern),
	};
}

export function cloneCompositionGuideState(value = null) {
	return sanitizeCompositionGuideState(value);
}

export function createDefaultCompositionGuideState() {
	return { ...COMPOSITION_GUIDE_DEFAULT_STATE };
}

function getFrameTarget(frame, exportWidth, exportHeight) {
	if (!frame) {
		return null;
	}
	const scale = getFrameScale(frame);
	const width = BASE_FRAME.width * scale;
	const height = BASE_FRAME.height * scale;
	const centerX = Number(frame.x ?? 0.5) * exportWidth;
	const centerY = Number(frame.y ?? 0.5) * exportHeight;
	if (
		!(
			Number.isFinite(centerX) &&
			Number.isFinite(centerY) &&
			Number.isFinite(width) &&
			Number.isFinite(height) &&
			width > 0 &&
			height > 0
		)
	) {
		return null;
	}
	return {
		kind: COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
		frameId: frame.id ?? null,
		left: centerX - width * 0.5,
		top: centerY - height * 0.5,
		width,
		height,
		rotationDeg: normalizeRotationDegrees(frame.rotation ?? 0),
	};
}

function getFrameTargetCorners(frame, exportWidth, exportHeight) {
	const target = getFrameTarget(frame, exportWidth, exportHeight);
	if (!target) {
		return [];
	}
	return getRectCornersFromAnchor({
		left: target.left,
		top: target.top,
		width: target.width,
		height: target.height,
		anchorAx: 0.5,
		anchorAy: 0.5,
		rotationDeg: target.rotationDeg,
	});
}

function getSelectedFrameTarget({
	frames,
	activeFrameId,
	selectedFrameIds,
	frameSelectionActive,
	exportWidth,
	exportHeight,
}) {
	const selectedFrameIdSet =
		frameSelectionActive && selectedFrameIds?.length
			? new Set(selectedFrameIds.map(String))
			: null;
	const activeFrame =
		frames.find((frame) => frame.id === activeFrameId) ?? null;
	const selectedFrame =
		selectedFrameIdSet && activeFrame && selectedFrameIdSet.has(activeFrame.id)
			? activeFrame
			: selectedFrameIdSet
				? (frames.find((frame) => selectedFrameIdSet.has(frame.id)) ?? null)
				: null;
	return getFrameTarget(
		selectedFrame ?? activeFrame ?? frames[0] ?? null,
		exportWidth,
		exportHeight,
	);
}

function getAllFramesTarget(frames, exportWidth, exportHeight) {
	const bounds = getPointsBounds(
		frames.flatMap((frame) =>
			getFrameTargetCorners(frame, exportWidth, exportHeight),
		),
	);
	if (!bounds) {
		return null;
	}
	return {
		kind: COMPOSITION_GUIDE_SCOPE_ALL_FRAMES,
		frameId: null,
		left: bounds.left,
		top: bounds.top,
		width: bounds.width,
		height: bounds.height,
		rotationDeg: 0,
	};
}

export function resolveCompositionGuideTarget({
	scope = COMPOSITION_GUIDE_SCOPE_SELECTED_FRAME,
	frames = [],
	activeFrameId = null,
	selectedFrameIds = [],
	frameSelectionActive = false,
	exportWidth,
	exportHeight,
} = {}) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}
	const width = Number(exportWidth);
	const height = Number(exportHeight);
	if (
		!(
			Number.isFinite(width) &&
			width > 0 &&
			Number.isFinite(height) &&
			height > 0
		)
	) {
		return null;
	}
	const normalizedScope = normalizeCompositionGuideScope(scope);
	return normalizedScope === COMPOSITION_GUIDE_SCOPE_ALL_FRAMES
		? getAllFramesTarget(frames, width, height)
		: getSelectedFrameTarget({
				frames,
				activeFrameId,
				selectedFrameIds,
				frameSelectionActive,
				exportWidth: width,
				exportHeight: height,
			});
}

function addRatioLines(lines, width, height, ratios, weight = "minor") {
	for (const ratio of ratios) {
		const x = -width * 0.5 + width * ratio;
		const y = -height * 0.5 + height * ratio;
		lines.push({
			axis: "vertical",
			weight,
			x1: x,
			y1: -height * 0.5,
			x2: x,
			y2: height * 0.5,
		});
		lines.push({
			axis: "horizontal",
			weight,
			x1: -width * 0.5,
			y1: y,
			x2: width * 0.5,
			y2: y,
		});
	}
}

function getGridDivisionCount(logicalSize, screenSize) {
	if (Number.isFinite(screenSize) && screenSize > 0) {
		return clamp(
			Math.round(screenSize / GRID_TARGET_SPACING_PX),
			GRID_MIN_DIVISIONS,
			GRID_MAX_DIVISIONS,
		);
	}
	return clamp(
		Math.round(logicalSize / 240),
		GRID_MIN_DIVISIONS,
		GRID_MAX_DIVISIONS,
	);
}

function addGridLines(
	lines,
	width,
	height,
	{ screenWidth = 0, screenHeight = 0 } = {},
) {
	const xDivisions = getGridDivisionCount(width, screenWidth);
	const yDivisions = getGridDivisionCount(height, screenHeight);
	for (let index = 1; index < xDivisions; index += 1) {
		const ratio = index / xDivisions;
		const x = -width * 0.5 + width * ratio;
		lines.push({
			axis: "vertical",
			weight: Math.abs(ratio - 0.5) < 1e-6 ? "major" : "minor",
			x1: x,
			y1: -height * 0.5,
			x2: x,
			y2: height * 0.5,
		});
	}
	for (let index = 1; index < yDivisions; index += 1) {
		const ratio = index / yDivisions;
		const y = -height * 0.5 + height * ratio;
		lines.push({
			axis: "horizontal",
			weight: Math.abs(ratio - 0.5) < 1e-6 ? "major" : "minor",
			x1: -width * 0.5,
			y1: y,
			x2: width * 0.5,
			y2: y,
		});
	}
	return { xDivisions, yDivisions };
}

export function buildCompositionGuideLines({
	target,
	pattern = COMPOSITION_GUIDE_PATTERN_THIRDS,
	screenWidth = 0,
	screenHeight = 0,
} = {}) {
	if (!target || !(target.width > 0 && target.height > 0)) {
		return {
			lines: [],
			grid: null,
		};
	}
	const normalizedPattern = normalizeCompositionGuidePattern(pattern);
	const lines = [];
	let grid = null;
	if (normalizedPattern === COMPOSITION_GUIDE_PATTERN_GOLDEN) {
		addRatioLines(lines, target.width, target.height, [
			GOLDEN_INSET_RATIO,
			1 - GOLDEN_INSET_RATIO,
		]);
	} else if (normalizedPattern === COMPOSITION_GUIDE_PATTERN_CENTER) {
		addRatioLines(lines, target.width, target.height, [0.25, 0.75], "minor");
		addRatioLines(lines, target.width, target.height, [0.5], "major");
	} else if (normalizedPattern === COMPOSITION_GUIDE_PATTERN_GRID) {
		grid = addGridLines(lines, target.width, target.height, {
			screenWidth,
			screenHeight,
		});
	} else {
		addRatioLines(lines, target.width, target.height, [1 / 3, 2 / 3]);
	}
	return {
		lines,
		grid,
	};
}
