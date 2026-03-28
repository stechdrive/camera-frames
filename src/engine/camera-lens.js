import { BASE_FRAME, BASE_RENDER_BOX } from "../constants.js";

const DEG_TO_RAD = Math.PI / 180;
const FILM_35MM_WIDTH = 36;
export const MIN_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM = 14;
export const MAX_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM = 200;
export const STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM_SNAP_POINTS =
	Object.freeze([14, 18, 21, 24, 28, 35, 50, 70, 75, 85, 100, 135, 200]);

export function getStandardFrameCropFactor() {
	return BASE_RENDER_BOX.width / BASE_FRAME.width;
}

export function getStandardFrameHorizontalFovDegrees(baseHorizontalFovDegrees) {
	const halfHorizontal = Number(baseHorizontalFovDegrees) * DEG_TO_RAD * 0.5;
	return (
		(Math.atan(Math.tan(halfHorizontal) / getStandardFrameCropFactor()) * 2) /
		DEG_TO_RAD
	);
}

export function getStandardFrameHorizontalEquivalentMm(
	baseHorizontalFovDegrees,
) {
	const halfHorizontal =
		getStandardFrameHorizontalFovDegrees(baseHorizontalFovDegrees) *
		DEG_TO_RAD *
		0.5;
	return FILM_35MM_WIDTH / Math.max(2 * Math.tan(halfHorizontal), 1e-6);
}

export function clampStandardFrameHorizontalEquivalentMm(value) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return MIN_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM;
	}

	return Math.min(
		MAX_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM,
		Math.max(MIN_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM, nextValue),
	);
}

export function snapStandardFrameHorizontalEquivalentMm(
	value,
	threshold = 1.5,
) {
	const clampedValue = clampStandardFrameHorizontalEquivalentMm(value);
	const nearestPoint =
		STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM_SNAP_POINTS.reduce(
			(best, point) =>
				Math.abs(point - clampedValue) < Math.abs(best - clampedValue)
					? point
					: best,
			STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM_SNAP_POINTS[0],
		);

	return Math.abs(nearestPoint - clampedValue) <= threshold
		? nearestPoint
		: clampedValue;
}

export function getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
	standardFrameHorizontalEquivalentMm,
) {
	const clampedEquivalentMm = clampStandardFrameHorizontalEquivalentMm(
		standardFrameHorizontalEquivalentMm,
	);
	const halfHorizontalTangent =
		FILM_35MM_WIDTH / Math.max(2 * clampedEquivalentMm, 1e-6);
	return (
		(Math.atan(halfHorizontalTangent * getStandardFrameCropFactor()) * 2) /
		DEG_TO_RAD
	);
}

export const DEFAULT_SHOT_CAMERA_BASE_FOVX =
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(35);
