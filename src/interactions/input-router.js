export function isNativeHistoryTarget(target) {
	if (
		!target ||
		(typeof target !== "object" && typeof target !== "function") ||
		typeof target.closest !== "function"
	) {
		return false;
	}
	const draftEditingTarget = target.closest('input[data-draft-editing="true"]');
	if (draftEditingTarget) {
		return true;
	}
	return (
		target.closest(
			[
				"textarea",
				'[contenteditable="true"]',
				'input[type="search"]',
				'input[type="url"]',
				'input[type="email"]',
				'input[type="password"]',
			].join(", "),
		) !== null
	);
}

export function bindInputRouter({
	listen,
	viewportShell,
	dropHint,
	anchorDot,
	assetController,
	importReferenceImageFiles,
	supportsReferenceImageFile,
	updateDropHint,
	updateUi,
	updateOutputFrameOverlay,
	setStatus,
	startOrbitAroundHitDrag,
	startZoomToolDrag,
	startLensAdjustDrag,
	startShotCameraRollDrag,
	startViewportOrthographicPanDrag,
	toggleMeasurementMode,
	toggleZoomTool,
	toggleViewportSelectMode,
	toggleViewportReferenceImageEditMode,
	toggleViewportTransformMode,
	toggleViewportPivotEditMode,
	startNewProject,
	saveProject,
	exportProject,
	openFiles,
	undoHistory,
	redoHistory,
	clearSceneAssetSelection,
	requestNavigationHistoryCommit,
	flushNavigationHistory,
	isInteractiveTextTarget,
	isViewportSelectMode,
	getActiveCamera,
	isZoomInteractionMode,
	isPieInteractionMode,
	isLensInteractionMode,
	isRollInteractionMode,
	isViewportOrthographicActive,
	applyNavigateInteractionMode,
	syncControlsToMode,
	ensurePerspectiveForViewportRotation,
	captureViewportProjectionState,
	restoreViewportProjectionState,
	openViewportPieMenu,
	updateViewportPiePointer,
	finishViewportPieMenu,
	closeViewportPieMenu,
	handleViewportPieAction,
	state,
	fpsMovement,
	pointerControls,
	isFrameSelectionActive,
	isReferenceImageSelectionActive,
	clearFrameSelection,
	clearReferenceImageSelection,
	clearOutputFrameSelection,
	handleOrbitAroundHitDragMove,
	handleOrbitAroundHitDragEnd,
	handleZoomToolDragMove,
	handleZoomToolDragEnd,
	handleLensAdjustDragMove,
	handleLensAdjustDragEnd,
	handleShotCameraRollDragMove,
	handleShotCameraRollDragEnd,
	handleViewportOrthographicPanMove,
	handleViewportOrthographicPanEnd,
	handleViewportOrthographicWheel,
	handleOutputFramePanMove,
	handleOutputFramePanEnd,
	handleOutputFrameResizeMove,
	handleOutputFrameResizeEnd,
	handleOutputFrameAnchorDragMove,
	handleOutputFrameAnchorDragEnd,
	handleFrameDragMove,
	handleFrameDragEnd,
	handleFrameResizeMove,
	handleFrameResizeEnd,
	handleFrameRotateMove,
	handleFrameRotateEnd,
	handleFrameAnchorDragMove,
	handleFrameAnchorDragEnd,
	handleViewportTransformDragMove,
	handleViewportTransformDragEnd,
	pickViewportAssetAtPointer,
	handleMeasurementPointerDown,
	handleMeasurementHoverMove,
	handleMeasurementAxisDragMove,
	handleMeasurementAxisDragEnd,
	deleteSelectedMeasurement,
	startOutputFrameAnchorDrag,
	isInteractionBlocked = null,
}) {
	let viewportSelectClickCandidate = null;
	let viewportOrthoRotationGesture = null;
	let viewportPieTouchHoldState = null;
	const VIEWPORT_PIE_TOUCH_HOLD_MS = 320;
	const VIEWPORT_PIE_TOUCH_HOLD_DISTANCE_PX = 12;
	const VIEWPORT_POINTER_CLICK_DISTANCE_PX = 8;

	function isHistoryShortcut(event) {
		const hasHistoryModifier = event.ctrlKey || event.metaKey;
		return (
			hasHistoryModifier && (event.code === "KeyZ" || event.code === "KeyY")
		);
	}

	function syncInteractiveInputNavigationState(isInteractiveInputFocused) {
		if (isInteractiveInputFocused) {
			fpsMovement.enable = false;
			pointerControls.enable = false;
			return;
		}

		const navigationEnabled = state.interactionMode === "navigate";
		fpsMovement.enable = navigationEnabled;
		pointerControls.enable =
			navigationEnabled && !isViewportOrthographicActive?.();
	}

	function getCameraPoseSignature() {
		const camera = getActiveCamera?.();
		if (!camera) {
			return "none";
		}

		return [
			camera.position.x.toFixed(5),
			camera.position.y.toFixed(5),
			camera.position.z.toFixed(5),
			camera.quaternion.x.toFixed(5),
			camera.quaternion.y.toFixed(5),
			camera.quaternion.z.toFixed(5),
			camera.quaternion.w.toFixed(5),
			camera.isOrthographicCamera
				? [
						"ortho",
						Number(camera.left).toFixed(5),
						Number(camera.right).toFixed(5),
						Number(camera.top).toFixed(5),
						Number(camera.bottom).toFixed(5),
						Number(camera.zoom).toFixed(5),
					].join("|")
				: "perspective",
		].join("|");
	}

	function isMiddleMouseButton(event) {
		return event.button === 1;
	}

	function shouldOpenViewportPie(event) {
		if (!isMiddleMouseButton(event)) {
			return false;
		}
		if (isInteractiveTextTarget(event.target)) {
			return false;
		}
		return true;
	}

	function isViewportPieTarget(target) {
		return (
			target instanceof Element &&
			target.closest(".viewport-pie__item, .viewport-pie__center") !== null
		);
	}

	function clearViewportPieTouchHold() {
		if (!viewportPieTouchHoldState) {
			return;
		}
		window.clearTimeout(viewportPieTouchHoldState.timeoutId);
		viewportPieTouchHoldState = null;
	}

	function isTouchViewportPieCandidate(event) {
		return false;
	}

	function maybeRestoreViewportOrthographicProjection(event) {
		if (
			!viewportOrthoRotationGesture ||
			event.pointerId !== viewportOrthoRotationGesture.pointerId
		) {
			return;
		}

		const deltaX = event.clientX - viewportOrthoRotationGesture.startClientX;
		const deltaY = event.clientY - viewportOrthoRotationGesture.startClientY;
		const isClickLike =
			Math.hypot(deltaX, deltaY) <= VIEWPORT_POINTER_CLICK_DISTANCE_PX;
		const cameraPoseChanged =
			viewportOrthoRotationGesture.startPose !== getCameraPoseSignature();
		const projectionSnapshot = viewportOrthoRotationGesture.projectionSnapshot;
		viewportOrthoRotationGesture = null;
		if (isClickLike && !cameraPoseChanged) {
			restoreViewportProjectionState?.(projectionSnapshot);
			syncControlsToMode?.();
		}
	}

	listen(
		viewportShell,
		"pointerdown",
		(event) => {
			if (handleMeasurementPointerDown?.(event)) {
				viewportSelectClickCandidate = null;
			}
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"pointerdown",
		(event) => {
			if (isPieInteractionMode?.()) {
				return;
			}
			const target = event.target instanceof Element ? event.target : null;
			if (
				isViewportOrthographicActive?.() &&
				event.button === 0 &&
				target?.closest("#viewport") !== null
			) {
				viewportOrthoRotationGesture = null;
				const projectionSnapshot = captureViewportProjectionState?.() ?? null;
				if (ensurePerspectiveForViewportRotation?.()) {
					syncControlsToMode?.();
					viewportOrthoRotationGesture = {
						pointerId: event.pointerId,
						startClientX: event.clientX,
						startClientY: event.clientY,
						startPose: getCameraPoseSignature(),
						projectionSnapshot,
					};
				}
			}
			if (startOrbitAroundHitDrag?.(event)) {
				return;
			}
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"pointerdown",
		(event) => {
			if (!isPieInteractionMode?.()) {
				return;
			}
			if (isViewportPieTarget(event.target)) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			closeViewportPieMenu?.();
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"contextmenu",
		(event) => {
			const target = event.target instanceof Element ? event.target : null;
			if (target?.closest("#viewport, #render-box, .viewport-pie") !== null) {
				event.preventDefault();
			}
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"wheel",
		(event) => {
			if (!isViewportOrthographicActive?.()) {
				return;
			}
			const target = event.target instanceof Element ? event.target : null;
			if (
				target?.closest(".viewport-pie, .viewport-axis-gizmo, #viewport-gizmo")
			) {
				return;
			}
			handleViewportOrthographicWheel?.(event);
		},
		{ capture: true, passive: false },
	);

	listen(
		viewportShell,
		"pointerdown",
		(event) => {
			if (!shouldOpenViewportPie(event)) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			openViewportPieMenu?.(event);
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"pointerdown",
		(event) => {
			if (!isTouchViewportPieCandidate(event)) {
				return;
			}
			clearViewportPieTouchHold();
			viewportPieTouchHoldState = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				timeoutId: window.setTimeout(() => {
					openViewportPieMenu?.(
						{
							button: event.button,
							clientX: event.clientX,
							clientY: event.clientY,
						},
						{ force: true },
					);
					viewportPieTouchHoldState = null;
				}, VIEWPORT_PIE_TOUCH_HOLD_MS),
			};
		},
		{ capture: true },
	);

	listen(
		viewportShell,
		"auxclick",
		(event) => {
			if (!isMiddleMouseButton(event)) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
		},
		{ capture: true },
	);

	listen(viewportShell, "dragover", (event) => {
		event.preventDefault();
		dropHint.classList.remove("is-hidden");
	});

	listen(viewportShell, "dragleave", (event) => {
		event.preventDefault();
		updateDropHint();
	});

	listen(viewportShell, "drop", async (event) => {
		event.preventDefault();
		const files = [...(event.dataTransfer?.files || [])];
		if (files.length === 0) {
			updateDropHint();
			return;
		}

		const referenceImageFiles =
			typeof supportsReferenceImageFile === "function"
				? files.filter((file) => supportsReferenceImageFile(file))
				: [];
		const assetFiles =
			referenceImageFiles.length > 0
				? files.filter((file) => !referenceImageFiles.includes(file))
				: files;

		try {
			if (referenceImageFiles.length > 0) {
				await importReferenceImageFiles?.(referenceImageFiles);
			}
			if (assetFiles.length > 0) {
				await assetController.importDroppedFiles(assetFiles);
			}
		} catch (error) {
			console.error(error);
			setStatus(error.message);
		}
	});

	listen(window, "resize", () => {
		updateOutputFrameOverlay();
	});

	listen(window, "focusin", (event) => {
		if (!isInteractiveTextTarget(event.target)) {
			return;
		}
		syncInteractiveInputNavigationState(true);
		flushNavigationHistory?.();
	});

	listen(window, "focusout", (event) => {
		if (!isInteractiveTextTarget(event.target)) {
			return;
		}
		queueMicrotask(() => {
			syncInteractiveInputNavigationState(
				isInteractiveTextTarget(document.activeElement),
			);
		});
	});

	listen(viewportShell, "pointerdown", (event) => {
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest(".viewport-pie")) {
			return;
		}
		if (
			target?.closest(
				".measurement-overlay__point, .measurement-overlay__chip, .measurement-overlay__gizmo-handle",
			)
		) {
			return;
		}
		if (viewportPieTouchHoldState?.pointerId === event.pointerId) {
			return;
		}

		if (
			target?.closest("#viewport") !== null &&
			startViewportOrthographicPanDrag?.(event)
		) {
			return;
		}

		if (startLensAdjustDrag?.(event)) {
			return;
		}

		if (startShotCameraRollDrag?.(event)) {
			return;
		}

		if (startZoomToolDrag(event)) {
			return;
		}

		if (target?.closest(".frame-item")) {
			return;
		}
		if (
			target?.closest(
				".reference-image-layer__entry, .reference-image-selection-layer",
			)
		) {
			return;
		}
		if (target?.closest("#viewport-gizmo")) {
			return;
		}
		if (target?.closest("#render-box")) {
			if (isReferenceImageSelectionActive?.()) {
				clearReferenceImageSelection?.();
				updateUi();
				return;
			}
			if (!isFrameSelectionActive()) {
				return;
			}
			clearFrameSelection();
			updateUi();
			return;
		}

		const hadSelection =
			state.outputFrameSelected ||
			isFrameSelectionActive() ||
			isReferenceImageSelectionActive?.();
		if (hadSelection) {
			clearReferenceImageSelection?.();
			clearFrameSelection();
			clearOutputFrameSelection();
			updateUi();
		}
		if (
			isViewportSelectMode?.() &&
			event.button === 0 &&
			target?.closest("#viewport") === null
		) {
			viewportSelectClickCandidate = null;
			return;
		}

		if (isViewportSelectMode?.() && event.button === 0) {
			viewportSelectClickCandidate = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startPose: getCameraPoseSignature(),
			};
		}
	});

	listen(window, "pointermove", handleZoomToolDragMove);
	listen(window, "pointerup", handleZoomToolDragEnd);
	listen(window, "pointercancel", handleZoomToolDragEnd);
	listen(window, "pointermove", (event) => {
		handleMeasurementHoverMove?.(event);
		handleMeasurementAxisDragMove?.(event);
	});
	listen(window, "pointerup", (event) => {
		handleMeasurementAxisDragEnd?.(event);
	});
	listen(window, "pointercancel", (event) => {
		handleMeasurementAxisDragEnd?.(event);
	});
	listen(window, "pointermove", handleOrbitAroundHitDragMove);
	listen(window, "pointerup", handleOrbitAroundHitDragEnd);
	listen(window, "pointercancel", handleOrbitAroundHitDragEnd);
	listen(window, "pointermove", handleLensAdjustDragMove);
	listen(window, "pointerup", handleLensAdjustDragEnd);
	listen(window, "pointercancel", handleLensAdjustDragEnd);
	listen(window, "pointermove", handleShotCameraRollDragMove);
	listen(window, "pointerup", handleShotCameraRollDragEnd);
	listen(window, "pointercancel", handleShotCameraRollDragEnd);
	listen(window, "pointermove", handleViewportOrthographicPanMove);
	listen(window, "pointerup", handleViewportOrthographicPanEnd);
	listen(window, "pointercancel", handleViewportOrthographicPanEnd);
	listen(window, "pointermove", (event) => {
		if (
			!viewportPieTouchHoldState ||
			event.pointerId !== viewportPieTouchHoldState.pointerId
		) {
			return;
		}
		const deltaX = event.clientX - viewportPieTouchHoldState.startClientX;
		const deltaY = event.clientY - viewportPieTouchHoldState.startClientY;
		if (Math.hypot(deltaX, deltaY) > VIEWPORT_PIE_TOUCH_HOLD_DISTANCE_PX) {
			clearViewportPieTouchHold();
		}
	});
	listen(window, "pointermove", (event) => {
		if (!isPieInteractionMode?.()) {
			return;
		}
		updateViewportPiePointer?.(event);
	});
	listen(window, "pointerup", (event) => {
		if (!isPieInteractionMode?.() || !isMiddleMouseButton(event)) {
			return;
		}
		event.preventDefault();
		const actionId = finishViewportPieMenu?.(event);
		if (actionId) {
			handleViewportPieAction?.(actionId, event);
		}
	});
	listen(window, "pointercancel", () => {
		if (!isPieInteractionMode?.()) {
			return;
		}
		closeViewportPieMenu?.();
	});
	listen(window, "pointerup", (event) => {
		if (viewportPieTouchHoldState?.pointerId === event.pointerId) {
			clearViewportPieTouchHold();
		}
	});
	listen(window, "pointercancel", (event) => {
		if (viewportPieTouchHoldState?.pointerId === event.pointerId) {
			clearViewportPieTouchHold();
		}
	});
	listen(window, "pointerup", (event) => {
		if (
			!viewportSelectClickCandidate ||
			event.pointerId !== viewportSelectClickCandidate.pointerId
		) {
			return;
		}
		const deltaX = event.clientX - viewportSelectClickCandidate.startClientX;
		const deltaY = event.clientY - viewportSelectClickCandidate.startClientY;
		const isClickLike =
			Math.hypot(deltaX, deltaY) <= VIEWPORT_POINTER_CLICK_DISTANCE_PX;
		const cameraPoseChanged =
			viewportSelectClickCandidate.startPose !== getCameraPoseSignature();
		const shouldSelect = isClickLike && !cameraPoseChanged;
		viewportSelectClickCandidate = null;
		if (!shouldSelect) {
			return;
		}
		pickViewportAssetAtPointer?.(event);
	});
	listen(window, "pointercancel", (event) => {
		if (viewportSelectClickCandidate?.pointerId === event.pointerId) {
			viewportSelectClickCandidate = null;
		}
	});
	listen(window, "pointerup", (event) => {
		maybeRestoreViewportOrthographicProjection(event);
	});
	listen(window, "pointercancel", (event) => {
		maybeRestoreViewportOrthographicProjection(event);
	});
	listen(window, "pointerup", () => {
		requestNavigationHistoryCommit?.();
	});
	listen(window, "pointercancel", () => {
		requestNavigationHistoryCommit?.();
	});
	listen(window, "keydown", (event) => {
		if (isInteractionBlocked?.()) {
			if (!isInteractiveTextTarget(event.target)) {
				event.preventDefault();
			}
			return;
		}

		if (event.repeat) {
			return;
		}

		if (isHistoryShortcut(event) && !isNativeHistoryTarget(event.target)) {
			event.preventDefault();
			if (event.code === "KeyY" || event.shiftKey) {
				redoHistory?.();
			} else {
				undoHistory?.();
			}
			return;
		}

		if (
			(event.ctrlKey || event.metaKey) &&
			event.code === "KeyN" &&
			!event.altKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			startNewProject?.();
			return;
		}

		if (
			(event.ctrlKey || event.metaKey) &&
			event.code === "KeyO" &&
			!event.altKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			openFiles?.();
			return;
		}

		if (
			(event.ctrlKey || event.metaKey) &&
			event.code === "KeyS" &&
			!event.altKey
		) {
			event.preventDefault();
			if (event.shiftKey) {
				exportProject?.();
			} else {
				saveProject?.();
			}
			return;
		}

		if (
			(event.ctrlKey || event.metaKey) &&
			event.code === "KeyD" &&
			!event.altKey &&
			!event.shiftKey &&
			!isInteractiveTextTarget(event.target)
		) {
			event.preventDefault();
			clearSceneAssetSelection?.();
			return;
		}

		if (
			(event.code === "Delete" || event.code === "Backspace") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey &&
			!isInteractiveTextTarget(event.target)
		) {
			const deletedMeasurement = deleteSelectedMeasurement?.() ?? false;
			if (deletedMeasurement) {
				event.preventDefault();
				return;
			}
			const deletedSceneAssets =
				assetController?.deleteSelectedSceneAssets?.() ?? false;
			if (deletedSceneAssets) {
				event.preventDefault();
				return;
			}
		}

		if (event.code === "Escape" && isPieInteractionMode?.()) {
			event.preventDefault();
			closeViewportPieMenu?.();
			return;
		}

		if (event.code === "Escape" && isLensInteractionMode?.()) {
			event.preventDefault();
			applyNavigateInteractionMode();
			return;
		}

		if (event.code === "Escape" && isRollInteractionMode?.()) {
			event.preventDefault();
			applyNavigateInteractionMode();
			return;
		}

		if (isInteractiveTextTarget(event.target)) {
			return;
		}

		if (
			event.code === "KeyZ" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleZoomTool();
			return;
		}

		if (
			event.code === "KeyM" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey &&
			!isInteractiveTextTarget(event.target)
		) {
			event.preventDefault();
			toggleMeasurementMode?.();
			return;
		}

		if (
			event.code === "KeyV" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleViewportSelectMode?.();
			return;
		}

		if (
			event.code === "KeyR" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey
		) {
			event.preventDefault();
			if (event.shiftKey) {
				toggleViewportReferenceImageEditMode?.();
				return;
			}
			handleViewportPieAction?.("toggle-reference-preview");
			return;
		}

		if (
			event.code === "KeyT" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleViewportTransformMode?.();
			return;
		}

		if (
			event.code === "KeyQ" &&
			(state.mode === "viewport" || state.mode === "camera") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			event.preventDefault();
			toggleViewportPivotEditMode?.();
			return;
		}

		if (
			event.code === "KeyF" &&
			state.mode === "camera" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey
		) {
			event.preventDefault();
			handleViewportPieAction?.(
				event.shiftKey ? "frame-mask-selected" : "frame-mask-all",
			);
			return;
		}

		if (event.code === "Escape" && isZoomInteractionMode()) {
			event.preventDefault();
			applyNavigateInteractionMode();
		}
	});
	listen(window, "keyup", (event) => {
		if (isInteractiveTextTarget(event.target)) {
			return;
		}
		requestNavigationHistoryCommit?.();
	});
	listen(window, "blur", () => {
		clearViewportPieTouchHold();
		closeViewportPieMenu?.();
		flushNavigationHistory?.();
	});

	listen(window, "pointermove", handleOutputFramePanMove);
	listen(window, "pointerup", handleOutputFramePanEnd);
	listen(window, "pointercancel", handleOutputFramePanEnd);
	listen(window, "pointermove", handleOutputFrameResizeMove);
	listen(window, "pointerup", handleOutputFrameResizeEnd);
	listen(window, "pointercancel", handleOutputFrameResizeEnd);
	listen(window, "pointermove", handleOutputFrameAnchorDragMove);
	listen(window, "pointerup", handleOutputFrameAnchorDragEnd);
	listen(window, "pointercancel", handleOutputFrameAnchorDragEnd);
	listen(window, "pointermove", handleFrameDragMove);
	listen(window, "pointerup", handleFrameDragEnd);
	listen(window, "pointercancel", handleFrameDragEnd);
	listen(window, "pointermove", handleFrameResizeMove);
	listen(window, "pointerup", handleFrameResizeEnd);
	listen(window, "pointercancel", handleFrameResizeEnd);
	listen(window, "pointermove", handleFrameRotateMove);
	listen(window, "pointerup", handleFrameRotateEnd);
	listen(window, "pointercancel", handleFrameRotateEnd);
	listen(window, "pointermove", handleFrameAnchorDragMove);
	listen(window, "pointerup", handleFrameAnchorDragEnd);
	listen(window, "pointercancel", handleFrameAnchorDragEnd);
	listen(window, "pointermove", handleViewportTransformDragMove);
	listen(window, "pointerup", handleViewportTransformDragEnd);
	listen(window, "pointercancel", handleViewportTransformDragEnd);
	listen(anchorDot, "pointerdown", startOutputFrameAnchorDrag);
}
