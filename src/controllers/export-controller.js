import {
	createExportBundle,
	createExportPass,
	createPixelLayer,
	createRasterLayer,
	renderExportBundleToCanvas,
} from "../engine/export-bundle.js";
import { buildExportPassPlan } from "../engine/export-pass-plan.js";
import {
	buildExportReadinessPlan,
	finalizeExportReadiness,
} from "../engine/export-readiness.js";
import { createSparkExportRendererManager } from "../engine/spark-export-renderer.js";

export function createExportController({
	scene,
	spark,
	guides,
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
	let exportRenderLock = false;
	const exportRenderBackend = createSparkExportRendererManager({
		sourceSpark: spark,
	});

	function getNowMs() {
		if (typeof performance !== "undefined" && performance.now) {
			return performance.now();
		}

		return Date.now();
	}

	function getExportTargetShotCameras() {
		const target = store.exportOptions.target.value;
		if (target === "all") {
			return [...store.workspace.shotCameras.value];
		}

		if (target === "selected") {
			const selectedIds = new Set(store.exportOptions.presetIds.value);
			return store.workspace.shotCameras.value.filter((documentState) =>
				selectedIds.has(documentState.id),
			);
		}

		const activeDocument = getActiveShotCameraDocument();
		return activeDocument ? [activeDocument] : [];
	}

	function getSceneAssetExportOrder() {
		return getSceneAssets().map((asset) => ({
			id: asset.id,
			kind: asset.kind,
			label: asset.label,
			exportRole: asset.exportRole ?? "beauty",
			maskGroup: asset.maskGroup ?? "",
		}));
	}

	async function renderScenePixelsWithReadiness({
		scene,
		camera,
		width,
		height,
		sceneAssets,
	}) {
		const readinessPlan = buildExportReadinessPlan({
			sceneAssets,
		});
		const deadline = getNowMs() + readinessPlan.maxWaitMs;
		let completedWarmupPasses = 0;

		while (
			completedWarmupPasses < readinessPlan.warmupPasses &&
			getNowMs() <= deadline
		) {
			await exportRenderBackend.prepareFrame({
				scene,
				camera,
				width,
				height,
				update: true,
			});
			await exportRenderBackend.renderFrame({
				scene,
				camera,
				width,
				height,
			});
			completedWarmupPasses += 1;
		}

		await exportRenderBackend.prepareFrame({
			scene,
			camera,
			width,
			height,
			update: true,
		});
		await exportRenderBackend.renderFrame({
			scene,
			camera,
			width,
			height,
		});

		return {
			pixels: await exportRenderBackend.readPixels({
				width,
				height,
			}),
			readiness: finalizeExportReadiness(readinessPlan, {
				completedWarmupPasses,
				timedOut: completedWarmupPasses < readinessPlan.warmupPasses,
			}),
		};
	}

	async function renderOutputSnapshotForShotCamera(shotCameraId) {
		if (getTotalLoadedItems() === 0) {
			throw new Error(t("error.exportRequiresAsset"));
		}

		const targetDocument = getShotCameraDocument(shotCameraId);
		const previousShotCameraId = store.workspace.activeShotCameraId.value;
		const shouldRestore = shotCameraId && shotCameraId !== previousShotCameraId;
		const previousGuidesVisible = guides.visible;
		const previousSparkAutoUpdate = spark.autoUpdate;
		const previousHelperVisibility = new Map();

		for (const [entryId, entry] of shotCameraRegistry.entries()) {
			previousHelperVisibility.set(entryId, entry.helper.visible);
			entry.helper.visible = false;
		}

		guides.visible = Boolean(targetDocument?.exportSettings?.exportGridOverlay);

		if (shouldRestore) {
			store.workspace.activeShotCameraId.value = shotCameraId;
		}

		try {
			exportRenderLock = true;
			syncActiveShotCameraFromDocument();
			syncShotProjection();
			syncOutputCamera();

			const outputCamera = getActiveOutputCamera();
			const { width, height } = getOutputSizeState(targetDocument);
			const sceneAssets = getSceneAssetExportOrder();
			spark.autoUpdate = false;
			const sceneCapture = await renderScenePixelsWithReadiness({
				scene,
				camera: outputCamera,
				width,
				height,
				sceneAssets,
			});
			const flipped = flipPixels(sceneCapture.pixels, width, height);
			return {
				width,
				height,
				pixels: flipped,
				sceneAssets,
				readiness: sceneCapture.readiness,
			};
		} finally {
			exportRenderLock = false;
			spark.autoUpdate = previousSparkAutoUpdate;
			guides.visible = previousGuidesVisible;
			for (const [entryId, entry] of shotCameraRegistry.entries()) {
				entry.helper.visible = previousHelperVisibility.get(entryId) ?? false;
			}

			if (shouldRestore) {
				store.workspace.activeShotCameraId.value = previousShotCameraId;
				syncActiveShotCameraFromDocument();
				syncShotProjection();
				syncOutputCamera();
			}

			updateShotCameraHelpers();
		}
	}

	function buildShotCameraExportFilename(
		documentState,
		snapshot,
		sequenceIndex = null,
	) {
		const fallbackIndex =
			store.workspace.shotCameras.value.findIndex(
				(shotCamera) => shotCamera.id === documentState?.id,
			) + 1;
		const baseName = getShotCameraExportBaseName(documentState, fallbackIndex);
		const sequenceSuffix =
			Number.isFinite(sequenceIndex) && sequenceIndex > 0
				? `-${String(sequenceIndex).padStart(2, "0")}`
				: "";
		return `${baseName}${sequenceSuffix}-${snapshot.width}x${snapshot.height}.png`;
	}

	function renderFrameOverlayLayer(width, height, frames = getActiveFrames()) {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}

		context.clearRect(0, 0, width, height);
		drawFramesToContext(context, width, height, frames, {
			logicalSpaceWidth: width,
			logicalSpaceHeight: height,
			strokeStyle: "#ff0000",
		});

		return createRasterLayer({
			name: "FRAME",
			canvas,
			category: "frame",
		});
	}

	function buildExportBundle(
		{ width, height, pixels, sceneAssets = [], readiness = null },
		frames = getActiveFrames(),
	) {
		const passPlan = buildExportPassPlan(sceneAssets);
		return createExportBundle({
			width,
			height,
			sceneAssets,
			readiness,
			passes: [
				createExportPass({
					id: passPlan.beauty.id,
					name: passPlan.beauty.name,
					category: passPlan.beauty.category,
					metadata: {
						sceneAssets,
						readiness,
						role: "beauty",
						assetIds: passPlan.beauty.assetIds,
					},
					layers: [
						createPixelLayer({
							name: "Render",
							pixels,
							width,
							height,
							category: "render",
							metadata: {
								sceneAssets,
								readiness,
								passId: "beauty",
								assetIds: passPlan.beauty.assetIds,
							},
						}),
					],
				}),
				createExportPass({
					id: "frame-overlay",
					name: "Frame Overlay",
					category: "overlay",
					metadata: {
						role: "frame-overlay",
					},
					layers: [renderFrameOverlayLayer(width, height, frames)],
				}),
				...passPlan.masks.map((maskPass) =>
					createExportPass({
						id: maskPass.id,
						name: maskPass.name,
						category: maskPass.category,
						metadata: {
							role: "mask",
							maskGroup: maskPass.maskGroup,
							assetIds: maskPass.assetIds,
						},
						layers: [],
						enabled: false,
					}),
				),
			],
		});
	}

	function renderCompositeOutputCanvas(snapshot, frames = getActiveFrames()) {
		return renderExportBundleToCanvas(buildExportBundle(snapshot, frames));
	}

	async function downloadPng() {
		setExportStatus("export.exporting", true);

		try {
			const targetDocuments = getExportTargetShotCameras();
			if (targetDocuments.length === 0) {
				throw new Error(t("error.exportRequiresPreset"));
			}

			let lastSnapshot = null;

			for (const [index, documentState] of targetDocuments.entries()) {
				const snapshot = await renderOutputSnapshotForShotCamera(
					documentState.id,
				);
				const compositeCanvas = renderCompositeOutputCanvas(
					snapshot,
					documentState.frames ?? [],
				);
				const link = document.createElement("a");
				link.href = compositeCanvas.toDataURL("image/png");
				link.download = buildShotCameraExportFilename(
					documentState,
					snapshot,
					targetDocuments.length > 1 ? index + 1 : null,
				);
				link.click();

				lastSnapshot = snapshot;
			}

			if (targetDocuments.length === 1 && lastSnapshot) {
				store.exportSummary.value = t("exportSummary.exported", {
					width: lastSnapshot.width,
					height: lastSnapshot.height,
				});
				setStatus(t("status.pngExported"));
			} else {
				store.exportSummary.value = t("exportSummary.exportedBatch", {
					count: targetDocuments.length,
				});
				setStatus(
					t("status.pngExportedBatch", {
						count: targetDocuments.length,
					}),
				);
			}
			setExportStatus("export.ready");
			updateUi();
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
		}
	}

	function setExportTarget(nextValue) {
		const target =
			nextValue === "all" || nextValue === "selected" ? nextValue : "current";
		store.exportOptions.target.value = target;
		if (
			target === "selected" &&
			store.exportOptions.presetIds.value.length === 0 &&
			store.workspace.activeShotCameraId.value
		) {
			store.exportOptions.presetIds.value = [
				store.workspace.activeShotCameraId.value,
			];
		}
		setStatus(
			t("status.exportTargetChanged", {
				target: t(`exportTarget.${target}`),
			}),
		);
	}

	function toggleExportPreset(shotCameraId) {
		const nextIds = new Set(store.exportOptions.presetIds.value);
		if (nextIds.has(shotCameraId)) {
			nextIds.delete(shotCameraId);
		} else {
			nextIds.add(shotCameraId);
		}

		store.exportOptions.presetIds.value = store.workspace.shotCameras.value
			.filter((documentState) => nextIds.has(documentState.id))
			.map((documentState) => documentState.id);
		setStatus(
			t("status.exportPresetSelection", {
				count: store.exportOptions.presetIds.value.length,
			}),
		);
	}

	function isRenderLocked() {
		return exportRenderLock;
	}

	function dispose() {
		exportRenderBackend.dispose();
	}

	return {
		getExportTargetShotCameras,
		renderOutputSnapshotForShotCamera,
		buildExportBundle,
		renderCompositeOutputCanvas,
		downloadPng,
		buildShotCameraExportFilename,
		setExportTarget,
		toggleExportPreset,
		isRenderLocked,
		dispose,
	};
}
