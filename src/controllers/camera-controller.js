import { createCameraActiveShotController } from "./camera/active-shot.js";
import { createCameraDocumentOpsController } from "./camera/document-ops.js";
import { createCameraExportSettingsController } from "./camera/export-naming.js";
import { createCameraLensClippingController } from "./camera/lens-clipping.js";
import { createCameraPoseController } from "./camera/pose.js";
import { createCameraPropertiesController } from "./camera/properties.js";
import { createCameraViewSyncController } from "./camera/view-sync.js";

export {
	getShotCameraExportBaseNameForDocument,
	resolveShotCameraExportNameTemplate,
	sanitizeExportName,
} from "./camera/export-naming.js";

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
	const activeShot = createCameraActiveShotController({
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
		beforeActiveShotCameraChange,
		afterActiveShotCameraChange,
	});

	const pose = createCameraPoseController({
		state,
		getActiveShotCamera: activeShot.getActiveShotCamera,
		updateActiveShotCameraDocument: activeShot.updateActiveShotCameraDocument,
	});

	const lensClipping = createCameraLensClippingController({
		store,
		state,
		runHistoryAction,
		updateUi,
		setStatus,
		t,
		horizontalToVerticalFovDegrees,
		getShotCameraDocument: activeShot.getShotCameraDocument,
		updateActiveShotCameraDocument: activeShot.updateActiveShotCameraDocument,
		getActiveShotCameraEntry: activeShot.getActiveShotCameraEntry,
		getAutoClipRange,
	});

	const properties = createCameraPropertiesController({
		runHistoryAction,
		updateUi,
		getActiveShotCamera: activeShot.getActiveShotCamera,
		updateActiveShotCameraDocument: activeShot.updateActiveShotCameraDocument,
		syncActiveShotCameraDocumentFromLiveCamera:
			pose.syncActiveShotCameraDocumentFromLiveCamera,
	});

	const exportSettings = createCameraExportSettingsController({
		runHistoryAction,
		updateUi,
		setStatus,
		t,
		updateActiveShotCameraDocument: activeShot.updateActiveShotCameraDocument,
	});

	const documentOps = createCameraDocumentOpsController({
		store,
		shotCameraRegistry,
		runHistoryAction,
		updateUi,
		setStatus,
		t,
		setShotCameraDocuments: activeShot.setShotCameraDocuments,
		syncShotCameraEntryFromDocument:
			lensClipping.syncShotCameraEntryFromDocument,
		syncActiveShotCameraDocumentFromLiveCamera:
			pose.syncActiveShotCameraDocumentFromLiveCamera,
		placeCameraAtHome,
		copyPose,
		getActiveShotCameraDocument: activeShot.getActiveShotCameraDocument,
		getActiveShotCameraEntry: activeShot.getActiveShotCameraEntry,
		beforeActiveShotCameraChange,
		afterActiveShotCameraChange,
		clearFrameDrag,
		clearOutputFramePan,
		clearControlMomentum,
	});

	const viewSync = createCameraViewSyncController({
		state,
		viewportCamera,
		runHistoryAction,
		updateUi,
		setStatus,
		t,
		getActiveShotCamera: activeShot.getActiveShotCamera,
		getViewportCameraForShotCopy,
		getViewportPerspectiveCamera,
		prepareViewportPerspectiveMode,
		resetViewportView,
		placeCameraAtHome,
		copyPose,
		syncControlsToMode,
		clearControlMomentum,
		syncActiveShotCameraDocumentFromLiveCamera:
			pose.syncActiveShotCameraDocumentFromLiveCamera,
		syncActiveShotCameraFromDocument:
			lensClipping.syncActiveShotCameraFromDocument,
	});

	return {
		registerShotCameraDocuments: activeShot.registerShotCameraDocuments,
		getActiveShotCameraEntry: activeShot.getActiveShotCameraEntry,
		getShotCameraDocument: activeShot.getShotCameraDocument,
		getActiveShotCameraDocument: activeShot.getActiveShotCameraDocument,
		updateActiveShotCameraDocument: activeShot.updateActiveShotCameraDocument,
		setShotCameraDocuments: activeShot.setShotCameraDocuments,
		getShotCameraExportBaseName: exportSettings.getShotCameraExportBaseName,
		getActiveShotCamera: activeShot.getActiveShotCamera,
		getActiveCameraViewCamera: activeShot.getActiveCameraViewCamera,
		getActiveOutputCamera: activeShot.getActiveOutputCamera,
		updateShotCameraHelpers: activeShot.updateShotCameraHelpers,
		syncShotCameraEntryFromDocument:
			lensClipping.syncShotCameraEntryFromDocument,
		syncActiveShotCameraFromDocument:
			lensClipping.syncActiveShotCameraFromDocument,
		setMode: activeShot.setMode,
		setBaseFovX: lensClipping.setBaseFovX,
		setViewportBaseFovX: lensClipping.setViewportBaseFovX,
		setShotCameraClippingMode: lensClipping.setShotCameraClippingMode,
		setShotCameraNear: lensClipping.setShotCameraNear,
		setShotCameraFar: lensClipping.setShotCameraFar,
		setShotCameraRollLock: properties.setShotCameraRollLock,
		syncActiveShotCameraDocumentFromLiveCamera:
			pose.syncActiveShotCameraDocumentFromLiveCamera,
		setActiveShotCameraPositionAxis: properties.setActiveShotCameraPositionAxis,
		moveActiveShotCameraLocalAxis: properties.moveActiveShotCameraLocalAxis,
		setShotCameraName: properties.setShotCameraName,
		setShotCameraExportName: exportSettings.setShotCameraExportName,
		setShotCameraExportFormat: exportSettings.setShotCameraExportFormat,
		setShotCameraExportGridOverlay:
			exportSettings.setShotCameraExportGridOverlay,
		setShotCameraExportGridLayerMode:
			exportSettings.setShotCameraExportGridLayerMode,
		setShotCameraExportModelLayers:
			exportSettings.setShotCameraExportModelLayers,
		setShotCameraExportSplatLayers:
			exportSettings.setShotCameraExportSplatLayers,
		selectShotCamera: activeShot.selectShotCamera,
		createShotCamera: documentOps.createShotCamera,
		duplicateActiveShotCamera: documentOps.duplicateActiveShotCamera,
		deleteActiveShotCamera: documentOps.deleteActiveShotCamera,
		copyViewportToShotCamera: viewSync.copyViewportToShotCamera,
		copyShotCameraToViewport: viewSync.copyShotCameraToViewport,
		resetActiveView: viewSync.resetActiveView,
		applyActiveShotCameraRoll: pose.applyActiveShotCameraRoll,
	};
}
