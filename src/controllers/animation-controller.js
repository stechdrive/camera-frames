import * as THREE from "three";
import {
	ANIMATION_INTERPOLATION_HOLD,
	ANIMATION_INTERPOLATION_LINEAR,
	ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
	ANIMATION_CHANNEL_GROUP_LENS,
	ANIMATION_CHANNEL_GROUP_POSE,
	ANIMATION_CHANNEL_GROUP_TRANSFORM,
	ANIMATION_TARGET_SCENE_ASSET,
	ANIMATION_TARGET_SHOT_CAMERA,
	createAnimationTimelineKeyId,
	createDefaultAnimationDocument,
	getActiveAnimationClip,
	getAnimationTrackChannelGroup,
	isAnimationTrackPathAllowed,
	parseAnimationTimelineKeyId,
	sampleNumberTrack,
	sanitizeAnimationDocument,
} from "../animation/animation-model.js";
import {
	composeCameraQuaternionFromPoseAngles,
	decomposeCameraPoseAngles,
} from "../engine/camera-pose.js";

const CAMERA_AXIS_LOCAL = new THREE.Vector3(0, 0, -1);
const TIMELINE_ZOOM_MIN = 1;
const TIMELINE_ZOOM_MAX = 8;
const TIMELINE_ZOOM_STEP = 2;
export const ANIMATION_KEY_TARGET_CAMERA = "camera";
export const ANIMATION_KEY_TARGET_OBJECTS = "objects";
export const ANIMATION_KEY_TARGET_BOTH = "both";
const ANIMATION_KEY_TARGET_MODES = new Set([
	ANIMATION_KEY_TARGET_CAMERA,
	ANIMATION_KEY_TARGET_OBJECTS,
	ANIMATION_KEY_TARGET_BOTH,
]);

function cloneSerializable(value) {
	return JSON.parse(JSON.stringify(value));
}

function clampTimelineFrame(frame, clip) {
	const startFrame = Number(clip?.startFrame ?? 1);
	const endFrame =
		startFrame + Math.max(1, Number(clip?.durationFrames ?? 1)) - 1;
	const numericFrame = Number(frame);
	if (!Number.isFinite(numericFrame)) {
		return startFrame;
	}
	return Math.min(endFrame, Math.max(startFrame, Math.round(numericFrame)));
}

function clampTimelineZoom(zoom) {
	const numericZoom = Number(zoom);
	if (!Number.isFinite(numericZoom)) {
		return 1;
	}
	return Math.min(TIMELINE_ZOOM_MAX, Math.max(TIMELINE_ZOOM_MIN, numericZoom));
}

function sanitizeKeyTargetMode(mode) {
	return ANIMATION_KEY_TARGET_MODES.has(mode)
		? mode
		: ANIMATION_KEY_TARGET_CAMERA;
}

function sanitizeTimelineInterpolationMode(mode) {
	return mode === ANIMATION_INTERPOLATION_HOLD
		? ANIMATION_INTERPOLATION_HOLD
		: ANIMATION_INTERPOLATION_LINEAR;
}

function updateActiveClip(documentState, updateClip) {
	const normalized = sanitizeAnimationDocument(documentState);
	const activeClipId = normalized.activeClipId;
	return {
		...normalized,
		clips: normalized.clips.map((clip) =>
			clip.id === activeClipId ? updateClip({ ...clip }) : clip,
		),
	};
}

function createBindingId(target) {
	return `${target.kind}:${target.id}`;
}

function createKeyId(bindingId, path, frame) {
	return createAnimationTimelineKeyId({
		bindingId,
		channelGroup: getAnimationTrackChannelGroup(null, path),
		path,
		frame,
	});
}

function createLegacyKeyId(bindingId, path, frame) {
	return `${bindingId}:${path}:${Math.round(Number(frame) || 0)}`;
}

function parseKeyId(keyId) {
	return parseAnimationTimelineKeyId(keyId);
}

function createTargetKey(target) {
	if (!target?.kind || target.id == null) {
		return "";
	}
	return `${target.kind}:${String(target.id)}`;
}

function parseTargetKey(targetKey) {
	const value = String(targetKey ?? "");
	const separatorIndex = value.indexOf(":");
	if (separatorIndex <= 0 || separatorIndex >= value.length - 1) {
		return null;
	}
	const kind = value.slice(0, separatorIndex);
	const id = value.slice(separatorIndex + 1);
	if (
		kind !== ANIMATION_TARGET_SHOT_CAMERA &&
		kind !== ANIMATION_TARGET_SCENE_ASSET
	) {
		return null;
	}
	return { kind, id };
}

export function createAnimationController({
	store,
	state = null,
	shotCameraRegistry = new Map(),
	getShotCameraDocument = () => null,
	getAssetController = () => null,
	syncShotProjection = () => {},
	applyCameraViewProjection = () => {},
	syncOutputCamera = () => {},
	updateCameraSummary = () => {},
	runHistoryAction = (_label, applyChange) => {
		applyChange?.();
		return false;
	},
	updateUi = () => {},
} = {}) {
	const baseShotCameraStates = new Map();
	const baseSceneAssetStates = new Map();
	const evaluatedShotCameraLens = new Map();
	const evaluatedRuntimeTargetKeys = new Set();
	const manuallyEditedRuntimeTargets = new Set();
	let timelineKeyClipboard = null;
	let runtimeStateCaptured = false;
	let runtimeEvaluated = false;
	let playbackAccumulatorSeconds = 0;

	function captureCameraRuntimeState(shotCameraId, entry) {
		const documentState = getShotCameraDocument(shotCameraId);
		const angles = decomposeCameraPoseAngles({
			quaternion: entry.camera.quaternion,
			axisLocal: CAMERA_AXIS_LOCAL,
		});
		return {
			position: {
				x: entry.camera.position.x,
				y: entry.camera.position.y,
				z: entry.camera.position.z,
			},
			quaternion: {
				x: entry.camera.quaternion.x,
				y: entry.camera.quaternion.y,
				z: entry.camera.quaternion.z,
				w: entry.camera.quaternion.w,
			},
			up: {
				x: entry.camera.up.x,
				y: entry.camera.up.y,
				z: entry.camera.up.z,
			},
			angles,
			lens: {
				baseFovX: Number(
					documentState?.lens?.baseFovX ?? state?.baseFovX ?? 60,
				),
				shiftX: Number(documentState?.lens?.shiftX ?? 0),
				shiftY: Number(documentState?.lens?.shiftY ?? 0),
			},
		};
	}

	function captureAssetRuntimeState(asset) {
		const worldPosition = asset.object.getWorldPosition(new THREE.Vector3());
		const worldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		const worldEuler = new THREE.Euler().setFromQuaternion(
			worldQuaternion,
			"XYZ",
		);
		return {
			worldPosition: {
				x: worldPosition.x,
				y: worldPosition.y,
				z: worldPosition.z,
			},
			worldQuaternion: {
				x: worldQuaternion.x,
				y: worldQuaternion.y,
				z: worldQuaternion.z,
				w: worldQuaternion.w,
			},
			rotationDegrees: {
				x: THREE.MathUtils.radToDeg(worldEuler.x),
				y: THREE.MathUtils.radToDeg(worldEuler.y),
				z: THREE.MathUtils.radToDeg(worldEuler.z),
			},
			worldScale: Number(asset.worldScale ?? 1),
		};
	}

	function ensureRuntimeStateCaptured() {
		if (runtimeStateCaptured) {
			return;
		}
		baseShotCameraStates.clear();
		for (const [shotCameraId, entry] of shotCameraRegistry.entries()) {
			if (entry?.camera) {
				baseShotCameraStates.set(
					shotCameraId,
					captureCameraRuntimeState(shotCameraId, entry),
				);
			}
		}
		baseSceneAssetStates.clear();
		for (const asset of getAssetController?.()?.getSceneAssets?.() ?? []) {
			if (asset?.object) {
				baseSceneAssetStates.set(
					String(asset.id),
					captureAssetRuntimeState(asset),
				);
			}
		}
		runtimeStateCaptured = true;
	}

	function getSceneAssetByAnimationId(assetId) {
		const assetController = getAssetController?.();
		return (
			assetController?.getSceneAsset?.(assetId) ??
			assetController?.getSceneAsset?.(Number(assetId)) ??
			null
		);
	}

	function applyCameraRuntimeState(entry, baseState) {
		if (!entry?.camera || !baseState) {
			return;
		}
		entry.camera.position.set(
			baseState.position.x,
			baseState.position.y,
			baseState.position.z,
		);
		entry.camera.quaternion.set(
			baseState.quaternion.x,
			baseState.quaternion.y,
			baseState.quaternion.z,
			baseState.quaternion.w,
		);
		entry.camera.up.set(baseState.up.x, baseState.up.y, baseState.up.z);
		entry.camera.updateMatrixWorld(true);
	}

	function applyAssetWorldTransform(asset, baseState) {
		if (!asset?.object || !baseState) {
			return;
		}
		const worldScale = Math.max(0.01, Number(baseState.worldScale) || 1);
		asset.worldScale = worldScale;
		getAssetController?.()?.applyAssetWorldScale?.(asset);

		const worldPosition = new THREE.Vector3(
			baseState.worldPosition.x,
			baseState.worldPosition.y,
			baseState.worldPosition.z,
		);
		asset.object.parent?.worldToLocal(worldPosition);
		asset.object.position.copy(worldPosition);

		const worldQuaternion = new THREE.Quaternion(
			baseState.worldQuaternion.x,
			baseState.worldQuaternion.y,
			baseState.worldQuaternion.z,
			baseState.worldQuaternion.w,
		);
		if (asset.object.parent) {
			const parentWorldQuaternion = asset.object.parent.getWorldQuaternion(
				new THREE.Quaternion(),
			);
			worldQuaternion.premultiply(parentWorldQuaternion.invert());
		}
		asset.object.quaternion.copy(worldQuaternion);
		asset.object.updateMatrixWorld(true);
	}

	function restoreBaseRuntimeState({ update = false } = {}) {
		if (!runtimeStateCaptured) {
			return false;
		}
		for (const [shotCameraId, baseState] of baseShotCameraStates.entries()) {
			applyCameraRuntimeState(shotCameraRegistry.get(shotCameraId), baseState);
		}
		for (const [assetId, baseState] of baseSceneAssetStates.entries()) {
			const asset = getSceneAssetByAnimationId(assetId);
			if (asset) {
				applyAssetWorldTransform(asset, baseState);
			}
		}
		evaluatedShotCameraLens.clear();
		evaluatedRuntimeTargetKeys.clear();
		store.animation.evaluatedLens.value = null;
		const activeBaseState = baseShotCameraStates.get(
			store.workspace.activeShotCameraId.value,
		);
		if (activeBaseState && state) {
			state.baseFovX = activeBaseState.lens.baseFovX;
		}
		runtimeEvaluated = false;
		if (update) {
			syncShotProjection?.();
			applyCameraViewProjection?.();
			syncOutputCamera?.();
			updateCameraSummary?.();
			updateUi?.();
		}
		return true;
	}

	function restoreRuntimeTargetsToBase(targetKeys) {
		if (!runtimeStateCaptured) {
			return false;
		}
		let restored = false;
		for (const targetKey of targetKeys ?? []) {
			const target = parseTargetKey(targetKey);
			if (target?.kind === ANIMATION_TARGET_SHOT_CAMERA) {
				const baseState = baseShotCameraStates.get(target.id);
				const entry = shotCameraRegistry.get(target.id);
				if (!entry?.camera || !baseState) {
					continue;
				}
				applyCameraRuntimeState(entry, baseState);
				evaluatedShotCameraLens.delete(target.id);
				if (target.id === store.workspace.activeShotCameraId.value) {
					store.animation.evaluatedLens.value = null;
					if (state) {
						state.baseFovX = baseState.lens.baseFovX;
					}
				}
				restored = true;
				continue;
			}
			if (target?.kind === ANIMATION_TARGET_SCENE_ASSET) {
				const baseState = baseSceneAssetStates.get(String(target.id));
				const asset = getSceneAssetByAnimationId(target.id);
				if (!asset?.object || !baseState) {
					continue;
				}
				applyAssetWorldTransform(asset, baseState);
				restored = true;
			}
		}
		return restored;
	}

	function captureCurrentTargetRuntimeState(target) {
		const targetKey = createTargetKey(target);
		if (!targetKey) {
			return false;
		}
		if (target.kind === ANIMATION_TARGET_SHOT_CAMERA) {
			const entry = shotCameraRegistry.get(target.id);
			if (!entry?.camera) {
				return false;
			}
			const baseState = captureCameraRuntimeState(target.id, entry);
			baseShotCameraStates.set(target.id, baseState);
			evaluatedShotCameraLens.delete(target.id);
			if (target.id === store.workspace.activeShotCameraId.value) {
				store.animation.evaluatedLens.value = null;
				if (state) {
					state.baseFovX = baseState.lens.baseFovX;
				}
			}
			return true;
		}
		if (target.kind === ANIMATION_TARGET_SCENE_ASSET) {
			const asset = getSceneAssetByAnimationId(target.id);
			if (!asset?.object) {
				return false;
			}
			baseSceneAssetStates.set(
				String(target.id),
				captureAssetRuntimeState(asset),
			);
			return true;
		}
		return false;
	}

	function captureRuntimeStateForTarget(target) {
		if (target?.kind === ANIMATION_TARGET_SHOT_CAMERA) {
			const entry = shotCameraRegistry.get(target.id);
			if (!entry?.camera) {
				return null;
			}
			return {
				target: {
					kind: ANIMATION_TARGET_SHOT_CAMERA,
					id: target.id,
				},
				state: captureCameraRuntimeState(target.id, entry),
			};
		}
		if (target?.kind === ANIMATION_TARGET_SCENE_ASSET) {
			const asset = getSceneAssetByAnimationId(target.id);
			if (!asset?.object) {
				return null;
			}
			return {
				target: {
					kind: ANIMATION_TARGET_SCENE_ASSET,
					id: String(target.id),
				},
				state: captureAssetRuntimeState(asset),
			};
		}
		return null;
	}

	function captureManualRuntimeStates(
		targetKeys = manuallyEditedRuntimeTargets,
	) {
		const snapshots = new Map();
		for (const targetKey of targetKeys) {
			const target = parseTargetKey(targetKey);
			const snapshot = target ? captureRuntimeStateForTarget(target) : null;
			if (snapshot) {
				snapshots.set(targetKey, snapshot);
			}
		}
		return snapshots;
	}

	function applyRuntimeStateSnapshot(snapshot) {
		if (!snapshot?.target || !snapshot.state) {
			return false;
		}
		if (snapshot.target.kind === ANIMATION_TARGET_SHOT_CAMERA) {
			const entry = shotCameraRegistry.get(snapshot.target.id);
			applyCameraRuntimeState(entry, snapshot.state);
			evaluatedShotCameraLens.delete(snapshot.target.id);
			if (snapshot.target.id === store.workspace.activeShotCameraId.value) {
				store.animation.evaluatedLens.value = null;
				if (state) {
					state.baseFovX = snapshot.state.lens.baseFovX;
				}
			}
			return Boolean(entry?.camera);
		}
		if (snapshot.target.kind === ANIMATION_TARGET_SCENE_ASSET) {
			const asset = getSceneAssetByAnimationId(snapshot.target.id);
			if (!asset) {
				return false;
			}
			applyAssetWorldTransform(asset, snapshot.state);
			return true;
		}
		return false;
	}

	function releaseRuntimeEvaluationForManualEdit({
		targetKind = ANIMATION_TARGET_SHOT_CAMERA,
		targetId = store.workspace.activeShotCameraId.value,
		insertAutoKey = true,
	} = {}) {
		if (
			!runtimeEvaluated ||
			store.animation.isPlaying.value ||
			!isAnimationEnabled()
		) {
			return false;
		}
		ensureRuntimeStateCaptured();
		const target = {
			kind: targetKind,
			id: String(targetId ?? ""),
		};
		const targetKey = createTargetKey(target);
		const autoKeyEntries =
			insertAutoKey &&
			shouldHandleAutoKey(target) &&
			target.kind === ANIMATION_TARGET_SHOT_CAMERA
				? buildShotCameraKeyEntries(target.id)
				: insertAutoKey &&
						shouldHandleAutoKey(target) &&
						target.kind === ANIMATION_TARGET_SCENE_ASSET
					? buildSceneAssetKeyEntries(target.id)?.entries
					: null;
		if (!targetKey || !captureCurrentTargetRuntimeState(target)) {
			return false;
		}
		manuallyEditedRuntimeTargets.add(targetKey);
		if (autoKeyEntries) {
			upsertKeyValues({
				target,
				entries: autoKeyEntries,
				label:
					target.kind === ANIMATION_TARGET_SHOT_CAMERA
						? "animation.autokey.camera"
						: "animation.autokey.asset",
				applyFrame: false,
			});
		}
		return true;
	}

	function getTrackSample(binding, path, timelineFrame, baseValue) {
		const track = binding.tracks.find((candidate) => candidate.path === path);
		return track
			? sampleNumberTrack(track, timelineFrame, baseValue)
			: baseValue;
	}

	function getBindingTracksByChannelGroup(binding, group) {
		return (binding.tracks ?? []).filter(
			(track) =>
				getAnimationTrackChannelGroup(binding.target, track.path) === group,
		);
	}

	function hasBindingChannelGroup(binding, group) {
		return getBindingTracksByChannelGroup(binding, group).length > 0;
	}

	function hasKeyId(selectedIds, bindingId, path, frame) {
		const keyFrame = Math.round(Number(frame));
		return (
			selectedIds.has(createKeyId(bindingId, path, keyFrame)) ||
			selectedIds.has(createLegacyKeyId(bindingId, path, keyFrame))
		);
	}

	function evaluateShotCameraTransformChannels(
		binding,
		timelineFrame,
		entry,
		baseState,
	) {
		const position = {
			x: getTrackSample(
				binding,
				"transform.position.x",
				timelineFrame,
				baseState.position.x,
			),
			y: getTrackSample(
				binding,
				"transform.position.y",
				timelineFrame,
				baseState.position.y,
			),
			z: getTrackSample(
				binding,
				"transform.position.z",
				timelineFrame,
				baseState.position.z,
			),
		};
		const angles = {
			yawDeg: getTrackSample(
				binding,
				"transform.rotation.yawDeg",
				timelineFrame,
				baseState.angles.yawDeg,
			),
			pitchDeg: getTrackSample(
				binding,
				"transform.rotation.pitchDeg",
				timelineFrame,
				baseState.angles.pitchDeg,
			),
			rollDeg: getTrackSample(
				binding,
				"transform.rotation.rollDeg",
				timelineFrame,
				baseState.angles.rollDeg,
			),
		};
		const quaternion = composeCameraQuaternionFromPoseAngles({
			axisLocal: CAMERA_AXIS_LOCAL,
			yawDeg: angles.yawDeg,
			pitchDeg: angles.pitchDeg,
			rollDeg: angles.rollDeg,
		});
		entry.camera.position.set(position.x, position.y, position.z);
		entry.camera.quaternion.copy(quaternion);
		entry.camera.up.set(0, 1, 0).applyQuaternion(quaternion).normalize();
		entry.camera.updateMatrixWorld(true);
	}

	function evaluateShotCameraLensChannels(
		binding,
		timelineFrame,
		shotCameraId,
		baseState,
	) {
		const lens = {
			baseFovX: getTrackSample(
				binding,
				"lens.baseFovX",
				timelineFrame,
				baseState.lens.baseFovX,
			),
			shiftX: getTrackSample(
				binding,
				"lens.shiftX",
				timelineFrame,
				baseState.lens.shiftX,
			),
			shiftY: getTrackSample(
				binding,
				"lens.shiftY",
				timelineFrame,
				baseState.lens.shiftY,
			),
		};
		evaluatedShotCameraLens.set(shotCameraId, lens);
		if (shotCameraId === store.workspace.activeShotCameraId.value) {
			store.animation.evaluatedLens.value = lens;
			if (state) {
				state.baseFovX = lens.baseFovX;
			}
		}
	}

	function evaluateShotCameraBinding(binding, timelineFrame) {
		const shotCameraId = binding.target.id;
		const entry = shotCameraRegistry.get(shotCameraId);
		const baseState = baseShotCameraStates.get(shotCameraId);
		if (!entry?.camera || !baseState) {
			return;
		}
		if (hasBindingChannelGroup(binding, ANIMATION_CHANNEL_GROUP_TRANSFORM)) {
			evaluateShotCameraTransformChannels(
				binding,
				timelineFrame,
				entry,
				baseState,
			);
		}
		if (hasBindingChannelGroup(binding, ANIMATION_CHANNEL_GROUP_LENS)) {
			evaluateShotCameraLensChannels(
				binding,
				timelineFrame,
				shotCameraId,
				baseState,
			);
		}
	}

	function evaluateSceneAssetTransformChannels(
		binding,
		timelineFrame,
		asset,
		baseState,
	) {
		const worldPosition = {
			x: getTrackSample(
				binding,
				"transform.position.x",
				timelineFrame,
				baseState.worldPosition.x,
			),
			y: getTrackSample(
				binding,
				"transform.position.y",
				timelineFrame,
				baseState.worldPosition.y,
			),
			z: getTrackSample(
				binding,
				"transform.position.z",
				timelineFrame,
				baseState.worldPosition.z,
			),
		};
		const rotationDegrees = {
			x: getTrackSample(
				binding,
				"transform.rotation.xDeg",
				timelineFrame,
				baseState.rotationDegrees.x,
			),
			y: getTrackSample(
				binding,
				"transform.rotation.yDeg",
				timelineFrame,
				baseState.rotationDegrees.y,
			),
			z: getTrackSample(
				binding,
				"transform.rotation.zDeg",
				timelineFrame,
				baseState.rotationDegrees.z,
			),
		};
		const worldQuaternion = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(
				THREE.MathUtils.degToRad(rotationDegrees.x),
				THREE.MathUtils.degToRad(rotationDegrees.y),
				THREE.MathUtils.degToRad(rotationDegrees.z),
				"XYZ",
			),
		);
		applyAssetWorldTransform(asset, {
			worldPosition,
			worldQuaternion,
			worldScale: getTrackSample(
				binding,
				"transform.worldScale",
				timelineFrame,
				baseState.worldScale,
			),
		});
	}

	function evaluateSceneAssetPlaybackChannels(binding) {
		const playbackTracks = getBindingTracksByChannelGroup(
			binding,
			ANIMATION_CHANNEL_GROUP_ASSET_PLAYBACK,
		);
		const poseTracks = getBindingTracksByChannelGroup(
			binding,
			ANIMATION_CHANNEL_GROUP_POSE,
		);
		return playbackTracks.length > 0 || poseTracks.length > 0;
	}

	function evaluateSceneAssetBinding(binding, timelineFrame) {
		const assetId = binding.target.id;
		const asset = getSceneAssetByAnimationId(assetId);
		const baseState = baseSceneAssetStates.get(String(assetId));
		if (!asset?.object || !baseState) {
			return;
		}
		if (hasBindingChannelGroup(binding, ANIMATION_CHANNEL_GROUP_TRANSFORM)) {
			evaluateSceneAssetTransformChannels(
				binding,
				timelineFrame,
				asset,
				baseState,
			);
		}
		evaluateSceneAssetPlaybackChannels(binding);
	}

	function getEvaluatedLensForShotCamera(shotCameraId) {
		return evaluatedShotCameraLens.get(shotCameraId) ?? null;
	}

	function getAnimationDocument() {
		return sanitizeAnimationDocument(store.animation.document.value);
	}

	function getAutoKeyTargetKeys() {
		return getAnimationDocument().autoKeyTargetKeys ?? [];
	}

	function hasAutoKeyTargets() {
		return getAutoKeyTargetKeys().length > 0;
	}

	function isTargetAutoKeyEnabled(target) {
		const targetKey = createTargetKey(target);
		return Boolean(targetKey) && getAutoKeyTargetKeys().includes(targetKey);
	}

	function replaceAutoKeyTargetKeys(nextTargetKeys, { history = false } = {}) {
		const nextKeys = [];
		const seenKeys = new Set();
		for (const targetKey of Array.isArray(nextTargetKeys)
			? nextTargetKeys
			: []) {
			const parsed = parseTargetKey(targetKey);
			if (!parsed) {
				continue;
			}
			const key = createTargetKey(parsed);
			if (seenKeys.has(key)) {
				continue;
			}
			seenKeys.add(key);
			nextKeys.push(key);
		}
		updateAnimationDocument(
			"animation.autokey-targets",
			(documentState) => ({
				...documentState,
				autoKeyTargetKeys: nextKeys,
			}),
			{ history },
		);
		return nextKeys;
	}

	function setAutoKeyForTargets(
		targets,
		nextEnabled,
		{ history = false } = {},
	) {
		const normalizedTargets = (Array.isArray(targets) ? targets : [targets])
			.map((target) => parseTargetKey(createTargetKey(target)))
			.filter(Boolean);
		if (normalizedTargets.length === 0) {
			return false;
		}
		const nextKeys = new Set(getAutoKeyTargetKeys());
		let changed = false;
		for (const target of normalizedTargets) {
			const targetKey = createTargetKey(target);
			if (nextEnabled) {
				if (!nextKeys.has(targetKey)) {
					nextKeys.add(targetKey);
					changed = true;
				}
			} else if (nextKeys.delete(targetKey)) {
				changed = true;
			}
		}
		if (!changed) {
			return nextEnabled
				? normalizedTargets.every((target) =>
						nextKeys.has(createTargetKey(target)),
					)
				: normalizedTargets.every(
						(target) => !nextKeys.has(createTargetKey(target)),
					);
		}
		replaceAutoKeyTargetKeys([...nextKeys], { history });
		return true;
	}

	function setAutoKeyForTarget(target, nextEnabled, options = {}) {
		return setAutoKeyForTargets([target], nextEnabled, options);
	}

	function toggleAutoKeyForTarget(target) {
		const parsedTarget = parseTargetKey(createTargetKey(target));
		if (!parsedTarget) {
			return false;
		}
		const nextEnabled = !isTargetAutoKeyEnabled(parsedTarget);
		setAutoKeyForTarget(parsedTarget, nextEnabled);
		return nextEnabled;
	}

	function getCurrentKeyTargetTargets() {
		const keyTargetMode = sanitizeKeyTargetMode(
			store.animation.keyTargetMode?.value,
		);
		const targets = [];
		if (
			keyTargetMode === ANIMATION_KEY_TARGET_CAMERA ||
			keyTargetMode === ANIMATION_KEY_TARGET_BOTH
		) {
			const shotCameraId = store.workspace.activeShotCameraId.value;
			if (shotCameraId != null) {
				targets.push({
					kind: ANIMATION_TARGET_SHOT_CAMERA,
					id: shotCameraId,
				});
			}
		}
		if (
			keyTargetMode === ANIMATION_KEY_TARGET_OBJECTS ||
			keyTargetMode === ANIMATION_KEY_TARGET_BOTH
		) {
			for (const assetId of store.selectedSceneAssetIds?.value ?? []) {
				if (assetId == null) {
					continue;
				}
				targets.push({
					kind: ANIMATION_TARGET_SCENE_ASSET,
					id: assetId,
				});
			}
		}
		return targets;
	}

	function isAnimationEnabled() {
		return getAnimationDocument().enabled !== false;
	}

	function setAnimationDocument(nextDocument, { updateFrame = true } = {}) {
		const normalized = sanitizeAnimationDocument(nextDocument);
		store.animation.document.value = normalized;
		if (updateFrame) {
			const clip = getActiveAnimationClip(normalized);
			store.animation.timelineFrame.value = clampTimelineFrame(
				store.animation.timelineFrame.value,
				clip,
			);
		}
	}

	function updateAnimationDocument(
		label,
		updateDocument,
		{ history = true } = {},
	) {
		const applyChange = () => {
			const nextDocument = updateDocument(getAnimationDocument());
			setAnimationDocument(nextDocument);
		};
		if (history) {
			runHistoryAction?.(label, applyChange);
		} else {
			applyChange();
		}
		updateUi();
	}

	function upsertKeyValue({
		target,
		path,
		value,
		label = "animation.key",
		frame = store.animation.timelineFrame.value,
		applyFrame = true,
	}) {
		return upsertKeyValues({
			target,
			entries: [{ path, value }],
			label,
			frame,
			applyFrame,
		});
	}

	function upsertKeyValues({
		target,
		entries,
		label = "animation.key",
		frame = store.animation.timelineFrame.value,
		applyFrame = true,
		history = true,
	}) {
		const normalizedTarget = {
			kind: target?.kind,
			id: String(target?.id ?? ""),
		};
		const normalizedEntries = (Array.isArray(entries) ? entries : [])
			.map((entry) => ({
				path: String(entry?.path ?? ""),
				value: Number(entry?.value),
			}))
			.filter(
				(entry) =>
					isAnimationTrackPathAllowed(normalizedTarget, entry.path) &&
					Number.isFinite(entry.value),
			);
		if (!normalizedTarget.id || normalizedEntries.length === 0) {
			return false;
		}
		const keyFrame = Math.round(Number(frame));
		updateAnimationDocument(
			label,
			(documentState) =>
				updateActiveClip(documentState, (clip) => {
					const bindingId = createBindingId(normalizedTarget);
					const bindings = [...clip.bindings];
					let bindingIndex = bindings.findIndex(
						(binding) =>
							binding.target.kind === normalizedTarget.kind &&
							String(binding.target.id) === normalizedTarget.id,
					);
					if (bindingIndex < 0) {
						bindings.push({
							id: bindingId,
							target: normalizedTarget,
							labelCache: "",
							tracks: [],
						});
						bindingIndex = bindings.length - 1;
					}
					const binding = { ...bindings[bindingIndex] };
					const tracks = [...binding.tracks];
					for (const entry of normalizedEntries) {
						let trackIndex = tracks.findIndex(
							(track) => track.path === entry.path,
						);
						if (trackIndex < 0) {
							tracks.push({
								path: entry.path,
								valueType: "number",
								interpolation: "linear",
								keys: [],
							});
							trackIndex = tracks.length - 1;
						}
						const track = { ...tracks[trackIndex] };
						const key = {
							frame: keyFrame,
							value: entry.value,
						};
						const nextKeys = [
							...track.keys.filter((candidate) => candidate.frame !== keyFrame),
							key,
						].sort((left, right) => left.frame - right.frame);
						tracks[trackIndex] = {
							...track,
							keys: nextKeys,
						};
					}
					binding.tracks = tracks;
					bindings[bindingIndex] = binding;
					store.animation.selectedBindingId.value = binding.id;
					store.animation.selectedKeyIds.value = normalizedEntries.map(
						(entry) => createKeyId(binding.id, entry.path, keyFrame),
					);
					return {
						...clip,
						bindings,
					};
				}),
			{ history },
		);
		if (applyFrame) {
			applyCurrentFrame({ frame: keyFrame });
		}
		return true;
	}

	function getBindingForTarget(clip, target) {
		const normalizedTarget = parseTargetKey(createTargetKey(target));
		if (!normalizedTarget) {
			return null;
		}
		return (
			clip.bindings.find(
				(binding) =>
					binding.target.kind === normalizedTarget.kind &&
					String(binding.target.id) === normalizedTarget.id,
			) ?? null
		);
	}

	function getKeyIdsForTimelineKeyFrame(binding, frame) {
		const keyFrame = Math.round(Number(frame));
		if (!binding || !Number.isFinite(keyFrame)) {
			return [];
		}
		const keyIds = [];
		for (const track of binding.tracks ?? []) {
			if (
				(track.keys ?? []).some(
					(key) => Math.round(Number(key.frame)) === keyFrame,
				)
			) {
				keyIds.push(createKeyId(binding.id, track.path, keyFrame));
			}
		}
		return keyIds;
	}

	function collectSelectedKeyRefs(
		clip = getActiveAnimationClip(getAnimationDocument()),
	) {
		const selectedIds = new Set(store.animation.selectedKeyIds.value ?? []);
		if (selectedIds.size === 0) {
			return [];
		}
		const refs = [];
		const seenIds = new Set();
		for (const binding of clip.bindings ?? []) {
			for (const track of binding.tracks ?? []) {
				for (const key of track.keys ?? []) {
					const keyFrame = Math.round(Number(key.frame));
					const keyId = createKeyId(binding.id, track.path, keyFrame);
					if (
						!hasKeyId(selectedIds, binding.id, track.path, keyFrame) ||
						seenIds.has(keyId)
					) {
						continue;
					}
					seenIds.add(keyId);
					refs.push({
						id: keyId,
						bindingId: binding.id,
						target: {
							kind: binding.target.kind,
							id: String(binding.target.id),
						},
						path: track.path,
						frame: keyFrame,
						value: Number(key.value),
						interpolation: key.interpolation,
					});
				}
			}
		}
		return refs;
	}

	function setSelectedTimelineKeyIds(keyIds) {
		const nextIds = [];
		const seenIds = new Set();
		for (const keyId of Array.isArray(keyIds) ? keyIds : []) {
			const parsed = parseKeyId(keyId);
			if (!parsed) {
				continue;
			}
			const normalizedKeyId = createAnimationTimelineKeyId(parsed);
			if (seenIds.has(normalizedKeyId)) {
				continue;
			}
			seenIds.add(normalizedKeyId);
			nextIds.push(normalizedKeyId);
		}
		store.animation.selectedKeyIds.value = nextIds;
		const bindingIds = new Set(
			nextIds.map((keyId) => parseKeyId(keyId)?.bindingId).filter(Boolean),
		);
		store.animation.selectedBindingId.value =
			bindingIds.size === 1 ? [...bindingIds][0] : null;
		return nextIds;
	}

	function clearTimelineKeySelection() {
		if ((store.animation.selectedKeyIds.value ?? []).length === 0) {
			return false;
		}
		store.animation.selectedKeyIds.value = [];
		store.animation.selectedBindingId.value = null;
		updateUi?.();
		return true;
	}

	function hasSelectedTimelineKeys() {
		return collectSelectedKeyRefs().length > 0;
	}

	function hasTimelineKeyClipboard() {
		return Array.isArray(timelineKeyClipboard?.entries)
			? timelineKeyClipboard.entries.length > 0
			: false;
	}

	function selectTimelineKeyFrame(target, frame, options = {}) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const binding = getBindingForTarget(clip, target);
		if (!binding) {
			return false;
		}
		const keyIds = getKeyIdsForTimelineKeyFrame(binding, frame);
		if (keyIds.length === 0) {
			return false;
		}
		const additive = options?.additive === true;
		const toggle = options?.toggle === true;
		const nextIds = new Set(
			additive || toggle ? (store.animation.selectedKeyIds.value ?? []) : [],
		);
		const allSelected = keyIds.every((keyId) => nextIds.has(keyId));
		if (toggle && allSelected) {
			for (const keyId of keyIds) {
				nextIds.delete(keyId);
			}
		} else {
			for (const keyId of keyIds) {
				nextIds.add(keyId);
			}
		}
		setSelectedTimelineKeyIds([...nextIds]);
		updateUi?.();
		return true;
	}

	function moveSelectedTimelineKeysBy(deltaFrames, options = {}) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const refs = collectSelectedKeyRefs(clip);
		if (refs.length === 0) {
			return false;
		}
		const requestedDelta = Math.round(Number(deltaFrames));
		if (!Number.isFinite(requestedDelta) || requestedDelta === 0) {
			return true;
		}
		const startFrame = Number(clip.startFrame);
		const endFrame = startFrame + Math.max(1, Number(clip.durationFrames)) - 1;
		const minFrame = Math.min(...refs.map((ref) => ref.frame));
		const maxFrame = Math.max(...refs.map((ref) => ref.frame));
		const delta = Math.min(
			endFrame - maxFrame,
			Math.max(startFrame - minFrame, requestedDelta),
		);
		if (delta === 0) {
			return true;
		}
		const selectedIds = new Set(refs.map((ref) => ref.id));
		const nextSelectedKeyIds = [];
		updateAnimationDocument(
			options?.label ?? "animation.key.move",
			(documentState) =>
				updateActiveClip(documentState, (activeClip) => {
					const nextBindings = activeClip.bindings.map((binding) => {
						const nextTracks = binding.tracks.map((track) => {
							const movingKeys = [];
							const movingFrames = new Set();
							const destinationFrames = new Set();
							for (const key of track.keys ?? []) {
								const keyFrame = Math.round(Number(key.frame));
								if (!hasKeyId(selectedIds, binding.id, track.path, keyFrame)) {
									continue;
								}
								const nextFrame = keyFrame + delta;
								movingFrames.add(keyFrame);
								destinationFrames.add(nextFrame);
								movingKeys.push({
									...key,
									frame: nextFrame,
								});
								nextSelectedKeyIds.push(
									createKeyId(binding.id, track.path, nextFrame),
								);
							}
							if (movingKeys.length === 0) {
								return track;
							}
							const preservedKeys = (track.keys ?? []).filter((key) => {
								const keyFrame = Math.round(Number(key.frame));
								return (
									!movingFrames.has(keyFrame) &&
									!destinationFrames.has(keyFrame)
								);
							});
							return {
								...track,
								keys: [...preservedKeys, ...movingKeys].sort(
									(left, right) => left.frame - right.frame,
								),
							};
						});
						return {
							...binding,
							tracks: nextTracks,
						};
					});
					return {
						...activeClip,
						bindings: nextBindings,
					};
				}),
			{ history: options?.history !== false },
		);
		setSelectedTimelineKeyIds(nextSelectedKeyIds);
		if (options?.applyFrame !== false) {
			applyCurrentFrame();
		}
		updateUi?.();
		return true;
	}

	function moveTimelineKeyFrame(target, fromFrame, toFrame, options = {}) {
		if (!selectTimelineKeyFrame(target, fromFrame, options?.selection ?? {})) {
			return false;
		}
		return moveSelectedTimelineKeysBy(
			Math.round(Number(toFrame)) - Math.round(Number(fromFrame)),
			options,
		);
	}

	function copySelectedTimelineKeys() {
		const refs = collectSelectedKeyRefs();
		if (refs.length === 0) {
			return false;
		}
		const originFrame = Math.min(...refs.map((ref) => ref.frame));
		timelineKeyClipboard = {
			originFrame,
			entries: refs.map((ref) => ({
				target: {
					kind: ref.target.kind,
					id: String(ref.target.id),
				},
				path: ref.path,
				offsetFrame: ref.frame - originFrame,
				value: ref.value,
				...(ref.interpolation ? { interpolation: ref.interpolation } : {}),
			})),
		};
		updateUi?.();
		return true;
	}

	function pasteTimelineKeys(options = {}) {
		const entries = Array.isArray(timelineKeyClipboard?.entries)
			? timelineKeyClipboard.entries
			: [];
		if (entries.length === 0) {
			return false;
		}
		const clip = getActiveAnimationClip(getAnimationDocument());
		const offsets = entries.map((entry) =>
			Math.round(Number(entry.offsetFrame)),
		);
		const minOffset = Math.min(...offsets);
		const maxOffset = Math.max(...offsets);
		const startFrame = Number(clip.startFrame);
		const endFrame = startFrame + Math.max(1, Number(clip.durationFrames)) - 1;
		const requestedFrameValue = Math.round(
			Number(options?.frame ?? store.animation.timelineFrame.value),
		);
		const requestedFrame = Number.isFinite(requestedFrameValue)
			? requestedFrameValue
			: startFrame;
		const baseFrame = Math.min(
			endFrame - maxOffset,
			Math.max(startFrame - minOffset, requestedFrame),
		);
		const nextSelectedKeyIds = [];
		updateAnimationDocument(
			options?.label ?? "animation.key.paste",
			(documentState) =>
				updateActiveClip(documentState, (activeClip) => {
					const bindings = [...activeClip.bindings];
					for (const entry of entries) {
						const target = parseTargetKey(createTargetKey(entry.target));
						const path = String(entry.path ?? "");
						const value = Number(entry.value);
						if (
							!target ||
							!isAnimationTrackPathAllowed(target, path) ||
							!Number.isFinite(value)
						) {
							continue;
						}
						const keyFrame = baseFrame + Math.round(Number(entry.offsetFrame));
						let bindingIndex = bindings.findIndex(
							(binding) =>
								binding.target.kind === target.kind &&
								String(binding.target.id) === target.id,
						);
						if (bindingIndex < 0) {
							bindings.push({
								id: createBindingId(target),
								target,
								labelCache: "",
								tracks: [],
							});
							bindingIndex = bindings.length - 1;
						}
						const binding = { ...bindings[bindingIndex] };
						const tracks = [...binding.tracks];
						let trackIndex = tracks.findIndex((track) => track.path === path);
						if (trackIndex < 0) {
							tracks.push({
								path,
								valueType: "number",
								interpolation: "linear",
								keys: [],
							});
							trackIndex = tracks.length - 1;
						}
						const track = { ...tracks[trackIndex] };
						const key = {
							frame: keyFrame,
							value,
							...(entry.interpolation
								? { interpolation: entry.interpolation }
								: {}),
						};
						track.keys = [
							...(track.keys ?? []).filter(
								(candidate) => candidate.frame !== keyFrame,
							),
							key,
						].sort((left, right) => left.frame - right.frame);
						tracks[trackIndex] = track;
						binding.tracks = tracks;
						bindings[bindingIndex] = binding;
						nextSelectedKeyIds.push(createKeyId(binding.id, path, keyFrame));
					}
					return {
						...activeClip,
						bindings,
					};
				}),
			{ history: options?.history !== false },
		);
		setSelectedTimelineKeyIds(nextSelectedKeyIds);
		if (options?.applyFrame !== false) {
			applyCurrentFrame();
		}
		updateUi?.();
		return nextSelectedKeyIds.length > 0;
	}

	function deleteSelectedTimelineKeys(options = {}) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const refs = collectSelectedKeyRefs(clip);
		if (refs.length === 0) {
			return false;
		}
		const selectedIds = new Set(refs.map((ref) => ref.id));
		updateAnimationDocument(
			options?.label ?? "animation.key.delete",
			(documentState) =>
				updateActiveClip(documentState, (activeClip) => {
					const bindings = activeClip.bindings
						.map((binding) => {
							const tracks = binding.tracks
								.map((track) => ({
									...track,
									keys: (track.keys ?? []).filter((key) => {
										const keyFrame = Math.round(Number(key.frame));
										return !hasKeyId(
											selectedIds,
											binding.id,
											track.path,
											keyFrame,
										);
									}),
								}))
								.filter((track) => track.keys.length > 0);
							return {
								...binding,
								tracks,
							};
						})
						.filter((binding) => binding.tracks.length > 0);
					return {
						...activeClip,
						bindings,
					};
				}),
			{ history: options?.history !== false },
		);
		setSelectedTimelineKeyIds([]);
		if (options?.applyFrame !== false) {
			applyCurrentFrame();
		}
		updateUi?.();
		return true;
	}

	function getTimelineKeyFrames(options = {}) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const selectedOnly = options?.selectedOnly === true;
		const selectedIds = new Set(store.animation.selectedKeyIds.value ?? []);
		const frames = new Set();
		for (const binding of clip.bindings ?? []) {
			for (const track of binding.tracks ?? []) {
				for (const key of track.keys ?? []) {
					const keyFrame = Math.round(Number(key.frame));
					if (!Number.isFinite(keyFrame)) {
						continue;
					}
					if (selectedOnly) {
						if (!hasKeyId(selectedIds, binding.id, track.path, keyFrame)) {
							continue;
						}
					}
					frames.add(keyFrame);
				}
			}
		}
		return [...frames].sort((left, right) => left - right);
	}

	function jumpTimelineToPreviousKey() {
		const current = Math.round(Number(store.animation.timelineFrame.value));
		const previousFrame = [...getTimelineKeyFrames()]
			.reverse()
			.find((frame) => frame < current);
		if (!Number.isFinite(previousFrame)) {
			return false;
		}
		setTimelineFrame(previousFrame);
		return true;
	}

	function jumpTimelineToNextKey() {
		const current = Math.round(Number(store.animation.timelineFrame.value));
		const nextFrame = getTimelineKeyFrames().find((frame) => frame > current);
		if (!Number.isFinite(nextFrame)) {
			return false;
		}
		setTimelineFrame(nextFrame);
		return true;
	}

	function getSelectedTimelineKeyInterpolation() {
		const refs = collectSelectedKeyRefs();
		if (refs.length === 0) {
			return null;
		}
		const modes = new Set(
			refs.map((ref) => sanitizeTimelineInterpolationMode(ref.interpolation)),
		);
		return modes.size === 1 ? [...modes][0] : "mixed";
	}

	function setSelectedTimelineKeyInterpolation(mode, options = {}) {
		const interpolation = sanitizeTimelineInterpolationMode(mode);
		const refs = collectSelectedKeyRefs();
		if (refs.length === 0) {
			return false;
		}
		const selectedIds = new Set(refs.map((ref) => ref.id));
		updateAnimationDocument(
			options?.label ?? "animation.key.interpolation",
			(documentState) =>
				updateActiveClip(documentState, (activeClip) => ({
					...activeClip,
					bindings: activeClip.bindings.map((binding) => ({
						...binding,
						tracks: binding.tracks.map((track) => ({
							...track,
							keys: (track.keys ?? []).map((key) => {
								const keyFrame = Math.round(Number(key.frame));
								return hasKeyId(selectedIds, binding.id, track.path, keyFrame)
									? {
											...key,
											interpolation,
										}
									: key;
							}),
						})),
					})),
				})),
			{ history: options?.history !== false },
		);
		if (options?.applyFrame !== false) {
			applyCurrentFrame();
		}
		updateUi?.();
		return true;
	}

	function scaleSelectedTimelineKeys(factor, options = {}) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const refs = collectSelectedKeyRefs(clip);
		const selectedFrames = [...new Set(refs.map((ref) => ref.frame))].sort(
			(left, right) => left - right,
		);
		if (selectedFrames.length < 2) {
			return false;
		}
		const numericFactor = Number(factor);
		if (!Number.isFinite(numericFactor) || numericFactor <= 0) {
			return false;
		}
		const startFrame = Number(clip.startFrame);
		const endFrame = startFrame + Math.max(1, Number(clip.durationFrames)) - 1;
		const pivotFrame = Number.isFinite(Number(options?.pivotFrame))
			? Math.round(Number(options.pivotFrame))
			: selectedFrames[0];
		const scaledFrameByKeyId = new Map();
		for (const ref of refs) {
			const nextFrame =
				pivotFrame + Math.round((ref.frame - pivotFrame) * numericFactor);
			scaledFrameByKeyId.set(ref.id, nextFrame);
		}
		let minFrame = Math.min(...scaledFrameByKeyId.values());
		let maxFrame = Math.max(...scaledFrameByKeyId.values());
		let shift = 0;
		if (minFrame < startFrame) {
			shift = startFrame - minFrame;
		}
		if (maxFrame + shift > endFrame) {
			shift = endFrame - maxFrame;
		}
		if (shift !== 0) {
			for (const [keyId, frame] of scaledFrameByKeyId) {
				scaledFrameByKeyId.set(keyId, frame + shift);
			}
			minFrame = Math.min(...scaledFrameByKeyId.values());
			maxFrame = Math.max(...scaledFrameByKeyId.values());
		}
		if (minFrame < startFrame || maxFrame > endFrame) {
			return false;
		}
		const selectedIds = new Set(refs.map((ref) => ref.id));
		const nextSelectedKeyIds = [];
		updateAnimationDocument(
			options?.label ?? "animation.key.scale-time",
			(documentState) =>
				updateActiveClip(documentState, (activeClip) => {
					const nextBindings = activeClip.bindings.map((binding) => {
						const nextTracks = binding.tracks.map((track) => {
							const movingKeys = [];
							const movingFrames = new Set();
							const destinationFrames = new Set();
							for (const key of track.keys ?? []) {
								const keyFrame = Math.round(Number(key.frame));
								const keyId = createKeyId(binding.id, track.path, keyFrame);
								if (!hasKeyId(selectedIds, binding.id, track.path, keyFrame)) {
									continue;
								}
								const nextFrame = scaledFrameByKeyId.get(keyId);
								if (!Number.isFinite(nextFrame)) {
									continue;
								}
								movingFrames.add(keyFrame);
								destinationFrames.add(nextFrame);
								movingKeys.push({
									...key,
									frame: nextFrame,
								});
								nextSelectedKeyIds.push(
									createKeyId(binding.id, track.path, nextFrame),
								);
							}
							if (movingKeys.length === 0) {
								return track;
							}
							const preservedKeys = (track.keys ?? []).filter((key) => {
								const keyFrame = Math.round(Number(key.frame));
								return (
									!movingFrames.has(keyFrame) &&
									!destinationFrames.has(keyFrame)
								);
							});
							return {
								...track,
								keys: [...preservedKeys, ...movingKeys].sort(
									(left, right) => left.frame - right.frame,
								),
							};
						});
						return {
							...binding,
							tracks: nextTracks,
						};
					});
					return {
						...activeClip,
						bindings: nextBindings,
					};
				}),
			{ history: options?.history !== false },
		);
		setSelectedTimelineKeyIds(nextSelectedKeyIds);
		if (options?.applyFrame !== false) {
			applyCurrentFrame();
		}
		updateUi?.();
		return true;
	}

	function getCurrentTimelineKeyStatus(
		frame = store.animation.timelineFrame.value,
	) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		const keyFrame = Math.round(Number(frame));
		const currentTargets = getCurrentKeyTargetTargets();
		const targetKeys =
			currentTargets.length > 0
				? new Set(currentTargets.map((target) => createTargetKey(target)))
				: null;
		let targetCount = 0;
		let keyedTargetCount = 0;
		let keyCount = 0;
		const interpolations = new Set();
		for (const binding of clip.bindings ?? []) {
			const targetKey = createTargetKey(binding.target);
			if (targetKeys && !targetKeys.has(targetKey)) {
				continue;
			}
			targetCount += 1;
			let bindingHasKey = false;
			for (const track of binding.tracks ?? []) {
				for (const key of track.keys ?? []) {
					if (Math.round(Number(key.frame)) !== keyFrame) {
						continue;
					}
					keyCount += 1;
					bindingHasKey = true;
					interpolations.add(
						sanitizeTimelineInterpolationMode(key.interpolation),
					);
				}
			}
			if (bindingHasKey) {
				keyedTargetCount += 1;
			}
		}
		return {
			frame: keyFrame,
			hasKey: keyCount > 0,
			targetCount,
			keyedTargetCount,
			keyCount,
			interpolation:
				interpolations.size === 0
					? null
					: interpolations.size === 1
						? [...interpolations][0]
						: "mixed",
		};
	}

	function captureAnimationDocument() {
		return cloneSerializable(getAnimationDocument());
	}

	function restoreAnimationDocument(documentState = null) {
		setAnimationDocument(documentState ?? createDefaultAnimationDocument());
		return true;
	}

	function captureTimelineEditorState() {
		return {
			timelineFrame: store.animation.timelineFrame.value,
			panelOpen: store.animation.panelOpen.value,
			panelHeight: store.animation.panelHeight.value,
			autoKeyTargetKeys: getAutoKeyTargetKeys(),
			selectedBindingId: store.animation.selectedBindingId.value,
			selectedKeyIds: [...(store.animation.selectedKeyIds.value ?? [])],
			expandedRowIds: [...(store.animation.expandedRowIds.value ?? [])],
			zoom: store.animation.zoom.value,
			scrollFrame: store.animation.scrollFrame.value,
			keyTargetMode: sanitizeKeyTargetMode(store.animation.keyTargetMode.value),
		};
	}

	function restoreTimelineEditorState(editorState = null) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		store.animation.timelineFrame.value = clampTimelineFrame(
			editorState?.timelineFrame,
			clip,
		);
		store.animation.panelOpen.value = Boolean(editorState?.panelOpen);
		store.animation.panelHeight.value = Math.min(
			520,
			Math.max(144, Number(editorState?.panelHeight ?? 220)),
		);
		store.animation.selectedBindingId.value =
			typeof editorState?.selectedBindingId === "string"
				? editorState.selectedBindingId
				: null;
		store.animation.selectedKeyIds.value = Array.isArray(
			editorState?.selectedKeyIds,
		)
			? [...editorState.selectedKeyIds]
			: [];
		store.animation.expandedRowIds.value = Array.isArray(
			editorState?.expandedRowIds,
		)
			? [...editorState.expandedRowIds]
			: [];
		store.animation.zoom.value = clampTimelineZoom(editorState?.zoom ?? 1);
		store.animation.scrollFrame.value = Math.round(
			Number(editorState?.scrollFrame ?? clip.startFrame),
		);
		store.animation.keyTargetMode.value = sanitizeKeyTargetMode(
			editorState?.keyTargetMode,
		);
		if (Array.isArray(editorState?.autoKeyTargetKeys)) {
			replaceAutoKeyTargetKeys(editorState.autoKeyTargetKeys, {
				history: false,
			});
		} else if (editorState?.autoKey === true) {
			setAutoKeyForTargets(getCurrentKeyTargetTargets(), true, {
				history: false,
			});
		} else if (editorState && Object.hasOwn(editorState, "autoKey")) {
			replaceAutoKeyTargetKeys([], { history: false });
		}
		store.animation.isPlaying.value = false;
		return true;
	}

	function setAnimationEnabled(_nextEnabled) {
		if (isAnimationEnabled()) {
			return true;
		}
		updateAnimationDocument("animation.enabled", (documentState) => ({
			...documentState,
			enabled: true,
		}));
		return true;
	}

	function toggleAnimationEnabled() {
		return setAnimationEnabled(true);
	}

	function setTimelinePanelOpen(nextOpen) {
		store.animation.panelOpen.value = Boolean(nextOpen);
	}

	function setTimelinePanelHeight(nextHeight) {
		store.animation.panelHeight.value = Math.min(
			520,
			Math.max(144, Number(nextHeight) || 220),
		);
	}

	function setTimelineZoom(nextZoom) {
		store.animation.zoom.value = clampTimelineZoom(nextZoom);
		store.animation.scrollFrame.value = store.animation.timelineFrame.value;
		updateUi?.();
		return store.animation.zoom.value;
	}

	function zoomTimelineIn() {
		return setTimelineZoom(store.animation.zoom.value * TIMELINE_ZOOM_STEP);
	}

	function zoomTimelineOut() {
		return setTimelineZoom(store.animation.zoom.value / TIMELINE_ZOOM_STEP);
	}

	function setTimelineFrame(nextFrame) {
		const clip = getActiveAnimationClip(getAnimationDocument());
		store.animation.timelineFrame.value = clampTimelineFrame(nextFrame, clip);
		store.animation.isPlaying.value = false;
		applyCurrentFrame();
		updateUi();
	}

	function setAnimationFps(nextFps) {
		updateAnimationDocument("animation.fps", (documentState) =>
			updateActiveClip(documentState, (clip) => ({
				...clip,
				fps: nextFps,
			})),
		);
	}

	function setAnimationDurationFrames(nextDurationFrames) {
		updateAnimationDocument("animation.duration", (documentState) =>
			updateActiveClip(documentState, (clip) => ({
				...clip,
				durationFrames: nextDurationFrames,
				playbackEndFrame:
					clip.startFrame +
					Math.max(1, Math.round(Number(nextDurationFrames))) -
					1,
			})),
		);
	}

	function setAnimationAutoKey(nextEnabled) {
		const targets = getCurrentKeyTargetTargets();
		if (targets.length === 0) {
			if (!nextEnabled) {
				replaceAutoKeyTargetKeys([]);
				return true;
			}
			return false;
		}
		return setAutoKeyForTargets(targets, Boolean(nextEnabled));
	}

	function setAnimationKeyTargetMode(nextMode) {
		store.animation.keyTargetMode.value = sanitizeKeyTargetMode(nextMode);
		updateUi?.();
	}

	function shouldHandleAutoKey(target = null) {
		if (!target) {
			return hasAutoKeyTargets();
		}
		return isTargetAutoKeyEnabled(target);
	}

	function shouldHandleShotCameraAutoKey(
		shotCameraId = store.workspace.activeShotCameraId.value,
	) {
		return shouldHandleAutoKey({
			kind: ANIMATION_TARGET_SHOT_CAMERA,
			id: shotCameraId,
		});
	}

	function shouldHandleSceneAssetAutoKey(assetId) {
		return shouldHandleAutoKey({
			kind: ANIMATION_TARGET_SCENE_ASSET,
			id: assetId,
		});
	}

	function setShotCameraPositionKey(axis, nextValue) {
		if (!["x", "y", "z"].includes(axis)) {
			return false;
		}
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SHOT_CAMERA,
				id: store.workspace.activeShotCameraId.value,
			},
			path: `transform.position.${axis}`,
			value: nextValue,
			label: `animation.key.camera-position.${axis}`,
		});
	}

	function setShotCameraPoseAngleKey(axis, nextValue) {
		const pathByAxis = {
			yawDeg: "transform.rotation.yawDeg",
			pitchDeg: "transform.rotation.pitchDeg",
			rollDeg: "transform.rotation.rollDeg",
			yaw: "transform.rotation.yawDeg",
			pitch: "transform.rotation.pitchDeg",
			roll: "transform.rotation.rollDeg",
		};
		const path = pathByAxis[axis];
		if (!path) {
			return false;
		}
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SHOT_CAMERA,
				id: store.workspace.activeShotCameraId.value,
			},
			path,
			value: nextValue,
			label: "animation.key.camera-rotation",
		});
	}

	function setShotCameraBaseFovXKey(nextValue) {
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SHOT_CAMERA,
				id: store.workspace.activeShotCameraId.value,
			},
			path: "lens.baseFovX",
			value: nextValue,
			label: "animation.key.camera-lens",
		});
	}

	function setShotCameraLensShiftAxisKey(axis, nextPercent) {
		const path = axis === "y" ? "lens.shiftY" : "lens.shiftX";
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SHOT_CAMERA,
				id: store.workspace.activeShotCameraId.value,
			},
			path,
			value: Number(nextPercent) / 100,
			label: `animation.key.camera-lens-shift.${axis === "y" ? "y" : "x"}`,
		});
	}

	function setSceneAssetPositionKey(assetId, axis, nextValue) {
		if (!["x", "y", "z"].includes(axis)) {
			return false;
		}
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SCENE_ASSET,
				id: assetId,
			},
			path: `transform.position.${axis}`,
			value: nextValue,
			label: `animation.key.asset-position.${axis}`,
		});
	}

	function setSceneAssetRotationKey(assetId, axis, nextValue) {
		if (!["x", "y", "z"].includes(axis)) {
			return false;
		}
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SCENE_ASSET,
				id: assetId,
			},
			path: `transform.rotation.${axis}Deg`,
			value: nextValue,
			label: `animation.key.asset-rotation.${axis}`,
		});
	}

	function setSceneAssetWorldScaleKey(assetId, nextValue) {
		return upsertKeyValue({
			target: {
				kind: ANIMATION_TARGET_SCENE_ASSET,
				id: assetId,
			},
			path: "transform.worldScale",
			value: nextValue,
			label: "animation.key.asset-scale",
		});
	}

	function getCurrentShotCameraLensValues(shotCameraId) {
		const documentLens = getShotCameraDocument(shotCameraId)?.lens ?? {};
		const evaluatedLens = getEvaluatedLensForShotCamera(shotCameraId);
		if (evaluatedLens) {
			return evaluatedLens;
		}
		const isActiveShotCamera =
			String(shotCameraId) ===
			String(store.workspace.activeShotCameraId.value ?? "");
		const activeShiftX = Number(store.shotCamera?.lensShiftX?.value);
		const activeShiftY = Number(store.shotCamera?.lensShiftY?.value);
		return {
			baseFovX:
				isActiveShotCamera && Number.isFinite(Number(state?.baseFovX))
					? Number(state.baseFovX)
					: documentLens.baseFovX,
			shiftX:
				isActiveShotCamera && Number.isFinite(activeShiftX)
					? activeShiftX
					: documentLens.shiftX,
			shiftY:
				isActiveShotCamera && Number.isFinite(activeShiftY)
					? activeShiftY
					: documentLens.shiftY,
		};
	}

	function buildShotCameraKeyEntries(shotCameraId) {
		const entry = shotCameraRegistry.get(shotCameraId);
		if (!entry?.camera) {
			return null;
		}
		const angles = decomposeCameraPoseAngles({
			quaternion: entry.camera.quaternion,
			axisLocal: CAMERA_AXIS_LOCAL,
		});
		const lens = getCurrentShotCameraLensValues(shotCameraId);
		return [
			{ path: "transform.position.x", value: entry.camera.position.x },
			{ path: "transform.position.y", value: entry.camera.position.y },
			{ path: "transform.position.z", value: entry.camera.position.z },
			{ path: "transform.rotation.yawDeg", value: angles.yawDeg },
			{ path: "transform.rotation.pitchDeg", value: angles.pitchDeg },
			{ path: "transform.rotation.rollDeg", value: angles.rollDeg },
			{
				path: "lens.baseFovX",
				value: lens.baseFovX ?? state?.baseFovX ?? 60,
			},
			{ path: "lens.shiftX", value: lens.shiftX ?? 0 },
			{ path: "lens.shiftY", value: lens.shiftY ?? 0 },
		];
	}

	function insertShotCameraKey(
		shotCameraId = store.workspace.activeShotCameraId.value,
		{
			frame = store.animation.timelineFrame.value,
			applyFrame = true,
			history = true,
		} = {},
	) {
		const entries = buildShotCameraKeyEntries(shotCameraId);
		if (!entries) {
			return false;
		}
		return upsertKeyValues({
			target: {
				kind: ANIMATION_TARGET_SHOT_CAMERA,
				id: shotCameraId,
			},
			entries,
			label: "animation.key.camera",
			frame,
			applyFrame,
			history,
		});
	}

	function buildSceneAssetKeyEntries(assetId) {
		const asset = getSceneAssetByAnimationId(assetId);
		if (!asset?.object) {
			return null;
		}
		const worldPosition = asset.object.getWorldPosition(new THREE.Vector3());
		const worldQuaternion = asset.object.getWorldQuaternion(
			new THREE.Quaternion(),
		);
		const worldEuler = new THREE.Euler().setFromQuaternion(
			worldQuaternion,
			"XYZ",
		);
		return {
			assetId: asset.id,
			entries: [
				{ path: "transform.position.x", value: worldPosition.x },
				{ path: "transform.position.y", value: worldPosition.y },
				{ path: "transform.position.z", value: worldPosition.z },
				{
					path: "transform.rotation.xDeg",
					value: THREE.MathUtils.radToDeg(worldEuler.x),
				},
				{
					path: "transform.rotation.yDeg",
					value: THREE.MathUtils.radToDeg(worldEuler.y),
				},
				{
					path: "transform.rotation.zDeg",
					value: THREE.MathUtils.radToDeg(worldEuler.z),
				},
				{ path: "transform.worldScale", value: asset.worldScale ?? 1 },
			],
		};
	}

	function insertSceneAssetKey(
		assetId,
		{
			frame = store.animation.timelineFrame.value,
			applyFrame = true,
			history = true,
		} = {},
	) {
		const keyData = buildSceneAssetKeyEntries(assetId);
		if (!keyData) {
			return false;
		}
		return upsertKeyValues({
			target: {
				kind: ANIMATION_TARGET_SCENE_ASSET,
				id: keyData.assetId,
			},
			entries: keyData.entries,
			label: "animation.key.asset",
			frame,
			applyFrame,
			history,
		});
	}

	function autoKeySceneAssetTransforms(
		assetIds,
		{ frame = store.animation.timelineFrame.value, applyFrame = false } = {},
	) {
		const uniqueAssetIds = [];
		const seenIds = new Set();
		for (const assetId of Array.isArray(assetIds) ? assetIds : [assetIds]) {
			const key = String(assetId ?? "");
			if (!key || seenIds.has(key)) {
				continue;
			}
			seenIds.add(key);
			uniqueAssetIds.push(assetId);
		}
		let inserted = false;
		for (const assetId of uniqueAssetIds) {
			if (!shouldHandleSceneAssetAutoKey(assetId)) {
				continue;
			}
			inserted =
				insertSceneAssetKey(assetId, {
					frame,
					applyFrame: false,
				}) || inserted;
		}
		if (inserted && applyFrame) {
			applyCurrentFrame({ frame });
		}
		return inserted;
	}

	function insertKeyForSelection() {
		if (!isAnimationEnabled()) {
			setAnimationEnabled(true);
		}
		const selectedAssetIds = store.selectedSceneAssetIds?.value ?? [];
		const keyTargetMode = sanitizeKeyTargetMode(
			store.animation.keyTargetMode?.value,
		);
		const frame = store.animation.timelineFrame.value;
		let inserted = false;
		const insertedTargets = [];
		if (
			keyTargetMode === ANIMATION_KEY_TARGET_CAMERA ||
			keyTargetMode === ANIMATION_KEY_TARGET_BOTH
		) {
			const shotCameraId = store.workspace.activeShotCameraId.value;
			const insertedCamera = insertShotCameraKey(shotCameraId, {
				frame,
				applyFrame: false,
			});
			if (insertedCamera) {
				inserted = true;
				insertedTargets.push({
					kind: ANIMATION_TARGET_SHOT_CAMERA,
					id: shotCameraId,
				});
			}
		}
		if (
			keyTargetMode === ANIMATION_KEY_TARGET_OBJECTS ||
			keyTargetMode === ANIMATION_KEY_TARGET_BOTH
		) {
			for (const assetId of selectedAssetIds) {
				const insertedAsset = insertSceneAssetKey(assetId, {
					frame,
					applyFrame: false,
				});
				if (insertedAsset) {
					inserted = true;
					insertedTargets.push({
						kind: ANIMATION_TARGET_SCENE_ASSET,
						id: assetId,
					});
				}
			}
		}
		if (inserted) {
			setAutoKeyForTargets(insertedTargets, true, { history: false });
			applyCurrentFrame({ frame });
		}
		return inserted;
	}

	function playTimeline() {
		if (!isAnimationEnabled()) {
			return false;
		}
		ensureRuntimeStateCaptured();
		playbackAccumulatorSeconds = 0;
		store.animation.isPlaying.value = true;
		return true;
	}

	function pauseTimeline() {
		store.animation.isPlaying.value = false;
		return true;
	}

	function jumpTimelineStart() {
		const clip = getActiveAnimationClip(getAnimationDocument());
		setTimelineFrame(clip.playbackStartFrame ?? clip.startFrame);
	}

	function jumpTimelineEnd() {
		const clip = getActiveAnimationClip(getAnimationDocument());
		setTimelineFrame(
			clip.playbackEndFrame ?? clip.startFrame + clip.durationFrames - 1,
		);
	}

	function getEvaluatedRuntimeTargetKeysForClip(clip) {
		const targetKeys = new Set();
		for (const binding of clip?.bindings ?? []) {
			const hasImplementedChannels =
				binding.target.kind === ANIMATION_TARGET_SHOT_CAMERA
					? hasBindingChannelGroup(
							binding,
							ANIMATION_CHANNEL_GROUP_TRANSFORM,
						) || hasBindingChannelGroup(binding, ANIMATION_CHANNEL_GROUP_LENS)
					: binding.target.kind === ANIMATION_TARGET_SCENE_ASSET
						? hasBindingChannelGroup(binding, ANIMATION_CHANNEL_GROUP_TRANSFORM)
						: false;
			const targetKey = hasImplementedChannels
				? createTargetKey(binding.target)
				: "";
			if (targetKey) {
				targetKeys.add(targetKey);
			}
		}
		return targetKeys;
	}

	function withBaseRuntimeStateForSnapshot(callback) {
		const shouldReapply = runtimeEvaluated && isAnimationEnabled();
		const frame = store.animation.timelineFrame.value;
		const preservedRuntimeStates = shouldReapply
			? captureManualRuntimeStates()
			: new Map();
		if (shouldReapply) {
			restoreRuntimeTargetsToBase(evaluatedRuntimeTargetKeys);
		} else {
			restoreBaseRuntimeState();
		}
		try {
			return callback?.();
		} finally {
			if (shouldReapply) {
				applyCurrentFrame({
					frame,
					preserveManualEdits: true,
					preservedRuntimeStates,
				});
			}
		}
	}

	function applyCurrentFrame({
		frame = store.animation.timelineFrame.value,
		preserveManualEdits = false,
		preservedRuntimeStates = null,
	} = {}) {
		if (!isAnimationEnabled()) {
			return restoreBaseRuntimeState();
		}
		const skippedTargetKeys = preserveManualEdits
			? new Set(manuallyEditedRuntimeTargets)
			: new Set();
		const manualRuntimeStates = preserveManualEdits
			? (preservedRuntimeStates ??
				captureManualRuntimeStates(skippedTargetKeys))
			: new Map();
		if (!preserveManualEdits) {
			manuallyEditedRuntimeTargets.clear();
		}
		ensureRuntimeStateCaptured();
		const clip = getActiveAnimationClip(getAnimationDocument());
		const nextEvaluatedTargetKeys = getEvaluatedRuntimeTargetKeysForClip(clip);
		restoreRuntimeTargetsToBase(
			new Set([...evaluatedRuntimeTargetKeys, ...nextEvaluatedTargetKeys]),
		);
		evaluatedRuntimeTargetKeys.clear();
		for (const targetKey of nextEvaluatedTargetKeys) {
			evaluatedRuntimeTargetKeys.add(targetKey);
		}
		const timelineFrame = clampTimelineFrame(frame, clip);
		store.animation.timelineFrame.value = timelineFrame;
		for (const binding of clip.bindings) {
			if (skippedTargetKeys.has(createTargetKey(binding.target))) {
				continue;
			}
			if (binding.target.kind === "shot-camera") {
				evaluateShotCameraBinding(binding, timelineFrame);
			} else if (binding.target.kind === "scene-asset") {
				evaluateSceneAssetBinding(binding, timelineFrame);
			}
		}
		for (const snapshot of manualRuntimeStates.values()) {
			applyRuntimeStateSnapshot(snapshot);
		}
		runtimeEvaluated = true;
		syncShotProjection?.();
		applyCameraViewProjection?.();
		syncOutputCamera?.();
		updateCameraSummary?.();
		return true;
	}

	function advancePlayback(deltaSeconds) {
		if (!store.animation.isPlaying.value || !isAnimationEnabled()) {
			return false;
		}
		const clip = getActiveAnimationClip(getAnimationDocument());
		const fps = Math.max(1, Number(clip.fps) || 24);
		playbackAccumulatorSeconds += Math.max(0, Number(deltaSeconds) || 0);
		const frameStep = Math.floor(playbackAccumulatorSeconds * fps);
		if (frameStep <= 0) {
			return false;
		}
		playbackAccumulatorSeconds -= frameStep / fps;
		const startFrame = clip.playbackStartFrame ?? clip.startFrame;
		const endFrame =
			clip.playbackEndFrame ?? clip.startFrame + clip.durationFrames - 1;
		let nextFrame = store.animation.timelineFrame.value + frameStep;
		while (nextFrame > endFrame) {
			nextFrame = startFrame + (nextFrame - endFrame - 1);
		}
		applyCurrentFrame({ frame: nextFrame });
		return true;
	}

	return {
		getAnimationDocument,
		captureAnimationDocument,
		restoreAnimationDocument,
		captureTimelineEditorState,
		restoreTimelineEditorState,
		setAnimationEnabled,
		toggleAnimationEnabled,
		setTimelinePanelOpen,
		setTimelinePanelHeight,
		setTimelineZoom,
		zoomTimelineIn,
		zoomTimelineOut,
		setTimelineFrame,
		setAnimationFps,
		setAnimationDurationFrames,
		setAnimationAutoKey,
		setAnimationKeyTargetMode,
		getAutoKeyTargetKeys,
		isTargetAutoKeyEnabled,
		setAutoKeyForTarget,
		toggleAutoKeyForTarget,
		selectTimelineKeyFrame,
		clearTimelineKeySelection,
		hasSelectedTimelineKeys,
		hasTimelineKeyClipboard,
		getTimelineKeyFrames,
		jumpTimelineToPreviousKey,
		jumpTimelineToNextKey,
		getSelectedTimelineKeyInterpolation,
		setSelectedTimelineKeyInterpolation,
		scaleSelectedTimelineKeys,
		getCurrentTimelineKeyStatus,
		moveSelectedTimelineKeysBy,
		moveTimelineKeyFrame,
		copySelectedTimelineKeys,
		pasteTimelineKeys,
		deleteSelectedTimelineKeys,
		shouldHandleAutoKey,
		shouldHandleShotCameraAutoKey,
		shouldHandleSceneAssetAutoKey,
		setShotCameraPositionKey,
		setShotCameraPoseAngleKey,
		setShotCameraBaseFovXKey,
		setShotCameraLensShiftAxisKey,
		setSceneAssetPositionKey,
		setSceneAssetRotationKey,
		setSceneAssetWorldScaleKey,
		autoKeySceneAssetTransforms,
		insertKeyForSelection,
		playTimeline,
		pauseTimeline,
		jumpTimelineStart,
		jumpTimelineEnd,
		restoreBaseRuntimeState,
		withBaseRuntimeStateForSnapshot,
		releaseRuntimeEvaluationForManualEdit,
		getEvaluatedLensForShotCamera,
		applyCurrentFrame,
		advancePlayback,
	};
}
