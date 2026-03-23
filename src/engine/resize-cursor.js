const CURSOR_STEP_DEGREES = 15;

const RESIZE_HANDLE_ANGLE_DEGREES = {
	right: 0,
	"top-right": 135,
	top: 90,
	"top-left": 45,
	left: 0,
	"bottom-left": 135,
	bottom: 90,
	"bottom-right": 45,
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

function buildResizeCursorSvg(angleDegrees) {
	return `
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
			<g transform="rotate(${angleDegrees} 16 16)" fill="none" stroke-linecap="round" stroke-linejoin="round">
				<path d="M6.6 16H25.4" stroke="#ffffff" stroke-width="4.8" />
				<path d="M6.6 16H25.4" stroke="#111111" stroke-width="1.9" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M10.5 11.9 6.3 16 10.5 20.1" stroke="#111111" stroke-width="1.7" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#ffffff" stroke-width="4.2" />
				<path d="M21.5 11.9 25.7 16 21.5 20.1" stroke="#111111" stroke-width="1.7" />
			</g>
		</svg>
	`.trim();
}

export function getFrameResizeCursorCss(frameRotationDegrees, handleKey) {
	const handleAngle = RESIZE_HANDLE_ANGLE_DEGREES[handleKey] ?? 0;
	const cursorAngle = quantizeDegrees(
		(frameRotationDegrees ?? 0) + handleAngle,
	);

	if (!cursorCache.has(cursorAngle)) {
		const encodedSvg = encodeURIComponent(buildResizeCursorSvg(cursorAngle));
		cursorCache.set(
			cursorAngle,
			`url("data:image/svg+xml,${encodedSvg}") 16 16, ew-resize`,
		);
	}

	return cursorCache.get(cursorAngle);
}
