import * as THREE from "three";
import {
	VIEWPORT_PROJECTION_ORTHOGRAPHIC,
	getViewportOrthoAxisKey,
	getViewportOrthoViewForAxis,
} from "../engine/viewport-orthographic.js";
import { WORKSPACE_PANE_VIEWPORT } from "../workspace-model.js";

const AXIS_KEYS = ["x", "y", "z"];
const AXIS_VECTORS = Object.freeze({
	x: new THREE.Vector3(1, 0, 0),
	y: new THREE.Vector3(0, 1, 0),
	z: new THREE.Vector3(0, 0, 1),
});
const GIZMO_RADIUS_PX = 26;
const ALIGNMENT_CENTER_THRESHOLD = 0.92;
const GIZMO_NODE_RADIUS_PX_FALLBACK = 8.64;

export function createViewportAxisGizmoController({
	state,
	axisGizmo,
	axisGizmoSvg,
	getActiveViewportCamera,
	getViewportProjectionMode,
	getViewportOrthoState,
}) {
	const nodeElements = new Map();
	const lineElements = new Map();
	const nodeRadiusCache = new Map();
	let cachedGizmoWidth = 0;
	let cachedGizmoHeight = 0;
	const cameraRight = new THREE.Vector3();
	const cameraUp = new THREE.Vector3();
	const cameraForward = new THREE.Vector3();
	const projected = {
		x: {
			positive: { x: 0, y: 0, depth: 0 },
			negative: { x: 0, y: 0, depth: 0 },
		},
		y: {
			positive: { x: 0, y: 0, depth: 0 },
			negative: { x: 0, y: 0, depth: 0 },
		},
		z: {
			positive: { x: 0, y: 0, depth: 0 },
			negative: { x: 0, y: 0, depth: 0 },
		},
	};

	function getNodeElement(nodeId) {
		if (!axisGizmo) {
			return null;
		}
		if (!nodeElements.has(nodeId)) {
			nodeElements.set(
				nodeId,
				axisGizmo.querySelector(`[data-axis-gizmo-node="${nodeId}"]`) ?? null,
			);
		}
		return nodeElements.get(nodeId);
	}

	function getLineElement(axisKey) {
		if (!axisGizmoSvg) {
			return null;
		}
		if (!lineElements.has(axisKey)) {
			lineElements.set(
				axisKey,
				axisGizmoSvg.querySelector(`[data-axis-gizmo-line="${axisKey}"]`) ??
					null,
			);
		}
		return lineElements.get(axisKey);
	}

	function setNodeVisible(nodeId, visible) {
		const element = getNodeElement(nodeId);
		if (!element) {
			return;
		}
		element.classList.toggle("is-hidden", !visible);
	}

	function setNodePosition(nodeId, x, y) {
		const element = getNodeElement(nodeId);
		if (!element) {
			return;
		}
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
	}

	function setNodeDepth(nodeId, depth) {
		const element = getNodeElement(nodeId);
		if (!element) {
			return;
		}
		element.style.zIndex = `${Math.round(10 + depth * 10)}`;
	}

	function setNodeActive(nodeId, active) {
		const element = getNodeElement(nodeId);
		if (!element) {
			return;
		}
		element.classList.toggle("is-active", active);
	}

	function setNodeFacing(nodeId, facing) {
		const element = getNodeElement(nodeId);
		if (!element) {
			return;
		}
		if (facing === "negative") {
			element.dataset.facing = "negative";
			return;
		}
		element.dataset.facing = "positive";
	}

	function getNodeRadiusPx(nodeId) {
		if (nodeRadiusCache.has(nodeId)) {
			return nodeRadiusCache.get(nodeId);
		}
		const element = getNodeElement(nodeId);
		const width = Number(element?.offsetWidth ?? 0);
		const height = Number(element?.offsetHeight ?? 0);
		const radius = Math.max(width, height) * 0.5;
		const result = radius > 0 ? radius : GIZMO_NODE_RADIUS_PX_FALLBACK;
		nodeRadiusCache.set(nodeId, result);
		return result;
	}

	function setLinePoints(axisKey, x1, y1, x2, y2) {
		const lineElement = getLineElement(axisKey);
		if (!lineElement) {
			return;
		}
		lineElement.setAttribute("x1", x1.toFixed(2));
		lineElement.setAttribute("y1", y1.toFixed(2));
		lineElement.setAttribute("x2", x2.toFixed(2));
		lineElement.setAttribute("y2", y2.toFixed(2));
	}

	function setLineActive(axisKey, active) {
		const lineElement = getLineElement(axisKey);
		if (!lineElement) {
			return;
		}
		lineElement.classList.toggle("is-active", active);
	}

	function hideAxisGizmo() {
		if (!axisGizmo) {
			return;
		}
		axisGizmo.classList.add("is-hidden");
	}

	function showAxisGizmo() {
		if (!axisGizmo) {
			return;
		}
		axisGizmo.classList.remove("is-hidden");
	}

	function projectAxisDirection(axisVector, target) {
		target.x = axisVector.dot(cameraRight);
		target.y = axisVector.dot(cameraUp);
		target.depth = axisVector.dot(cameraForward) * -1;
		return target;
	}

	function syncViewportAxisGizmo() {
		if (!axisGizmo) {
			return;
		}
		if (state.mode !== WORKSPACE_PANE_VIEWPORT) {
			hideAxisGizmo();
			return;
		}

		const camera = getActiveViewportCamera?.();
		if (!camera) {
			hideAxisGizmo();
			return;
		}

		showAxisGizmo();
		const gizmoWidth = Math.max(axisGizmo.clientWidth || 0, 0);
		const gizmoHeight = Math.max(axisGizmo.clientHeight || 0, 0);
		if (gizmoWidth !== cachedGizmoWidth || gizmoHeight !== cachedGizmoHeight) {
			cachedGizmoWidth = gizmoWidth;
			cachedGizmoHeight = gizmoHeight;
			nodeRadiusCache.clear();
		}
		if (gizmoWidth <= 0 || gizmoHeight <= 0) {
			hideAxisGizmo();
			return;
		}
		axisGizmoSvg?.setAttribute("viewBox", `0 0 ${gizmoWidth} ${gizmoHeight}`);
		const gizmoCenterX = gizmoWidth * 0.5;
		const gizmoCenterY = gizmoHeight * 0.5;
		const gizmoRadius = Math.min(
			GIZMO_RADIUS_PX,
			Math.max(Math.min(gizmoWidth, gizmoHeight) * 0.5 - 10, 0),
		);
		cameraRight.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
		cameraUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
		camera.getWorldDirection(cameraForward).normalize();

		const isOrthographic =
			getViewportProjectionMode?.() === VIEWPORT_PROJECTION_ORTHOGRAPHIC;
		const activeOrthoViewId = isOrthographic
			? (getViewportOrthoState?.()?.viewId ?? null)
			: null;

		for (const axisKey of AXIS_KEYS) {
			const axisVector = AXIS_VECTORS[axisKey];
			const positive = projectAxisDirection(
				axisVector,
				projected[axisKey].positive,
			);
			const negative = projectAxisDirection(
				axisVector.clone().multiplyScalar(-1),
				projected[axisKey].negative,
			);
			const positiveX = gizmoCenterX + positive.x * gizmoRadius;
			const positiveY = gizmoCenterY - positive.y * gizmoRadius;
			const negativeX = gizmoCenterX + negative.x * gizmoRadius;
			const negativeY = gizmoCenterY - negative.y * gizmoRadius;
			const positiveNodeId = `pos-${axisKey}`;
			const negativeNodeId = `neg-${axisKey}`;
			const centerNodeId = `axis-${axisKey}`;
			const activePositiveView = getViewportOrthoViewForAxis(axisKey, 1);
			const activeNegativeView = getViewportOrthoViewForAxis(axisKey, -1);
			const alignedDepth = Math.max(positive.depth, negative.depth);
			const aligned =
				alignedDepth >= ALIGNMENT_CENTER_THRESHOLD &&
				Math.hypot(positive.x, positive.y) <= 0.12 &&
				Math.hypot(negative.x, negative.y) <= 0.12;
			const facingPositive = positive.depth >= negative.depth;
			const lineDeltaX = positiveX - negativeX;
			const lineDeltaY = positiveY - negativeY;
			const lineLength = Math.hypot(lineDeltaX, lineDeltaY);
			const negativeInset =
				lineLength > 1e-4 ? getNodeRadiusPx(negativeNodeId) / lineLength : 0;
			const positiveInset =
				lineLength > 1e-4 ? getNodeRadiusPx(positiveNodeId) / lineLength : 0;
			const lineStartX = negativeX + lineDeltaX * negativeInset;
			const lineStartY = negativeY + lineDeltaY * negativeInset;
			const lineEndX = positiveX - lineDeltaX * positiveInset;
			const lineEndY = positiveY - lineDeltaY * positiveInset;

			setLinePoints(axisKey, lineStartX, lineStartY, lineEndX, lineEndY);
			setLineActive(
				axisKey,
				activeOrthoViewId &&
					getViewportOrthoAxisKey(activeOrthoViewId) === axisKey,
			);

			if (aligned) {
				setNodeVisible(positiveNodeId, false);
				setNodeVisible(negativeNodeId, false);
				setNodeVisible(centerNodeId, true);
				setNodePosition(centerNodeId, gizmoCenterX, gizmoCenterY);
				setNodeDepth(centerNodeId, Math.max(positive.depth, negative.depth));
				setNodeFacing(centerNodeId, facingPositive ? "positive" : "negative");
				setNodeActive(
					centerNodeId,
					activeOrthoViewId &&
						getViewportOrthoAxisKey(activeOrthoViewId) === axisKey,
				);
				axisGizmo.dataset[`${axisKey}Facing`] = facingPositive
					? "positive"
					: "negative";
				continue;
			}

			delete axisGizmo.dataset[`${axisKey}Facing`];
			setNodeVisible(centerNodeId, false);
			setNodeVisible(positiveNodeId, true);
			setNodeVisible(negativeNodeId, true);
			setNodeFacing(centerNodeId, "positive");
			setNodePosition(positiveNodeId, positiveX, positiveY);
			setNodePosition(negativeNodeId, negativeX, negativeY);
			setNodeDepth(positiveNodeId, positive.depth);
			setNodeDepth(negativeNodeId, negative.depth);
			setNodeActive(positiveNodeId, activeOrthoViewId === activePositiveView);
			setNodeActive(negativeNodeId, activeOrthoViewId === activeNegativeView);
		}
	}

	return {
		syncViewportAxisGizmo,
	};
}
