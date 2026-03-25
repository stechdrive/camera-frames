import { strToU8, zipSync } from "fflate";
import { ZipReader } from "./project-package.js";
import {
	createDefaultShotCameraDocuments,
	createShotCameraDocument,
} from "./workspace-model.js";

const PROJECT_FORMAT = "camera-frames-project";
const PROJECT_VERSION = 2;
const MANIFEST_PATH = "manifest.json";
const PROJECT_PATH = "project.json";
const DEFAULT_PROJECT_FILENAME = "camera-frames-project.ssproj";
const PROJECT_FILE_EMBEDDED_FILE_SOURCE = "project-file-embedded-file";
const PROJECT_FILE_PACKED_SPLAT_SOURCE = "project-file-packed-splat";

function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}

function clampNormalizedValue(value, fallback = 0.5) {
	if (!isFiniteNumber(value)) {
		return fallback;
	}
	return Math.max(0, Math.min(1, value));
}

function normalizeFileName(value, fallback = "asset.bin") {
	const candidate = String(value ?? "").trim();
	return candidate || fallback;
}

function getPathExtension(path) {
	const clean = String(path || "")
		.replace(/\\/g, "/")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase();
	const lastDot = clean.lastIndexOf(".");
	return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
}

function getMediaTypeFromFileName(
	fileName,
	fallback = "application/octet-stream",
) {
	switch (getPathExtension(fileName)) {
		case "glb":
			return "model/gltf-binary";
		case "gltf":
			return "model/gltf+json";
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "webp":
			return "image/webp";
		default:
			return fallback;
	}
}

function toSerializablePose(pose = null) {
	return {
		position: {
			x: Number(pose?.position?.x ?? 0),
			y: Number(pose?.position?.y ?? 0),
			z: Number(pose?.position?.z ?? 0),
		},
		quaternion: {
			x: Number(pose?.quaternion?.x ?? 0),
			y: Number(pose?.quaternion?.y ?? 0),
			z: Number(pose?.quaternion?.z ?? 0),
			w: Number(pose?.quaternion?.w ?? 1),
		},
		up: {
			x: Number(pose?.up?.x ?? 0),
			y: Number(pose?.up?.y ?? 1),
			z: Number(pose?.up?.z ?? 0),
		},
	};
}

function sanitizeOutputFrame(outputFrame = {}) {
	return {
		widthScale:
			isFiniteNumber(outputFrame.widthScale) && outputFrame.widthScale > 0
				? outputFrame.widthScale
				: 1,
		heightScale:
			isFiniteNumber(outputFrame.heightScale) && outputFrame.heightScale > 0
				? outputFrame.heightScale
				: 1,
		viewZoom:
			isFiniteNumber(outputFrame.viewZoom) && outputFrame.viewZoom > 0
				? outputFrame.viewZoom
				: 1,
		viewZoomAuto: outputFrame.viewZoomAuto !== false,
		anchor:
			typeof outputFrame.anchor === "string" && outputFrame.anchor
				? outputFrame.anchor
				: "center",
		centerX: clampNormalizedValue(outputFrame.centerX, 0.5),
		centerY: clampNormalizedValue(outputFrame.centerY, 0.5),
	};
}

function sanitizeShotCameraDocument(documentState) {
	const normalized = createShotCameraDocument({
		id: documentState?.id,
		name: documentState?.name,
		source: documentState,
	});

	return {
		id: normalized.id,
		name: normalized.name,
		lens: {
			baseFovX: Number(normalized.lens?.baseFovX ?? 60),
		},
		clipping: {
			mode: normalized.clipping?.mode === "manual" ? "manual" : "auto",
			near: Number(normalized.clipping?.near ?? 0.1),
			far: Number(normalized.clipping?.far ?? 1000),
		},
		outputFrame: sanitizeOutputFrame(normalized.outputFrame),
		exportSettings: {
			exportName: String(normalized.exportSettings?.exportName ?? ""),
			exportFormat:
				normalized.exportSettings?.exportFormat === "png" ? "png" : "psd",
			exportGridOverlay: Boolean(normalized.exportSettings?.exportGridOverlay),
			exportGridLayerMode:
				normalized.exportSettings?.exportGridLayerMode === "overlay"
					? "overlay"
					: "bottom",
			exportModelLayers: normalized.exportSettings?.exportModelLayers !== false,
			exportSplatLayers:
				normalized.exportSettings?.exportModelLayers !== false &&
				Boolean(normalized.exportSettings?.exportSplatLayers),
		},
		frames: (normalized.frames ?? []).map((frame) => ({
			id: frame.id,
			name: frame.name,
			x: Number(frame.x ?? 0.5),
			y: Number(frame.y ?? 0.5),
			scale: Number(frame.scale ?? 1),
			rotation: Number(frame.rotation ?? 0),
			order: Number(frame.order ?? 0),
			anchor:
				frame.anchor && typeof frame.anchor === "object"
					? {
							x: clampNormalizedValue(frame.anchor.x, Number(frame.x ?? 0.5)),
							y: clampNormalizedValue(frame.anchor.y, Number(frame.y ?? 0.5)),
						}
					: {
							x: Number(frame.x ?? 0.5),
							y: Number(frame.y ?? 0.5),
						},
		})),
		activeFrameId:
			normalized.activeFrameId ?? normalized.frames?.[0]?.id ?? null,
	};
}

function sanitizeProjectAssetState(asset, index = 0) {
	return {
		id: String(asset?.id ?? `asset-${index + 1}`),
		kind: asset?.kind === "model" ? "model" : "splat",
		label: String(asset?.label ?? `Asset ${index + 1}`),
		source: asset?.source ?? null,
		transform: {
			position: {
				x: Number(asset?.transform?.position?.x ?? 0),
				y: Number(asset?.transform?.position?.y ?? 0),
				z: Number(asset?.transform?.position?.z ?? 0),
			},
			quaternion: {
				x: Number(asset?.transform?.quaternion?.x ?? 0),
				y: Number(asset?.transform?.quaternion?.y ?? 0),
				z: Number(asset?.transform?.quaternion?.z ?? 0),
				w: Number(asset?.transform?.quaternion?.w ?? 1),
			},
		},
		worldScale:
			isFiniteNumber(asset?.worldScale) && asset.worldScale > 0
				? asset.worldScale
				: 1,
		unitMode: String(asset?.unitMode ?? "scene-default"),
		visible: asset?.visible !== false,
		exportRole: asset?.exportRole === "omit" ? "omit" : "beauty",
		maskGroup: String(asset?.maskGroup ?? ""),
		workingPivotLocal:
			asset?.workingPivotLocal && typeof asset.workingPivotLocal === "object"
				? {
						x: Number(asset.workingPivotLocal.x ?? 0),
						y: Number(asset.workingPivotLocal.y ?? 0),
						z: Number(asset.workingPivotLocal.z ?? 0),
					}
				: null,
	};
}

function sanitizeReferenceImageState(referenceImage, index = 0) {
	return {
		id: String(referenceImage?.id ?? `reference-image-${index + 1}`),
		label: String(referenceImage?.label ?? `Reference ${index + 1}`),
		source: referenceImage?.source ?? null,
		space: referenceImage?.space === "viewport" ? "viewport" : "shot-camera",
		shotCameraId:
			typeof referenceImage?.shotCameraId === "string"
				? referenceImage.shotCameraId
				: null,
		placement: {
			x: clampNormalizedValue(referenceImage?.placement?.x, 0.5),
			y: clampNormalizedValue(referenceImage?.placement?.y, 0.5),
			scale:
				isFiniteNumber(referenceImage?.placement?.scale) &&
				referenceImage.placement.scale > 0
					? referenceImage.placement.scale
					: 1,
			rotation: Number(referenceImage?.placement?.rotation ?? 0),
		},
		opacity: Math.max(0, Math.min(1, Number(referenceImage?.opacity ?? 1))),
		blendMode:
			typeof referenceImage?.blendMode === "string" && referenceImage.blendMode
				? referenceImage.blendMode
				: "normal",
		visible: referenceImage?.visible !== false,
		locked: Boolean(referenceImage?.locked),
	};
}

function normalizeProjectDocument(project = {}) {
	const rawShotCameras = Array.isArray(project.shotCameras)
		? project.shotCameras
		: [];
	const normalizedShotCameras =
		rawShotCameras.length > 0
			? rawShotCameras.map((shotCamera) => ({
					...sanitizeShotCameraDocument(shotCamera),
					pose: toSerializablePose(shotCamera.pose),
				}))
			: createDefaultShotCameraDocuments().map((shotCamera) => ({
					...sanitizeShotCameraDocument(shotCamera),
					pose: toSerializablePose(null),
				}));
	const activeShotCameraId =
		typeof project.workspace?.activeShotCameraId === "string" &&
		normalizedShotCameras.some(
			(shotCamera) => shotCamera.id === project.workspace.activeShotCameraId,
		)
			? project.workspace.activeShotCameraId
			: normalizedShotCameras[0].id;

	return {
		schema: PROJECT_FORMAT,
		version: PROJECT_VERSION,
		workspace: {
			activeShotCameraId,
			viewport: {
				baseFovX: Number(project.workspace?.viewport?.baseFovX ?? 60),
				pose: toSerializablePose(project.workspace?.viewport?.pose),
			},
		},
		resources:
			project.resources && typeof project.resources === "object"
				? { ...project.resources }
				: {},
		scene: {
			assets: (Array.isArray(project.scene?.assets)
				? project.scene.assets
				: []
			).map((asset, index) => sanitizeProjectAssetState(asset, index)),
			referenceImages: (Array.isArray(project.scene?.referenceImages)
				? project.scene.referenceImages
				: []
			).map((referenceImage, index) =>
				sanitizeReferenceImageState(referenceImage, index),
			),
		},
		shotCameras: normalizedShotCameras,
	};
}

function buildManifest() {
	return {
		format: PROJECT_FORMAT,
		version: PROJECT_VERSION,
		entries: {
			project: PROJECT_PATH,
		},
		features: ["scene-assets", "shot-cameras", "reference-images"],
	};
}

function toProjectAssetResourceRef(resourceId) {
	return {
		resourceId,
	};
}

async function sha256Hex(bytes) {
	const buffer = bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength,
	);
	const digest = await crypto.subtle.digest("SHA-256", buffer);
	return Array.from(new Uint8Array(digest))
		.map((value) => value.toString(16).padStart(2, "0"))
		.join("");
}

function buildHashedResourcePath(hash, originalName) {
	const extension = getPathExtension(originalName);
	return `resources/sha256/${hash.slice(0, 2)}/${hash}${extension ? `.${extension}` : ""}`;
}

function toUint8Array(value) {
	if (value instanceof Uint8Array) {
		return value;
	}
	if (value instanceof ArrayBuffer) {
		return new Uint8Array(value);
	}
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
	}
	return new Uint8Array();
}

export function createProjectFileEmbeddedFileSource({
	kind,
	file,
	fileName,
	projectAssetState = null,
} = {}) {
	return {
		sourceType: PROJECT_FILE_EMBEDDED_FILE_SOURCE,
		kind: kind === "model" ? "model" : "splat",
		file,
		fileName: normalizeFileName(fileName ?? file?.name, "asset.bin"),
		projectAssetState,
	};
}

export function createProjectFilePackedSplatSource({
	fileName,
	inputBytes,
	extraFiles = {},
	fileType = null,
	projectAssetState = null,
} = {}) {
	return {
		sourceType: PROJECT_FILE_PACKED_SPLAT_SOURCE,
		kind: "splat",
		fileName: normalizeFileName(fileName, "meta.json"),
		inputBytes: toUint8Array(inputBytes),
		extraFiles: Object.fromEntries(
			Object.entries(extraFiles).map(([key, value]) => [key, value]),
		),
		fileType: fileType ? String(fileType) : null,
		projectAssetState,
	};
}

export function isProjectFileEmbeddedFileSource(source) {
	return source?.sourceType === PROJECT_FILE_EMBEDDED_FILE_SOURCE;
}

export function isProjectFilePackedSplatSource(source) {
	return source?.sourceType === PROJECT_FILE_PACKED_SPLAT_SOURCE;
}

export function getDefaultProjectFilename() {
	return DEFAULT_PROJECT_FILENAME;
}

export async function buildCameraFramesProjectArchive(projectSnapshot) {
	const normalizedProject = normalizeProjectDocument(projectSnapshot);
	const archiveEntries = {};
	const resources = {};
	const serializedAssets = [];

	for (const [index, asset] of normalizedProject.scene.assets.entries()) {
		const resourceId = `resource-${index + 1}`;
		if (isProjectFileEmbeddedFileSource(asset.source)) {
			const file = asset.source.file;
			const fileName = normalizeFileName(
				asset.source.fileName ?? file?.name,
				`${asset.kind}-${index + 1}.bin`,
			);
			const bytes = new Uint8Array(await file.arrayBuffer());
			const hash = await sha256Hex(bytes);
			const path = buildHashedResourcePath(hash, fileName);
			archiveEntries[path] = bytes;
			resources[resourceId] = {
				type: "file",
				assetKind: asset.kind,
				path,
				sha256: hash,
				mediaType: file.type || getMediaTypeFromFileName(fileName),
				originalName: fileName,
			};
		} else if (isProjectFilePackedSplatSource(asset.source)) {
			const manifestBytes = toUint8Array(asset.source.inputBytes);
			const manifestHash = await sha256Hex(manifestBytes);
			const manifestPath = buildHashedResourcePath(
				manifestHash,
				asset.source.fileName,
			);
			archiveEntries[manifestPath] = manifestBytes;

			const extraFiles = [];
			for (const [name, value] of Object.entries(
				asset.source.extraFiles ?? {},
			)) {
				const bytes = toUint8Array(value);
				const hash = await sha256Hex(bytes);
				const path = buildHashedResourcePath(hash, name);
				archiveEntries[path] = bytes;
				extraFiles.push({
					name,
					path,
					sha256: hash,
				});
			}

			resources[resourceId] = {
				type: "packed-splat",
				assetKind: "splat",
				fileType: asset.source.fileType ?? null,
				originalName: asset.source.fileName,
				manifest: {
					path: manifestPath,
					sha256: manifestHash,
				},
				extraFiles,
			};
		} else {
			throw new Error(
				`Asset "${asset.label}" is missing a serializable source.`,
			);
		}

		serializedAssets.push({
			...asset,
			source: toProjectAssetResourceRef(resourceId),
		});
	}

	const serializedProject = {
		...normalizedProject,
		resources,
		scene: {
			...normalizedProject.scene,
			assets: serializedAssets,
		},
	};

	archiveEntries[MANIFEST_PATH] = strToU8(
		JSON.stringify(buildManifest(), null, 2),
	);
	archiveEntries[PROJECT_PATH] = strToU8(
		JSON.stringify(serializedProject, null, 2),
	);

	return zipSync(archiveEntries, {
		level: 6,
	});
}

export async function readCameraFramesProject(source) {
	const reader = await ZipReader.from(source);
	const manifest = JSON.parse(await reader.text(MANIFEST_PATH));
	if (
		manifest?.format !== PROJECT_FORMAT ||
		Number(manifest?.version) !== PROJECT_VERSION
	) {
		throw new Error("Unsupported CAMERA_FRAMES project format.");
	}

	const projectPath =
		typeof manifest.entries?.project === "string" && manifest.entries.project
			? manifest.entries.project
			: PROJECT_PATH;
	const project = normalizeProjectDocument(
		JSON.parse(await reader.text(projectPath)),
	);
	const assetEntries = [];

	for (const asset of project.scene.assets) {
		const resourceId = asset.source?.resourceId;
		const resource = project.resources?.[resourceId];
		if (!resource) {
			throw new Error(`Missing project resource for asset "${asset.label}".`);
		}

		if (resource.type === "file") {
			const blob = await reader.blob(resource.path);
			assetEntries.push({
				...asset,
				source: createProjectFileEmbeddedFileSource({
					kind: asset.kind,
					file: new File([blob], resource.originalName, {
						type: resource.mediaType || blob.type || undefined,
					}),
					fileName: resource.originalName,
					projectAssetState: asset,
				}),
			});
			continue;
		}

		if (resource.type === "packed-splat") {
			const manifestBlob = await reader.blob(resource.manifest?.path);
			const extraFiles = {};
			for (const extraFile of resource.extraFiles ?? []) {
				const extraBlob = await reader.blob(extraFile.path);
				extraFiles[extraFile.name] = await extraBlob.arrayBuffer();
			}
			assetEntries.push({
				...asset,
				source: createProjectFilePackedSplatSource({
					fileName: resource.originalName,
					inputBytes: new Uint8Array(await manifestBlob.arrayBuffer()),
					extraFiles,
					fileType: resource.fileType ?? null,
					projectAssetState: asset,
				}),
			});
			continue;
		}

		throw new Error(`Unsupported project resource type "${resource.type}".`);
	}

	return {
		manifest,
		project,
		assetEntries,
	};
}
