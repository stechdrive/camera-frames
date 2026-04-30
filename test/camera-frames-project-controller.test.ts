import assert from "node:assert/strict";
import { createProjectController } from "../src/controllers/project-controller.js";
import { buildZipArchiveBytes } from "../src/project-archive.js";
import { materializeProjectFilePackedSplatFullData } from "../src/project/document.js";
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
		case "error.projectSourceStagingRequired":
			return "Save this project file to the device and open it again.";
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

function createFakeOpfsStorage() {
	const records = new Map();
	const removed = [];
	const written = [];
	const directory = {
		async getFileHandle(name) {
			return {
				async createWritable() {
					const chunks = [];
					return new WritableStream({
						write(chunk) {
							written.push(name);
							chunks.push(chunk instanceof Uint8Array ? chunk.slice() : chunk);
						},
						close() {
							records.set(name, chunks);
						},
					});
				},
				async getFile() {
					return new File(records.get(name) ?? [], name, {
						type: "application/x-camera-frames-project",
					});
				},
			};
		},
		async removeEntry(name) {
			removed.push(name);
			records.delete(name);
		},
	};
	return {
		removed,
		written,
		storage: {
			async estimate() {
				return { quota: 1024 * 1024 * 1024, usage: 0 };
			},
			async getDirectory() {
				return {
					async getDirectoryHandle() {
						return directory;
					},
				};
			},
		},
	};
}

class HugeCountingProjectBlob extends Blob {
	constructor(state) {
		super([new Uint8Array([1, 2, 3, 4])], {
			type: "application/x-camera-frames-project",
		});
		this.state = state;
		Object.defineProperty(this, "name", {
			configurable: true,
			value: "huge-cloud.ssproj",
		});
	}

	get size() {
		return 300 * 1024 * 1024;
	}

	slice(start, end, contentType) {
		this.state.sliceCalls = (this.state.sliceCalls ?? 0) + 1;
		return super.slice(start, end, contentType);
	}

	async arrayBuffer() {
		this.state.arrayBufferCalls = (this.state.arrayBufferCalls ?? 0) + 1;
		return await super.arrayBuffer();
	}
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
		supportsSparkRadBundleBuildImpl: overrides.supportsSparkRadBundleBuildImpl,
		buildSparkRadBundleFromPackedSplatsImpl:
			overrides.buildSparkRadBundleFromPackedSplatsImpl,
		cleanupStaleProjectOpenSourcesImpl:
			overrides.cleanupStaleProjectOpenSourcesImpl,
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
	let cleanupCalls = 0;
	createHarness({
		cleanupStaleProjectOpenSourcesImpl: async () => {
			cleanupCalls += 1;
		},
	});
	await Promise.resolve();
	assert.equal(
		cleanupCalls,
		1,
		"project controller should sweep stale staged project sources at startup",
	);
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
	const opfs = createFakeOpfsStorage();
	await withNavigator(
		{
			userAgent:
				"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/147",
			maxTouchPoints: 5,
			storage: opfs.storage,
		},
		async () => {
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
			const projectFile = new File([archive], "cloud-scene.ssproj");
			await harness.projectController.openProjectSource(projectFile);
			assert.equal(opfs.written.length > 0, true);
			assert.equal(
				opfs.removed.length,
				0,
				"mobile staged project source must survive after successful open for deferred reads",
			);
			await harness.projectController.startNewProject();
			const discardAction = harness.store.overlay.value?.actions?.find(
				(action) => action.label === "action.discardAndNewProject",
			);
			if (discardAction) {
				await discardAction.onClick();
			}
			assert.equal(
				opfs.removed.length,
				1,
				"starting a new project releases the staged project source",
			);
		},
	);
}

{
	const opfs = createFakeOpfsStorage();
	await withNavigator(
		{
			userAgent:
				"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/147",
			maxTouchPoints: 5,
			storage: opfs.storage,
		},
		async () => {
			const harness = createHarness();
			const brokenProjectFile = new File(
				[new Uint8Array([1, 2, 3, 4])],
				"broken-cloud.ssproj",
			);
			await assert.rejects(
				harness.projectController.openProjectSource(brokenProjectFile),
			);
			assert.equal(opfs.written.length > 0, true);
			assert.equal(
				opfs.removed.length,
				1,
				"failed project open should release the staged project source immediately",
			);
		},
	);
}

{
	const sourceState = {};
	await withNavigator(
		{
			userAgent:
				"Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/147",
			maxTouchPoints: 5,
			storage: null,
		},
		async () => {
			const harness = createHarness();
			const source = new HugeCountingProjectBlob(sourceState);
			await assert.rejects(
				harness.projectController.openProjectSource(source),
				(error) => {
					assert.equal(error.code, "PROJECT_SOURCE_STAGING_REQUIRED");
					assert.equal(error.reason, "staging-unavailable-large-file");
					assert.equal(
						error.message,
						"Save this project file to the device and open it again.",
					);
					return true;
				},
			);
			assert.equal(
				sourceState.sliceCalls ?? 0,
				0,
				"large mobile files without a stable copy should fail before legacy archive probing re-reads the original provider Blob",
			);
			assert.equal(sourceState.arrayBufferCalls ?? 0, 0);
			assert.equal(harness.store.overlay.value, null);
		},
	);
}

{
	const opfs = createFakeOpfsStorage();
	await withNavigator(
		{
			userAgent:
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/147 Safari/537.36",
			maxTouchPoints: 5,
			storage: opfs.storage,
		},
		async () => {
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
			const projectFile = new File([archive], "stable-handle.ssproj");
			await harness.projectController.openProjectSource(projectFile, {
				fileHandle: {
					name: projectFile.name,
					getFile: async () => projectFile,
				},
			});
			assert.equal(
				opfs.written.length,
				0,
				"desktop-like touch opens with a File System Access handle should not create an extra OPFS staging copy",
			);
			assert.equal(harness.applyOpenedProjectCalls.length, 1);
		},
	);
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
	const originalFetch = globalThis.fetch;
	let fetchedUrl = "";
	globalThis.fetch = async (url) => {
		fetchedUrl = String(url);
		return new Response(new Blob([archive]), {
			status: 200,
			headers: {
				"Content-Type": "application/x-camera-frames-project",
			},
		});
	};
	try {
		await harness.projectController.openProjectSource(
			"https://example.test/projects/remote-scene.ssproj",
		);
	} finally {
		globalThis.fetch = originalFetch;
	}

	assert.equal(fetchedUrl, "https://example.test/projects/remote-scene.ssproj");
	assert.equal(harness.store.overlay.value, null);
	assert.equal(harness.applyOpenedProjectCalls.length, 1);
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
// Quality is the default package-save path, producing RAD-only output unless
// the user explicitly asks to keep FullData too.
await withNavigator({ gpu: {} }, async () => {
	const harness = createHarness();
	await harness.projectController.exportProject();
	const overlay = harness.store.overlay.value;
	const saveModeField = overlay?.fields?.find((f) => f.id === "saveMode");
	assert.equal(saveModeField?.type, "radio");
	assert.equal(saveModeField?.value, "quality");
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
	const qualityGroup = overlay?.fields?.find((f) => f.id === "qualityOptions");
	assert.equal(qualityGroup?.type, "group");
	assert.ok(
		qualityGroup?.fields?.some((f) => f.id === "preserveSplatFullData"),
		"Quality group must expose the FullData preservation toggle.",
	);
});

// A RAD-backed .ssproj that has not entered per-splat editing should be able
// to save as default Quality/RAD-only by repackaging the existing RAD bundle.
// It must not materialize FullData or rebuild RAD just to drop duplicated data.
await withNavigator({ gpu: {} }, async () => {
	let ensureFullDataCalls = 0;
	let radBuildCalls = 0;
	const rootBytes = new Uint8Array([0x52, 0x41, 0x44, 0x30, 1, 2, 3, 4]);
	const chunkBytes = new Uint8Array([0x52, 0x41, 0x44, 0x43, 5, 6, 7, 8]);
	const scopeAsset = {
		id: "splat-existing-rad",
		kind: "splat",
		label: "existing-rad",
		disposeTarget: { pagedSplats: {} },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "existing-rad.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: new Uint32Array([11, 12, 13, 14]),
			numSplats: 1,
			extra: { sh1: new Uint32Array([21, 22, 23, 24]) },
			splatEncoding: null,
			lodSplats: {
				packedArray: new Uint32Array([31, 32, 33, 34]),
				numSplats: 1,
				extra: {},
				splatEncoding: null,
				bakedQuality: "quality",
			},
			radBundle: {
				kind: "spark-rad-bundle",
				version: 1,
				root: {
					name: "existing-rad-lod.rad",
					bytes: rootBytes,
					size: rootBytes.byteLength,
				},
				chunks: [
					{
						name: "existing-rad-lod-1.radc",
						bytes: chunkBytes,
						size: chunkBytes.byteLength,
					},
				],
				sourceFingerprint: { numSplats: 1 },
				bounds: null,
				sparkVersion: "2.0.0",
				build: { mode: "quality", chunked: true },
			},
			fullDataPolicy: null,
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
			ensureFullDataForSplatAssets: async () => {
				ensureFullDataCalls += 1;
				return true;
			},
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async () => {
			radBuildCalls += 1;
			throw new Error("RAD rebuild should not run");
		},
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"existing-rad-repacked.ssproj",
	);
	globalThis.showSaveFilePicker = async () => savedPackage.fileHandle;
	try {
		await harness.projectController.exportProject();
		const saveMode = harness.store.overlay.value?.fields?.find(
			(f) => f.id === "saveMode",
		)?.value;
		await harness.store.overlay.value.onSubmit({
			saveMode,
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
	assert.equal(ensureFullDataCalls, 0);
	assert.equal(radBuildCalls, 0);
	assert.equal(scopeAsset.source.fullDataPolicy, "derive-from-rad");

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "existing-rad-repacked.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.fullDataPolicy, "derive-from-rad");
	assert.equal(savedSource.packedArray.length, 0);
	assert.equal(savedSource.lodSplats, null);
	assert.equal(savedSource.radBundle.root.name, "existing-rad-lod.rad");
	assert.equal(savedSource.radBundle.chunks[0].name, "existing-rad-lod-1.radc");
	assert.deepEqual(
		Array.from(
			new Uint8Array(await savedSource.radBundle.root.blob.arrayBuffer()),
		),
		Array.from(rootBytes),
	);
});

// If RAD streaming fell back to FullData but kept the reusable Quality RAD
// cache, default Quality save should still repackage that RAD-only bundle.
// Shot-camera/layout edits do not edit the 3DGS source, so this path must not
// bake or rebuild RAD just because the runtime now has PackedSplats.
await withNavigator({ gpu: {} }, async () => {
	let radBuildCalls = 0;
	const rootBytes = new Uint8Array([0x52, 0x41, 0x44, 0x30, 9, 8, 7, 6]);
	const fakePackedSplats = {
		packedArray: new Uint32Array([201, 202, 203, 204]),
		numSplats: 1,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
		async createLodSplats() {
			assert.fail("Reusable Quality RAD should skip Quality LoD bake.");
		},
	};
	const scopeAsset = {
		id: "splat-existing-rad-full-data",
		kind: "splat",
		label: "existing-rad-full-data",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "existing-rad-full-data.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: fakePackedSplats.packedArray,
			numSplats: fakePackedSplats.numSplats,
			extra: {},
			splatEncoding: null,
			lodSplats: null,
			radBundle: {
				kind: "spark-rad-bundle",
				version: 1,
				root: {
					name: "existing-rad-full-data-lod.rad",
					bytes: rootBytes,
					size: rootBytes.byteLength,
				},
				chunks: [],
				sourceFingerprint: { numSplats: 1 },
				bounds: null,
				sparkVersion: "2.0.0",
				build: { mode: "quality", chunked: false },
			},
			fullDataPolicy: "derive-from-rad",
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async () => {
			radBuildCalls += 1;
			throw new Error("Reusable Quality RAD should skip RAD rebuild.");
		},
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"existing-rad-full-data-repacked.ssproj",
	);
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
	assert.equal(radBuildCalls, 0);
	assert.equal(scopeAsset.source.fullDataPolicy, "derive-from-rad");

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "existing-rad-full-data-repacked.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.fullDataPolicy, "derive-from-rad");
	assert.equal(savedSource.packedArray.length, 0);
	assert.equal(savedSource.lodSplats, null);
	assert.equal(
		savedSource.radBundle.root.name,
		"existing-rad-full-data-lod.rad",
	);
	assert.deepEqual(
		Array.from(
			new Uint8Array(await savedSource.radBundle.root.blob.arrayBuffer()),
		),
		Array.from(rootBytes),
	);
});

// A pre-existing RAD bundle is only reusable as RAD-only source-of-truth when
// it is known to be a Quality RAD. Quick/unknown RAD is a cache and must be
// replaced before default Quality save drops FullData.
await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([101, 102, 103, 104]),
		numSplats: 1,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {
			sh1: new Uint32Array([201, 202, 203, 204]),
		},
		splatEncoding: {
			rgbMin: 0,
			update() {
				return true;
			},
		},
	};
	const oldRootBytes = new Uint8Array([0x52, 0x41, 0x44, 0x30, 1]);
	const newRootBytes = new Uint8Array([0x52, 0x41, 0x44, 0x30, 2]);
	const scopeAsset = {
		id: "splat-quick-rad",
		kind: "splat",
		label: "quick-rad",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "quick-rad.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: fakePackedSplats.packedArray,
			numSplats: fakePackedSplats.numSplats,
			extra: {},
			splatEncoding: null,
			lodSplats: {
				packedArray: new Uint32Array([111, 112, 113, 114]),
				numSplats: 1,
				extra: { lodTree: new Uint32Array([0, 0, 0, 0]) },
				splatEncoding: null,
				bakedQuality: "quality",
			},
			radBundle: {
				kind: "spark-rad-bundle",
				version: 1,
				root: {
					name: "quick-rad-cache.rad",
					bytes: oldRootBytes,
					size: oldRootBytes.byteLength,
				},
				chunks: [],
				sourceFingerprint: { numSplats: 1 },
				bounds: null,
				sparkVersion: "2.0.0",
				build: { mode: "quick", chunked: false },
			},
			fullDataPolicy: null,
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	const radBuildCalls = [];
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async (input) => {
			structuredClone(input);
			radBuildCalls.push(input);
			return {
				root: {
					name: "quality-rad-rebuilt.rad",
					bytes: newRootBytes,
				},
				chunks: [],
				metadata: {
					sparkVersion: "2.0.0",
					sourceFingerprint: { numSplats: input.numSplats },
					build: { mode: "quality", chunked: false },
				},
			};
		},
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"quick-rad-rebuilt.ssproj",
	);
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
	assert.equal(radBuildCalls.length, 1);
	assert.deepEqual(
		Array.from(radBuildCalls[0].lodSplats.packedArray),
		[111, 112, 113, 114],
	);
	assert.deepEqual(radBuildCalls[0].extraArrays, {});
	assert.equal(radBuildCalls[0].splatEncoding, null);
	assert.equal(scopeAsset.source.fullDataPolicy, "derive-from-rad");
	assert.equal(
		scopeAsset.source.radBundle.root.name,
		"quality-rad-rebuilt.rad",
	);

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "quick-rad-rebuilt.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.fullDataPolicy, "derive-from-rad");
	assert.equal(savedSource.packedArray.length, 0);
	assert.equal(savedSource.lodSplats, null);
	assert.equal(savedSource.radBundle.root.name, "quality-rad-rebuilt.rad");
	assert.deepEqual(
		Array.from(
			new Uint8Array(await savedSource.radBundle.root.blob.arrayBuffer()),
		),
		Array.from(newRootBytes),
	);
});

// If the RAD encoder is unavailable, a stale/unknown RAD cache must not turn
// into a RAD-only package. Keep FullData + LoD so the save stays lossless.
await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([121, 122, 123, 124]),
		numSplats: 1,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
	};
	const scopeAsset = {
		id: "splat-stale-rad-no-encoder",
		kind: "splat",
		label: "stale-rad-no-encoder",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "stale-rad-no-encoder.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: fakePackedSplats.packedArray,
			numSplats: fakePackedSplats.numSplats,
			extra: {},
			splatEncoding: null,
			lodSplats: {
				packedArray: new Uint32Array([131, 132, 133, 134]),
				numSplats: 1,
				extra: {},
				splatEncoding: null,
				bakedQuality: "quality",
			},
			radBundle: {
				kind: "spark-rad-bundle",
				version: 1,
				root: {
					name: "stale-cache.rad",
					bytes: new Uint8Array([0x52, 0x41, 0x44, 0x30, 3]),
					size: 5,
				},
				chunks: [],
				sourceFingerprint: { numSplats: 1 },
				build: null,
			},
			fullDataPolicy: null,
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		supportsSparkRadBundleBuildImpl: () => false,
		buildSparkRadBundleFromPackedSplatsImpl: async () => {
			throw new Error("RAD build should not be attempted");
		},
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"stale-rad-no-encoder.ssproj",
	);
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
	assert.equal(scopeAsset.source.fullDataPolicy, null);

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "stale-rad-no-encoder.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.fullDataPolicy, null);
	const fullSource =
		await materializeProjectFilePackedSplatFullData(savedSource);
	assert.deepEqual(Array.from(fullSource.packedArray), [121, 122, 123, 124]);
	assert.deepEqual(
		Array.from(fullSource.lodSplats.packedArray),
		[131, 132, 133, 134],
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

await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([31, 32, 33, 34]),
		numSplats: 2_000_000,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
		lodSplats: null,
		needsUpdate: false,
		async createLodSplats() {
			this.lodSplats = {
				packedArray: new Uint32Array([41, 42, 43, 44]),
				numSplats: 1_000_000,
				getNumSplats() {
					return this.numSplats;
				},
				extra: { lodTree: new Uint32Array([7, 8, 9]) },
				splatEncoding: null,
			};
			this.needsUpdate = true;
		},
		disposeLodSplats() {
			this.lodSplats = null;
		},
	};
	const scopeAsset = {
		id: "splat-rad-quality",
		kind: "splat",
		label: "rad-quality",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "rad-quality.rawsplat",
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
	const radBuildCalls = [];
	let radBundleAtCapture = null;
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async (input) => {
			radBuildCalls.push(input);
			return {
				root: {
					name: "rad-quality-lod.rad",
					bytes: new Uint8Array([0x52, 0x41, 0x44, 0x30]),
				},
				chunks: [
					{
						name: "rad-quality-lod-1.radc",
						bytes: new Uint8Array([1, 2, 3, 4]),
					},
				],
				metadata: {
					sparkVersion: "2.0.0",
					sourceFingerprint: {
						numSplats: input.numSplats,
						packedArraySha256:
							"240e10fe289dc87f0adf500a96166e6c071414beeb936e4e37d86345c273558d",
						extraArraysSha256: {},
					},
					bounds: {
						local: {
							min: { x: -1, y: -1, z: -1 },
							max: { x: 1, y: 1, z: 1 },
						},
					},
					build: { mode: "quality", chunked: true },
				},
			};
		},
		captureProjectStateSpy: () => {
			radBundleAtCapture = scopeAsset.source.radBundle;
			return capturedStateShell;
		},
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"quality-save-rad.ssproj",
	);
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
	assert.equal(radBuildCalls.length, 1);
	assert.equal(radBuildCalls[0].quality, true);
	assert.deepEqual(
		Array.from(radBuildCalls[0].lodSplats.packedArray),
		[41, 42, 43, 44],
	);
	assert.deepEqual(
		Array.from(radBuildCalls[0].lodSplats.extra.lodTree),
		[7, 8, 9],
	);
	assert.ok(
		radBundleAtCapture?.root,
		"Quality save must attach the generated RAD bundle before project snapshot capture.",
	);
	assert.match(radBundleAtCapture.root.sha256, /^[a-f0-9]{64}$/);
	assert.match(radBundleAtCapture.chunks[0].sha256, /^[a-f0-9]{64}$/);

	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "quality-save-rad.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.packedArray.length, 0);
	assert.equal(savedSource.fullDataPolicy, "derive-from-rad");
	assert.equal(
		savedSource.lodSplats,
		null,
		"Default Quality RAD save must not duplicate lodSplats beside RAD.",
	);
	assert.ok(savedSource.radBundle?.root?.blob instanceof Blob);
	assert.equal(savedSource.radBundle.root.name, "rad-quality-lod.rad");
	assert.equal(savedSource.radBundle.chunks[0].name, "rad-quality-lod-1.radc");
	assert.match(savedSource.radBundle.root.sha256, /^[a-f0-9]{64}$/);
	assert.match(savedSource.radBundle.chunks[0].sha256, /^[a-f0-9]{64}$/);
	assert.equal(
		savedSource.radBundle.sourceFingerprint.packedArraySha256,
		"240e10fe289dc87f0adf500a96166e6c071414beeb936e4e37d86345c273558d",
	);
});

await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([71, 72, 73, 74]),
		numSplats: 4,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
		lodSplats: null,
		async createLodSplats() {
			this.lodSplats = {
				packedArray: new Uint32Array([81, 82, 83, 84]),
				numSplats: 4,
				extra: { lodTree: new Uint32Array([0, 0, 0, 0]) },
				splatEncoding: null,
			};
		},
	};
	const scopeAsset = {
		id: "splat-rad-preserve",
		kind: "splat",
		label: "rad-preserve",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "rad-preserve.rawsplat",
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
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
			ensureFullDataForSplatAssets: async () => true,
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async () => ({
			root: {
				name: "rad-preserve-lod.rad",
				bytes: new Uint8Array([0x52, 0x41, 0x44, 0x30]),
			},
			chunks: [],
			metadata: {
				sourceFingerprint: { numSplats: fakePackedSplats.numSplats },
				build: { mode: "quality", chunked: false },
			},
		}),
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"quality-save-rad-preserve.ssproj",
	);
	globalThis.showSaveFilePicker = async () => savedPackage.fileHandle;
	try {
		await harness.projectController.exportProject();
		await harness.store.overlay.value.onSubmit({
			saveMode: "quality",
			preserveSplatFullData: true,
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
	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "quality-save-rad-preserve.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.equal(savedSource.fullDataPolicy, null);
	assert.ok(savedSource.radBundle?.root?.blob instanceof Blob);
	const fullSource =
		await materializeProjectFilePackedSplatFullData(savedSource);
	assert.deepEqual(Array.from(fullSource.packedArray), [71, 72, 73, 74]);
	assert.deepEqual(
		Array.from(fullSource.lodSplats.packedArray),
		[81, 82, 83, 84],
	);
});

await withNavigator({ gpu: {} }, async () => {
	const fakePackedSplats = {
		packedArray: new Uint32Array([51, 52, 53, 54]),
		numSplats: 4,
		getNumSplats() {
			return this.numSplats;
		},
		extra: {},
		splatEncoding: null,
		lodSplats: null,
		needsUpdate: false,
		async createLodSplats() {
			this.lodSplats = {
				packedArray: new Uint32Array([61, 62, 63, 64]),
				numSplats: 4,
				extra: { lodTree: new Uint32Array([0, 0, 0, 0]) },
				splatEncoding: null,
			};
			this.needsUpdate = true;
		},
	};
	const scopeAsset = {
		id: "splat-rad-fail",
		kind: "splat",
		label: "rad-fail",
		disposeTarget: { packedSplats: fakePackedSplats },
		source: {
			sourceType: "project-file-packed-splat",
			kind: "splat",
			fileName: "rad-fail.rawsplat",
			inputBytes: new Uint8Array(),
			extraFiles: {},
			fileType: null,
			packedArray: fakePackedSplats.packedArray,
			numSplats: fakePackedSplats.numSplats,
			extra: {},
			splatEncoding: null,
			lodSplats: null,
			radBundle: {
				kind: "spark-rad-bundle",
				version: 1,
				root: { name: "stale.rad", bytes: new Uint8Array([1]) },
				chunks: [],
			},
			projectAssetState: null,
			legacyState: null,
			resource: null,
		},
	};
	const harness = createHarness({
		assetController: {
			getSceneAssets: () => [scopeAsset],
		},
		supportsSparkRadBundleBuildImpl: () => true,
		buildSparkRadBundleFromPackedSplatsImpl: async () => {
			throw new Error("encoder unavailable");
		},
		captureProjectStateSpy: () => ({
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
		}),
	});
	const originalShowSaveFilePicker = globalThis.showSaveFilePicker;
	const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
	const originalIndexedDb = globalThis.indexedDB;
	globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
	globalThis.indexedDB = createCompletingIndexedDb();
	const savedPackage = createCollectingProjectFileHandle(
		"quality-save-rad-failure.ssproj",
	);
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
	const savedArchiveBytes = await collectWritableChunks(savedPackage.chunks);
	const savedProject = await readCameraFramesProject(
		new File([savedArchiveBytes], "quality-save-rad-failure.ssproj"),
	);
	const savedSource = savedProject.assetEntries[0]?.source;
	assert.equal(isProjectFilePackedSplatSource(savedSource), true);
	assert.ok(
		savedSource.lodSplats,
		"Quality LoD must survive RAD build failure.",
	);
	assert.equal(savedSource.radBundle, null);
	assert.equal(savedSource.fullDataPolicy, null);
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
