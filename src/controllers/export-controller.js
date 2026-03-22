import * as THREE from "three";

export function createExportController({
	scene,
	renderer,
	spark,
	guides,
	shotCameraRegistry,
	store,
	exportCanvas,
	flipPixels,
	drawFramesToContext,
	t,
	setStatus,
	setExportStatus,
	updateUi,
	getTotalLoadedItems,
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
	let outputRenderTarget = null;
	let exportRenderLock = false;

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

	function ensureOutputRenderTarget(
		documentState = getActiveShotCameraDocument(),
	) {
		const { width, height } = getOutputSizeState(documentState);
		const needsNewTarget =
			!outputRenderTarget ||
			outputRenderTarget.width !== width ||
			outputRenderTarget.height !== height;

		if (!needsNewTarget) {
			return outputRenderTarget;
		}

		outputRenderTarget?.dispose();
		outputRenderTarget = new THREE.WebGLRenderTarget(width, height, {
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			depthBuffer: true,
			stencilBuffer: false,
			generateMipmaps: false,
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
		});
		outputRenderTarget.texture.colorSpace = THREE.SRGBColorSpace;

		return outputRenderTarget;
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
		const previousSparkEncodeLinear = spark.encodeLinear;
		const previousHelperVisibility = new Map();
		const target = ensureOutputRenderTarget(targetDocument);

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
			const pixels = new Uint8Array(width * height * 4);
			const previousTarget = renderer.getRenderTarget();
			const previousAutoClear = renderer.autoClear;
			spark.autoUpdate = false;
			spark.encodeLinear = true;
			await spark.update({ scene, camera: outputCamera });

			try {
				renderer.setRenderTarget(target);
				renderer.autoClear = true;
				renderer.clear(true, true, true);
				renderer.render(scene, outputCamera);
			} finally {
				renderer.setRenderTarget(previousTarget);
				renderer.autoClear = previousAutoClear;
			}

			await renderer.readRenderTargetPixelsAsync(
				target,
				0,
				0,
				width,
				height,
				pixels,
			);
			const flipped = flipPixels(pixels, width, height);
			return { width, height, pixels: flipped };
		} finally {
			exportRenderLock = false;
			spark.autoUpdate = previousSparkAutoUpdate;
			spark.encodeLinear = previousSparkEncodeLinear;
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

	async function renderOutputSnapshot() {
		return renderOutputSnapshotForShotCamera(
			store.workspace.activeShotCameraId.value,
		);
	}

	function renderCompositeOutputCanvas(
		{ width, height, pixels },
		frames = getActiveFrames(),
	) {
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}

		const imageData = context.createImageData(width, height);
		imageData.data.set(pixels);
		context.putImageData(imageData, 0, 0);
		drawFramesToContext(context, width, height, frames, {
			logicalSpaceWidth: width,
			logicalSpaceHeight: height,
			strokeStyle: "#ff0000",
		});

		return canvas;
	}

	function drawOutputPreview(snapshot, frames = getActiveFrames()) {
		const context = exportCanvas.getContext("2d");
		if (!context) {
			throw new Error(t("error.previewContext"));
		}

		const compositeCanvas = renderCompositeOutputCanvas(snapshot, frames);
		exportCanvas.width = snapshot.width;
		exportCanvas.height = snapshot.height;
		exportCanvas.style.aspectRatio = `${snapshot.width} / ${snapshot.height}`;
		context.clearRect(0, 0, snapshot.width, snapshot.height);
		context.drawImage(compositeCanvas, 0, 0);
		return compositeCanvas;
	}

	async function refreshOutputPreview() {
		setExportStatus("export.rendering", true);

		try {
			const snapshot = await renderOutputSnapshot();
			drawOutputPreview(snapshot);
			store.exportSummary.value = t("exportSummary.refreshed", {
				width: snapshot.width,
				height: snapshot.height,
			});
			setExportStatus("export.ready");
			setStatus(t("status.exportPreviewUpdated"));
		} catch (error) {
			console.error(error);
			store.exportSummary.value = error.message;
			setExportStatus("export.idle");
			setStatus(error.message);
		}
	}

	async function downloadPng() {
		setExportStatus("export.exporting", true);

		try {
			const targetDocuments = getExportTargetShotCameras();
			if (targetDocuments.length === 0) {
				throw new Error(t("error.exportRequiresPreset"));
			}

			const activeShotCameraId = store.workspace.activeShotCameraId.value;
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

				if (
					targetDocuments.length === 1 &&
					documentState.id === activeShotCameraId
				) {
					drawOutputPreview(snapshot, documentState.frames ?? []);
				}

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
		outputRenderTarget?.dispose();
	}

	return {
		getExportTargetShotCameras,
		ensureOutputRenderTarget,
		renderOutputSnapshot,
		renderOutputSnapshotForShotCamera,
		renderCompositeOutputCanvas,
		drawOutputPreview,
		refreshOutputPreview,
		downloadPng,
		buildShotCameraExportFilename,
		setExportTarget,
		toggleExportPreset,
		isRenderLocked,
		dispose,
	};
}
