const FULL_TURN = Math.PI * 2;

export const VIEWPORT_PIE_RADIUS = 88;
export const VIEWPORT_PIE_INNER_RADIUS = 28;
export const VIEWPORT_PIE_OUTER_RADIUS = 126;

const VIEWPORT_PIE_LAYOUT = Object.freeze([
	{ id: "tool-select", angle: -Math.PI / 2 },
	{ id: "tool-transform", angle: -Math.PI / 4 },
	{ id: "tool-pivot", angle: 0 },
	{ id: "adjust-lens", angle: Math.PI / 4 },
	{ id: "reset-view", angle: Math.PI / 2 },
	{ id: "frame-create", angle: (Math.PI * 3) / 4 },
	{ id: "toggle-view-mode", angle: Math.PI },
	{ id: "tool-none", angle: (-Math.PI * 3) / 4 },
]);

export function buildViewportPieActions({ mode, t }) {
	return VIEWPORT_PIE_LAYOUT.map((entry) => {
		switch (entry.id) {
			case "tool-none":
				return {
					...entry,
					icon: "slash-circle",
					label: t("transformMode.none"),
				};
			case "tool-select":
				return {
					...entry,
					icon: "cursor",
					label: t("transformMode.select"),
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
					icon: "lens",
					label: t("action.adjustLens"),
				};
			case "reset-view":
				return {
					...entry,
					icon: "reset",
					label: t("action.resetActive"),
				};
			case "frame-create":
				return {
					...entry,
					icon: "frame",
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
}) {
	const dx = x - centerX;
	const dy = y - centerY;
	const distance = Math.hypot(dx, dy);
	if (
		distance < VIEWPORT_PIE_INNER_RADIUS ||
		distance > VIEWPORT_PIE_OUTER_RADIUS
	) {
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
