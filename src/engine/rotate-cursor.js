const CURSOR_STEP_DEGREES = 15;

const ROTATION_ZONE_ANGLE_DEGREES = {
	top: 0,
	"top-right": 45,
	right: 90,
	"bottom-right": 135,
	bottom: 180,
	"bottom-left": 225,
	left: 270,
	"top-left": 315,
};

const cursorCache = new Map();

function normalizeDegrees(value) {
	const normalized = Number.isFinite(value) ? value % 360 : 0;
	return normalized < 0 ? normalized + 360 : normalized;
}

function quantizeDegrees(value) {
	return (
		Math.round(normalizeDegrees(value) / CURSOR_STEP_DEGREES) *
		CURSOR_STEP_DEGREES
	);
}

function buildRotateCursorSvg(angleDegrees) {
	return `
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${angleDegrees} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#ffffff" stroke-width="4.8" />
				<path d="M8.8 21.1C10.4 12.9 21.6 12.9 23.2 21.1" stroke="#111111" stroke-width="1.9" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M8.8 17.4 7.9 21.1 11.6 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M23.2 17.4 24.1 21.1 20.4 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim();
}

export function getFrameRotateCursorCss(
	frameRotationDegrees = 0,
	zoneKey = "top",
) {
	const zoneAngle = ROTATION_ZONE_ANGLE_DEGREES[zoneKey] ?? 0;
	const cursorAngle = quantizeDegrees(frameRotationDegrees + zoneAngle);

	if (!cursorCache.has(cursorAngle)) {
		const encodedSvg = encodeURIComponent(buildRotateCursorSvg(cursorAngle));
		cursorCache.set(
			cursorAngle,
			`url("data:image/svg+xml,${encodedSvg}") 16 16, grab`,
		);
	}

	return cursorCache.get(cursorAngle);
}
