import * as THREE from "three";
import {
	MIN_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM,
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm,
} from "../engine/camera-lens.js";
import {
	applyLegacyCameraTransform,
	buildLegacyProjectImport,
} from "../importers/legacy-ssproj.js";
import { getDefaultProjectFilename } from "../project-file.js";
import {
	cloneShotCameraDocument,
	createDefaultShotCameraDocuments,
} from "../workspace-model.js";

const DEFAULT_VIEWPORT_BASE_FOVX =
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
		MIN_STANDARD_FRAME_HORIZONTAL_EQUIVALENT_MM,
	);

export function captureCameraPose(camera) {
	return {
		position: {
			x: camera.position.x,
			y: camera.position.y,
			z: camera.position.z,
		},
		quaternion: {
			x: camera.quaternion.x,
			y: camera.quaternion.y,
			z: camera.quaternion.z,
			w: camera.quaternion.w,
		},
		up: {
			x: camera.up.x,
			y: camera.up.y,
			z: camera.up.z,
		},
	};
}

export function restoreCameraPose(camera, snapshot) {
	if (!camera || !snapshot) {
		return false;
	}

	camera.position.set(
		Number(snapshot.position?.x ?? camera.position.x),
		Number(snapshot.position?.y ?? camera.position.y),
		Number(snapshot.position?.z ?? camera.position.z),
	);
	camera.quaternion.set(
		Number(snapshot.quaternion?.x ?? camera.quaternion.x),
		Number(snapshot.quaternion?.y ?? camera.quaternion.y),
		Number(snapshot.quaternion?.z ?? camera.quaternion.z),
		Number(snapshot.quaternion?.w ?? camera.quaternion.w),
	);
	camera.up.set(
		Number(snapshot.up?.x ?? camera.up.x),
		Number(snapshot.up?.y ?? camera.up.y),
		Number(snapshot.up?.z ?? camera.up.z),
	);
	camera.updateMatrixWorld(true);
	return true;
}

export function getLegacyImportSceneRadius(
	contentRoot,
	{
		createSceneBoundsBox = () => new THREE.Box3(),
		createVector3 = () => new THREE.Vector3(),
	} = {},
) {
	const box = createSceneBoundsBox().setFromObject(contentRoot);
	if (box.isEmpty()) {
		return 1;
	}

	const size = box.getSize(createVector3());
	return Math.max(size.length() * 0.35, 0.6);
}

export function createProjectStateBridge({
	store,
	state,
	viewportCamera,
	shotCameraRegistry,
	contentRoot,
	getAssetController,
	getLightingController,
	getReferenceImageController,
	getMeasurementController,
	getInteractionController,
	getPerSplatEditController,
	getViewportProjectionController,
	getFrameController,
	getOutputFrameController,
	getSceneFramingController,
	getShotCameraEditorStateController,
	registerShotCameraDocuments,
	getShotCameraDocument,
	getActiveShotCameraDocument,
	getActiveShotCameraEntry,
	setShotCameraDocuments,
	syncShotCameraEntryFromDocument,
	getShotCameraExportBaseName,
	syncControlsToMode,
	syncViewportProjection,
	syncShotProjection,
	applyCameraViewProjection,
	syncOutputCamera,
	updateShotCameraHelpers,
	updateCameraSummary,
	updateOutputFrameOverlay,
	updateUi,
	cloneShotCameraDocumentImpl = cloneShotCameraDocument,
	createDefaultShotCameraDocumentsImpl = createDefaultShotCameraDocuments,
	getDefaultProjectFilenameImpl = getDefaultProjectFilename,
	buildLegacyProjectImportImpl = buildLegacyProjectImport,
	applyLegacyCameraTransformImpl = applyLegacyCameraTransform,
} = {}) {
	function captureShotCameraEditorStates() {
		return (
			getShotCameraEditorStateController?.()?.captureShotCameraEditorStates?.() ??
			null
		);
	}

	function restoreShotCameraEditorStates(editorStates = null) {
		return getShotCameraEditorStateController?.()?.restoreShotCameraEditorStates?.(
			editorStates,
		);
	}

	function clearActiveShotCameraEditorState() {
		return getShotCameraEditorStateController?.()?.clearActiveShotCameraEditorState?.();
	}

	function restoreShotCameraEditorState(
		shotCameraId,
		{ fallbackSnapshot = null } = {},
	) {
		return getShotCameraEditorStateController?.()?.restoreShotCameraEditorState?.(
			shotCameraId,
			{
				fallbackSnapshot,
			},
		);
	}

	function captureWorkspaceState() {
		const shotCameraEditorStates = captureShotCameraEditorStates();
		return {
			activeShotCameraId: store.workspace.activeShotCameraId.value,
			viewportBaseFovX: store.viewportBaseFovX.value,
			viewportBaseFovXDirty: store.viewportBaseFovXDirty.value,
			viewportProjection:
				getViewportProjectionController?.()?.captureViewportProjectionState?.() ??
				null,
			shotCameras: store.workspace.shotCameras.value.map((documentState) =>
				cloneShotCameraDocumentImpl(documentState),
			),
			viewportPose: captureCameraPose(viewportCamera),
			shotCameraPoses: Array.from(shotCameraRegistry.entries()).map(
				([shotCameraId, entry]) => ({
					id: shotCameraId,
					pose: captureCameraPose(entry.camera),
				}),
			),
			sceneAssets:
				getAssetController?.()?.captureSceneAssetEditState?.() ?? null,
			sceneLighting:
				getLightingController?.()?.captureLightingState?.() ?? null,
			sceneReferenceImages:
				getReferenceImageController?.()?.captureProjectReferenceImagesState?.() ??
				null,
			splatEdit: getPerSplatEditController?.()?.captureEditState?.() ?? null,
			shotCameraEditorStates,
			referenceImageEditor:
				shotCameraEditorStates?.[store.workspace.activeShotCameraId.value]
					?.referenceImageEditor ?? null,
			frameSelectionActive: store.frames.selectionActive.value,
			frameSelectedIds: [...(store.frames.selectedIds.value ?? [])],
			frameSelectionAnchor: store.frames.selectionAnchor.value
				? { ...store.frames.selectionAnchor.value }
				: null,
			frameSelectionBoxLogical: store.frames.selectionBoxLogical.value
				? { ...store.frames.selectionBoxLogical.value }
				: null,
			outputFrameSelected: state.outputFrameSelected,
		};
	}

	function restoreWorkspaceState(snapshot) {
		if (!snapshot || !Array.isArray(snapshot.shotCameras)) {
			return false;
		}

		if (
			!getAssetController?.()?.restoreSceneAssetEditState?.(
				snapshot.sceneAssets,
			)
		) {
			return false;
		}
		getLightingController?.()?.applyLightingState?.(
			snapshot.sceneLighting ?? null,
		);

		setShotCameraDocuments(
			snapshot.shotCameras.map((documentState) =>
				cloneShotCameraDocumentImpl(documentState),
			),
		);
		registerShotCameraDocuments();
		if (!getShotCameraDocument(snapshot.activeShotCameraId)) {
			return false;
		}

		store.workspace.activeShotCameraId.value = snapshot.activeShotCameraId;
		store.viewportBaseFovX.value = Number.isFinite(snapshot.viewportBaseFovX)
			? snapshot.viewportBaseFovX
			: store.viewportBaseFovX.value;
		store.viewportBaseFovXDirty.value = Boolean(snapshot.viewportBaseFovXDirty);
		restoreCameraPose(viewportCamera, snapshot.viewportPose);
		getViewportProjectionController?.()?.restoreViewportProjectionState?.(
			snapshot.viewportProjection ?? null,
		);
		restoreShotCameraEditorStates(snapshot.shotCameraEditorStates ?? null);
		getReferenceImageController?.()?.applyProjectReferenceImagesState?.(
			snapshot.sceneReferenceImages ?? null,
			{ editorState: null },
		);
		getPerSplatEditController?.()?.restoreEditState?.(
			snapshot.splatEdit ?? null,
		);
		getMeasurementController?.()?.clearMeasurementSession?.({
			keepActive: false,
		});

		for (const poseEntry of snapshot.shotCameraPoses ?? []) {
			const entry = shotCameraRegistry.get(poseEntry.id);
			if (!entry) {
				return false;
			}
			restoreCameraPose(entry.camera, poseEntry.pose);
			syncShotCameraEntryFromDocument(entry);
		}

		getFrameController?.()?.clearFrameInteraction?.();
		getOutputFrameController?.()?.clearOutputFramePan?.();
		getOutputFrameController?.()?.clearOutputFrameAnchorDrag?.();
		getOutputFrameController?.()?.clearOutputFrameResize?.();
		restoreShotCameraEditorState(snapshot.activeShotCameraId, {
			fallbackSnapshot: snapshot,
		});
		getInteractionController?.()?.clearControlMomentum?.();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateShotCameraHelpers();
		updateCameraSummary();
		return true;
	}

	function applyProjectPackageImport(importState) {
		const legacyImport = buildLegacyProjectImportImpl({
			cameraFramesState: importState?.cameraFrames ?? null,
			sceneRadius: getLegacyImportSceneRadius(contentRoot),
		});
		if (!legacyImport?.shots?.length) {
			return false;
		}

		setShotCameraDocuments(legacyImport.shots.map((shot) => shot.document));
		store.workspace.activeShotCameraId.value =
			legacyImport.activeShotCameraId ??
			legacyImport.shots[0]?.document.id ??
			store.workspace.activeShotCameraId.value;

		for (const shot of legacyImport.shots) {
			const entry = shotCameraRegistry.get(shot.document.id);
			if (!entry) {
				continue;
			}

			applyLegacyCameraTransformImpl(entry.camera, shot.transform);
			syncShotCameraEntryFromDocument(entry);
		}

		const activeEntry = getActiveShotCameraEntry();
		if (activeEntry) {
			getSceneFramingController?.()?.copyPose(
				activeEntry.camera,
				viewportCamera,
			);
		}

		restoreShotCameraEditorStates(null);
		clearActiveShotCameraEditorState();
		getMeasurementController?.()?.clearMeasurementSession?.({
			keepActive: false,
		});
		getInteractionController?.()?.clearControlMomentum?.();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateOutputFrameOverlay();
		updateShotCameraHelpers();
		updateCameraSummary();
		updateUi();
		return true;
	}

	function captureProjectShotCameras() {
		return store.workspace.shotCameras.value.map((documentState) => ({
			...cloneShotCameraDocumentImpl(documentState),
			pose: captureCameraPose(
				shotCameraRegistry.get(documentState.id)?.camera ?? viewportCamera,
			),
		}));
	}

	function captureProjectState() {
		return {
			workspace: {
				activeShotCameraId: store.workspace.activeShotCameraId.value,
				viewport: {
					baseFovX: store.viewportBaseFovX.value,
					baseFovXDirty: store.viewportBaseFovXDirty.value,
					pose: captureCameraPose(viewportCamera),
					...(getViewportProjectionController?.()?.captureViewportProjectionState?.() ??
						{}),
				},
			},
			shotCameras: captureProjectShotCameras(),
			scene: {
				assets: getAssetController?.()?.captureProjectSceneState?.() ?? [],
				lighting: getLightingController?.()?.captureLightingState?.() ?? null,
				referenceImages:
					getReferenceImageController?.()?.captureProjectReferenceImagesState?.() ??
					null,
			},
		};
	}

	function buildProjectFilename() {
		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument) {
			return getDefaultProjectFilenameImpl();
		}

		return `${getShotCameraExportBaseName(activeDocument, 1)}.ssproj`;
	}

	function applySavedProjectState(project) {
		const shotCameras = (project?.shotCameras ?? []).map((shotCamera) => {
			const { pose: _pose, ...documentState } = shotCamera;
			return cloneShotCameraDocumentImpl(documentState);
		});
		setShotCameraDocuments(shotCameras);
		registerShotCameraDocuments();

		store.workspace.activeShotCameraId.value = getShotCameraDocument(
			project?.workspace?.activeShotCameraId,
		)
			? project.workspace.activeShotCameraId
			: (shotCameras[0]?.id ?? store.workspace.activeShotCameraId.value);
		store.viewportBaseFovX.value = Number.isFinite(
			project?.workspace?.viewport?.baseFovX,
		)
			? project.workspace.viewport.baseFovX
			: store.viewportBaseFovX.value;
		store.viewportBaseFovXDirty.value = Boolean(
			project?.workspace?.viewport?.baseFovXDirty,
		);
		restoreCameraPose(viewportCamera, project?.workspace?.viewport?.pose);
		getViewportProjectionController?.()?.restoreViewportProjectionState?.(
			project?.workspace?.viewport ?? null,
		);

		for (const shotCamera of project?.shotCameras ?? []) {
			const entry = shotCameraRegistry.get(shotCamera.id);
			if (!entry) {
				continue;
			}
			restoreCameraPose(entry.camera, shotCamera.pose);
			syncShotCameraEntryFromDocument(entry);
		}
		getReferenceImageController?.()?.applyProjectReferenceImagesState?.(
			project?.scene?.referenceImages,
		);
		getLightingController?.()?.applyLightingState?.(
			project?.scene?.lighting ?? null,
		);

		restoreShotCameraEditorStates(null);
		clearActiveShotCameraEditorState();
		getMeasurementController?.()?.clearMeasurementSession?.({
			keepActive: false,
		});
		getFrameController?.()?.clearFrameInteraction?.();
		getOutputFrameController?.()?.clearOutputFramePan?.();
		getOutputFrameController?.()?.clearOutputFrameAnchorDrag?.();
		getOutputFrameController?.()?.clearOutputFrameResize?.();
		getInteractionController?.()?.clearControlMomentum?.();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateOutputFrameOverlay();
		updateShotCameraHelpers();
		updateCameraSummary();
		updateUi();
	}

	function resetWorkspaceToDefaults() {
		const defaultShotCameras = createDefaultShotCameraDocumentsImpl().map(
			(documentState) => cloneShotCameraDocumentImpl(documentState),
		);
		setShotCameraDocuments([]);
		setShotCameraDocuments(defaultShotCameras);
		registerShotCameraDocuments();
		store.workspace.activeShotCameraId.value =
			defaultShotCameras[0]?.id ?? store.workspace.activeShotCameraId.value;
		store.viewportBaseFovX.value = DEFAULT_VIEWPORT_BASE_FOVX;
		store.viewportBaseFovXDirty.value = false;
		restoreShotCameraEditorStates(null);
		clearActiveShotCameraEditorState();
		getMeasurementController?.()?.clearMeasurementSession?.({
			keepActive: false,
		});
		getFrameController?.()?.clearFrameSelection?.();
		getOutputFrameController?.()?.clearOutputFrameSelection?.();
		getOutputFrameController?.()?.clearOutputFrameAnchorDrag?.();
		getOutputFrameController?.()?.clearOutputFrameResize?.();
		getInteractionController?.()?.clearControlMomentum?.();
		syncControlsToMode();
		syncViewportProjection();
		syncShotProjection();
		applyCameraViewProjection();
		syncOutputCamera();
		updateOutputFrameOverlay();
		updateShotCameraHelpers();
		updateCameraSummary();
		updateUi();
		return defaultShotCameras;
	}

	return {
		captureWorkspaceState,
		restoreWorkspaceState,
		applyProjectPackageImport,
		captureProjectShotCameras,
		captureProjectState,
		buildProjectFilename,
		applySavedProjectState,
		resetWorkspaceToDefaults,
	};
}
