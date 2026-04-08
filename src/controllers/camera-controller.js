import * as THREE from "three";
import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
} from "../constants.js";
import { DEFAULT_VIEWPORT_CAMERA_BASE_FOVX } from "../engine/camera-lens.js";
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
	getSceneBounds = () => null,
	clearFrameDrag,
	clearOutputFramePan,
	clearOutputFrameSelection,
	clearControlMomentum,
	beforeActiveShotCameraChange = null,
	afterActiveShotCameraChange = null,
	applyNavigateInteractionMode,
	copyPose,
	placeCameraAtHome,
	frameCamera,
	getViewportCameraForShotCopy = () => viewportCamera,
	getViewportPerspectiveCamera = () => viewportCamera,
	prepareViewportPerspectiveMode = () => false,
	resetViewportView = () => false,
	syncControlsToMode,
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
}) {
	function buildShotCameraDocumentName(nextNumber) {
		return t("shotCamera.defaultName", { index: nextNumber });
	}

	function getShotCameraExportBaseName(documentState, fallbackIndex = 1) {
		return getShotCameraExportBaseNameForDocument(
			documentState,
			fallbackIndex,
			buildShotCameraDocumentName,
		);
	}

	function normalizeShotCameraExportFormat(value) {
		return value === "png" ? "png" : "psd";
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

	function captureCameraPose(camera) {
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

	function syncActiveShotCameraDocumentFromLiveCamera({
		includeLens = false,
		baseFovX = state.baseFovX,
	} = {}) {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return;
		}

		updateActiveShotCameraDocument((documentState) => {
			documentState.pose = captureCameraPose(shotCamera);
			if (includeLens) {
				documentState.lens = {
					...documentState.lens,
					baseFovX: Number(baseFovX),
				};
			}
			return documentState;
		});
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

	function getResolvedShotCameraClipping(
		documentState,
		camera = viewportCamera,
	) {
		if (!documentState) {
			return getAutoClipRange(camera);
		}

		const near = clampClipNear(documentState.clipping.near);
		if (documentState.clipping.mode !== "manual") {
			const autoClip = getAutoClipRange(camera);
			return {
				near,
				far: clampClipFar(Math.max(autoClip.far, DEFAULT_CAMERA_FAR), near),
			};
		}

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

		const { near, far } = getResolvedShotCameraClipping(
			documentState,
			entry.camera,
		);
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

	function setBaseFovX(nextValue) {
		runHistoryAction?.("camera.lens", () => {
			state.baseFovX = Number(nextValue);
		});
		updateUi();
	}

	function setViewportBaseFovX(nextValue) {
		runHistoryAction?.("viewport.lens", () => {
			state.viewportBaseFovX = Number(nextValue);
			state.viewportBaseFovXDirty = true;
		});
		updateUi();
	}

	function setShotCameraClippingMode(nextValue) {
		const mode = nextValue === "manual" ? "manual" : "auto";
		runHistoryAction?.("camera.clip-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.clipping.mode = mode;
				return documentState;
			});
		});
		updateUi();
		setStatus(
			t("status.shotCameraClipMode", {
				mode: t(`clipMode.${mode}`),
			}),
		);
	}

	function setShotCameraNear(nextValue) {
		runHistoryAction?.("camera.near", () => {
			updateActiveShotCameraDocument((documentState) => {
				const near = clampClipNear(nextValue);
				documentState.clipping.near = near;
				documentState.clipping.far = clampClipFar(
					documentState.clipping.far,
					near,
				);
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraFar(nextValue) {
		runHistoryAction?.("camera.far", () => {
			updateActiveShotCameraDocument((documentState) => {
				const near = clampClipNear(documentState.clipping.near);
				documentState.clipping.far = clampClipFar(nextValue, near);
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraRollLock(nextValue) {
		runHistoryAction?.("camera.roll-lock", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.navigation = {
					...documentState.navigation,
					rollLock: Boolean(nextValue),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraName(nextValue) {
		runHistoryAction?.("camera.name", () => {
			updateActiveShotCameraDocument((documentState) => {
				const normalizedName = String(nextValue ?? "").trim();
				if (!normalizedName) {
					return documentState;
				}
				documentState.name = normalizedName;
				return documentState;
			});
		});
		updateUi();
	}

	function setActiveShotCameraPositionAxis(axis, nextValue) {
		const numericValue = Number(nextValue);
		if (!["x", "y", "z"].includes(axis) || !Number.isFinite(numericValue)) {
			return false;
		}

		return runHistoryAction?.(`camera.position.${axis}`, () => {
			const shotCamera = getActiveShotCamera();
			shotCamera.position[axis] = numericValue;
			shotCamera.updateMatrixWorld(true);
			syncActiveShotCameraDocumentFromLiveCamera();
			updateUi();
		});
	}

	function getActiveShotCameraLocalAxis(axis) {
		const shotCamera = getActiveShotCamera();
		if (!shotCamera) {
			return null;
		}
		const forward = shotCamera
			.getWorldDirection(new THREE.Vector3())
			.normalize();
		const right = new THREE.Vector3()
			.crossVectors(forward, shotCamera.up)
			.normalize();
		const up = new THREE.Vector3().crossVectors(right, forward).normalize();

		switch (axis) {
			case "right":
				return right;
			case "up":
				return up;
			case "forward":
				return forward;
			default:
				return null;
		}
	}

	function moveActiveShotCameraLocalAxis(axis, distance) {
		const numericDistance = Number(distance);
		if (
			!Number.isFinite(numericDistance) ||
			Math.abs(numericDistance) <= 1e-8
		) {
			return false;
		}

		const shotCamera = getActiveShotCamera();
		const axisVector = getActiveShotCameraLocalAxis(axis);
		if (!shotCamera || !(axisVector instanceof THREE.Vector3)) {
			return false;
		}

		shotCamera.position.addScaledVector(axisVector, numericDistance);
		shotCamera.updateMatrixWorld(true);
		syncActiveShotCameraDocumentFromLiveCamera();
		updateUi();
		return true;
	}

	function setShotCameraExportName(nextValue) {
		runHistoryAction?.("camera.export-name", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportName: String(nextValue ?? ""),
				};
				return documentState;
			});
		});
	}

	function setShotCameraExportFormat(nextValue) {
		const exportFormat = normalizeShotCameraExportFormat(nextValue);
		runHistoryAction?.("camera.export-format", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportFormat,
				};
				return documentState;
			});
		});
		updateUi();
		setStatus(
			t("status.shotCameraExportFormat", {
				format: t(`exportFormat.${exportFormat}`),
			}),
		);
	}

	function setShotCameraExportGridOverlay(nextValue) {
		const exportGridOverlay = Boolean(nextValue);
		runHistoryAction?.("camera.export-grid", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportGridOverlay,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportGridLayerMode(nextValue) {
		const exportGridLayerMode = nextValue === "overlay" ? "overlay" : "bottom";
		runHistoryAction?.("camera.export-grid-layer", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportGridLayerMode,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportModelLayers(nextValue) {
		const exportModelLayers = Boolean(nextValue);
		runHistoryAction?.("camera.export-model-layers", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportModelLayers,
					exportSplatLayers:
						exportModelLayers &&
						documentState.exportSettings?.exportFormat === "psd" &&
						Boolean(documentState.exportSettings?.exportSplatLayers),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraExportSplatLayers(nextValue) {
		const exportSplatLayers = Boolean(nextValue);
		runHistoryAction?.("camera.export-splat-layers", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.exportSettings = {
					...documentState.exportSettings,
					exportSplatLayers:
						documentState.exportSettings?.exportFormat === "psd" &&
						Boolean(documentState.exportSettings?.exportModelLayers) &&
						exportSplatLayers,
				};
				return documentState;
			});
		});
		updateUi();
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

	function createShotCamera() {
		const nextDocument = createWorkspaceShotCameraDocument();
		runHistoryAction?.("camera.create", () => {
			setShotCameraDocuments([
				...store.workspace.shotCameras.value,
				nextDocument,
			]);

			const entry = shotCameraRegistry.get(nextDocument.id);
			if (entry) {
				placeCameraAtHome(entry.camera, "camera");
				syncShotCameraEntryFromDocument(entry);
			}

			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextDocument.id;
			syncActiveShotCameraDocumentFromLiveCamera();
			clearFrameDrag();
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
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
		runHistoryAction?.("camera.duplicate", () => {
			setShotCameraDocuments([
				...store.workspace.shotCameras.value,
				nextDocument,
			]);

			const entry = shotCameraRegistry.get(nextDocument.id);
			if (entry) {
				copyPose(activeEntry.camera, entry.camera);
				syncShotCameraEntryFromDocument(entry);
			}

			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextDocument.id;
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
		setStatus(
			t("status.duplicatedShotCamera", {
				name: nextDocument.name,
			}),
		);
	}

	function deleteActiveShotCamera() {
		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument || store.workspace.shotCameras.value.length <= 1) {
			return;
		}

		const currentDocuments = store.workspace.shotCameras.value;
		const activeIndex = currentDocuments.findIndex(
			(documentState) => documentState.id === activeDocument.id,
		);
		const nextDocuments = currentDocuments.filter(
			(documentState) => documentState.id !== activeDocument.id,
		);
		const nextActiveDocument =
			nextDocuments[Math.min(activeIndex, nextDocuments.length - 1)] ??
			nextDocuments[0] ??
			null;
		if (!nextActiveDocument) {
			return;
		}

		runHistoryAction?.("camera.delete", () => {
			setShotCameraDocuments(nextDocuments);
			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextActiveDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextActiveDocument.id;
			clearFrameDrag();
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextActiveDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
		setStatus(
			t("status.deletedShotCamera", {
				name: activeDocument.name,
			}),
		);
	}

	function copyViewportToShotCamera() {
		const shotCamera = getActiveShotCamera();
		runHistoryAction?.("camera.copy-viewport", () => {
			copyPose(getViewportCameraForShotCopy?.() ?? viewportCamera, shotCamera);
			state.baseFovX = state.viewportBaseFovX;
			syncActiveShotCameraDocumentFromLiveCamera({
				includeLens: true,
				baseFovX: state.viewportBaseFovX,
			});
			if (state.mode === WORKSPACE_PANE_CAMERA) {
				syncControlsToMode();
			} else {
				clearControlMomentum();
			}
			updateUi();
		});
		setStatus(t("status.copiedViewportToShot"));
	}

	function copyShotCameraToViewport() {
		const shotCamera = getActiveShotCamera();
		runHistoryAction?.("viewport.copy-shot", () => {
			prepareViewportPerspectiveMode?.();
			const targetViewportCamera =
				getViewportPerspectiveCamera?.() ?? viewportCamera;
			const forward = shotCamera
				.getWorldDirection(new THREE.Vector3())
				.normalize();
			const target = shotCamera.position.clone().add(forward);
			targetViewportCamera.position.copy(shotCamera.position);
			targetViewportCamera.up.set(0, 1, 0);
			targetViewportCamera.lookAt(target);
			targetViewportCamera.updateMatrixWorld();
			if (state.mode === WORKSPACE_PANE_VIEWPORT) {
				syncControlsToMode();
			} else {
				clearControlMomentum();
			}
			updateUi();
		});
		setStatus(t("status.copiedShotToViewport"));
	}

	function resetActiveView() {
		runHistoryAction?.("camera.reset-view", () => {
			if (state.mode === WORKSPACE_PANE_CAMERA) {
				const shotCamera = getActiveShotCamera();
				placeCameraAtHome(shotCamera, "camera");
				syncActiveShotCameraDocumentFromLiveCamera();
				syncActiveShotCameraFromDocument();
				setStatus(t("status.resetCamera"));
			} else {
				if (!resetViewportView?.()) {
					placeCameraAtHome(viewportCamera, "viewport");
				}
				setStatus(t("status.resetViewport"));
			}
			syncControlsToMode();
			updateUi();
		});
	}

	function applyActiveShotCameraRoll(axisWorld, deltaRadians) {
		if (state.mode !== WORKSPACE_PANE_CAMERA) {
			return false;
		}

		const shotCamera = getActiveShotCamera();
		if (
			!shotCamera ||
			!(axisWorld instanceof THREE.Vector3) ||
			axisWorld.lengthSq() <= 1e-6 ||
			!Number.isFinite(deltaRadians) ||
			Math.abs(deltaRadians) <= 1e-7
		) {
			return false;
		}

		const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
			axisWorld.clone().normalize(),
			deltaRadians,
		);
		shotCamera.quaternion.premultiply(deltaQuaternion);
		shotCamera.up.applyQuaternion(deltaQuaternion).normalize();
		shotCamera.updateMatrixWorld(true);
		return true;
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
		setViewportBaseFovX,
		setShotCameraClippingMode,
		setShotCameraNear,
		setShotCameraFar,
		setShotCameraRollLock,
		syncActiveShotCameraDocumentFromLiveCamera,
		setActiveShotCameraPositionAxis,
		moveActiveShotCameraLocalAxis,
		setShotCameraName,
		setShotCameraExportName,
		setShotCameraExportFormat,
		setShotCameraExportGridOverlay,
		setShotCameraExportGridLayerMode,
		setShotCameraExportModelLayers,
		setShotCameraExportSplatLayers,
		selectShotCamera,
		createShotCamera,
		duplicateActiveShotCamera,
		deleteActiveShotCamera,
		copyViewportToShotCamera,
		copyShotCameraToViewport,
		resetActiveView,
		applyActiveShotCameraRoll,
	};
}

export function sanitizeExportName(value) {
	return String(value ?? "")
		.trim()
		.replace(/[\\/:*?"<>|]+/g, "-")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

export function resolveShotCameraExportNameTemplate(
	templateValue,
	shotCameraName = "",
) {
	const template = String(templateValue ?? "").trim();
	if (!template) {
		return "";
	}
	const replacement = String(shotCameraName ?? "").trim() || "Camera";
	return template.replace(/%cam/g, replacement);
}

export function getShotCameraExportBaseNameForDocument(
	documentState,
	fallbackIndex = 1,
	buildShotCameraDocumentName = (nextNumber) => `Camera ${nextNumber}`,
) {
	const shotCameraName =
		documentState?.name || buildShotCameraDocumentName(fallbackIndex);
	const candidate =
		resolveShotCameraExportNameTemplate(
			documentState?.exportSettings?.exportName,
			shotCameraName,
		) ||
		documentState?.name ||
		buildShotCameraDocumentName(fallbackIndex);

	return sanitizeExportName(candidate) || `camera-${fallbackIndex}`;
}
