const FULL_TURN = Math.PI * 2;

export const VIEWPORT_PIE_RADIUS = 88;
export const VIEWPORT_PIE_INNER_RADIUS = 28;
export const VIEWPORT_PIE_OUTER_RADIUS = 126;
const VIEWPORT_PIE_COARSE_SCALE = 1.28;

const VIEWPORT_PIE_ACTION_ORDER = Object.freeze([
	"tool-select",
	"tool-reference",
	"tool-transform",
	"tool-pivot",
	"adjust-lens",
	"frame-create",
	"toggle-view-mode",
	"clear-selection",
]);

function createViewportPieLayout(actionIds) {
	const angleStep = FULL_TURN / actionIds.length;
	return actionIds.map((id, index) => ({
		id,
		angle: -Math.PI / 2 + angleStep * index,
	}));
}

const VIEWPORT_PIE_LAYOUT = Object.freeze(
	createViewportPieLayout(VIEWPORT_PIE_ACTION_ORDER),
);

export function getViewportPieMetrics({ coarse = false } = {}) {
	const scale = coarse ? VIEWPORT_PIE_COARSE_SCALE : 1;
	return {
		coarse,
		radius: VIEWPORT_PIE_RADIUS * scale,
		innerRadius: VIEWPORT_PIE_INNER_RADIUS * scale,
		outerRadius: VIEWPORT_PIE_OUTER_RADIUS * scale,
	};
}

export function buildViewportPieActions({ mode, t }) {
	return VIEWPORT_PIE_LAYOUT.map((entry) => {
		switch (entry.id) {
			case "tool-select":
				return {
					...entry,
					icon: "cursor",
					label: t("transformMode.select"),
				};
			case "tool-reference":
				return {
					...entry,
					icon: "reference-tool",
					label: t("transformMode.reference"),
				};
			case "tool-transform":
				return {
					...entry,
					icon: "move",
					label: t("transformMode.transform"),
				};
			case "tool-pivot":
				return {
					...entry,
					icon: "pivot",
					label: t("transformMode.pivot"),
				};
			case "adjust-lens":
				return {
					...entry,
					icon: "camera-dslr",
					label: t("action.adjustLens"),
				};
			case "frame-create":
				return {
					...entry,
					icon: "frame-plus",
					label: t("action.newFrame"),
				};
			case "toggle-view-mode":
				return mode === "camera"
					? {
							...entry,
							icon: "viewport",
							label: t("mode.viewport"),
						}
					: {
							...entry,
							icon: "camera",
							label: t("mode.camera"),
						};
			case "clear-selection":
				return {
					...entry,
					icon: "selection-clear",
					label: t("action.clearSelection"),
				};
			default:
				return {
					...entry,
					icon: "slash-circle",
					label: entry.id,
				};
		}
	});
}

function normalizeAngle(angle) {
	let normalizedAngle = angle;
	while (normalizedAngle <= -Math.PI) {
		normalizedAngle += FULL_TURN;
	}
	while (normalizedAngle > Math.PI) {
		normalizedAngle -= FULL_TURN;
	}
	return normalizedAngle;
}

export function getViewportPieHoveredActionId({
	x,
	y,
	centerX,
	centerY,
	actions,
	innerRadius = VIEWPORT_PIE_INNER_RADIUS,
	outerRadius = VIEWPORT_PIE_OUTER_RADIUS,
}) {
	const dx = x - centerX;
	const dy = y - centerY;
	const distance = Math.hypot(dx, dy);
	if (distance < innerRadius || distance > outerRadius) {
		return null;
	}

	const pointerAngle = Math.atan2(dy, dx);
	let bestActionId = null;
	let bestAngleDelta = Number.POSITIVE_INFINITY;

	for (const action of actions) {
		const delta = Math.abs(normalizeAngle(pointerAngle - action.angle));
		if (delta < bestAngleDelta) {
			bestAngleDelta = delta;
			bestActionId = action.id;
		}
	}

	return bestActionId;
}
