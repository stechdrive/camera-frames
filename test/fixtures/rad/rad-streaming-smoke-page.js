import {
	PagedSplats,
	SparkRenderer,
	SplatFileType,
	SplatMesh,
} from "@sparkjsdev/spark";
import * as THREE from "three";

const DEFAULT_FRAME_COUNT = 120;
const DEFAULT_TIMEOUT_MS = 45000;

export async function runRadStreamingSmoke({
	radBase64,
	radBundleBase64 = null,
	fixtureName = "tiny-splats-lod.rad",
	frameCount = DEFAULT_FRAME_COUNT,
	timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
	const startedAt = performance.now();
	const checks = [];
	const failures = [];
	const observations = {
		fixtureName,
		userAgent: navigator.userAgent,
	};

	let blobUrl = null;
	let canvas = null;
	let renderer = null;
	let spark = null;
	let mesh = null;
	let pagedSplats = null;
	let originalFetch = null;
	let radRuntime = null;

	const check = (name, ok, details = {}) => {
		const entry = { name, ok: Boolean(ok), details };
		checks.push(entry);
		if (!entry.ok) failures.push(entry);
	};

	try {
		const bundleInput = normalizeRadBundleInput({
			radBase64,
			radBundleBase64,
			fixtureName,
		});
		const radBytes = bundleInput.root.bytes;
		fixtureName = bundleInput.fixtureName;
		observations.fixtureName = fixtureName;
		observations.fixtureBytes = radBytes.byteLength;
		observations.bundleChunks = bundleInput.chunks.map((entry) => ({
			name: entry.name,
			byteLength: entry.bytes.byteLength,
		}));
		check("fixture-bytes", radBytes.byteLength > 0, {
			byteLength: radBytes.byteLength,
		});

		const blob = new Blob([radBytes], { type: "application/octet-stream" });
		blobUrl = URL.createObjectURL(blob);

		const blobRange = await probeBlobRange(blobUrl, radBytes.byteLength);
		observations.blobRange = blobRange;
		check(
			"blob-range-partial",
			blobRange.status === 206 &&
				blobRange.byteLength > 0 &&
				blobRange.byteLength < radBytes.byteLength,
			blobRange,
		);

		const serviceWorkerRange = await probeServiceWorkerRadBundle({
			rootName: bundleInput.root.name,
			rootBlob: blob,
			totalBytes: radBytes.byteLength,
			chunks: bundleInput.chunks,
		});
		radRuntime = serviceWorkerRange.runtime;
		observations.serviceWorkerRange = serviceWorkerRange.summary;
		check(
			"service-worker-range-partial",
			serviceWorkerRange.summary.status === 206 &&
				serviceWorkerRange.summary.byteLength > 0 &&
				serviceWorkerRange.summary.byteLength < radBytes.byteLength,
			serviceWorkerRange.summary,
		);

		const rootUrl = radRuntime?.rootUrl ?? blobUrl;
		const fetchLog = [];
		originalFetch = globalThis.fetch.bind(globalThis);
		globalThis.fetch = async (input, init) => {
			const requestUrl = getFetchUrl(input);
			const range = getFetchRange(input, init);
			const begin = performance.now();
			try {
				const response = await originalFetch(input, init);
				const clone = response.clone();
				let byteLength = null;
				try {
					byteLength = (await clone.arrayBuffer()).byteLength;
				} catch (error) {
					byteLength = null;
				}
				fetchLog.push({
					urlKind: requestUrl.startsWith("blob:") ? "blob" : "url",
					name: summarizeFetchName(requestUrl),
					range,
					status: response.status,
					ok: response.ok,
					contentRange: response.headers.get("Content-Range"),
					contentLength: response.headers.get("Content-Length"),
					byteLength,
					durationMs: roundMs(performance.now() - begin),
				});
				return response;
			} catch (error) {
				fetchLog.push({
					urlKind: requestUrl.startsWith("blob:") ? "blob" : "url",
					name: summarizeFetchName(requestUrl),
					range,
					ok: false,
					error: formatError(error),
					durationMs: roundMs(performance.now() - begin),
				});
				throw error;
			}
		};

		pagedSplats = new PagedSplats({
			rootUrl,
			fileType: SplatFileType.RAD,
		});
		const metaResult = await withTimeout(
			pagedSplats.getRadMeta(),
			timeoutMs,
			"RAD metadata read timed out",
		);
		const meta = metaResult.meta;
		observations.radMeta = summarizeRadMeta(metaResult);
		check(
			"rad-header-readable",
			Number.isFinite(meta?.version) &&
				Number.isFinite(meta?.count) &&
				meta.count > 0 &&
				Array.isArray(meta?.chunks) &&
				meta.chunks.length > 0,
			observations.radMeta,
		);

		mesh = new SplatMesh({
			paged: pagedSplats,
			editable: false,
			raycastable: false,
		});
		await withTimeout(
			mesh.initialized,
			timeoutMs,
			"SplatMesh initialization timed out",
		);
		check("mesh-initialized", mesh.isInitialized === true, {
			isInitialized: mesh.isInitialized,
			pagedAttached: mesh.paged === pagedSplats,
		});

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10);
		camera.position.set(0, 0, 1.2);
		camera.lookAt(0, 0, 0);
		camera.updateMatrixWorld(true);

		canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		canvas.style.cssText =
			"position:fixed;left:-10000px;top:-10000px;width:128px;height:128px";
		document.body.appendChild(canvas);

		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: false,
			alpha: false,
			preserveDrawingBuffer: true,
		});
		renderer.setPixelRatio(1);
		renderer.setSize(128, 128, false);

		spark = new SparkRenderer({
			renderer,
			enableLod: true,
			enableDriveLod: true,
			enableLodFetching: true,
			maxPagedSplats: 65536,
			numLodFetchers: 1,
		});
		scene.add(spark);
		scene.add(mesh);
		scene.updateMatrixWorld(true);

		const frameSamples = [];
		let renderedFrames = 0;
		for (let frame = 0; frame < frameCount; frame += 1) {
			renderer.render(scene, camera);
			renderedFrames += 1;
			if (frame % 10 === 0 || frame === frameCount - 1) {
				frameSamples.push(sampleFrame(frame, pagedSplats, fetchLog));
			}
			await nextAnimationFrame();
			if (
				renderedFrames >= 2 &&
				pagedSplats.numSplats > 0 &&
				hasChunkFetch(fetchLog)
			) {
				break;
			}
		}

		await waitForCondition(
			() => pagedSplats.numSplats > 0 || hasChunkFetch(fetchLog),
			Math.min(timeoutMs, 5000),
		).catch(() => {});
		renderer.render(scene, camera);
		renderedFrames += 1;
		frameSamples.push(sampleFrame("final", pagedSplats, fetchLog));

		observations.render = {
			renderedFrames,
			pagedNumSplats: pagedSplats.numSplats,
			pagerAttached: Boolean(pagedSplats.pager),
			frameSamples,
			centerPixel: readCenterPixel(renderer),
		};
		observations.fetchLog = fetchLog;
		observations.fetchSummary = summarizeFetches(fetchLog);
		observations.rootUrlKind = rootUrl.startsWith("blob:")
			? "blob"
			: "service-worker";

		check("rendered-frame", renderedFrames > 0, observations.render);
		check("paged-runtime-attached", Boolean(pagedSplats.pager), {
			pagerAttached: Boolean(pagedSplats.pager),
		});
		check(
			"rad-range-fetch",
			hasRadRangeFetch(fetchLog),
			observations.fetchSummary,
		);
		check(
			"rad-chunk-fetch",
			hasChunkFetch(fetchLog),
			observations.fetchSummary,
		);
		check(
			"paged-splats-updated",
			pagedSplats.numSplats > 0,
			observations.render,
		);
	} catch (error) {
		failures.push({
			name: "rad-streaming-smoke-runtime",
			ok: false,
			details: formatError(error),
		});
	} finally {
		if (originalFetch) {
			globalThis.fetch = originalFetch;
		}
		try {
			mesh?.removeFromParent();
			mesh?.dispose?.();
		} catch {}
		try {
			spark?.removeFromParent();
			spark?.dispose?.();
		} catch {}
		try {
			renderer?.dispose?.();
		} catch {}
		try {
			await radRuntime?.unregister?.();
		} catch {}
		canvas?.remove();
		if (blobUrl) URL.revokeObjectURL(blobUrl);
	}

	observations.durationMs = roundMs(performance.now() - startedAt);
	return {
		ok: failures.length === 0,
		checks,
		failures,
		observations,
	};
}

export async function runEmbeddedRadProjectSmoke({
	ssprojBase64 = null,
	ssprojUrl = null,
	fixtureName = "embedded-rad.ssproj",
	assetIndex = 0,
	frameCount = DEFAULT_FRAME_COUNT,
	timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
	const startedAt = performance.now();
	const checks = [];
	const failures = [];
	const observations = {
		fixtureName,
		userAgent: navigator.userAgent,
	};

	let blobUrl = null;
	let canvas = null;
	let renderer = null;
	let spark = null;
	let mesh = null;
	let pagedSplats = null;
	let originalFetch = null;
	let radRuntime = null;

	const check = (name, ok, details = {}) => {
		const entry = { name, ok: Boolean(ok), details };
		checks.push(entry);
		if (!entry.ok) failures.push(entry);
	};

	try {
		const projectBytes = await loadProjectBytes({ ssprojBase64, ssprojUrl });
		observations.projectBytes = projectBytes.byteLength;
		check("project-bytes", projectBytes.byteLength > 0, {
			byteLength: projectBytes.byteLength,
			ssprojUrl,
		});

		const { readCameraFramesProject } = await import("/src/project/file/index.js");
		const project = await withTimeout(
			readCameraFramesProject(new File([projectBytes], fixtureName)),
			timeoutMs,
			"Embedded RAD project read timed out",
		);
		const radAssets = project.assetEntries.filter(
			(asset) =>
				asset.source?.sourceType === "project-file-packed-splat" &&
				asset.source.radBundle?.root,
		);
		observations.projectRadAssets = radAssets.map((asset) => ({
			label: asset.label,
			chunks: asset.source.radBundle?.chunks?.length ?? 0,
			deferredFullData: Boolean(asset.source.deferredFullData),
			packedArrayLength: asset.source.packedArray?.length ?? 0,
			rootSize: asset.source.radBundle?.root?.blob?.size ?? null,
		}));
		check("project-rad-assets", radAssets.length > 0, {
			count: radAssets.length,
			assets: observations.projectRadAssets,
		});
		const selectedAsset = radAssets[assetIndex] ?? radAssets[0] ?? null;
		const source = selectedAsset?.source ?? null;
		check(
			"project-rad-deferred-full-data",
			Boolean(source?.deferredFullData) &&
				(source?.packedArray?.length ?? 0) === 0,
			{
				label: selectedAsset?.label ?? null,
				deferredFullData: Boolean(source?.deferredFullData),
				packedArrayLength: source?.packedArray?.length ?? null,
			},
		);

		const rootBlob = source?.radBundle?.root?.blob;
		const chunks = (source?.radBundle?.chunks ?? []).map((entry) => ({
			name: entry.name,
			blob: entry.blob,
			size: entry.blob?.size ?? entry.size ?? null,
		}));
		check("project-rad-root-blob", rootBlob instanceof Blob, {
			label: selectedAsset?.label ?? null,
			rootSize: rootBlob?.size ?? null,
			chunks: chunks.length,
		});

		const rootName = source?.radBundle?.root?.name ?? "embedded-lod.rad";
		blobUrl = URL.createObjectURL(rootBlob);
		const blobRange = await probeBlobRange(blobUrl, rootBlob.size);
		observations.blobRange = blobRange;
		check(
			"blob-range-partial",
			blobRange.status === 206 &&
				blobRange.byteLength > 0 &&
				blobRange.byteLength < rootBlob.size,
			blobRange,
		);

		const serviceWorkerRange = await probeServiceWorkerRadBundle({
			rootName,
			rootBlob,
			totalBytes: rootBlob.size,
			chunks,
		});
		radRuntime = serviceWorkerRange.runtime;
		observations.serviceWorkerRange = serviceWorkerRange.summary;
		check(
			"service-worker-range-partial",
			serviceWorkerRange.summary.status === 206 &&
				serviceWorkerRange.summary.byteLength > 0 &&
				serviceWorkerRange.summary.byteLength < rootBlob.size,
			serviceWorkerRange.summary,
		);

		const fetchLog = [];
		originalFetch = globalThis.fetch.bind(globalThis);
		globalThis.fetch = async (input, init) => {
			const requestUrl = getFetchUrl(input);
			const range = getFetchRange(input, init);
			const begin = performance.now();
			try {
				const response = await originalFetch(input, init);
				const clone = response.clone();
				let byteLength = null;
				try {
					byteLength = (await clone.arrayBuffer()).byteLength;
				} catch {
					byteLength = null;
				}
				fetchLog.push({
					urlKind: requestUrl.startsWith("blob:") ? "blob" : "url",
					name: summarizeFetchName(requestUrl),
					range,
					status: response.status,
					ok: response.ok,
					contentRange: response.headers.get("Content-Range"),
					contentLength: response.headers.get("Content-Length"),
					byteLength,
					durationMs: roundMs(performance.now() - begin),
				});
				return response;
			} catch (error) {
				fetchLog.push({
					urlKind: requestUrl.startsWith("blob:") ? "blob" : "url",
					name: summarizeFetchName(requestUrl),
					range,
					ok: false,
					error: formatError(error),
					durationMs: roundMs(performance.now() - begin),
				});
				throw error;
			}
		};

		pagedSplats = new PagedSplats({
			rootUrl: radRuntime.rootUrl,
			fileType: SplatFileType.RAD,
		});
		const metaResult = await withTimeout(
			pagedSplats.getRadMeta(),
			timeoutMs,
			"RAD metadata read timed out",
		);
		const meta = metaResult.meta;
		observations.radMeta = summarizeRadMeta(metaResult);
		check(
			"rad-header-readable",
			Number.isFinite(meta?.version) &&
				Number.isFinite(meta?.count) &&
				meta.count > 0 &&
				Array.isArray(meta?.chunks) &&
				meta.chunks.length > 0,
			observations.radMeta,
		);

		mesh = new SplatMesh({
			paged: pagedSplats,
			editable: false,
			raycastable: false,
		});
		await withTimeout(
			mesh.initialized,
			timeoutMs,
			"SplatMesh initialization timed out",
		);
		check("mesh-initialized", mesh.isInitialized === true, {
			isInitialized: mesh.isInitialized,
			pagedAttached: mesh.paged === pagedSplats,
		});

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10);
		camera.position.set(0, 0, 1.2);
		camera.lookAt(0, 0, 0);
		camera.updateMatrixWorld(true);

		canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		canvas.style.cssText =
			"position:fixed;left:-10000px;top:-10000px;width:128px;height:128px";
		document.body.appendChild(canvas);

		renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: false,
			alpha: false,
			preserveDrawingBuffer: true,
		});
		renderer.setPixelRatio(1);
		renderer.setSize(128, 128, false);

		spark = new SparkRenderer({
			renderer,
			enableLod: true,
			enableDriveLod: true,
			enableLodFetching: true,
			maxPagedSplats: 65536,
			numLodFetchers: 1,
		});
		scene.add(spark);
		scene.add(mesh);
		scene.updateMatrixWorld(true);

		const frameSamples = [];
		let renderedFrames = 0;
		for (let frame = 0; frame < frameCount; frame += 1) {
			renderer.render(scene, camera);
			renderedFrames += 1;
			if (frame % 10 === 0 || frame === frameCount - 1) {
				frameSamples.push(sampleFrame(frame, pagedSplats, fetchLog));
			}
			await nextAnimationFrame();
			if (
				renderedFrames >= 2 &&
				pagedSplats.numSplats > 0 &&
				hasChunkFetch(fetchLog)
			) {
				break;
			}
		}

		await waitForCondition(
			() => pagedSplats.numSplats > 0 || hasChunkFetch(fetchLog),
			Math.min(timeoutMs, 5000),
		).catch(() => {});
		renderer.render(scene, camera);
		renderedFrames += 1;
		frameSamples.push(sampleFrame("final", pagedSplats, fetchLog));

		observations.render = {
			renderedFrames,
			pagedNumSplats: pagedSplats.numSplats,
			pagerAttached: Boolean(pagedSplats.pager),
			frameSamples,
			centerPixel: readCenterPixel(renderer),
		};
		observations.fetchLog = fetchLog;
		observations.fetchSummary = summarizeFetches(fetchLog);
		observations.rootUrlKind = "service-worker";

		check("rendered-frame", renderedFrames > 0, observations.render);
		check("paged-runtime-attached", Boolean(pagedSplats.pager), {
			pagerAttached: Boolean(pagedSplats.pager),
		});
		check(
			"rad-range-fetch",
			hasRadRangeFetch(fetchLog),
			observations.fetchSummary,
		);
		check(
			"rad-chunk-fetch",
			hasChunkFetch(fetchLog),
			observations.fetchSummary,
		);
		check(
			"paged-splats-updated",
			pagedSplats.numSplats > 0,
			observations.render,
		);
	} catch (error) {
		failures.push({
			name: "embedded-rad-project-smoke-runtime",
			ok: false,
			details: formatError(error),
		});
	} finally {
		if (originalFetch) {
			globalThis.fetch = originalFetch;
		}
		try {
			mesh?.removeFromParent();
			mesh?.dispose?.();
		} catch {}
		try {
			spark?.removeFromParent();
			spark?.dispose?.();
		} catch {}
		try {
			renderer?.dispose?.();
		} catch {}
		try {
			await radRuntime?.unregister?.();
		} catch {}
		canvas?.remove();
		if (blobUrl) URL.revokeObjectURL(blobUrl);
	}

	observations.durationMs = roundMs(performance.now() - startedAt);
	return {
		ok: failures.length === 0,
		checks,
		failures,
		observations,
	};
}

export async function runEmbeddedRadProjectFullDataSwapSmoke({
	ssprojBase64 = null,
	ssprojUrl = null,
	fixtureName = "embedded-rad.ssproj",
	assetIndex = 0,
	timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
	const startedAt = performance.now();
	const checks = [];
	const failures = [];
	const observations = {
		fixtureName,
		userAgent: navigator.userAgent,
	};

	let harness = null;
	let asset = null;
	let highlightController = null;

	const check = (name, ok, details = {}) => {
		const entry = { name, ok: Boolean(ok), details };
		checks.push(entry);
		if (!entry.ok) failures.push(entry);
	};

	try {
		const projectBytes = await loadProjectBytes({ ssprojBase64, ssprojUrl });
		observations.projectBytes = projectBytes.byteLength;
		check("project-bytes", projectBytes.byteLength > 0, {
			byteLength: projectBytes.byteLength,
			ssprojUrl,
		});

		const { readCameraFramesProject } = await import("/src/project/file/index.js");
		const project = await withTimeout(
			readCameraFramesProject(new File([projectBytes], fixtureName)),
			timeoutMs,
			"Embedded RAD project read timed out",
		);
		const radAssets = project.assetEntries.filter(
			(entry) =>
				entry.source?.sourceType === "project-file-packed-splat" &&
				entry.source.radBundle?.root,
		);
		check("project-rad-assets", radAssets.length > 0, {
			count: radAssets.length,
		});
		const selectedAsset = radAssets[assetIndex] ?? radAssets[0] ?? null;
		const source = selectedAsset?.source ?? null;
		observations.selectedAsset = {
			label: selectedAsset?.label ?? null,
			chunks: source?.radBundle?.chunks?.length ?? 0,
			deferredFullData: Boolean(source?.deferredFullData),
			packedArrayLength: source?.packedArray?.length ?? null,
		};
		check(
			"project-rad-deferred-full-data",
			Boolean(source?.deferredFullData) &&
				(source?.packedArray?.length ?? 0) === 0,
			observations.selectedAsset,
		);

		harness = await createBrowserAssetControllerHarness();
		asset = await withTimeout(
			harness.controller.createSplatAssetFromSource(source),
			timeoutMs,
			"RAD-backed asset creation timed out",
		);
		observations.radRuntimeAsset = {
			id: asset?.id ?? null,
			label: asset?.label ?? null,
			hasPaged: Boolean(asset?.disposeTarget?.paged),
			hasPackedSplats: Boolean(asset?.disposeTarget?.packedSplats),
			hasRuntimeCleanup: Boolean(asset?.radBundleRuntime),
			sourceHasRad: Boolean(asset?.source?.radBundle),
			sourceDeferredFullData: Boolean(asset?.source?.deferredFullData),
		};
		check(
			"rad-backed-runtime-created",
			Boolean(asset?.disposeTarget?.paged) &&
				Boolean(asset?.radBundleRuntime) &&
				Boolean(asset?.source?.deferredFullData),
			observations.radRuntimeAsset,
		);

		await withTimeout(
			harness.controller.ensureFullDataForSplatAssets([asset.id]),
			timeoutMs,
			"FullData swap timed out",
		);
		observations.fullDataRuntimeAsset = {
			hasPaged: Boolean(asset?.disposeTarget?.paged),
			hasPackedSplats: Boolean(asset?.disposeTarget?.packedSplats),
			packedArrayLength:
				asset?.disposeTarget?.packedSplats?.packedArray?.length ?? 0,
			numSplats:
				asset?.disposeTarget?.packedSplats?.getNumSplats?.() ??
				asset?.disposeTarget?.packedSplats?.numSplats ??
				null,
			sourceHasRad: Boolean(asset?.source?.radBundle),
			sourceDeferredFullData: Boolean(asset?.source?.deferredFullData),
			hasRuntimeCleanup: Boolean(asset?.radBundleRuntime),
		};
		check(
			"full-data-swap-packed-splats",
			!asset?.disposeTarget?.paged &&
				Boolean(asset?.disposeTarget?.packedSplats) &&
				(asset?.disposeTarget?.packedSplats?.packedArray?.length ?? 0) > 0,
			observations.fullDataRuntimeAsset,
		);
		check(
			"full-data-swap-clears-rad-cache",
			!asset?.source?.radBundle &&
				!asset?.source?.deferredFullData &&
				!asset?.radBundleRuntime,
			observations.fullDataRuntimeAsset,
		);

		const { createSplatSelectionHighlightController } = await import(
			"/src/engine/splat-selection-highlight.js"
		);
		highlightController = createSplatSelectionHighlightController();
		const assetIdKey = String(asset.id);
		const previousEnableLod = asset.disposeTarget?.enableLod;
		highlightController.sync({
			scopeAssets: [asset],
			selectedSplatsByAssetId: new Map([[assetIdKey, new Set([0])]]),
		});
		observations.fullDataHighlight = {
			hasLodSplats: Boolean(asset?.disposeTarget?.packedSplats?.lodSplats),
			hasSplatRgba: Boolean(asset?.disposeTarget?.splatRgba),
			enableLodDuringHighlight: asset?.disposeTarget?.enableLod,
			splatRgbaCount: asset?.disposeTarget?.splatRgba?.count ?? null,
			splatRgbaNeedsUpdate:
				asset?.disposeTarget?.splatRgba?.needsUpdate ?? null,
		};
		check(
			"full-data-highlight-disables-lod",
			Boolean(asset?.disposeTarget?.splatRgba) &&
				asset?.disposeTarget?.enableLod === false,
			observations.fullDataHighlight,
		);
		highlightController.clear();
		observations.fullDataHighlight.enableLodAfterClear =
			asset?.disposeTarget?.enableLod;
		check(
			"full-data-highlight-restores-lod",
			asset?.disposeTarget?.enableLod === previousEnableLod,
			observations.fullDataHighlight,
		);
	} catch (error) {
		failures.push({
			name: "embedded-rad-full-data-swap-runtime",
			ok: false,
			details: formatError(error),
		});
	} finally {
		try {
			highlightController?.clear?.();
		} catch {}
		try {
			await harness?.controller?.removeSceneAssets?.([asset?.id]);
		} catch {}
		try {
			asset?.disposeTarget?.dispose?.();
		} catch {}
	}

	observations.durationMs = roundMs(performance.now() - startedAt);
	return {
		ok: failures.length === 0,
		checks,
		failures,
		observations,
	};
}

async function probeBlobRange(blobUrl, totalBytes) {
	const response = await fetch(blobUrl, {
		headers: {
			Range: "bytes=0-31",
		},
	});
	const bytes = await response.arrayBuffer();
	return {
		status: response.status,
		ok: response.ok,
		contentRange: response.headers.get("Content-Range"),
		contentLength: response.headers.get("Content-Length"),
		byteLength: bytes.byteLength,
		totalBytes,
	};
}

async function loadProjectBytes({ ssprojBase64, ssprojUrl }) {
	if (ssprojUrl) {
		const response = await fetch(ssprojUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch ssproj fixture (${response.status} ${response.statusText})`,
			);
		}
		return new Uint8Array(await response.arrayBuffer());
	}
	return decodeBase64(ssprojBase64);
}

async function createBrowserAssetControllerHarness() {
	const [
		{ createAssetControllerBindings },
		{ createAssetController },
		{ SplatMesh },
		{ createCameraFramesStore },
	] = await Promise.all([
		import("/src/app/asset-controller-bindings.js"),
		import("/src/controllers/asset-controller.js"),
		import("/src/engine/spark-integration/spark-symbols.js"),
		import("/src/store.js"),
	]);
	const store = createCameraFramesStore();
	const sceneState = { assets: [], nextAssetId: 1 };
	const splatRoot = new THREE.Group();
	const modelRoot = new THREE.Group();
	const contentRoot = new THREE.Group();
	contentRoot.add(splatRoot, modelRoot);
	const controller = createAssetController(
		createAssetControllerBindings({
			sceneState,
			assetInput: { click() {} },
			store,
			loader: {
				loadAsync: async () => ({
					scene: new THREE.Group(),
					scenes: [new THREE.Group()],
				}),
			},
			splatRoot,
			modelRoot,
			contentRoot,
			SplatMesh,
			setStatus: () => {},
			updateUi: () => {},
			updateCameraSummary: () => {},
			frameAllCameras: () => {},
			placeAllCamerasAtHome: () => {},
			resetLocalizedCaches: () => {},
			setExportStatus: () => {},
			t: (key) => key,
			formatAssetWorldScale: (value) => String(value),
			getDefaultAssetUnitMode: () => "meters",
			isProjectPackageSource: () => false,
			extractProjectPackageAssets: () => [],
			applyProjectPackageImport: () => {},
			projectController: {
				openProjectSource: async () => {},
			},
			disposeObject: (object) => object?.dispose?.(),
			historyController: {
				runHistoryAction: (_label, operation) => operation?.(),
				beginHistoryTransaction: () => false,
				commitHistoryTransaction: () => false,
				cancelHistoryTransaction: () => {},
				clearHistory: () => {},
			},
			getPerSplatEditController: () => null,
		}),
	);
	return {
		controller,
		sceneState,
		store,
		contentRoot,
	};
}

function normalizeRadBundleInput({ radBase64, radBundleBase64, fixtureName }) {
	if (radBundleBase64?.root) {
		return {
			fixtureName:
				radBundleBase64.fixtureName ??
				radBundleBase64.root.name ??
				fixtureName,
			root: {
				name: radBundleBase64.root.name ?? "generated-lod.rad",
				bytes: decodeBase64(
					radBundleBase64.root.base64 ?? radBundleBase64.root.bytesBase64,
				),
			},
			chunks: (radBundleBase64.chunks ?? []).map((entry, index) => ({
				name: entry.name ?? `generated-lod-${index}.radc`,
				bytes: decodeBase64(entry.base64 ?? entry.bytesBase64),
			})),
		};
	}
	return {
		fixtureName,
		root: {
			name: fixtureName,
			bytes: decodeBase64(radBase64),
		},
		chunks: [],
	};
}

async function probeServiceWorkerRadBundle({
	rootName,
	rootBlob,
	totalBytes,
	chunks = [],
}) {
	const { registerProjectRadBundle } = await import(
		"/src/engine/rad-bundle-service-worker-client.js"
	);
	const runtime = await registerProjectRadBundle({
		kind: "spark-rad-bundle",
		version: 1,
		root: {
			name: rootName,
			blob: rootBlob,
		},
		chunks: chunks.map((entry) => ({
			name: entry.name,
			blob:
				entry.blob instanceof Blob
					? entry.blob
					: new Blob([entry.bytes], { type: "application/octet-stream" }),
		})),
	});
	const response = await fetch(runtime.rootUrl, {
		headers: {
			Range: "bytes=0-31",
		},
	});
	const bytes = await response.arrayBuffer();
	return {
		runtime,
		summary: {
			status: response.status,
			ok: response.ok,
			rootUrlKind: runtime.rootUrl.startsWith("blob:")
				? "blob"
				: "service-worker",
			contentRange: response.headers.get("Content-Range"),
			contentLength: response.headers.get("Content-Length"),
			byteLength: bytes.byteLength,
			totalBytes,
		},
	};
}

function decodeBase64(value) {
	if (typeof value !== "string" || value.length === 0) {
		throw new Error("radBase64 must be a non-empty base64 string");
	}
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

function getFetchUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	if (input instanceof Request) return input.url;
	return String(input);
}

function getFetchRange(input, init) {
	const headers = new Headers();
	if (input instanceof Request) {
		input.headers.forEach((value, key) => headers.set(key, value));
	}
	if (init?.headers) {
		new Headers(init.headers).forEach((value, key) => headers.set(key, value));
	}
	return headers.get("Range") ?? headers.get("range");
}

function summarizeFetchName(value) {
	try {
		const url = new URL(value, window.location.href);
		return url.pathname.split("/").filter(Boolean).pop() ?? "";
	} catch {
		return String(value).startsWith("blob:") ? "blob" : "";
	}
}

function summarizeRadMeta({ meta, chunksStart }) {
	return {
		version: meta.version,
		type: meta.type,
		count: meta.count,
		maxSh: meta.maxSh ?? null,
		lodTree: Boolean(meta.lodTree),
		chunkSize: meta.chunkSize ?? null,
		chunksStart,
		chunks: meta.chunks.length,
		firstChunks: meta.chunks.slice(0, 3).map((chunk) => ({
			offset: chunk.offset,
			bytes: chunk.bytes,
			base: chunk.base ?? null,
			count: chunk.count ?? null,
			filename: chunk.filename ?? null,
		})),
		splatEncoding: meta.splatEncoding ?? null,
	};
}

function sampleFrame(frame, pagedSplats, fetchLog) {
	const pager = pagedSplats.pager;
	return {
		frame,
		numSplats: pagedSplats.numSplats,
		fetches: fetchLog.length,
		pager: pager
			? {
					fetchPriority: pager.fetchPriority.length,
					fetchers: pager.fetchers.length,
					fetched: pager.fetched.length,
					readyUploads: pager.readyUploads.length,
					newUploads: pager.newUploads.length,
					lodTreeUpdates: pager.lodTreeUpdates.length,
				}
			: null,
	};
}

function summarizeFetches(fetchLog) {
	const rangeFetches = fetchLog.filter((entry) => entry.range);
	const chunkFetches = fetchLog.filter((entry) => isChunkFetch(entry));
	return {
		total: fetchLog.length,
		range: rangeFetches.length,
		chunk: chunkFetches.length,
		statuses: Object.fromEntries(
			[...new Set(fetchLog.map((entry) => entry.status).filter(Boolean))].map(
				(status) => [
					String(status),
					fetchLog.filter((entry) => entry.status === status).length,
				],
			),
		),
		ranges: rangeFetches.map((entry) => ({
			range: entry.range,
			status: entry.status,
			byteLength: entry.byteLength,
			contentRange: entry.contentRange,
		})),
	};
}

function hasRadRangeFetch(fetchLog) {
	return fetchLog.some((entry) => entry.range && entry.status === 206);
}

function hasChunkFetch(fetchLog) {
	return fetchLog.some((entry) => isChunkFetch(entry));
}

function isChunkRange(range) {
	return typeof range === "string" && !range.startsWith("bytes=0-");
}

function isChunkFetch(entry) {
	if (isChunkRange(entry.range) && entry.status === 206) {
		return true;
	}
	return (
		typeof entry.name === "string" &&
		entry.name.endsWith(".radc") &&
		(entry.status === 200 || entry.status === 206)
	);
}

function readCenterPixel(renderer) {
	const gl = renderer.getContext();
	const pixel = new Uint8Array(4);
	gl.readPixels(64, 64, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
	return Array.from(pixel);
}

function nextAnimationFrame() {
	return new Promise((resolve) => requestAnimationFrame(resolve));
}

async function waitForCondition(predicate, timeoutMs) {
	const startedAt = performance.now();
	while (performance.now() - startedAt < timeoutMs) {
		if (predicate()) return;
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error("Timed out waiting for condition");
}

async function withTimeout(promise, timeoutMs, message) {
	let timeoutId = 0;
	try {
		return await Promise.race([
			promise,
			new Promise((_, reject) => {
				timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
			}),
		]);
	} finally {
		clearTimeout(timeoutId);
	}
}

function roundMs(value) {
	return Math.round(value * 1000) / 1000;
}

function formatError(error) {
	return {
		name: error?.name ?? "Error",
		message: error?.message ?? String(error),
		stack: error?.stack ?? null,
	};
}
