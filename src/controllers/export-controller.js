import { getActiveAnimationClip } from "../animation/animation-model.js";
import { IS_DEV_RUNTIME, hasEnabledQueryFlag } from "../build-info.js";
import { renderExportPassToCanvas } from "../engine/export-bundle.js";
import { createZipBlob, downloadBlob } from "./export/archive-download.js";
import { buildSnapshotExportBundle } from "./export/bundle-build.js";
import { createCanvasFromPixels } from "./export/canvas-utils.js";
import {
	runFrameSequenceExport,
	runOutputExport,
	runPngExport,
	runPsdExport,
	runVideoExport,
} from "./export/download-actions.js";
import {
	buildShotCameraExportFilename as buildShotCameraExportFilenameHelper,
	createExportBundleFacade,
	createExportDownloadFacade,
	createPsdExportDocumentBuilder,
} from "./export/download-facade.js";
import {
	createPngBlobFromSnapshot,
	createPsdBlobFromSnapshot,
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
import {
	createWebmFromFrameRenderer,
	isWebmVideoExportSupported,
} from "./export/video-download.js";
import { createExportAbortError } from "./export/cancel.js";

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
	getAnimationController = () => null,
}) {
	const exportDebugLayersEnabled =
		IS_DEV_RUNTIME && hasEnabledQueryFlag("psdDebug");
	let activeExportAbortController = null;

	function beginExportRun() {
		if (activeExportAbortController?.signal?.aborted === false) {
			activeExportAbortController.abort(createExportAbortError());
		}
		activeExportAbortController = new AbortController();
		return activeExportAbortController.signal;
	}

	function finishExportRun(abortSignal) {
		if (activeExportAbortController?.signal === abortSignal) {
			activeExportAbortController = null;
		}
	}

	function cancelExport() {
		if (!activeExportAbortController?.signal) {
			return false;
		}
		if (activeExportAbortController.signal.aborted) {
			return false;
		}
		activeExportAbortController.abort(createExportAbortError());
		setStatus(t("status.exportCancelRequested"));
		return true;
	}

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
				onCancel: cancelExport,
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
		getAnimationController,
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
			getExportMode: () => store.exportOptions.mode.value,
			getExportFrameSource: () => store.exportOptions.frameSource.value,
			getAnimationDocument: () => store.animation.document.value,
			getVideoExportFps: () =>
				getActiveAnimationClip(store.animation.document.value)?.fps ?? 24,
			isVideoExportSupported: isWebmVideoExportSupported,
			renderSnapshot: outputRuntime.renderOutputSnapshotForShotCamera,
			downloadPngFromSnapshot,
			downloadPsdFromSnapshot,
			createPngBlobFromSnapshot,
			createPsdBlobFromSnapshot,
			createZipBlob,
			downloadBlob,
			createWebmFromFrameRenderer,
			renderCompositeOutputCanvas,
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
			beginExportRun,
			finishExportRun,
			clearExportOverlay,
			showExportErrorOverlay,
			setExportProgressOverlay,
			getPhaseDefaultDetail: getExportPhaseDefaultDetail,
			requireTargetsMessage: t("error.exportRequiresPreset"),
			t,
			runPngExportFn: runPngExport,
			runPsdExportFn: runPsdExport,
			runOutputExportFn: runOutputExport,
			runFrameSequenceExportFn: runFrameSequenceExport,
			runVideoExportFn: runVideoExport,
		});

	const exportBundleFacade = createExportBundleFacade({
		getFrames: getActiveFrames,
		drawFramesToContext,
		previewContextError: t("error.previewContext"),
		buildSnapshotExportBundle,
		renderCompositeOutputCanvas,
	});

	const {
		setExportMode,
		setExportFrameSource,
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
	} = createExportOptionsFacade({
		store,
		t,
		setStatus,
	});

	return {
		getExportTargetShotCameras,
		renderOutputSnapshotForShotCamera:
			outputRuntime.renderOutputSnapshotForShotCamera,
		buildExportBundle: exportBundleFacade.buildExportBundle,
		renderCompositeOutputCanvas: exportBundleFacade.renderCompositeOutputCanvas,
		downloadPng,
		downloadPsd,
		downloadOutput,
		cancelExport,
		buildShotCameraExportFilename,
		setExportMode,
		setExportFrameSource,
		setExportTarget,
		toggleExportPreset,
		setReferenceImageExportSessionEnabled,
		isRenderLocked: outputRuntime.isRenderLocked,
		__debugSetExportReadinessPolicyOverride:
			outputRuntime.setReadinessPolicyOverride,
		__debugGetExportReadinessPolicyOverride:
			outputRuntime.getReadinessPolicyOverride,
		__debugGetLastExportReadiness: outputRuntime.getLastExportReadiness,
		dispose: outputRuntime.dispose,
	};
}
