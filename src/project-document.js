import { DEFAULT_SHOT_CAMERA_BASE_FOVX } from "./engine/camera-lens.js";
import { normalizeLightingState } from "./lighting-model.js";
import {
	REFERENCE_IMAGE_ASSET_KIND,
	createDefaultReferenceImageDocument,
	normalizeReferenceImageDocument,
	sanitizeShotCameraReferenceImagesState,
} from "./reference-image-model.js";
import {
	createDefaultShotCameraDocuments,
	createShotCameraDocument,
} from "./workspace-model.js";

export const PROJECT_FORMAT = "camera-frames-project";
export const PROJECT_VERSION = 2;
export const PROJECT_MANIFEST_PATH = "manifest.json";
export const PROJECT_DOCUMENT_PATH = "project.json";
export const PROJECT_JOURNAL_PATH = "journal.json";
export const DEFAULT_PROJECT_FILENAME = "camera-frames-project.ssproj";
export const PROJECT_FILE_EMBEDDED_FILE_SOURCE = "project-file-embedded-file";
export const PROJECT_FILE_PACKED_SPLAT_SOURCE = "project-file-packed-splat";

function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}

function clampNormalizedValue(value, fallback = 0.5) {
	if (!isFiniteNumber(value)) {
		return fallback;
	}
	return Math.max(0, Math.min(1, value));
}

export function normalizeProjectFileName(value, fallback = "asset.bin") {
	const candidate = String(value ?? "").trim();
	return candidate || fallback;
}

export function generateProjectId() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}

	return `camera-frames-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getProjectPathExtension(path) {
	const clean = String(path || "")
		.replace(/\\/g, "/")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase();
	const lastDot = clean.lastIndexOf(".");
	return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
}

export function getProjectMediaTypeFromFileName(
	fileName,
	fallback = "application/octet-stream",
) {
	switch (getProjectPathExtension(fileName)) {
		case "glb":
			return "model/gltf-binary";
		case "gltf":
			return "model/gltf+json";
		case "psd":
			return "image/vnd.adobe.photoshop";
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

export function toSerializableCameraPose(pose = null) {
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

export function sanitizeShotCameraDocument(
	documentState,
	{ availablePresetIds = [] } = {},
) {
	const normalized = createShotCameraDocument({
		id: documentState?.id,
		name: documentState?.name,
		source: documentState,
	});

	return {
		id: normalized.id,
		name: normalized.name,
		lens: {
			baseFovX: Number(
				normalized.lens?.baseFovX ?? DEFAULT_SHOT_CAMERA_BASE_FOVX,
			),
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
		navigation: {
			rollLock: Boolean(normalized.navigation?.rollLock),
		},
		referenceImages: sanitizeShotCameraReferenceImagesState(
			normalized.referenceImages,
			{ availablePresetIds },
		),
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

export function sanitizeProjectAssetState(asset, index = 0) {
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
		legacyState:
			asset?.legacyState && typeof asset.legacyState === "object"
				? JSON.parse(JSON.stringify(asset.legacyState))
				: null,
	};
}

export function normalizeProjectDocument(project = {}) {
	const normalizedReferenceImages = normalizeReferenceImageDocument(
		project.scene?.referenceImages ?? createDefaultReferenceImageDocument(),
	);
	const availablePresetIds = normalizedReferenceImages.presets.map(
		(preset) => preset.id,
	);
	const rawShotCameras = Array.isArray(project.shotCameras)
		? project.shotCameras
		: [];
	const normalizedShotCameras =
		rawShotCameras.length > 0
			? rawShotCameras.map((shotCamera) => ({
					...sanitizeShotCameraDocument(shotCamera, {
						availablePresetIds,
					}),
					pose: toSerializableCameraPose(shotCamera.pose),
				}))
			: createDefaultShotCameraDocuments().map((shotCamera) => ({
					...sanitizeShotCameraDocument(shotCamera, {
						availablePresetIds,
					}),
					pose: toSerializableCameraPose(null),
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
		projectId:
			typeof project.projectId === "string" ? project.projectId.trim() : "",
		packageRevision:
			Number.isFinite(project.packageRevision) && project.packageRevision >= 0
				? Math.floor(project.packageRevision)
				: 0,
		workspace: {
			activeShotCameraId,
			viewport: {
				baseFovX: Number(project.workspace?.viewport?.baseFovX ?? 60),
				baseFovXDirty:
					typeof project.workspace?.viewport?.baseFovXDirty === "boolean"
						? project.workspace.viewport.baseFovXDirty
						: Number.isFinite(project.workspace?.viewport?.baseFovX) &&
							project.workspace.viewport.baseFovX !== 60,
				pose: toSerializableCameraPose(project.workspace?.viewport?.pose),
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
			lighting: normalizeLightingState(project.scene?.lighting),
			referenceImages: normalizedReferenceImages,
		},
		shotCameras: normalizedShotCameras,
	};
}

export function buildProjectManifest({
	storageMode = "portable",
	projectPath = PROJECT_DOCUMENT_PATH,
	projectName = "",
} = {}) {
	return {
		format: PROJECT_FORMAT,
		version: PROJECT_VERSION,
		storageMode,
		projectName: String(projectName ?? ""),
		entries: {
			project: projectPath,
		},
		features: [
			"scene-assets",
			"scene-lighting",
			"shot-cameras",
			"reference-images",
		],
	};
}

export function createProjectAssetResourceRef(resourceId) {
	return {
		resourceId,
	};
}

export function getDefaultProjectFilename() {
	return DEFAULT_PROJECT_FILENAME;
}

export function toUint8Array(value) {
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

export async function sha256Hex(bytes) {
	const normalizedBytes = toUint8Array(bytes);
	const buffer = normalizedBytes.buffer.slice(
		normalizedBytes.byteOffset,
		normalizedBytes.byteOffset + normalizedBytes.byteLength,
	);
	const digest = await crypto.subtle.digest("SHA-256", buffer);
	return Array.from(new Uint8Array(digest))
		.map((value) => value.toString(16).padStart(2, "0"))
		.join("");
}

export function buildProjectResourcePath(hash, originalName) {
	const extension = getProjectPathExtension(originalName);
	return `resources/sha256/${hash.slice(0, 2)}/${hash}${extension ? `.${extension}` : ""}`;
}

export function getProjectSourceResource(source) {
	return source?.resource ?? null;
}

export function getProjectResourceStableKey(resource) {
	if (!resource || typeof resource !== "object") {
		return null;
	}

	if (resource.type === "file" && typeof resource.sha256 === "string") {
		return `file:${resource.sha256}:${resource.originalName ?? ""}`;
	}

	if (
		resource.type === "packed-splat" &&
		typeof resource.manifest?.sha256 === "string"
	) {
		return `packed-splat:${resource.manifest.sha256}:${resource.originalName ?? ""}`;
	}

	return null;
}

export function getProjectSourceStableKey(source) {
	return getProjectResourceStableKey(getProjectSourceResource(source));
}

function buildProjectFingerprintPayload(project) {
	const normalizedProject = normalizeProjectDocument(project);
	const resourceEntries = Object.entries(normalizedProject.resources ?? {})
		.map(([resourceId, resource]) => ({
			resourceId,
			resourceKey: getProjectResourceStableKey(resource),
		}))
		.sort((left, right) => left.resourceId.localeCompare(right.resourceId));

	return {
		projectId: normalizedProject.projectId || "",
		packageRevision: normalizedProject.packageRevision ?? 0,
		resourceEntries,
		sceneAssets: normalizedProject.scene.assets.map((asset) => ({
			id: asset.id,
			kind: asset.kind,
			label: asset.label,
			resourceId: asset.source?.resourceId ?? null,
		})),
		referenceImageAssets: normalizedProject.scene.referenceImages.assets.map(
			(asset) => ({
				id: asset.id,
				label: asset.label,
				resourceId: asset.source?.resourceId ?? null,
			}),
		),
		referenceImagePresets: normalizedProject.scene.referenceImages.presets.map(
			(preset) => ({
				id: preset.id,
				name: preset.name,
				itemCount: preset.items.length,
			}),
		),
		referenceImageBindings: normalizedProject.shotCameras.map((shotCamera) => ({
			id: shotCamera.id,
			presetId: shotCamera.referenceImages?.presetId ?? null,
		})),
	};
}

export async function buildProjectFingerprint(project) {
	const payload = buildProjectFingerprintPayload(project);
	return sha256Hex(new TextEncoder().encode(JSON.stringify(payload)));
}

export function createProjectFileEmbeddedFileSource({
	kind,
	file,
	fileName,
	projectAssetState = null,
	legacyState = null,
	resource = null,
} = {}) {
	const normalizedKind =
		kind === "model" || kind === "splat" || kind === REFERENCE_IMAGE_ASSET_KIND
			? kind
			: "splat";
	return {
		sourceType: PROJECT_FILE_EMBEDDED_FILE_SOURCE,
		kind: normalizedKind,
		file,
		fileName: normalizeProjectFileName(fileName ?? file?.name, "asset.bin"),
		projectAssetState,
		legacyState,
		resource,
	};
}

export function createProjectFilePackedSplatSource({
	fileName,
	inputBytes,
	extraFiles = {},
	fileType = null,
	projectAssetState = null,
	legacyState = null,
	resource = null,
} = {}) {
	return {
		sourceType: PROJECT_FILE_PACKED_SPLAT_SOURCE,
		kind: "splat",
		fileName: normalizeProjectFileName(fileName, "meta.json"),
		inputBytes: toUint8Array(inputBytes),
		extraFiles: Object.fromEntries(
			Object.entries(extraFiles).map(([key, value]) => [key, value]),
		),
		fileType: fileType ? String(fileType) : null,
		projectAssetState,
		legacyState,
		resource,
	};
}

export function isProjectFileEmbeddedFileSource(source) {
	return source?.sourceType === PROJECT_FILE_EMBEDDED_FILE_SOURCE;
}

export function isProjectFilePackedSplatSource(source) {
	return source?.sourceType === PROJECT_FILE_PACKED_SPLAT_SOURCE;
}
