import * as THREE from "three";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
} from "../constants.js";
import {
	WORKSPACE_PANE_CAMERA,
	WORKSPACE_PANE_VIEWPORT,
	cloneShotCameraDocument,
	createShotCameraDocument,
	getNextShotCameraNumber,
	getShotCameraDocumentById,
	getShotCameraDocumentId,
	setSinglePaneRole,
} from "../workspace-model.js";

export function createCameraController({
	store,
	state,
	scene,
	viewportCamera,
	shotCameraRegistry,
	horizontalToVerticalFovDegrees,
	t,
	setStatus,
	updateUi,
	getAutoClipRange,
	clearFrameDrag,
	clearOutputFramePan,
	clearOutputFrameSelection,
	clearControlMomentum,
	applyNavigateInteractionMode,
	copyPose,
	frameCamera,
	syncControlsToMode,
}) {
	function buildShotCameraDocumentName(nextNumber) {
		return t("shotCamera.defaultName", { index: nextNumber });
	}

	function sanitizeExportName(value) {
		return String(value ?? "")
			.trim()
			.replace(/[\\/:*?"<>|]+/g, "-")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	}

	function getShotCameraExportBaseName(documentState, fallbackIndex = 1) {
		const candidate =
			documentState?.exportSettings?.exportName?.trim() ||
			documentState?.name ||
			buildShotCameraDocumentName(fallbackIndex);

		return sanitizeExportName(candidate) || `camera-${fallbackIndex}`;
	}

	function createWorkspaceShotCameraDocument(sourceDocument = null) {
		const nextNumber = getNextShotCameraNumber(
			store.workspace.shotCameras.value,
		);
		return createShotCameraDocument({
			id: getShotCameraDocumentId(nextNumber),
			name: buildShotCameraDocumentName(nextNumber),
			source: sourceDocument,
		});
	}

	function createShotCameraEntry(documentState) {
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

	function registerShotCameraDocuments() {
		const documentIds = new Set();

		for (const documentState of store.workspace.shotCameras.value) {
			documentIds.add(documentState.id);

			if (!shotCameraRegistry.has(documentState.id)) {
				shotCameraRegistry.set(
					documentState.id,
					createShotCameraEntry(documentState),
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
		activeEntry.helper.update();
	}

	function clampClipNear(value) {
		return Math.max(DEFAULT_CAMERA_NEAR, Number(value) || DEFAULT_CAMERA_NEAR);
	}

	function clampClipFar(value, near) {
		return Math.max(near + 0.01, Number(value) || DEFAULT_CAMERA_FAR);
	}

	function getResolvedShotCameraClipping(documentState) {
		if (!documentState || documentState.clipping.mode !== "manual") {
			return getAutoClipRange();
		}

		const near = clampClipNear(documentState.clipping.near);
		return {
			near,
			far: clampClipFar(documentState.clipping.far, near),
		};
	}

	function syncShotCameraEntryFromDocument(entry) {
		const documentState = getShotCameraDocument(entry.id);
		if (!documentState) {
			return;
		}

		const { near, far } = getResolvedShotCameraClipping(documentState);
		entry.camera.aspect = BASE_RENDER_BOX.width / BASE_RENDER_BOX.height;
		entry.camera.fov = horizontalToVerticalFovDegrees(
			documentState.lens.baseFovX,
			entry.camera.aspect,
		);
		entry.camera.near = near;
		entry.camera.far = far;

		if (documentState.id === store.workspace.activeShotCameraId.value) {
			store.shotCamera.nearLive.value = near;
			store.shotCamera.farLive.value = far;
		}
	}

	function syncActiveShotCameraFromDocument() {
		const activeEntry = getActiveShotCameraEntry();
		if (!activeEntry) {
			return;
		}

		syncShotCameraEntryFromDocument(activeEntry);
	}

	function setMode(mode) {
		if (mode === state.mode) {
			return;
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

	function setBaseFovX(nextValue) {
		state.baseFovX = Number(nextValue);
		updateUi();
	}

	function setShotCameraClippingMode(nextValue) {
		const mode = nextValue === "manual" ? "manual" : "auto";
		updateActiveShotCameraDocument((documentState) => {
			documentState.clipping.mode = mode;
			return documentState;
		});
		updateUi();
		setStatus(
			t("status.shotCameraClipMode", {
				mode: t(`clipMode.${mode}`),
			}),
		);
	}

	function setShotCameraNear(nextValue) {
		updateActiveShotCameraDocument((documentState) => {
			const near = clampClipNear(nextValue);
			documentState.clipping.near = near;
			documentState.clipping.far = clampClipFar(
				documentState.clipping.far,
				near,
			);
			return documentState;
		});
		updateUi();
	}

	function setShotCameraFar(nextValue) {
		updateActiveShotCameraDocument((documentState) => {
			const near = clampClipNear(documentState.clipping.near);
			documentState.clipping.far = clampClipFar(nextValue, near);
			return documentState;
		});
		updateUi();
	}

	function setShotCameraExportName(nextValue) {
		updateActiveShotCameraDocument((documentState) => {
			documentState.exportSettings = {
				...documentState.exportSettings,
				exportName: String(nextValue ?? ""),
			};
			return documentState;
		});
	}

	function selectShotCamera(shotCameraId) {
		const documentState = getShotCameraDocument(shotCameraId);
		if (
			!documentState ||
			documentState.id === store.workspace.activeShotCameraId.value
		) {
			return;
		}

		store.workspace.activeShotCameraId.value = documentState.id;
		clearFrameDrag();
		clearOutputFramePan();
		clearControlMomentum();
		updateUi();
		setStatus(
			t("status.selectedShotCamera", {
				name: documentState.name,
			}),
		);
	}

	function createShotCamera() {
		const nextDocument = createWorkspaceShotCameraDocument();
		const sourceCamera =
			state.mode === WORKSPACE_PANE_CAMERA
				? getActiveShotCamera()
				: viewportCamera;
		setShotCameraDocuments([
			...store.workspace.shotCameras.value,
			nextDocument,
		]);

		const entry = shotCameraRegistry.get(nextDocument.id);
		if (entry) {
			copyPose(sourceCamera, entry.camera);
			syncShotCameraEntryFromDocument(entry);
		}

		store.workspace.activeShotCameraId.value = nextDocument.id;
		clearFrameDrag();
		clearOutputFramePan();
		clearControlMomentum();
		updateUi();
		setStatus(
			t("status.createdShotCamera", {
				name: nextDocument.name,
			}),
		);
	}

	function duplicateActiveShotCamera() {
		const activeDocument = getActiveShotCameraDocument();
		const activeEntry = getActiveShotCameraEntry();
		if (!activeDocument || !activeEntry) {
			createShotCamera();
			return;
		}

		const nextDocument = createWorkspaceShotCameraDocument(activeDocument);
		setShotCameraDocuments([
			...store.workspace.shotCameras.value,
			nextDocument,
		]);

		const entry = shotCameraRegistry.get(nextDocument.id);
		if (entry) {
			copyPose(activeEntry.camera, entry.camera);
			syncShotCameraEntryFromDocument(entry);
		}

		store.workspace.activeShotCameraId.value = nextDocument.id;
		clearOutputFramePan();
		clearControlMomentum();
		updateUi();
		setStatus(
			t("status.duplicatedShotCamera", {
				name: nextDocument.name,
			}),
		);
	}

	function copyViewportToShotCamera() {
		const shotCamera = getActiveShotCamera();
		copyPose(viewportCamera, shotCamera);
		if (state.mode === WORKSPACE_PANE_CAMERA) {
			syncControlsToMode();
		} else {
			clearControlMomentum();
		}
		setStatus(t("status.copiedViewportToShot"));
	}

	function copyShotCameraToViewport() {
		const shotCamera = getActiveShotCamera();
		copyPose(shotCamera, viewportCamera);
		if (state.mode === WORKSPACE_PANE_VIEWPORT) {
			syncControlsToMode();
		} else {
			clearControlMomentum();
		}
		setStatus(t("status.copiedShotToViewport"));
	}

	function resetActiveView() {
		if (state.mode === WORKSPACE_PANE_CAMERA) {
			const shotCamera = getActiveShotCamera();
			frameCamera(shotCamera, "camera");
			syncActiveShotCameraFromDocument();
			setStatus(t("status.resetCamera"));
		} else {
			frameCamera(viewportCamera, "viewport");
			setStatus(t("status.resetViewport"));
		}
		syncControlsToMode();
	}

	return {
		registerShotCameraDocuments,
		getActiveShotCameraEntry,
		getShotCameraDocument,
		getActiveShotCameraDocument,
		updateActiveShotCameraDocument,
		setShotCameraDocuments,
		getShotCameraExportBaseName,
		getActiveShotCamera,
		getActiveCameraViewCamera,
		getActiveOutputCamera,
		updateShotCameraHelpers,
		syncShotCameraEntryFromDocument,
		syncActiveShotCameraFromDocument,
		setMode,
		setBaseFovX,
		setShotCameraClippingMode,
		setShotCameraNear,
		setShotCameraFar,
		setShotCameraExportName,
		selectShotCamera,
		createShotCamera,
		duplicateActiveShotCamera,
		copyViewportToShotCamera,
		copyShotCameraToViewport,
		resetActiveView,
	};
}
