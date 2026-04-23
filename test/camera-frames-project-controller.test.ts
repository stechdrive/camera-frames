import assert from "node:assert/strict";
import { createProjectController } from "../src/controllers/project-controller.js";
import { buildZipArchiveBytes } from "../src/project-archive.js";
import {
	buildCameraFramesProjectArchive,
	isProjectFilePackedSplatSource,
	readCameraFramesProject,
} from "../src/project/file/index.js";
import { createDefaultReferenceImageDocument } from "../src/reference-image-model.js";

function t(key, values = {}) {
	switch (key) {
		case "overlay.importPhaseVerify":
			return "Verify";
		case "overlay.importPhaseExpand":
			return "Expand";
		case "overlay.importPhaseLoad":
			return "Load";
		case "overlay.importPhaseApply":
			return "Apply";
		case "overlay.importTitle":
			return "Import";
		case "overlay.importMessage":
			return "Importing project";
		case "status.projectLoaded":
			return "Project loaded";
		case "status.workingStateRestored":
			return `Working state restored: ${values.name ?? ""}`;
		case "overlay.packageFieldCompressSplatsWorkerUnavailable":
			return "Compress 3DGS to SOG (unavailable in this environment)";
		case "overlay.packageSplatOptimization.sog":
			return "SOG compression";
		case "overlay.packageSplatOptimization.sogDisabled":
			return "SOG compression (unavailable in this environment)";
		case "overlay.packageSplatOptimization.bakeLodHintPreserveQuality":
			return "Already baked at Quality — will be preserved.";
		case "overlay.packageSplatOptimization.bakeLodHintPreserveQuick":
			return "Already baked at Quick — preserved, or upgrade to Quality.";
		case "error.sogCompressionWorkerUnavailable":
			return "Could not start the SOG compression worker in this environment. Save again with SOG compression turned off.";
		default:
			return key;
	}
}

async function withNavigator(value, callback) {
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value,
	});
	try {
		return await callback();
	} finally {
		if (descriptor) {
			Object.defineProperty(globalThis, "navigator", descriptor);
		} else {
			// biome-ignore lint/performance/noDelete: Restore the original global shape in this test harness.
			delete globalThis.navigator;
		}
	}
}

function createCollectingProjectFileHandle(name = "mock.ssproj") {
	const chunks = [];
	const fileHandle = {
		name,
		async createWritable() {
			const stream = new WritableStream({
				write(chunk) {
					chunks.push(chunk);
				},
			});
			return {
				writable: stream,
				async close() {},
				async abort() {
					await stream.abort?.();
				},
			};
		},
	};
	return { fileHandle, chunks };
}

async function collectWritableChunks(chunks) {
	const parts = [];
	let totalLength = 0;
	for (const chunk of chunks) {
		let bytes = null;
		if (chunk instanceof Blob) {
			bytes = new Uint8Array(await chunk.arrayBuffer());
		} else if (chunk instanceof ArrayBuffer) {
			bytes = new Uint8Array(chunk);
		} else if (ArrayBuffer.isView(chunk)) {
			bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
		} else if (typeof chunk === "string") {
			bytes = new TextEncoder().encode(chunk);
		} else {
			throw new Error(`Unsupported writable chunk type: ${typeof chunk}`);
		}
		parts.push(bytes);
		totalLength += bytes.byteLength;
	}
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		result.set(part, offset);
		offset += part.byteLength;
	}
	return result;
}

function createCompletingIndexedDb() {
	const records = new Map();
	const createRequest = () => ({
		result: undefined,
		error: null,
		onsuccess: null,
		onerror: null,
	});
	const completeTransactionRequest = (transaction, result) => {
		const request = createRequest();
		request.result = result;
		queueMicrotask(() => transaction.oncomplete?.());
		return request;
	};
	const database = {
		objectStoreNames: {
			contains: () => true,
		},
		createObjectStore: () => {},
		transaction: () => {
			const transaction = {
				error: null,
				onabort: null,
				oncomplete: null,
				onerror: null,
				objectStore: () => ({
					delete: (projectId) => {
						records.delete(projectId);
						return completeTransactionRequest(transaction, undefined);
					},
					getAll: () =>
						completeTransactionRequest(
							transaction,
							Array.from(records.values()),
						),
					put: (record) => {
						records.set(record.projectId, record);
						return completeTransactionRequest(transaction, record);
					},
				}),
			};
			return transaction;
		},
		close: () => {},
	};

	return {
		open: () => {
			const request = createRequest();
			queueMicrotask(() => {
				request.result = database;
				request.onsuccess?.();
			});
			return request;
		},
	};
}

function createHarness(overrides = {}) {
	const store = {
		overlay: { value: null },
		project: {
			name: { value: "" },
			dirty: { value: false },
			packageDirty: { value: true },
		},
	};
	const statusEvents = [];
	const applyOpenedProjectCalls = [];
	const clearProjectSidecarsCalls = [];
	const resetProjectWorkspaceCalls = [];
	let currentProjectState = overrides.captureProjectState?.() ?? {
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	};
	const projectController = createProjectController({
		store,
		assetController: {
			loadSources: async () => {},
			applyWorkingProjectSceneState: async () => {},
			captureWorkingProjectSceneState: () => ({
				assets: [],
				selectedAssetKeys: [],
				activeAssetKey: "",
			}),
			...(overrides.assetController ?? {}),
		},
		applySavedProjectState: () => {},
		applyOpenedProject: async (...args) => {
			applyOpenedProjectCalls.push(args);
			await overrides.applyOpenedProject?.(...args);
		},
		clearProjectSidecars: () => {
			clearProjectSidecarsCalls.push(true);
			overrides.clearProjectSidecars?.();
		},
		resetProjectWorkspace: () => {
			resetProjectWorkspaceCalls.push(true);
			overrides.resetProjectWorkspace?.();
		},
		buildProjectFilename: () => "test-project.ssproj",
		captureProjectState:
			overrides.captureProjectStateSpy ?? (() => currentProjectState),
		clearHistory: () => {},
		updateUi: () => {},
		setStatus: (status) => {
			statusEvents.push(status);
		},
		t,
		prewarmSogCompressionWorkerImpl: overrides.prewarmSogCompressionWorkerImpl,
		supportsSogCompressionImpl: overrides.supportsSogCompressionImpl,
	});

	return {
		projectController,
		store,
		statusEvents,
		applyOpenedProjectCalls,
		clearProjectSidecarsCalls,
		resetProjectWorkspaceCalls,
		setProjectState: (nextState) => {
			currentProjectState = nextState;
		},
	};
}

{
	const harness = createHarness();
	const brokenProjectFile = new File(
		[new Uint8Array([1, 2, 3, 4])],
		"broken.ssproj",
	);
	await assert.rejects(
		harness.projectController.openProjectSource(brokenProjectFile),
	);
	assert.equal(harness.store.overlay.value, null);
}

{
	const harness = createHarness();
	await harness.projectController.startNewProject();
	harness.setProjectState({
		workspace: {
			activeShotCameraId: "shot-1",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [
			{
				id: "shot-1",
				name: "Camera 1",
				pose: {
					position: { x: 1, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
				lens: { baseFovX: 55 },
				clipping: { mode: "auto", near: 0.1, far: 1000 },
				exportSettings: { exportName: "", exportFormat: "psd" },
				outputFrame: {
					widthScale: 1,
					heightScale: 1,
					viewZoom: 1,
					anchor: "center",
				},
				frames: [],
				activeFrameId: "",
				frameMask: { mode: "off", opacityPct: 80, selectedIds: [] },
				navigation: { rollLock: false },
			},
		],
		scene: {
			assets: [],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	});
	harness.projectController.syncProjectPresentation();
	const archive = await buildCameraFramesProjectArchive({
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	});
	const projectFile = new File([archive], "scene.ssproj");
	const opened = await harness.projectController.openProjectSource(projectFile);
	assert.equal(opened, false);
	assert.equal(harness.applyOpenedProjectCalls.length, 0);
	assert.equal(harness.store.overlay.value?.kind, "confirm");
}

{
	const harness = createHarness();
	const projectSnapshot = {
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	};
	const archive = await buildCameraFramesProjectArchive(projectSnapshot);
	const projectFile = new File([archive], "scene.ssproj");
	await harness.projectController.openProjectSource(projectFile);
	assert.equal(harness.store.overlay.value, null);
	assert.equal(harness.applyOpenedProjectCalls.length, 1);
	assert.equal(
		harness.applyOpenedProjectCalls[0]?.[1]?.skipApplyState,
		false,
		"applyOpenedProject should receive skipApplyState=false when no compatible working state exists",
	);
}

{
	const harness = createHarness({
		assetController: {
			loadSources: async () => {},
		},
	});
	const legacyArchive = await buildZipArchiveBytes({
		"document.json": new TextEncoder().encode("{}"),
	});
	const legacyProjectFile = new File([legacyArchive], "legacy.ssproj");
	await harness.projectController.openProjectSource(legacyProjectFile);
	assert.equal(harness.store.overlay.value, null);
	assert.equal(harness.clearProjectSidecarsCalls.length, 1);
}

{
	const harness = createHarness();
	await harness.projectController.startNewProject();
	assert.equal(harness.resetProjectWorkspaceCalls.length, 1);
	assert.equal(harness.store.overlay.value, null);
}

// Radio primary choice is Fast / Quality only — no SOG at the top level.
// Disclosure group ("advanced") holds SOG compression and its sub-options.
await withNavigator({ gpu: {} }, async () => {
	const harness = createHarness();
	await harness.projectController.exportProject();
	const overlay = harness.store.overlay.value;
	const saveModeField = overlay?.fields?.find((f) => f.id === "saveMode");
	assert.equal(saveModeField?.type, "radio");
	assert.equal(saveModeField?.value, "fast");
	assert.deepEqual(
		saveModeField?.options?.map((o) => o.value),
		["fast", "quality"],
		"Radio must expose only Fast and Quality; SOG / Quick go through other paths.",
	);
	const advancedGroup = overlay?.fields?.find((f) => f.id === "advanced");
	assert.equal(advancedGroup?.type, "group");
	assert.ok(
		advancedGroup?.fields?.some((f) => f.id === "sogCompress"),
		"Advanced group must expose the SOG compression toggle.",
	);
});

// Fast + SOG submit path still routes through SOG worker prewarm + error handling.
await withNavigator({ gpu: {} }, async () => {
	const harness = createHarness({
		prewarmSogCompressionWorkerImpl: async () => {
			throw new Error("boom");
		},
	});
	await harness.projectController.exportProject();
	await harness.store.overlay.value.onSubmit({
		saveMode: "fast",
		sogCompress: true,
		sogMaxShBands: "2",
		sogIterations: "10",
	});
	assert.equal(harness.store.overlay.value?.kind, "error");
	assert.match(
		harness.store.overlay.value?.detail ?? "",
		/SOG compression worker/,
	);
});

// Fast save with no SOG — picker abort path still closes overlay cleanly.
{
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	globalThis.showSaveFilePicker = async () => {
		const error = new Error("The user aborted a request.");
		error.name = "AbortError";
		throw error;
	};
	try {
		const harness = createHarness();
		await harness.projectController.exportProject();
		assert.equal(harness.store.overlay.value?.kind, "confirm");
		await harness.store.overlay.value.onSubmit({
			saveMode: "fast",
			sogCompress: false,
			sogMaxShBands: "2",
			sogIterations: "10",
		});
		assert.equal(harness.store.overlay.value, null);
	} finally {
		globalThis.showSaveFilePicker = originalShowSaveFilePicker;
	}
}

// When the scene already carries Quality-baked LoD, radio defaults to
// Quality so the dialog mirrors the existing state the user is about to
// keep (smart no-op skip then runs at save time — no recomputation).
await withNavigator({ gpu: {} }, async () => {
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [
				{
					kind: "splat",
					label: "big-scene",
					disposeTarget: { packedSplats: { packedArray: new Uint32Array(4) } },
					source: {
						sourceType: "project-file-packed-splat",
						lodSplats: {
							packedArray: new Uint32Array(4),
							bakedQuality: "quality",
						},
					},
				},
			],
		},
	});
	await harness.projectController.exportProject();
	const overlay = harness.store.overlay.value;
	const saveModeField = overlay?.fields?.find((f) => f.id === "saveMode");
	assert.equal(saveModeField?.value, "quality");
	const qualityOption = saveModeField?.options?.find(
		(o) => o.value === "quality",
	);
	assert.match(
		String(qualityOption?.hint ?? ""),
		/preserve|Quality/i,
		"Quality hint should signal that existing bake will be preserved.",
	);
});

// Regression: Quality-save must bake LoD into asset.source BEFORE the
// project state is snapshotted for serialization. Earlier, captureProjectState
// ran first and then the bake mutated asset.source.lodSplats on the live
// scene assets — but the snapshot was already frozen, so the saved ssproj
// contained no baked LoD despite the user choosing Quality.
await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([1, 2, 3, 4]),
		numSplats: 2_000_000,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
		lodSplats: null,
		needsUpdate: false,
		bakeCompleted: false,
		async createLodSplats({ quality }) {
			await new Promise((resolve) => setTimeout(resolve, 5));
			this.lodSplats = {
				packedArray: new Uint32Array([9, 9, 9, 9]),
				numSplats: 3_000_000,
				getNumSplats() {
					return this.numSplats;
				},
				extra: { lodTree: new Uint32Array([1, 2, 3]) },
				splatEncoding: null,
			};
			this.bakeCompleted = true;
			this.needsUpdate = true;
		},
		disposeLodSplats() {
			this.lodSplats = null;
		},
	};
	const scopeAsset = {
		id: "splat-big",
		kind: "splat",
		label: "big-splat",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "big-splat.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: fakePackedSplats.packedArray,
			numSplats: fakePackedSplats.numSplats,
			extra: {},
			splatEncoding: null,
			lodSplats: null,
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	// Track when captureProjectState runs relative to when the bake attaches
	// lodSplats to the live source. The bug was: capture ran BEFORE the bake,
	// so the snapshot passed to the serializer was a frozen copy with no
	// lodSplats, even though the live asset later carried it.
	let captureCalls = 0;
	let bakeCompleteAtCapture = null;
	let sourceLodSplatsAtCapture = null;
	const capturedStateShell = {
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [scopeAsset],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	};
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		captureProjectStateSpy: () => {
			captureCalls += 1;
			bakeCompleteAtCapture = fakePackedSplats.bakeCompleted;
			sourceLodSplatsAtCapture = scopeAsset.source.lodSplats;
			return capturedStateShell;
		},
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle("quality-save.ssproj");
	globalThis.showSaveFilePicker = async () => savedPackage.fileHandle;
	try {
		await harness.projectController.exportProject();
		await harness.store.overlay.value.onSubmit({
			saveMode: "quality",
			sogCompress: false,
			sogMaxShBands: "2",
			sogIterations: "10",
		});
	} finally {
		globalThis.showSaveFilePicker = originalShowSaveFilePicker;
		globalThis.requestAnimationFrame = originalRequestAnimationFrame;
		if (originalIndexedDb === undefined) {
			// biome-ignore lint/performance/noDelete: Restore the original global shape in this test harness.
			delete globalThis.indexedDB;
		} else {
			globalThis.indexedDB = originalIndexedDb;
		}
	}
	assert.equal(
		fakePackedSplats.bakeCompleted,
		true,
		"Quality save must invoke createLodSplats on the packed splat.",
	);
	assert.ok(
		captureCalls > 0,
		"captureProjectState must be consulted during the save flow.",
	);
	assert.equal(
		bakeCompleteAtCapture,
		true,
		"captureProjectState must run AFTER the Quality bake has mutated the live source — otherwise the serializer sees a snapshot frozen before the bake and the saved ssproj contains no lodSplats.",
	);
	assert.ok(
		sourceLodSplatsAtCapture,
		"At the moment captureProjectState ran, asset.source.lodSplats must already be attached so it flows into the normalized project passed to the serializer.",
	);
	assert.equal(
		scopeAsset.source.lodSplats.bakedQuality,
		"quality",
		"Bake attachment must record bakedQuality so the next open mirrors state.",
	);

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	assert.ok(
		savedArchiveBytes.byteLength > 0,
		"Quality save must write a non-empty .ssproj archive.",
	);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "quality-save.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(
		isProjectFilePackedSplatSource(savedSource),
		true,
		"Quality save archive must restore the splat as a packed-splat source.",
	);
	assert.ok(
		savedSource.lodSplats,
		"Quality save archive must contain baked LoD data after reopening.",
	);
	assert.deepEqual(
		Array.from(savedSource.lodSplats.packedArray),
		[9, 9, 9, 9],
		"Quality save archive must contain the baked lodSplats packedArray.",
	);
	assert.deepEqual(
		Array.from(savedSource.lodSplats.extra.lodTree),
		[1, 2, 3],
		"Quality save archive must contain baked lodSplats extra arrays.",
	);
	assert.equal(savedSource.lodSplats.bakedQuality, "quality");
});

{
	const harness = createHarness();
	harness.projectController.syncProjectPresentation();
	harness.setProjectState({
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [
			{
				id: "shot-1",
				name: "Camera 1",
				pose: {
					position: { x: 1.2, y: 1.5, z: 3.0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
				lens: { baseFovX: 55 },
				clipping: { mode: "auto", near: 0.1, far: 1000 },
				exportSettings: { exportName: "", exportFormat: "psd" },
				outputFrame: {
					widthScale: 1,
					heightScale: 1,
					viewZoom: 1,
					anchor: "center",
					fitScale: 1,
					fitViewportWidth: 1280,
					fitViewportHeight: 720,
				},
				frames: [],
				activeFrameId: "",
				frameMask: { mode: "off", opacityPct: 80, selectedIds: [] },
				navigation: { rollLock: false },
			},
		],
		scene: {
			assets: [],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	});
	assert.equal(harness.projectController.isProjectDirty(), true);
	harness.projectController.establishProjectDirtyBaseline();
	assert.equal(harness.store.project.dirty.value, false);
}

{
	const harness = createHarness();
	await harness.projectController.startNewProject();
	harness.setProjectState({
		workspace: {
			activeShotCameraId: "",
			viewport: {
				baseFovX: 55,
				pose: {
					position: { x: 0, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					up: { x: 0, y: 1, z: 0 },
				},
			},
		},
		shotCameras: [],
		scene: {
			assets: [
				{
					id: "asset-1",
					kind: "model",
					label: "Asset 1",
					source: null,
					transform: {
						position: { x: 1, y: 0, z: 0 },
						quaternion: { x: 0, y: 0, z: 0, w: 1 },
					},
				},
			],
			referenceImages: createDefaultReferenceImageDocument(),
		},
	});
	harness.projectController.syncProjectPresentation();
	await harness.projectController.startNewProject();
	assert.equal(harness.resetProjectWorkspaceCalls.length, 1);
	assert.equal(harness.store.overlay.value?.kind, "confirm");
}

console.log("✅ CAMERA_FRAMES project controller tests passed!");
