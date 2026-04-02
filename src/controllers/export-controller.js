import { IS_DEV_RUNTIME, hasEnabledQueryFlag } from "../build-info.js";
import {
	getAllExportBundlePasses,
	renderExportPassToCanvas,
} from "../engine/export-bundle.js";
import { buildSnapshotExportBundle } from "./export/bundle-build.js";
import { createCanvasFromPixels } from "./export/canvas-utils.js";
import {
	runOutputExport,
	runPngExport,
	runPsdExport,
} from "./export/download-actions.js";
import {
	buildShotCameraExportFilename as buildShotCameraExportFilenameHelper,
	createExportBundleFacade,
	createExportDownloadFacade,
	createPsdExportDocumentBuilder,
} from "./export/download-facade.js";
import {
	downloadPngFromSnapshot,
	downloadPsdFromSnapshot,
	renderCompositeOutputCanvas,
} from "./export/output-download.js";
import { createExportOutputRuntime } from "./export/output-runtime.js";
import {
	clearExportOverlay as clearExportOverlayHelper,
	createExportOptionsFacade,
	setExportProgressOverlay as setExportProgressOverlayHelper,
	showExportErrorOverlay as showExportErrorOverlayHelper,
} from "./export/presentation.js";
import {
	buildExportProgressOverlay,
	getExportPhaseDefaultDetail,
} from "./export/progress.js";
import { buildPsdExportDocument as buildPsdDocument } from "./export/psd-document.js";
import {
	getShotCameraExportSettings,
	resolveExportTargetShotCameras,
} from "./export/targets.js";

export function createExportController({
	scene,
	renderer,
	spark,
	guides,
	guideOverlay,
	shotCameraRegistry,
	store,
	flipPixels,
	drawFramesToContext,
	t,
	setStatus,
	setExportStatus,
	updateUi,
	getTotalLoadedItems,
	getSceneAssets,
	getShotCameraDocument,
	getActiveShotCameraDocument,
	getActiveOutputCamera,
	getActiveFrames,
	getOutputSizeState,
	getShotCameraExportBaseName,
	syncActiveShotCameraFromDocument,
	syncShotProjection,
	syncOutputCamera,
	updateShotCameraHelpers,
}) {
	const exportDebugLayersEnabled =
		IS_DEV_RUNTIME && hasEnabledQueryFlag("psdDebug");

	function setExportProgressOverlay(
		targetDocuments,
		currentIndex,
		exportFormat,
		startedAt,
		phaseState = null,
	) {
		return setExportProgressOverlayHelper(
			targetDocuments,
			currentIndex,
			exportFormat,
			startedAt,
			phaseState,
			{
				store,
				t,
				buildExportProgressOverlay,
			},
		);
	}

	function clearExportOverlay() {
		return clearExportOverlayHelper(store);
	}

	function showExportErrorOverlay(error) {
		return showExportErrorOverlayHelper(error, {
			store,
			t,
			clearExportOverlay: clearExportOverlayHelper,
		});
	}

	function getExportTargetShotCameras() {
		return resolveExportTargetShotCameras({
			store,
			getActiveShotCameraDocument,
		});
	}

	const outputRuntime = createExportOutputRuntime({
		scene,
		renderer,
		spark,
		guides,
		guideOverlay,
		shotCameraRegistry,
		store,
		flipPixels,
		t,
		getSceneAssets,
		getShotCameraDocument,
		getActiveOutputCamera,
		getOutputSizeState,
		syncActiveShotCameraFromDocument,
		syncShotProjection,
		syncOutputCamera,
		updateShotCameraHelpers,
		exportDebugLayersEnabled,
	});

	const buildShotCameraExportFilename = (...args) =>
		buildShotCameraExportFilenameHelper(...args, {
			shotCameras: store.workspace.shotCameras.value,
			getShotCameraExportBaseName,
		});

	const buildPsdExportDocument = createPsdExportDocumentBuilder({
		getFrames: getActiveFrames,
		t,
		exportDebugLayersEnabled,
		createCanvasFromPixels,
		renderExportPassToCanvas,
		buildPsdDocument,
	});

	const { downloadPng, downloadPsd, downloadOutput } =
		createExportDownloadFacade({
			getTargetDocuments: getExportTargetShotCameras,
			getExportSettings: getShotCameraExportSettings,
			renderSnapshot: outputRuntime.renderOutputSnapshotForShotCamera,
			downloadPngFromSnapshot,
			downloadPsdFromSnapshot,
			drawFramesToContext,
			previewContextError: t("error.previewContext"),
			buildFilename: buildShotCameraExportFilename,
			buildPsdExportDocument,
			setExportStatus,
			setSummary: (value) => {
				store.exportSummary.value = value;
			},
			setStatus,
			updateUi,
			clearExportOverlay,
			showExportErrorOverlay,
			setExportProgressOverlay,
			getPhaseDefaultDetail: getExportPhaseDefaultDetail,
			requireTargetsMessage: t("error.exportRequiresPreset"),
			t,
			runPngExportFn: runPngExport,
			runPsdExportFn: runPsdExport,
			runOutputExportFn: runOutputExport,
		});

	const exportBundleFacade = createExportBundleFacade({
		getFrames: getActiveFrames,
		drawFramesToContext,
		previewContextError: t("error.previewContext"),
		buildSnapshotExportBundle,
		renderCompositeOutputCanvas,
	});

	const {
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
	} = createExportOptionsFacade({
		store,
		t,
		setStatus,
	});

	function isRenderLocked() {
		return exportRenderLock;
	}

	function dispose() {
		exportRenderBackend.dispose();
	}

	return {
		getExportTargetShotCameras,
		renderOutputSnapshotForShotCamera:
			outputRuntime.renderOutputSnapshotForShotCamera,
		buildExportBundle: exportBundleFacade.buildExportBundle,
		renderCompositeOutputCanvas: exportBundleFacade.renderCompositeOutputCanvas,
		downloadPng,
		downloadPsd,
		downloadOutput,
		buildShotCameraExportFilename,
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
		isRenderLocked: outputRuntime.isRenderLocked,
		dispose: outputRuntime.dispose,
	};
}
