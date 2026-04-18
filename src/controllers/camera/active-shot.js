import * as THREE from "three";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
} from "../../constants.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
	cloneShotCameraDocument,
	getShotCameraDocumentById,
	setSinglePaneRole,
} from "../../workspace-model.js";
import { DEFAULT_VIEWPORT_CAMERA_BASE_FOVX } from "../../engine/camera-lens.js";

function createShotCameraEntry(documentState, scene) {
	const camera = new THREE.PerspectiveCamera(
		50,
		BASE_RENDER_BOX.width / BASE_RENDER_BOX.height,
		DEFAULT_CAMERA_NEAR,
		DEFAULT_CAMERA_FAR,
	);
	const cameraViewCamera = camera.clone();
	const outputCamera = camera.clone();
	const helper = new THREE.CameraHelper(camera);
	helper.visible = false;
	scene.add(helper);

	return {
		id: documentState.id,
		name: documentState.name,
		camera,
		cameraViewCamera,
		outputCamera,
		helper,
	};
}

export function createCameraActiveShotController({
	store,
	state,
	scene,
	shotCameraRegistry,
	viewportCamera,
	updateUi,
	setStatus,
	t,
	clearFrameDrag,
	clearOutputFrameSelection,
	clearOutputFramePan,
	clearControlMomentum,
	applyNavigateInteractionMode,
	beforeActiveShotCameraChange = null,
	afterActiveShotCameraChange = null,
}) {
	function registerShotCameraDocuments() {
		const documentIds = new Set();

		for (const documentState of store.workspace.shotCameras.value) {
			documentIds.add(documentState.id);

			if (!shotCameraRegistry.has(documentState.id)) {
				shotCameraRegistry.set(
					documentState.id,
					createShotCameraEntry(documentState, scene),
				);
				continue;
			}

			shotCameraRegistry.get(documentState.id).name = documentState.name;
		}

		for (const [shotCameraId, entry] of shotCameraRegistry.entries()) {
			if (documentIds.has(shotCameraId)) {
				continue;
			}

			entry.helper.removeFromParent();
			shotCameraRegistry.delete(shotCameraId);
		}
	}

	function getActiveShotCameraEntry() {
		registerShotCameraDocuments();
		return (
			shotCameraRegistry.get(store.workspace.activeShotCameraId.value) ??
			shotCameraRegistry.values().next().value ??
			null
		);
	}

	function getShotCameraDocument(shotCameraId) {
		return getShotCameraDocumentById(
			store.workspace.shotCameras.value,
			shotCameraId,
		);
	}

	function getActiveShotCameraDocument() {
		return store.workspace.activeShotCamera.value ?? null;
	}

	function setShotCameraDocuments(nextDocuments) {
		store.workspace.shotCameras.value = nextDocuments;
		const nextDocumentIds = new Set(
			nextDocuments.map((documentState) => documentState.id),
		);
		store.exportOptions.presetIds.value =
			store.exportOptions.presetIds.value.filter((shotCameraId) =>
				nextDocumentIds.has(shotCameraId),
			);
		registerShotCameraDocuments();
	}

	function updateActiveShotCameraDocument(updateDocument) {
		const activeShotCameraId = store.workspace.activeShotCameraId.value;
		setShotCameraDocuments(
			store.workspace.shotCameras.value.map((documentState) =>
				documentState.id === activeShotCameraId
					? updateDocument(cloneShotCameraDocument(documentState))
					: documentState,
			),
		);
	}

	function getActiveShotCamera() {
		return getActiveShotCameraEntry()?.camera ?? viewportCamera;
	}

	function getActiveCameraViewCamera() {
		return getActiveShotCameraEntry()?.cameraViewCamera ?? viewportCamera;
	}

	function getActiveOutputCamera() {
		return getActiveShotCameraEntry()?.outputCamera ?? viewportCamera;
	}

	function updateShotCameraHelpers() {
		for (const entry of shotCameraRegistry.values()) {
			entry.helper.visible = false;
		}

		const activeEntry = getActiveShotCameraEntry();
		if (!activeEntry) {
			return;
		}

		activeEntry.helper.visible = state.mode === WORKSPACE_PANE_VIEWPORT;
		if (activeEntry.helper.visible) {
			activeEntry.helper.update();
		}
	}

	function setMode(mode) {
		if (mode === state.mode) {
			return;
		}

		if (mode === WORKSPACE_PANE_VIEWPORT && !state.viewportBaseFovXDirty) {
			state.viewportBaseFovX = DEFAULT_VIEWPORT_CAMERA_BASE_FOVX;
		}

		store.workspace.panes.value = setSinglePaneRole(
			store.workspace.panes.value,
			mode,
		);
		clearFrameDrag();
		clearOutputFrameSelection();
		applyNavigateInteractionMode();
		clearControlMomentum();
		updateUi();
		setStatus(
			mode === WORKSPACE_PANE_CAMERA
				? t("status.cameraEnabled")
				: t("status.viewportEnabled"),
		);
	}

	function selectShotCamera(shotCameraId) {
		const documentState = getShotCameraDocument(shotCameraId);
		if (
			!documentState ||
			documentState.id === store.workspace.activeShotCameraId.value
		) {
			return;
		}

		beforeActiveShotCameraChange?.(
			store.workspace.activeShotCameraId.value,
			documentState.id,
		);
		store.workspace.activeShotCameraId.value = documentState.id;
		clearFrameDrag();
		clearOutputFramePan();
		clearControlMomentum();
		updateUi();
		afterActiveShotCameraChange?.(
			documentState.id,
			store.workspace.activeShotCameraId.value,
		);
		setStatus(
			t("status.selectedShotCamera", {
				name: documentState.name,
			}),
		);
	}

	return {
		registerShotCameraDocuments,
		getActiveShotCameraEntry,
		getShotCameraDocument,
		getActiveShotCameraDocument,
		setShotCameraDocuments,
		updateActiveShotCameraDocument,
		getActiveShotCamera,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		updateShotCameraHelpers,
		setMode,
		selectShotCamera,
	};
}
