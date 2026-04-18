import * as THREE from "three";
import {
	MOVE_AXIS_HANDLE_NAMES,
	MOVE_PLANE_HANDLE_NAMES,
	ROTATE_AXIS_HANDLE_NAMES,
	SPLAT_SCALE_HANDLE_NAME,
	WORLD_AXES,
	buildAxisPlaneNormal,
	toPlainPoint,
	toPlainQuaternion,
	updatePointerRay,
} from "./pure-utils.js";

export function createSplatEditGizmo({
	store,
	t,
	setStatus,
	updateUi,
	beginHistoryTransaction,
	commitHistoryTransaction,
	isSplatEditModeActive,
	getSplatEditBoxCenter,
	getSplatEditBoxRotation,
	getSplatEditBoxBasisWorld,
	getSelectedSplatTransformEntries,
	getSelectedSplatTransformPivotWorld,
	ensureSelectedSplatTransformPreview,
	updateSelectedSplatTransformPreview,
	finalizeSelectedSplatTransform,
	beginSplatSourceHistoryTransaction,
	finalizeSplatTransformDragHistory,
	syncSceneHelper,
}) {
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2();
	const dragPlane = new THREE.Plane();
	const dragHitPoint = new THREE.Vector3();
	const dragDelta = new THREE.Vector3();
	const tempVector = new THREE.Vector3();
	const tempVector2 = new THREE.Vector3();
	const tempBoxDeltaRotation = new THREE.Quaternion();
	const tempBoxWorldRotation = new THREE.Quaternion();
	const tempBoxCross = new THREE.Vector3();

	let activeBoxDrag = null;
	let activeTransformDrag = null;

	function getActiveBoxDrag() {
		return activeBoxDrag;
	}

	function getActiveTransformDrag() {
		return activeTransformDrag;
	}

	function clearActiveBoxDrag({ cancelHistory = false } = {}) {
		if (activeBoxDrag?.historyStarted && cancelHistory) {
			// Cancellation is handled by the caller via cancelHistoryTransaction.
		}
		activeBoxDrag = null;
	}

	function clearActiveTransformDrag() {
		activeTransformDrag = null;
	}

	function getViewportGizmoConfig() {
		if (!isSplatEditModeActive()) {
			return null;
		}
		if (store.splatEdit.tool.value === "box") {
			if (!store.splatEdit.boxPlaced.value) {
				return null;
			}
			const boxRotation = getSplatEditBoxRotation();
			return {
				pivotWorld: getSplatEditBoxCenter(),
				basisWorld: getSplatEditBoxBasisWorld(boxRotation),
				pivotMode: true,
				showMoveAxes: true,
				showMovePlanes: true,
				showRotate: true,
				showScale: false,
			};
		}
		if (store.splatEdit.tool.value !== "transform") {
			return null;
		}
		const pivotWorld = getSelectedSplatTransformPivotWorld();
		if (!pivotWorld) {
			return null;
		}
		return {
			pivotWorld,
			basisWorld: {
				x: WORLD_AXES.x.clone(),
				y: WORLD_AXES.y.clone(),
				z: WORLD_AXES.z.clone(),
			},
			pivotMode: false,
			showMoveAxes: true,
			showMovePlanes: true,
			showRotate: true,
			showScale: true,
		};
	}

	function startViewportGizmoDrag(
		handleName,
		{ camera, viewportRect, event, config },
	) {
		if (
			!isSplatEditModeActive() ||
			!camera ||
			!viewportRect ||
			!config?.pivotWorld
		) {
			return false;
		}

		if (store.splatEdit.tool.value === "transform") {
			const selection = getSelectedSplatTransformEntries();
			if (selection.entries.length === 0 || !selection.selectionBounds) {
				return false;
			}

			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				event,
				camera,
				viewportRect,
			);
			const anchorWorld = selection.selectionBounds.getCenter(
				new THREE.Vector3(),
			);
			const previewState = ensureSelectedSplatTransformPreview(
				selection.entries,
				selection.selectionBounds,
				anchorWorld,
			);

			if (MOVE_AXIS_HANDLE_NAMES.includes(handleName)) {
				const axisKey = handleName.split("-")[1];
				const axisWorld = WORLD_AXES[axisKey];
				const planeNormal = buildAxisPlaneNormal(
					axisWorld,
					camera,
					tempVector,
					tempVector2,
				);
				if (!planeNormal) {
					return false;
				}
				dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				const historyState = beginSplatSourceHistoryTransaction(
					"splat-edit.transform",
					selection.entries,
					{ skipSnapshotDiff: true },
				);
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "move-axis",
					anchorWorld,
					axisWorld: axisWorld.clone(),
					planeNormal: planeNormal.clone(),
					planePoint: planePoint.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted: historyState.historyStarted,
					historyCaptureAssets: historyState.historyCaptureAssets,
				};
				return true;
			}

			if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
				const planeAxes =
					handleName === "move-xy"
						? [WORLD_AXES.x, WORLD_AXES.y]
						: handleName === "move-yz"
							? [WORLD_AXES.y, WORLD_AXES.z]
							: [WORLD_AXES.z, WORLD_AXES.x];
				const planeNormal = new THREE.Vector3()
					.crossVectors(planeAxes[0], planeAxes[1])
					.normalize();
				dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				const historyState = beginSplatSourceHistoryTransaction(
					"splat-edit.transform",
					selection.entries,
					{ skipSnapshotDiff: true },
				);
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "move-plane",
					anchorWorld,
					planeNormal: planeNormal.clone(),
					planePoint: planePoint.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted: historyState.historyStarted,
					historyCaptureAssets: historyState.historyCaptureAssets,
				};
				return true;
			}

			if (ROTATE_AXIS_HANDLE_NAMES.includes(handleName)) {
				const axisKey = handleName.split("-")[1];
				const axisWorld = WORLD_AXES[axisKey];
				dragPlane.setFromNormalAndCoplanarPoint(axisWorld, anchorWorld);
				const planePoint = pointerRay.intersectPlane(
					dragPlane,
					new THREE.Vector3(),
				);
				if (!planePoint) {
					return false;
				}
				const startVector = planePoint.sub(anchorWorld).normalize();
				if (startVector.lengthSq() < 1e-6) {
					return false;
				}
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				const historyState = beginSplatSourceHistoryTransaction(
					"splat-edit.transform",
					selection.entries,
					{ skipSnapshotDiff: true },
				);
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "rotate",
					anchorWorld,
					axisWorld: axisWorld.clone(),
					startVector: startVector.clone(),
					entries: selection.entries,
					preview: previewState,
					historyStarted: historyState.historyStarted,
					historyCaptureAssets: historyState.historyCaptureAssets,
				};
				return true;
			}

			if (handleName === SPLAT_SCALE_HANDLE_NAME) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				const historyState = beginSplatSourceHistoryTransaction(
					"splat-edit.transform",
					selection.entries,
					{ skipSnapshotDiff: true },
				);
				activeTransformDrag = {
					pointerId: event.pointerId,
					mode: "scale-uniform",
					anchorWorld,
					startClientX: event.clientX,
					startClientY: event.clientY,
					entries: selection.entries,
					preview: previewState,
					historyStarted: historyState.historyStarted,
					historyCaptureAssets: historyState.historyCaptureAssets,
				};
				return true;
			}

			return false;
		}

		if (store.splatEdit.tool.value !== "box") {
			return false;
		}

		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			event,
			camera,
			viewportRect,
		);
		const anchorWorld = config.pivotWorld.clone();
		const basisWorld = config.basisWorld ?? getSplatEditBoxBasisWorld();

		if (MOVE_AXIS_HANDLE_NAMES.includes(handleName)) {
			const axisKey = handleName.split("-")[1];
			const axisWorld = basisWorld[axisKey]?.clone?.() ?? WORLD_AXES[axisKey];
			const planeNormal = buildAxisPlaneNormal(
				axisWorld,
				camera,
				tempVector,
				tempVector2,
			);
			if (!planeNormal) {
				return false;
			}
			dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
			const planePoint = pointerRay.intersectPlane(
				dragPlane,
				new THREE.Vector3(),
			);
			if (!planePoint) {
				return false;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			activeBoxDrag = {
				pointerId: event.pointerId,
				mode: "axis",
				handleName,
				anchorWorld,
				axisWorld: axisWorld.clone(),
				planeNormal: planeNormal.clone(),
				planePoint: planePoint.clone(),
				historyStarted:
					beginHistoryTransaction?.("splat-edit.box-transform") === true,
			};
			return true;
		}

		if (MOVE_PLANE_HANDLE_NAMES.includes(handleName)) {
			const planeAxes =
				handleName === "move-xy"
					? [basisWorld.x, basisWorld.y]
					: handleName === "move-yz"
						? [basisWorld.y, basisWorld.z]
						: [basisWorld.z, basisWorld.x];
			const planeNormal = new THREE.Vector3()
				.crossVectors(planeAxes[0], planeAxes[1])
				.normalize();
			dragPlane.setFromNormalAndCoplanarPoint(planeNormal, anchorWorld);
			const planePoint = pointerRay.intersectPlane(
				dragPlane,
				new THREE.Vector3(),
			);
			if (!planePoint) {
				return false;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			activeBoxDrag = {
				pointerId: event.pointerId,
				mode: "plane",
				handleName,
				anchorWorld,
				planeNormal: planeNormal.clone(),
				planePoint: planePoint.clone(),
				historyStarted:
					beginHistoryTransaction?.("splat-edit.box-transform") === true,
			};
			return true;
		}

		if (ROTATE_AXIS_HANDLE_NAMES.includes(handleName)) {
			const axisKey = handleName.split("-")[1];
			const axisWorld = basisWorld[axisKey]?.clone?.() ?? WORLD_AXES[axisKey];
			dragPlane.setFromNormalAndCoplanarPoint(axisWorld, anchorWorld);
			const planePoint = pointerRay.intersectPlane(
				dragPlane,
				new THREE.Vector3(),
			);
			if (!planePoint) {
				return false;
			}
			const startVector = planePoint.sub(anchorWorld).normalize();
			if (startVector.lengthSq() < 1e-6) {
				return false;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			activeBoxDrag = {
				pointerId: event.pointerId,
				mode: "rotate",
				handleName,
				anchorWorld,
				axisWorld: axisWorld.clone(),
				startVector: startVector.clone(),
				startRotation: getSplatEditBoxRotation(),
				historyStarted:
					beginHistoryTransaction?.("splat-edit.box-transform") === true,
			};
			return true;
		}

		return false;
	}

	function handleViewportGizmoDragMove(event, { camera, viewportRect }) {
		if (
			activeTransformDrag &&
			event.pointerId === activeTransformDrag.pointerId &&
			isSplatEditModeActive() &&
			store.splatEdit.tool.value === "transform" &&
			camera &&
			viewportRect
		) {
			const pointerRay = updatePointerRay(
				raycaster,
				pointerNdc,
				event,
				camera,
				viewportRect,
			);
			if (activeTransformDrag.mode === "move-axis") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.planeNormal,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const worldDelta = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.planePoint)
					.projectOnVector(activeTransformDrag.axisWorld);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldTranslation: worldDelta,
				});
				return true;
			}

			if (activeTransformDrag.mode === "move-plane") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.planeNormal,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const worldDelta = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.planePoint);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldTranslation: worldDelta,
				});
				return true;
			}

			if (activeTransformDrag.mode === "rotate") {
				dragPlane.setFromNormalAndCoplanarPoint(
					activeTransformDrag.axisWorld,
					activeTransformDrag.anchorWorld,
				);
				const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
				if (!hitPoint) {
					return true;
				}
				const nextVector = dragDelta
					.copy(hitPoint)
					.sub(activeTransformDrag.anchorWorld)
					.normalize();
				if (nextVector.lengthSq() < 1e-6) {
					return true;
				}
				const cross = tempVector
					.copy(activeTransformDrag.startVector)
					.cross(nextVector);
				const angle = Math.atan2(
					cross.dot(activeTransformDrag.axisWorld),
					activeTransformDrag.startVector.dot(nextVector),
				);
				const worldRotation = new THREE.Quaternion().setFromAxisAngle(
					activeTransformDrag.axisWorld,
					angle,
				);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					worldRotation,
					pivotWorld: activeTransformDrag.anchorWorld,
				});
				return true;
			}

			if (activeTransformDrag.mode === "scale-uniform") {
				const deltaPixels =
					event.clientX -
					activeTransformDrag.startClientX -
					(event.clientY - activeTransformDrag.startClientY);
				const uniformScale = Math.exp(deltaPixels * 0.01);
				updateSelectedSplatTransformPreview(activeTransformDrag.preview, {
					uniformScale,
					pivotWorld: activeTransformDrag.anchorWorld,
				});
				return true;
			}
		}

		if (
			!activeBoxDrag ||
			event.pointerId !== activeBoxDrag.pointerId ||
			!isSplatEditModeActive() ||
			store.splatEdit.tool.value !== "box" ||
			!camera ||
			!viewportRect
		) {
			return false;
		}

		const pointerRay = updatePointerRay(
			raycaster,
			pointerNdc,
			event,
			camera,
			viewportRect,
		);
		if (activeBoxDrag.mode === "rotate") {
			dragPlane.setFromNormalAndCoplanarPoint(
				activeBoxDrag.axisWorld,
				activeBoxDrag.anchorWorld,
			);
			const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
			if (!hitPoint) {
				return true;
			}
			dragDelta.copy(hitPoint).sub(activeBoxDrag.anchorWorld).normalize();
			if (dragDelta.lengthSq() < 1e-6) {
				return true;
			}
			const signedAngle = Math.atan2(
				tempBoxCross
					.crossVectors(activeBoxDrag.startVector, dragDelta)
					.dot(activeBoxDrag.axisWorld),
				activeBoxDrag.startVector.dot(dragDelta),
			);
			tempBoxDeltaRotation.setFromAxisAngle(
				activeBoxDrag.axisWorld,
				signedAngle,
			);
			tempBoxWorldRotation
				.copy(tempBoxDeltaRotation)
				.multiply(activeBoxDrag.startRotation);
			store.splatEdit.boxRotation.value =
				toPlainQuaternion(tempBoxWorldRotation);
			syncSceneHelper();
			updateUi?.();
			return true;
		}

		dragPlane.setFromNormalAndCoplanarPoint(
			activeBoxDrag.planeNormal,
			activeBoxDrag.anchorWorld,
		);
		const hitPoint = pointerRay.intersectPlane(dragPlane, dragHitPoint);
		if (!hitPoint) {
			return true;
		}

		let nextCenter = activeBoxDrag.anchorWorld.clone();
		if (activeBoxDrag.mode === "axis") {
			const projectedDistance = dragDelta
				.copy(hitPoint)
				.sub(activeBoxDrag.planePoint)
				.dot(activeBoxDrag.axisWorld);
			nextCenter = nextCenter.addScaledVector(
				activeBoxDrag.axisWorld,
				projectedDistance,
			);
		} else {
			nextCenter = nextCenter.add(
				dragDelta.copy(hitPoint).sub(activeBoxDrag.planePoint),
			);
		}
		store.splatEdit.boxCenter.value = toPlainPoint(nextCenter);
		syncSceneHelper();
		updateUi?.();
		return true;
	}

	function handleViewportGizmoDragEnd(event) {
		if (
			activeTransformDrag &&
			event.pointerId === activeTransformDrag.pointerId &&
			isSplatEditModeActive()
		) {
			const completedDrag = activeTransformDrag;
			activeTransformDrag = null;
			const changed = finalizeSelectedSplatTransform(completedDrag.entries);
			store.splatEdit.lastOperation.value = {
				mode:
					completedDrag.mode === "rotate"
						? "transform-rotate"
						: completedDrag.mode === "scale-uniform"
							? "transform-scale"
							: "transform-move",
				hitCount: store.splatEdit.selectionCount.value,
			};
			finalizeSplatTransformDragHistory(completedDrag, { commit: changed });
			if (changed) {
				setStatus?.(
					t(
						completedDrag.mode === "rotate"
							? "status.splatEditTransformedRotate"
							: completedDrag.mode === "scale-uniform"
								? "status.splatEditTransformedScale"
								: "status.splatEditTransformedMove",
						{ count: store.splatEdit.selectionCount.value },
					),
				);
			}
			return true;
		}

		if (
			!activeBoxDrag ||
			event.pointerId !== activeBoxDrag.pointerId ||
			!isSplatEditModeActive()
		) {
			return false;
		}
		const completedDrag = activeBoxDrag;
		activeBoxDrag = null;
		if (completedDrag.historyStarted) {
			commitHistoryTransaction?.("splat-edit.box-transform");
		}
		return true;
	}

	return {
		getActiveBoxDrag,
		getActiveTransformDrag,
		clearActiveBoxDrag,
		clearActiveTransformDrag,
		getViewportGizmoConfig,
		startViewportGizmoDrag,
		handleViewportGizmoDragMove,
		handleViewportGizmoDragEnd,
	};
}
