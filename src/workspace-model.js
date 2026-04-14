import {
	ANCHORS,
	BASE_FRAME,
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
	FRAME_MAX_COUNT,
} from "./constants.js";
import { DEFAULT_SHOT_CAMERA_BASE_FOVX } from "./engine/camera-lens.js";
import {
	FRAME_MASK_SHAPE_BOUNDS,
	FRAME_TRAJECTORY_EXPORT_SOURCE_NONE,
	FRAME_TRAJECTORY_MODE_LINE,
	cloneFrameTrajectoryHandlesByFrameId,
	normalizeFrameMaskShape,
	normalizeFrameTrajectoryExportSource,
	normalizeFrameTrajectoryMode,
	sanitizeFrameTrajectoryHandlesByFrameId,
} from "./engine/frame-trajectory.js";
import {
	cloneShotCameraReferenceImagesState,
	createShotCameraReferenceImagesState,
} from "./reference-image-model.js";

export const WORKSPACE_LAYOUT_SINGLE = "single";
export const WORKSPACE_LAYOUT_QUAD = "quad";
const SHOT_CAMERA_ID_PREFIX = "shot-camera-";
const FRAME_ID_PREFIX = "frame-";
const FRAME_DISPLAY_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const FRAME_NAME_MAX_LENGTH = 64;
const DEFAULT_FRAME_X = 0.5;
const DEFAULT_FRAME_Y = 0.5;
const DEFAULT_FRAME_SCALE = 1;
const DEFAULT_FRAME_MASK_OPACITY_PCT = 80;
const DEFAULT_FRAME_MASK_PREFERRED_MODE = "all";
const DEFAULT_FRAME_MASK_SHAPE = FRAME_MASK_SHAPE_BOUNDS;
const DEFAULT_FRAME_TRAJECTORY_MODE = FRAME_TRAJECTORY_MODE_LINE;
const DEFAULT_FRAME_TRAJECTORY_EXPORT_SOURCE =
	FRAME_TRAJECTORY_EXPORT_SOURCE_NONE;

export const WORKSPACE_PANE_CAMERA = "camera";
export const WORKSPACE_PANE_VIEWPORT = "viewport";

export const VIEWPORT_PRESET_PERSPECTIVE = "perspective";
export const VIEWPORT_PRESET_TOP = "top";
export const VIEWPORT_PRESET_FRONT = "front";
export const VIEWPORT_PRESET_RIGHT = "right";

export function createDefaultWorkspacePanes() {
	return [
		{
			id: "pane-main",
			role: WORKSPACE_PANE_CAMERA,
			viewportPreset: VIEWPORT_PRESET_PERSPECTIVE,
			projection: "perspective",
			shotCameraBinding: "active",
		},
	];
}

export function getShotCameraDocumentId(index) {
	return `${SHOT_CAMERA_ID_PREFIX}${index}`;
}

export function getFrameDocumentId(index) {
	return `${FRAME_ID_PREFIX}${index}`;
}

export function getFrameDisplayLabel(index) {
	return FRAME_DISPLAY_LABELS[Math.max(index - 1, 0)] ?? `${index}`;
}

export function sanitizeFrameName(value, fallback = "FRAME A") {
	const normalized = Array.from(String(value ?? ""))
		.map((character) => {
			const codePoint = character.codePointAt(0) ?? 0;
			return codePoint < 32 || codePoint === 127 ? " " : character;
		})
		.join("")
		.replace(/\s+/g, " ")
		.trim();
	const truncated = Array.from(normalized)
		.slice(0, FRAME_NAME_MAX_LENGTH)
		.join("");
	return truncated || fallback;
}

export function resolveFrameMaskSelectedIds(frames, selectedIds) {
	const availableFrameIds = Array.isArray(frames)
		? frames
				.map((frame) => frame?.id)
				.filter((frameId) => typeof frameId === "string" && frameId.length > 0)
		: [];
	const availableFrameIdSet = new Set(availableFrameIds);
	const normalizedSelectedIds = [];
	for (const frameId of selectedIds ?? []) {
		if (
			typeof frameId !== "string" ||
			!availableFrameIdSet.has(frameId) ||
			normalizedSelectedIds.includes(frameId)
		) {
			continue;
		}
		normalizedSelectedIds.push(frameId);
	}

	return normalizedSelectedIds.length > 0
		? normalizedSelectedIds
		: availableFrameIds;
}

export function resolveFrameMaskPreferredMode(mode, preferredMode) {
	if (preferredMode === "selected" || preferredMode === "all") {
		return preferredMode;
	}
	if (mode === "selected" || mode === "all") {
		return mode;
	}
	return DEFAULT_FRAME_MASK_PREFERRED_MODE;
}

export function resolveFrameMaskToggleMode({
	mode,
	preferredMode,
	hasRememberedSelection = false,
}) {
	if (mode === "selected" || mode === "all") {
		return "off";
	}
	const resolvedPreferredMode = resolveFrameMaskPreferredMode(
		mode,
		preferredMode,
	);
	return resolvedPreferredMode === "selected" && !hasRememberedSelection
		? "all"
		: resolvedPreferredMode;
}

export function getNextShotCameraNumber(shotCameras) {
	let maxNumber = 0;

	for (const shotCamera of shotCameras) {
		const match = new RegExp(`^${SHOT_CAMERA_ID_PREFIX}(\\d+)$`).exec(
			shotCamera.id,
		);
		if (!match) {
			continue;
		}

		maxNumber = Math.max(maxNumber, Number(match[1]) || 0);
	}

	return maxNumber + 1;
}

export function getNextFrameNumber(frames) {
	let maxNumber = 0;

	for (const frame of frames) {
		const match = new RegExp(`^${FRAME_ID_PREFIX}(\\d+)$`).exec(frame.id);
		if (!match) {
			continue;
		}

		maxNumber = Math.max(maxNumber, Number(match[1]) || 0);
	}

	return maxNumber + 1;
}

export function cloneFrameDocument(frame) {
	return {
		...frame,
		anchor:
			frame.anchor && typeof frame.anchor === "object"
				? { ...frame.anchor }
				: frame.anchor,
	};
}

function getLegacyFrameCenterX(frame) {
	if (Number.isFinite(frame.x) && Number.isFinite(frame.width)) {
		return frame.x + frame.width * 0.5;
	}

	return Number.isFinite(frame.x) ? frame.x : DEFAULT_FRAME_X;
}

function getLegacyFrameCenterY(frame) {
	if (Number.isFinite(frame.y) && Number.isFinite(frame.height)) {
		return frame.y + frame.height * 0.5;
	}

	return Number.isFinite(frame.y) ? frame.y : DEFAULT_FRAME_Y;
}

function getLegacyFrameScale(frame) {
	if (Number.isFinite(frame.scale) && frame.scale > 0) {
		return frame.scale;
	}

	const widthScale = Number.isFinite(frame.width)
		? (frame.width * BASE_RENDER_BOX.width) / BASE_FRAME.width
		: Number.NaN;
	const heightScale = Number.isFinite(frame.height)
		? (frame.height * BASE_RENDER_BOX.height) / BASE_FRAME.height
		: Number.NaN;
	const scales = [widthScale, heightScale].filter(
		(value) => Number.isFinite(value) && value > 0,
	);

	if (scales.length === 0) {
		return DEFAULT_FRAME_SCALE;
	}

	return scales.reduce((sum, value) => sum + value, 0) / scales.length;
}

function clampFrameAnchorAxis(value, fallback) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}

	return Math.min(1, Math.max(0, nextValue));
}

function normalizeFrameAnchor(anchor, fallbackX, fallbackY) {
	if (typeof anchor === "string") {
		const preset = ANCHORS[anchor];
		if (preset) {
			return { ...preset };
		}
	}

	if (anchor && typeof anchor === "object") {
		return {
			x: clampFrameAnchorAxis(anchor.x, fallbackX),
			y: clampFrameAnchorAxis(anchor.y, fallbackY),
		};
	}

	return {
		x: fallbackX,
		y: fallbackY,
	};
}

export function createFrameDocument({ id, name, source } = {}) {
	const baseFrame = source
		? cloneFrameDocument(source)
		: {
				x: DEFAULT_FRAME_X,
				y: DEFAULT_FRAME_Y,
				scale: DEFAULT_FRAME_SCALE,
				rotation: 0,
				order: 0,
			};

	const centerX = getLegacyFrameCenterX(baseFrame);
	const centerY = getLegacyFrameCenterY(baseFrame);

	return {
		...baseFrame,
		x: centerX,
		y: centerY,
		scale: getLegacyFrameScale(baseFrame),
		rotation: Number.isFinite(baseFrame.rotation) ? baseFrame.rotation : 0,
		anchor: normalizeFrameAnchor(baseFrame.anchor, centerX, centerY),
		order: Number.isFinite(baseFrame.order) ? baseFrame.order : 0,
		id: id ?? baseFrame.id ?? getFrameDocumentId(1),
		name: sanitizeFrameName(name ?? baseFrame.name, "FRAME A"),
	};
}

function createDefaultFrameMaskState(frames = []) {
	return {
		mode: "off",
		preferredMode: DEFAULT_FRAME_MASK_PREFERRED_MODE,
		opacityPct: DEFAULT_FRAME_MASK_OPACITY_PCT,
		selectedIds: resolveFrameMaskSelectedIds(frames, []),
		shape: DEFAULT_FRAME_MASK_SHAPE,
		trajectoryMode: DEFAULT_FRAME_TRAJECTORY_MODE,
		trajectoryExportSource: DEFAULT_FRAME_TRAJECTORY_EXPORT_SOURCE,
		trajectory: {
			handlesByFrameId: {},
		},
	};
}

function sanitizeFrameMaskState(frameMask, frames) {
	return {
		mode:
			frameMask?.mode === "selected" || frameMask?.mode === "all"
				? frameMask.mode
				: "off",
		preferredMode: resolveFrameMaskPreferredMode(
			frameMask?.mode,
			frameMask?.preferredMode,
		),
		opacityPct: Number.isFinite(frameMask?.opacityPct)
			? Math.min(100, Math.max(0, Math.round(frameMask.opacityPct)))
			: DEFAULT_FRAME_MASK_OPACITY_PCT,
		selectedIds: resolveFrameMaskSelectedIds(frames, frameMask?.selectedIds),
		shape: normalizeFrameMaskShape(frameMask?.shape),
		trajectoryMode: normalizeFrameTrajectoryMode(frameMask?.trajectoryMode),
		trajectoryExportSource: normalizeFrameTrajectoryExportSource(
			frameMask?.trajectoryExportSource,
		),
		trajectory: {
			handlesByFrameId: sanitizeFrameTrajectoryHandlesByFrameId(
				frames,
				frameMask?.trajectory?.handlesByFrameId,
			),
		},
	};
}

export function createDefaultFrameDocuments() {
	return [
		createFrameDocument({
			id: getFrameDocumentId(1),
			name: "FRAME A",
		}),
	];
}

export function createShotCameraDocument({ id, name, source } = {}) {
	const baseDocument = source
		? cloneShotCameraDocument(source)
		: {
				lens: {
					baseFovX: DEFAULT_SHOT_CAMERA_BASE_FOVX,
				},
				clipping: {
					mode: "auto",
					near: DEFAULT_CAMERA_NEAR,
					far: DEFAULT_CAMERA_FAR,
				},
				outputFrame: {
					widthScale: 1,
					heightScale: 1,
					viewZoom: 1,
					viewZoomAuto: true,
					viewportCenterAuto: true,
					anchor: "center",
					centerX: 0.5,
					centerY: 0.5,
					viewportCenterX: 0.5,
					viewportCenterY: 0.5,
					fitScale: 0,
					fitViewportWidth: 0,
					fitViewportHeight: 0,
				},
				exportSettings: {
					exportName: "cf-%cam",
					exportFormat: "psd",
					exportGridOverlay: true,
					exportGridLayerMode: "bottom",
					exportModelLayers: true,
					exportSplatLayers: true,
				},
				navigation: {
					rollLock: false,
				},
				referenceImages: createShotCameraReferenceImagesState(),
				frames: createDefaultFrameDocuments(),
				activeFrameId: getFrameDocumentId(1),
			};

	const frames = (baseDocument.frames ?? [])
		.slice(0, FRAME_MAX_COUNT)
		.map((frame, index) =>
			createFrameDocument({
				id: frame?.id ?? getFrameDocumentId(index + 1),
				name: frame?.name,
				source: frame,
			}),
		);
	const defaultFrameMask = createDefaultFrameMaskState(frames);

	return {
		...baseDocument,
		id: id ?? baseDocument.id ?? getShotCameraDocumentId(1),
		name: name ?? baseDocument.name ?? "Camera 1",
		frameMask: {
			...defaultFrameMask,
			...sanitizeFrameMaskState(baseDocument.frameMask, frames),
		},
		frames,
		activeFrameId: baseDocument.activeFrameId ?? frames[0]?.id ?? null,
	};
}

export function createDefaultShotCameraDocuments() {
	return [
		createShotCameraDocument({
			id: getShotCameraDocumentId(1),
			name: "Camera 1",
		}),
	];
}

export function getWorkspacePaneById(panes, paneId) {
	return panes.find((pane) => pane.id === paneId) ?? null;
}

export function getActiveWorkspacePane(panes, activePaneId) {
	return (
		getWorkspacePaneById(panes, activePaneId) ??
		panes[0] ?? {
			id: "pane-fallback",
			role: WORKSPACE_PANE_CAMERA,
			viewportPreset: VIEWPORT_PRESET_PERSPECTIVE,
			projection: "perspective",
			shotCameraBinding: "active",
		}
	);
}

export function getShotCameraDocumentById(shotCameras, shotCameraId) {
	return (
		shotCameras.find((shotCamera) => shotCamera.id === shotCameraId) ?? null
	);
}

export function getActiveShotCameraDocument(shotCameras, activeShotCameraId) {
	return (
		getShotCameraDocumentById(shotCameras, activeShotCameraId) ??
		shotCameras[0] ??
		null
	);
}

export function getFrameDocumentById(frames, frameId) {
	return frames.find((frame) => frame.id === frameId) ?? null;
}

export function getActiveFrameDocument(frames, activeFrameId) {
	return getFrameDocumentById(frames, activeFrameId) ?? frames[0] ?? null;
}

export function cloneShotCameraDocument(documentState) {
	const frames = (documentState.frames ?? [])
		.slice(0, FRAME_MAX_COUNT)
		.map(cloneFrameDocument);
	const sanitizedFrameMask = sanitizeFrameMaskState(
		documentState.frameMask,
		frames,
	);

	return {
		...documentState,
		lens: {
			...documentState.lens,
		},
		clipping: {
			...documentState.clipping,
		},
		outputFrame: {
			...documentState.outputFrame,
			centerX: Number.isFinite(documentState.outputFrame?.centerX)
				? documentState.outputFrame.centerX
				: 0.5,
			centerY: Number.isFinite(documentState.outputFrame?.centerY)
				? documentState.outputFrame.centerY
				: 0.5,
			viewportCenterX: Number.isFinite(
				documentState.outputFrame?.viewportCenterX,
			)
				? documentState.outputFrame.viewportCenterX
				: 0.5,
			viewportCenterY: Number.isFinite(
				documentState.outputFrame?.viewportCenterY,
			)
				? documentState.outputFrame.viewportCenterY
				: 0.5,
			fitScale:
				Number.isFinite(documentState.outputFrame?.fitScale) &&
				documentState.outputFrame.fitScale > 0
					? documentState.outputFrame.fitScale
					: 0,
			fitViewportWidth: Number.isFinite(
				documentState.outputFrame?.fitViewportWidth,
			)
				? documentState.outputFrame.fitViewportWidth
				: 0,
			fitViewportHeight: Number.isFinite(
				documentState.outputFrame?.fitViewportHeight,
			)
				? documentState.outputFrame.fitViewportHeight
				: 0,
			viewZoomAuto: documentState.outputFrame?.viewZoomAuto !== false,
			viewportCenterAuto:
				documentState.outputFrame?.viewportCenterAuto !== false,
		},
		exportSettings: {
			exportName: documentState.exportSettings?.exportName ?? "",
			exportFormat: documentState.exportSettings?.exportFormat ?? "psd",
			exportGridOverlay: Boolean(
				documentState.exportSettings?.exportGridOverlay,
			),
			exportGridLayerMode:
				documentState.exportSettings?.exportGridLayerMode === "overlay"
					? "overlay"
					: "bottom",
			exportModelLayers: Boolean(
				documentState.exportSettings?.exportModelLayers,
			),
			exportSplatLayers:
				documentState.exportSettings?.exportSplatLayers ?? true,
		},
		frameMask: {
			...createDefaultFrameMaskState(frames),
			...sanitizedFrameMask,
			trajectory: {
				handlesByFrameId: cloneFrameTrajectoryHandlesByFrameId(
					sanitizedFrameMask.trajectory?.handlesByFrameId,
				),
			},
		},
		navigation: {
			rollLock: Boolean(documentState.navigation?.rollLock),
		},
		referenceImages: cloneShotCameraReferenceImagesState(
			documentState.referenceImages,
		),
		frames,
		activeFrameId: documentState.activeFrameId ?? frames[0]?.id ?? null,
	};
}

export function getWorkspaceModeLabelKey(pane) {
	return `mode.${pane?.role ?? WORKSPACE_PANE_CAMERA}`;
}

export function setSinglePaneRole(panes, role) {
	return panes.map((pane, index) =>
		index === 0
			? {
					...pane,
					role,
				}
			: pane,
	);
}
