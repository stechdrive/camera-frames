// @ts-nocheck
import assert from "node:assert/strict";
import {
	createProjectFileEmbeddedFileSource,
	createProjectFilePackedSplatSource,
} from "../src/project-document.js";
import {
	readCameraFramesWorkingProject,
	saveCameraFramesWorkingProject,
} from "../src/project-storage-working.js";
import { createDefaultReferenceImageDocument } from "../src/reference-image-model.js";

function createNotFoundError(message = "Not found") {
	const error = new Error(message);
	error.name = "NotFoundError";
	return error;
}

class FakeFileHandle {
	constructor(name, initialData = new Uint8Array()) {
		this.kind = "file";
		this.name = name;
		this.data = initialData;
		this.writeCount = 0;
	}

	async getFile() {
		return new File([this.data], this.name);
	}

	async createWritable() {
		return {
			write: async (value) => {
				this.data =
					value instanceof Uint8Array
						? value
						: new Uint8Array(await new Blob([value]).arrayBuffer());
			},
			close: async () => {
				this.writeCount += 1;
			},
		};
	}
}

class FakeDirectoryHandle {
	constructor(name) {
		this.kind = "directory";
		this.name = name;
		this.directories = new Map();
		this.files = new Map();
	}

	async getDirectoryHandle(name, { create = false } = {}) {
		if (this.directories.has(name)) {
			return this.directories.get(name);
		}
		if (!create) {
			throw createNotFoundError(`Missing directory: ${name}`);
		}
		const directory = new FakeDirectoryHandle(name);
		this.directories.set(name, directory);
		return directory;
	}

	async getFileHandle(name, { create = false } = {}) {
		if (this.files.has(name)) {
			return this.files.get(name);
		}
		if (!create) {
			throw createNotFoundError(`Missing file: ${name}`);
		}
		const file = new FakeFileHandle(name);
		this.files.set(name, file);
		return file;
	}

	getFileByPath(path) {
		const segments = String(path).split("/").filter(Boolean);
		let current = this;
		while (segments.length > 1) {
			current = current.directories.get(segments.shift());
			if (!current) {
				return null;
			}
		}
		return current.files.get(segments[0]) ?? null;
	}
}

const baseProjectSnapshot = {
	workspace: {
		activeShotCameraId: "shot-camera-1",
		viewport: {
			baseFovX: 55,
			pose: {
				position: { x: 1, y: 2, z: 3 },
				quaternion: { x: 0, y: 0, z: 0, w: 1 },
				up: { x: 0, y: 1, z: 0 },
			},
		},
	},
	shotCameras: [
		{
			id: "shot-camera-1",
			name: "Camera 1",
			pose: {
				position: { x: 4, y: 5, z: 6 },
				quaternion: { x: 0, y: 0, z: 0, w: 1 },
				up: { x: 0, y: 1, z: 0 },
			},
			lens: { baseFovX: 48 },
			clipping: { mode: "manual", near: 0.2, far: 200 },
			outputFrame: {
				widthScale: 1.1,
				heightScale: 0.9,
				viewZoom: 1.2,
				viewZoomAuto: false,
				anchor: "top-right",
				centerX: 0.4,
				centerY: 0.6,
			},
			exportSettings: {
				exportName: "cut-a",
				exportFormat: "png",
				exportGridOverlay: true,
				exportGridLayerMode: "overlay",
				exportModelLayers: false,
				exportSplatLayers: false,
			},
			frames: [],
			activeFrameId: null,
		},
	],
	scene: {
		assets: [
			{
				id: "asset-model",
				kind: "model",
				label: "Layout",
				source: createProjectFileEmbeddedFileSource({
					kind: "model",
					file: new File([new Uint8Array([1, 2, 3, 4])], "layout.glb", {
						type: "model/gltf-binary",
					}),
					fileName: "layout.glb",
				}),
				transform: {
					position: { x: 1, y: 0, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				contentTransform: {
					position: { x: 0.1, y: 0.2, z: 0.3 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
					scale: { x: 0.9, y: 0.9, z: 0.9 },
				},
				baseScale: { x: 1, y: 1, z: 1 },
				worldScale: 1,
				unitMode: "meters",
				visible: true,
				exportRole: "beauty",
				maskGroup: "",
				workingPivotLocal: null,
			},
			{
				id: "asset-splat",
				kind: "splat",
				label: "Packed Splat",
				source: createProjectFilePackedSplatSource({
					fileName: "meta.json",
					inputBytes: new TextEncoder().encode('{"files":["means.bin"]}'),
					extraFiles: {
						"means.bin": new Uint8Array([5, 6, 7]).buffer,
					},
					fileType: "pcsogs",
				}),
				transform: {
					position: { x: 0, y: 1, z: 0 },
					quaternion: { x: 0, y: 0, z: 0, w: 1 },
				},
				worldScale: 2,
				unitMode: "meters",
				visible: false,
				exportRole: "omit",
				maskGroup: "mask-a",
				workingPivotLocal: { x: 0.1, y: 0.2, z: 0.3 },
			},
		],
		referenceImages: createDefaultReferenceImageDocument(),
	},
};

const workingDirectory = new FakeDirectoryHandle("shot-a");
const firstSave = await saveCameraFramesWorkingProject({
	directoryHandle: workingDirectory,
	projectSnapshot: baseProjectSnapshot,
	projectName: "shot-a",
});

assert.equal(firstSave.manifest.storageMode, "working");
assert.equal(firstSave.writtenResourceCount, 2);
assert.equal(firstSave.reusedResourceCount, 0);

const readResult = await readCameraFramesWorkingProject(workingDirectory);
assert.equal(readResult.project.workspace.activeShotCameraId, "shot-camera-1");
assert.equal(readResult.assetEntries.length, 2);
assert.equal(
	readResult.project.scene.assets[0].contentTransform.position.x,
	0.1,
);
assert.equal(readResult.project.scene.assets[0].contentTransform.scale.x, 0.9);
assert.equal(readResult.project.scene.assets[0].baseScale.x, 1);
assert.equal(readResult.assetEntries[0].source.resource.type, "file");
assert.equal(readResult.assetEntries[1].source.resource.type, "packed-splat");

const reopenSnapshot = {
	workspace: readResult.project.workspace,
	shotCameras: readResult.project.shotCameras,
	scene: {
		assets: readResult.project.scene.assets.map((asset, index) => ({
			...asset,
			source: readResult.assetEntries[index].source,
		})),
		referenceImages: readResult.project.scene.referenceImages,
	},
};

const modelPath = firstSave.project.resources["resource-1"].path;
const splatManifestPath =
	firstSave.project.resources["resource-2"].manifest.path;
const modelFileHandle = workingDirectory.getFileByPath(modelPath);
const splatManifestFileHandle =
	workingDirectory.getFileByPath(splatManifestPath);

assert.ok(modelFileHandle);
assert.ok(splatManifestFileHandle);
assert.equal(modelFileHandle.writeCount, 1);
assert.equal(splatManifestFileHandle.writeCount, 1);

const secondSave = await saveCameraFramesWorkingProject({
	directoryHandle: workingDirectory,
	projectSnapshot: reopenSnapshot,
	projectName: "shot-a",
});

assert.equal(secondSave.writtenResourceCount, 0);
assert.equal(secondSave.reusedResourceCount, 2);
assert.equal(modelFileHandle.writeCount, 1);
assert.equal(splatManifestFileHandle.writeCount, 1);

console.log("✅ CAMERA_FRAMES working project storage tests passed!");
