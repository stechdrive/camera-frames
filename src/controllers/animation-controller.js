import * as THREE from "three";
import {
	ANIMATION_TARGET_SCENE_ASSET,
	ANIMATION_TARGET_SHOT_CAMERA,
	createDefaultAnimationDocument,
	getActiveAnimationClip,
	isAnimationTrackPathAllowed,
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
	return `${bindingId}:${path}:${frame}`;
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
	const manuallyEditedRuntimeTargets = new Set();
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

	function evaluateShotCameraBinding(binding, timelineFrame) {
		const shotCameraId = binding.target.id;
		const entry = shotCameraRegistry.get(shotCameraId);
		const baseState = baseShotCameraStates.get(shotCameraId);
		if (!entry?.camera || !baseState) {
			return;
		}
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

	function evaluateSceneAssetBinding(binding, timelineFrame) {
		const assetId = binding.target.id;
		const asset = getSceneAssetByAnimationId(assetId);
		const baseState = baseSceneAssetStates.get(String(assetId));
		if (!asset?.object || !baseState) {
			return;
		}
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

	function withBaseRuntimeStateForSnapshot(callback) {
		const shouldReapply = runtimeEvaluated && isAnimationEnabled();
		const frame = store.animation.timelineFrame.value;
		const preservedRuntimeStates = shouldReapply
			? captureManualRuntimeStates()
			: new Map();
		restoreBaseRuntimeState();
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
		restoreBaseRuntimeState();
		const clip = getActiveAnimationClip(getAnimationDocument());
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
