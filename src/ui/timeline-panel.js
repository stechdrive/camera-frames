import { html } from "htm/preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import {
	ANIMATION_TARGET_SCENE_ASSET,
	ANIMATION_TARGET_SHOT_CAMERA,
	getAnimationTrackChannelGroup,
	parseAnimationTimelineKeyId,
} from "../animation/animation-model.js";
import { INTERACTIVE_FIELD_PROPS } from "./workbench-controls.js";
import { IconButton } from "./workbench-primitives.js";
import { WorkbenchIcon } from "./workbench-icons.js";

const TIMELINE_ZOOM_MIN = 1;
const TIMELINE_ZOOM_MAX = 8;
const TIMELINE_WHEEL_ZOOM_FACTOR = 1.2;
const KEY_TARGET_CAMERA = "camera";
const KEY_TARGET_OBJECTS = "objects";
const KEY_TARGET_BOTH = "both";
const ROW_FILTER_ALL = "all";
const ROW_FILTER_KEYED = "keyed";
const ROW_FILTER_FOCUS = "focus";
const ROW_FILTER_AUTOKEY = "autokey";
const ROW_FILTERS = [
	ROW_FILTER_ALL,
	ROW_FILTER_KEYED,
	ROW_FILTER_FOCUS,
	ROW_FILTER_AUTOKEY,
];

function clampNumber(value, fallback = 0) {
	const nextValue = Number(value);
	return Number.isFinite(nextValue) ? nextValue : fallback;
}

function formatFrame(frame) {
	return String(Math.round(Number(frame) || 0));
}

function getFrameLeftPct(frame, startFrame, endFrame) {
	return ((frame - startFrame) / Math.max(1, endFrame - startFrame)) * 100;
}

function getTimelineLeftCss(frame, startFrame, endFrame) {
	const leftPct = Math.max(
		0,
		Math.min(100, getFrameLeftPct(frame, startFrame, endFrame)),
	);
	return leftPct >= 100 ? "calc(100% - 1px)" : `${leftPct}%`;
}

function pickNiceFrameStep(rawStep) {
	const numericStep = Math.max(1, Number(rawStep) || 1);
	if (numericStep <= 1) {
		return 1;
	}
	const magnitude = 10 ** Math.floor(Math.log10(numericStep));
	for (const multiplier of [1, 2, 5, 10]) {
		const step = multiplier * magnitude;
		if (numericStep <= step) {
			return step;
		}
	}
	return 10 * magnitude;
}

function getMinimumFrameLabelSpacingPx(endFrame) {
	const digits = String(Math.max(1, Math.round(Math.abs(endFrame)))).length;
	if (digits <= 1) {
		return 16;
	}
	if (digits === 2) {
		return 20;
	}
	if (digits === 3) {
		return 26;
	}
	return 32;
}

function buildTimelineTicks({ startFrame, endFrame, contentPixelWidth }) {
	const frameIntervals = Math.max(1, endFrame - startFrame);
	const frameSpacingPx =
		Number.isFinite(contentPixelWidth) && contentPixelWidth > 0
			? contentPixelWidth / frameIntervals
			: 0;
	const minimumSpacingPx = getMinimumFrameLabelSpacingPx(endFrame);
	const step =
		frameSpacingPx >= minimumSpacingPx
			? 1
			: pickNiceFrameStep(minimumSpacingPx / Math.max(1, frameSpacingPx));
	const ticks = new Set([startFrame, endFrame]);
	const firstTick = Math.ceil(startFrame / step) * step;
	for (let frame = firstTick; frame <= endFrame; frame += step) {
		if (frame >= startFrame) {
			ticks.add(frame);
		}
	}
	return [...ticks].sort((left, right) => left - right);
}

function createTimelineTargetKey(kind, id) {
	if (!kind || id == null) {
		return "";
	}
	return `${kind}:${String(id)}`;
}

function parseTimelineTargetKey(targetKey) {
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

function getSceneAssetLabel(asset, fallback = "") {
	return asset?.label || asset?.name || String(asset?.id ?? fallback);
}

function getTimelineTargetLabel(
	target,
	shotCameras,
	sceneAssets,
	fallback = "",
) {
	if (target.kind === ANIMATION_TARGET_SHOT_CAMERA) {
		return (
			shotCameras.find((camera) => camera.id === target.id)?.name ??
			(fallback || target.id)
		);
	}
	const asset = sceneAssets.find(
		(candidate) => String(candidate.id) === String(target.id),
	);
	return getSceneAssetLabel(asset, fallback || target.id);
}

function getTimelineTargetTypeLabel(target, sceneAssets, t) {
	if (target.kind === ANIMATION_TARGET_SHOT_CAMERA) {
		return t("timeline.targetTypeCamera");
	}
	const asset = sceneAssets.find(
		(candidate) => String(candidate.id) === String(target.id),
	);
	return asset?.kind === "splat"
		? t("timeline.targetTypeSplat")
		: t("timeline.targetTypeMesh");
}

function collectBindingKeyFrames(binding) {
	const frames = new Set();
	for (const track of binding.tracks ?? []) {
		for (const key of track.keys ?? []) {
			frames.add(key.frame);
		}
	}
	return [...frames].sort((left, right) => left - right);
}

function collectBindingChannelGroups(binding) {
	const groups = new Set();
	for (const track of binding.tracks ?? []) {
		const group = getAnimationTrackChannelGroup(binding.target, track.path);
		if (group) {
			groups.add(group);
		}
	}
	return [...groups].sort();
}

function isTimelineKeyFrameSelected(row, frame, selectedKeyIds) {
	if (!row.bindingId || !Array.isArray(selectedKeyIds)) {
		return false;
	}
	const keyFrame = Math.round(Number(frame) || 0);
	return selectedKeyIds.some((keyId) => {
		const parsed = parseAnimationTimelineKeyId(keyId);
		return parsed?.bindingId === row.bindingId && parsed.frame === keyFrame;
	});
}

function isTimelineKeyboardInputTarget(target) {
	const element =
		typeof Element !== "undefined" && target instanceof Element ? target : null;
	if (!element) {
		return false;
	}
	if (element.closest("[contenteditable='true']")) {
		return true;
	}
	const tagName = element.tagName.toLowerCase();
	return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function buildTimelineRows({
	clip,
	shotCameras = [],
	sceneAssets = [],
	activeShotCameraId,
	selectedAssetIds = [],
	autoKeyTargetKeys = [],
	t,
}) {
	const autoKeySet = new Set(autoKeyTargetKeys ?? []);
	const rowsByTargetKey = new Map();
	const upsertTarget = ({
		target,
		label = "",
		typeLabel = "",
		bindingId = null,
		keyFrames = [],
		channelGroups = [],
		candidate = false,
	}) => {
		const targetKey = createTimelineTargetKey(target?.kind, target?.id);
		if (!targetKey) {
			return;
		}
		const existing = rowsByTargetKey.get(targetKey);
		const mergedKeyFrames =
			keyFrames.length > 0 ? keyFrames : (existing?.keyFrames ?? []);
		const mergedChannelGroups = [
			...new Set([...(existing?.channelGroups ?? []), ...channelGroups]),
		].sort();
		rowsByTargetKey.set(targetKey, {
			id: targetKey,
			target: {
				kind: target.kind,
				id: String(target.id),
			},
			bindingId: bindingId || existing?.bindingId || null,
			kind: target.kind,
			icon: target.kind === ANIMATION_TARGET_SHOT_CAMERA ? "camera" : "scene",
			label:
				label ||
				existing?.label ||
				getTimelineTargetLabel(target, shotCameras, sceneAssets),
			typeLabel: typeLabel || existing?.typeLabel || "",
			keyFrames: mergedKeyFrames,
			channelGroups: mergedChannelGroups,
			autoKey: autoKeySet.has(targetKey),
			candidate:
				mergedKeyFrames.length === 0 &&
				(candidate || existing?.candidate || keyFrames.length === 0),
		});
	};

	for (const binding of clip.bindings ?? []) {
		const target = {
			kind: binding.target.kind,
			id: binding.target.id,
		};
		upsertTarget({
			target,
			bindingId: binding.id,
			label: getTimelineTargetLabel(
				target,
				shotCameras,
				sceneAssets,
				binding.labelCache,
			),
			typeLabel: getTimelineTargetTypeLabel(target, sceneAssets, t),
			keyFrames: collectBindingKeyFrames(binding),
			channelGroups: collectBindingChannelGroups(binding),
		});
	}

	const activeCamera = shotCameras.find(
		(camera) => camera.id === activeShotCameraId,
	);
	if (activeShotCameraId != null) {
		const target = {
			kind: ANIMATION_TARGET_SHOT_CAMERA,
			id: activeShotCameraId,
		};
		upsertTarget({
			target,
			label: activeCamera?.name || activeCamera?.id || activeShotCameraId,
			typeLabel: getTimelineTargetTypeLabel(target, sceneAssets, t),
			candidate: true,
		});
	}

	for (const assetId of selectedAssetIds ?? []) {
		const asset = sceneAssets.find(
			(candidate) => String(candidate.id) === String(assetId),
		);
		if (!asset) {
			continue;
		}
		const target = {
			kind: ANIMATION_TARGET_SCENE_ASSET,
			id: asset.id,
		};
		upsertTarget({
			target,
			label: getSceneAssetLabel(asset),
			typeLabel: getTimelineTargetTypeLabel(target, sceneAssets, t),
			candidate: true,
		});
	}

	for (const targetKey of autoKeySet) {
		const target = parseTimelineTargetKey(targetKey);
		if (!target) {
			continue;
		}
		upsertTarget({
			target,
			label: getTimelineTargetLabel(target, shotCameras, sceneAssets),
			typeLabel: getTimelineTargetTypeLabel(target, sceneAssets, t),
			candidate: true,
		});
	}

	return [...rowsByTargetKey.values()];
}

function getSelectedAnimationAssets(store) {
	const sceneAssets = store.sceneAssets.value ?? [];
	const selectedIds = store.selectedSceneAssetIds.value ?? [];
	return selectedIds
		.map((assetId) => sceneAssets.find((asset) => asset.id === assetId) ?? null)
		.filter(Boolean);
}

function buildKeyTargetState({ store, t }) {
	const selectedAssets = getSelectedAnimationAssets(store);
	const activeCamera = store.workspace.activeShotCamera.value;
	const cameraLabel = activeCamera?.name || activeCamera?.id || "Camera";
	const objectLabel =
		selectedAssets.length === 0
			? t("timeline.keyTargetNoObjects")
			: selectedAssets.length === 1
				? selectedAssets[0].label ||
					selectedAssets[0].name ||
					String(selectedAssets[0].id)
				: t("timeline.keyTargetObjects", {
						count: selectedAssets.length,
					});
	const objectTitle =
		selectedAssets.length === 0
			? t("timeline.keyTargetNoObjects")
			: selectedAssets
					.map((asset) => asset.label || asset.name || String(asset.id))
					.join(", ");
	const mode = [
		KEY_TARGET_CAMERA,
		KEY_TARGET_OBJECTS,
		KEY_TARGET_BOTH,
	].includes(store.animation.keyTargetMode.value)
		? store.animation.keyTargetMode.value
		: KEY_TARGET_CAMERA;
	const summary =
		mode === KEY_TARGET_CAMERA
			? cameraLabel
			: mode === KEY_TARGET_OBJECTS
				? objectLabel
				: `${cameraLabel} + ${objectLabel}`;
	return {
		mode,
		cameraLabel,
		objectLabel,
		objectTitle,
		summary,
		selectedObjectCount: selectedAssets.length,
		addKeyDisabled: mode === KEY_TARGET_OBJECTS && selectedAssets.length === 0,
	};
}

function isFocusedTimelineRow(row, activeShotCameraId, selectedAssetIds) {
	if (row.kind === ANIMATION_TARGET_SHOT_CAMERA) {
		return String(row.target.id) === String(activeShotCameraId ?? "");
	}
	return (selectedAssetIds ?? []).some(
		(assetId) => String(assetId) === String(row.target.id),
	);
}

function filterTimelineRows({
	rows,
	filterMode,
	query,
	activeShotCameraId,
	selectedAssetIds,
}) {
	const normalizedMode = ROW_FILTERS.includes(filterMode)
		? filterMode
		: ROW_FILTER_ALL;
	const normalizedQuery = String(query ?? "")
		.trim()
		.toLowerCase();
	return rows.filter((row) => {
		if (
			normalizedMode === ROW_FILTER_KEYED &&
			(row.keyFrames ?? []).length === 0
		) {
			return false;
		}
		if (normalizedMode === ROW_FILTER_AUTOKEY && !row.autoKey) {
			return false;
		}
		if (
			normalizedMode === ROW_FILTER_FOCUS &&
			!isFocusedTimelineRow(row, activeShotCameraId, selectedAssetIds)
		) {
			return false;
		}
		if (!normalizedQuery) {
			return true;
		}
		return `${row.label} ${row.typeLabel}`
			.toLowerCase()
			.includes(normalizedQuery);
	});
}

function TimelineSegmentButton({
	value,
	activeValue,
	label,
	disabled = false,
	onClick,
}) {
	return html`
		<button
			type="button"
			class=${
				activeValue === value
					? "timeline-segmented__button is-active"
					: "timeline-segmented__button"
			}
			aria-pressed=${activeValue === value}
			disabled=${disabled}
			onClick=${() => onClick?.(value)}
		>
			${label}
		</button>
	`;
}

function TimelineKeyTargetButton({
	mode,
	activeMode,
	icon,
	label,
	detail = "",
	title,
	controller,
}) {
	return html`
		<button
			type="button"
			class=${
				activeMode === mode
					? "timeline-key-target__mode is-active"
					: "timeline-key-target__mode"
			}
			data-mode=${mode}
			aria-pressed=${activeMode === mode}
			title=${title}
			onClick=${() => controller()?.setAnimationKeyTargetMode?.(mode)}
		>
			<${WorkbenchIcon} name=${icon} size=${12} />
			<span>${label}</span>
			${
				detail
					? html`<span class="timeline-key-target__count">${detail}</span>`
					: null
			}
		</button>
	`;
}

function TimelineNumberField({
	label,
	value,
	min = 1,
	max = 9999,
	step = 1,
	onCommit,
}) {
	return html`
		<label class="timeline-field">
			<span>${label}</span>
			<input
				...${INTERACTIVE_FIELD_PROPS}
				type="number"
				min=${min}
				max=${max}
				step=${step}
				value=${value}
				onInput=${(event) => onCommit?.(event.currentTarget.value)}
			/>
		</label>
	`;
}

function TimelineKey({
	frame,
	clip,
	row,
	selected = false,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerCancel,
}) {
	const startFrame = clip.startFrame;
	const durationFrames = Math.max(1, clip.durationFrames);
	const endFrame = startFrame + durationFrames - 1;
	const inRange = frame >= startFrame && frame <= endFrame;
	const classes = ["timeline-key"];
	if (!inRange) {
		classes.push("timeline-key--out");
	}
	if (selected) {
		classes.push("is-selected");
	}
	return html`
		<button
			type="button"
			class=${classes.join(" ")}
			style=${{ left: getTimelineLeftCss(frame, startFrame, endFrame) }}
			aria-pressed=${selected}
			title=${formatFrame(frame)}
			onPointerDown=${(event) => onPointerDown?.(event, row, frame, selected)}
			onPointerMove=${onPointerMove}
			onPointerUp=${onPointerUp}
			onPointerCancel=${onPointerCancel}
		></button>
	`;
}

export function TimelinePanel({ store, controller, t = (key) => key }) {
	const timelinePanelRef = useRef(null);
	const timelineViewportRef = useRef(null);
	const timelineContentRef = useRef(null);
	const timelineScrubbingRef = useRef(false);
	const timelineKeyDragRef = useRef(null);
	const [timelineViewportWidth, setTimelineViewportWidth] = useState(0);
	const [rowFilterMode, setRowFilterMode] = useState(ROW_FILTER_ALL);
	const [rowSearchQuery, setRowSearchQuery] = useState("");
	const [timeScalePercent, setTimeScalePercent] = useState("100");
	const animation = store.animation;
	const clip = animation.activeClip.value;
	const panelOpen = animation.panelOpen.value;
	const startFrame = clip.startFrame;
	const endFrame = startFrame + clip.durationFrames - 1;
	const currentFrame = clampNumber(animation.timelineFrame.value, startFrame);
	const playheadLeft = getTimelineLeftCss(currentFrame, startFrame, endFrame);
	const selectedKeyIds = animation.selectedKeyIds.value ?? [];
	const timelineZoom = Math.min(
		TIMELINE_ZOOM_MAX,
		Math.max(TIMELINE_ZOOM_MIN, clampNumber(animation.zoom.value, 1)),
	);
	const timelineContentWidthPct = Math.max(100, timelineZoom * 100);
	const timelineContentPixelWidth = Math.max(
		0,
		timelineViewportWidth * timelineZoom,
	);
	const rows = useMemo(
		() =>
			buildTimelineRows({
				clip,
				shotCameras: store.workspace.shotCameras.value,
				sceneAssets: store.sceneAssets.value,
				activeShotCameraId: store.workspace.activeShotCameraId.value,
				selectedAssetIds: store.selectedSceneAssetIds.value,
				autoKeyTargetKeys: animation.autoKeyTargetKeys.value,
				t,
			}),
		[
			clip,
			store.workspace.shotCameras.value,
			store.sceneAssets.value,
			store.workspace.activeShotCameraId.value,
			store.selectedSceneAssetIds.value,
			animation.autoKeyTargetKeys.value,
			t,
		],
	);
	const filteredRows = useMemo(
		() =>
			filterTimelineRows({
				rows,
				filterMode: rowFilterMode,
				query: rowSearchQuery,
				activeShotCameraId: store.workspace.activeShotCameraId.value,
				selectedAssetIds: store.selectedSceneAssetIds.value,
			}),
		[
			rows,
			rowFilterMode,
			rowSearchQuery,
			store.workspace.activeShotCameraId.value,
			store.selectedSceneAssetIds.value,
		],
	);
	const ticks = useMemo(
		() =>
			buildTimelineTicks({
				startFrame,
				endFrame,
				contentPixelWidth: timelineContentPixelWidth,
			}),
		[startFrame, endFrame, timelineContentPixelWidth],
	);
	const keyTarget = buildKeyTargetState({ store, t });
	const timelineController = controller?.();
	const hasSelectedKeys =
		selectedKeyIds.length > 0 &&
		timelineController?.hasSelectedTimelineKeys?.() !== false;
	const hasKeyClipboard =
		timelineController?.hasTimelineKeyClipboard?.() === true;
	const selectedInterpolation =
		timelineController?.getSelectedTimelineKeyInterpolation?.() ?? null;
	const currentKeyStatus =
		timelineController?.getCurrentTimelineKeyStatus?.(currentFrame) ?? null;
	const selectedKeyFrameCount =
		timelineController?.getTimelineKeyFrames?.({ selectedOnly: true })
			?.length ?? 0;
	const canScaleSelectedKeys = selectedKeyFrameCount >= 2;

	useEffect(() => {
		const element = timelineViewportRef.current;
		if (!element) {
			return undefined;
		}
		const updateWidth = () => {
			setTimelineViewportWidth(element.clientWidth || 0);
		};
		updateWidth();
		if (typeof ResizeObserver === "undefined") {
			window.addEventListener("resize", updateWidth);
			return () => window.removeEventListener("resize", updateWidth);
		}
		const observer = new ResizeObserver(updateWidth);
		observer.observe(element);
		return () => observer.disconnect();
	}, [panelOpen]);

	const frameFromPointerEvent = (event) => {
		const element = timelineContentRef.current;
		if (!element) {
			return currentFrame;
		}
		const rect = element.getBoundingClientRect();
		const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
		const ratio = rect.width > 0 ? x / rect.width : 0;
		return Math.round(startFrame + ratio * Math.max(0, endFrame - startFrame));
	};

	const focusTimelinePanel = () => {
		timelinePanelRef.current?.focus?.({ preventScroll: true });
	};

	const seekTimelineAtPointer = (event) => {
		event.preventDefault();
		controller()?.setTimelineFrame?.(frameFromPointerEvent(event));
	};

	const autoScrollTimelineForPointer = (event) => {
		const viewport = timelineViewportRef.current;
		if (!viewport || viewport.scrollWidth <= viewport.clientWidth) {
			return;
		}
		const rect = viewport.getBoundingClientRect();
		const edgePx = 42;
		let delta = 0;
		if (event.clientX < rect.left + edgePx) {
			delta = -Math.max(8, Math.round(rect.left + edgePx - event.clientX));
		} else if (event.clientX > rect.right - edgePx) {
			delta = Math.max(8, Math.round(event.clientX - (rect.right - edgePx)));
		}
		if (delta === 0) {
			return;
		}
		viewport.scrollLeft = Math.max(0, viewport.scrollLeft + delta);
	};

	const handleTimelinePointerDown = (event) => {
		if (event.button !== 0) {
			return;
		}
		focusTimelinePanel();
		timelineScrubbingRef.current = true;
		try {
			event.currentTarget.setPointerCapture?.(event.pointerId);
		} catch (_error) {
			// Pointer capture can fail for synthetic test events.
		}
		seekTimelineAtPointer(event);
	};

	const handleTimelineKeyPointerDown = (event, row, frame, selected) => {
		if (event.button !== 0) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		focusTimelinePanel();
		const toggleSelection = event.shiftKey || event.ctrlKey || event.metaKey;
		if (!selected || toggleSelection) {
			controller()?.selectTimelineKeyFrame?.(row.target, frame, {
				additive: toggleSelection,
				toggle: toggleSelection,
			});
		}
		controller()?.setTimelineFrame?.(frame);
		if (toggleSelection && selected) {
			timelineKeyDragRef.current = null;
			return;
		}
		timelineKeyDragRef.current = {
			pointerId: event.pointerId,
			startFrame: frame,
			currentFrame: frame,
			didDrag: false,
		};
		try {
			event.currentTarget.setPointerCapture?.(event.pointerId);
		} catch (_error) {
			// Pointer capture can fail for synthetic test events.
		}
	};

	const handleTimelineKeyPointerMove = (event) => {
		const dragState = timelineKeyDragRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		autoScrollTimelineForPointer(event);
		const nextFrame = frameFromPointerEvent(event);
		if (nextFrame === dragState.currentFrame) {
			return;
		}
		dragState.currentFrame = nextFrame;
		dragState.didDrag = dragState.didDrag || nextFrame !== dragState.startFrame;
		controller()?.setTimelineFrame?.(nextFrame);
	};

	const endTimelineKeyDrag = (event) => {
		const dragState = timelineKeyDragRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		timelineKeyDragRef.current = null;
		try {
			event.currentTarget.releasePointerCapture?.(event.pointerId);
		} catch (_error) {
			// Best-effort release only.
		}
		if (dragState.didDrag) {
			controller()?.moveSelectedTimelineKeysBy?.(
				dragState.currentFrame - dragState.startFrame,
			);
		}
	};

	const handleTimelinePointerMove = (event) => {
		if (!timelineScrubbingRef.current) {
			return;
		}
		autoScrollTimelineForPointer(event);
		seekTimelineAtPointer(event);
	};

	const endTimelineScrub = (event) => {
		timelineScrubbingRef.current = false;
		try {
			event.currentTarget.releasePointerCapture?.(event.pointerId);
		} catch (_error) {
			// Best-effort release only.
		}
	};

	const handleTimelineWheel = (event) => {
		const viewport = timelineViewportRef.current;
		if (!viewport) {
			return;
		}
		if (event.altKey) {
			event.preventDefault();
			const rect = viewport.getBoundingClientRect();
			const pointerX = Math.max(
				0,
				Math.min(rect.width, event.clientX - rect.left),
			);
			const scrollRatio =
				(viewport.scrollLeft + pointerX) / Math.max(1, viewport.scrollWidth);
			const zoomFactor =
				event.deltaY < 0
					? TIMELINE_WHEEL_ZOOM_FACTOR
					: 1 / TIMELINE_WHEEL_ZOOM_FACTOR;
			const nextZoom = controller()?.setTimelineZoom?.(
				timelineZoom * zoomFactor,
			);
			if (Number.isFinite(nextZoom)) {
				requestAnimationFrame(() => {
					viewport.scrollLeft = Math.max(
						0,
						scrollRatio * viewport.scrollWidth - pointerX,
					);
				});
			}
			return;
		}
		if (viewport.scrollWidth <= viewport.clientWidth) {
			return;
		}
		const delta =
			Math.abs(event.deltaX) > Math.abs(event.deltaY)
				? event.deltaX
				: event.deltaY;
		if (Math.abs(delta) <= 0) {
			return;
		}
		event.preventDefault();
		viewport.scrollLeft += delta;
	};

	const applyTimelineKeyScale = () => {
		const factor = Number(timeScalePercent) / 100;
		if (!Number.isFinite(factor) || factor <= 0) {
			setTimeScalePercent("100");
			return false;
		}
		return controller()?.scaleSelectedTimelineKeys?.(factor) === true;
	};

	const handleTimelineKeyDown = (event) => {
		if (isTimelineKeyboardInputTarget(event.target)) {
			return;
		}
		if (
			event.code === "KeyI" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			if (controller()?.insertKeyForSelection?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			event.code === "Comma" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			if (controller()?.jumpTimelineToPreviousKey?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			event.code === "Period" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			if (controller()?.jumpTimelineToNextKey?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			(event.ctrlKey || event.metaKey) &&
			!event.altKey &&
			!event.shiftKey &&
			event.code === "KeyC"
		) {
			if (controller()?.copySelectedTimelineKeys?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			(event.ctrlKey || event.metaKey) &&
			!event.altKey &&
			!event.shiftKey &&
			event.code === "KeyV"
		) {
			if (controller()?.pasteTimelineKeys?.({ frame: currentFrame })) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			(event.code === "Delete" || event.code === "Backspace") &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			if (controller()?.deleteSelectedTimelineKeys?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
			return;
		}
		if (
			event.code === "Escape" &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey
		) {
			if (controller()?.clearTimelineKeySelection?.()) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	};

	if (!panelOpen) {
		return html`
			<div class="timeline-rail">
				<button
					type="button"
					class="timeline-rail__button"
					onClick=${() => controller()?.setTimelinePanelOpen?.(true)}
				>
					<${WorkbenchIcon} name="clock" size=${15} />
					<span>${t("timeline.title")}</span>
				</button>
			</div>
		`;
	}

	return html`
		<section
			ref=${timelinePanelRef}
			class="timeline-panel is-enabled"
			tabIndex="-1"
			onKeyDown=${handleTimelineKeyDown}
			style=${{ "--timeline-panel-height": `${animation.panelHeight.value}px` }}
		>
			<div class="timeline-panel__resize" aria-hidden="true"></div>
			<button
				type="button"
				class="timeline-panel__collapse"
				aria-label=${t("timeline.collapse")}
				title=${t("timeline.collapse")}
				onClick=${() => controller()?.setTimelinePanelOpen?.(false)}
			>
				<${WorkbenchIcon} name="chevron-down" size=${15} />
			</button>
			<div class="timeline-toolbar">
				<${IconButton}
					icon="skip-back"
					label=${t("timeline.start")}
					compact=${true}
					className="timeline-action--start"
					onClick=${() => controller()?.jumpTimelineStart?.()}
				/>
				<${IconButton}
					icon=${animation.isPlaying.value ? "pause" : "play"}
					label=${
						animation.isPlaying.value ? t("timeline.pause") : t("timeline.play")
					}
					active=${animation.isPlaying.value}
					compact=${true}
					className="timeline-action--play"
					onClick=${() =>
						animation.isPlaying.value
							? controller()?.pauseTimeline?.()
							: controller()?.playTimeline?.()}
				/>
				<${IconButton}
					icon="skip-forward"
					label=${t("timeline.end")}
					compact=${true}
					className="timeline-action--end"
					onClick=${() => controller()?.jumpTimelineEnd?.()}
				/>
				<${IconButton}
					icon="chevron-left"
					label=${t("timeline.previousKey")}
					compact=${true}
					className="timeline-action--previous-key"
					onClick=${() => controller()?.jumpTimelineToPreviousKey?.()}
				/>
				<${IconButton}
					icon="chevron-right"
					label=${t("timeline.nextKey")}
					compact=${true}
					className="timeline-action--next-key"
					onClick=${() => controller()?.jumpTimelineToNextKey?.()}
				/>
				<${TimelineNumberField}
					label=${t("timeline.frame")}
					value=${currentFrame}
					min=${startFrame}
					max=${endFrame}
					onCommit=${(value) => controller()?.setTimelineFrame?.(value)}
				/>
				<${TimelineNumberField}
					label=${t("timeline.fps")}
					value=${clip.fps}
					min=${1}
					max=${120}
					onCommit=${(value) => controller()?.setAnimationFps?.(value)}
				/>
				<${TimelineNumberField}
					label=${t("timeline.duration")}
					value=${clip.durationFrames}
					min=${1}
					max=${9999}
					onCommit=${(value) =>
						controller()?.setAnimationDurationFrames?.(value)}
				/>
				<span class="timeline-toolbar__range">${formatFrame(startFrame)} - ${formatFrame(endFrame)}</span>
				<${IconButton}
					icon="zoom-out"
					label=${t("timeline.zoomOut")}
					compact=${true}
					disabled=${timelineZoom <= TIMELINE_ZOOM_MIN}
					className="timeline-action--zoom-out"
					onClick=${() => controller()?.zoomTimelineOut?.()}
				/>
				<span class="timeline-zoom-readout">${Math.round(timelineZoom * 100)}%</span>
				<${IconButton}
					icon="zoom"
					label=${t("timeline.zoomIn")}
					compact=${true}
					disabled=${timelineZoom >= TIMELINE_ZOOM_MAX}
					className="timeline-action--zoom-in"
					onClick=${() => controller()?.zoomTimelineIn?.()}
				/>
				<div class="timeline-key-target">
					<span class="timeline-key-target__label">
						${t("timeline.keyTarget")}
					</span>
					<div class="timeline-key-target__modes">
						<${TimelineKeyTargetButton}
							mode=${KEY_TARGET_CAMERA}
							activeMode=${keyTarget.mode}
							icon="camera"
							label=${t("timeline.keyTargetCamera")}
							title=${`${t("timeline.keyTarget")}: ${keyTarget.cameraLabel}`}
							controller=${controller}
						/>
						<${TimelineKeyTargetButton}
							mode=${KEY_TARGET_OBJECTS}
							activeMode=${keyTarget.mode}
							icon="scene"
							label=${t("timeline.keyTargetSelectedObjects")}
							detail=${
								keyTarget.selectedObjectCount > 0
									? String(keyTarget.selectedObjectCount)
									: ""
							}
							title=${`${t("timeline.keyTarget")}: ${keyTarget.objectTitle}`}
							controller=${controller}
						/>
						<${TimelineKeyTargetButton}
							mode=${KEY_TARGET_BOTH}
							activeMode=${keyTarget.mode}
							icon="keyframe"
							label=${t("timeline.keyTargetBoth")}
							detail=${
								keyTarget.selectedObjectCount > 0
									? String(keyTarget.selectedObjectCount)
									: ""
							}
							title=${`${t("timeline.keyTarget")}: ${keyTarget.cameraLabel} + ${keyTarget.objectTitle}`}
							controller=${controller}
						/>
					</div>
					<span class="timeline-key-target__summary" title=${keyTarget.summary}>
						${keyTarget.summary}
					</span>
				</div>
				<${IconButton}
					icon="keyframe"
					label=${t("timeline.addKey")}
					compact=${true}
					disabled=${keyTarget.addKeyDisabled}
					className="timeline-action--add-key"
					onClick=${() => controller()?.insertKeyForSelection?.()}
				/>
				<${IconButton}
					icon="duplicate"
					label=${t("timeline.copyKeys")}
					compact=${true}
					disabled=${!hasSelectedKeys}
					className="timeline-action--copy-keys"
					onClick=${() => controller()?.copySelectedTimelineKeys?.()}
				/>
				<${IconButton}
					icon="paste"
					label=${t("timeline.pasteKeys")}
					compact=${true}
					disabled=${!hasKeyClipboard}
					className="timeline-action--paste-keys"
					onClick=${() =>
						controller()?.pasteTimelineKeys?.({ frame: currentFrame })}
				/>
				<${IconButton}
					icon="trash"
					label=${t("timeline.deleteKeys")}
					compact=${true}
					disabled=${!hasSelectedKeys}
					className="timeline-action--delete-keys"
					onClick=${() => controller()?.deleteSelectedTimelineKeys?.()}
				/>
				<div class="timeline-key-status">
					<span
						class=${
							currentKeyStatus?.hasKey
								? "timeline-key-status__dot is-keyed"
								: "timeline-key-status__dot"
						}
						aria-hidden="true"
					></span>
					<span>
						${
							currentKeyStatus?.hasKey
								? t("timeline.currentFrameKeyed")
								: t("timeline.currentFrameNoKey")
						}
					</span>
				</div>
				<div class="timeline-key-interpolation">
					<span class="timeline-key-interpolation__label">
						${t("timeline.interpolation")}
					</span>
					<div class="timeline-segmented">
						<${TimelineSegmentButton}
							value="linear"
							activeValue=${selectedInterpolation}
							label=${t("timeline.interpolationLinear")}
							disabled=${!hasSelectedKeys}
							onClick=${(value) =>
								controller()?.setSelectedTimelineKeyInterpolation?.(value)}
						/>
						<${TimelineSegmentButton}
							value="hold"
							activeValue=${selectedInterpolation}
							label=${t("timeline.interpolationHold")}
							disabled=${!hasSelectedKeys}
							onClick=${(value) =>
								controller()?.setSelectedTimelineKeyInterpolation?.(value)}
						/>
					</div>
				</div>
				<label class="timeline-field timeline-field--scale">
					<span>${t("timeline.keyScale")}</span>
					<input
						...${INTERACTIVE_FIELD_PROPS}
						type="number"
						min=${10}
						max=${400}
						step=${5}
						value=${timeScalePercent}
						disabled=${!canScaleSelectedKeys}
						onInput=${(event) => setTimeScalePercent(event.currentTarget.value)}
						onKeyDown=${(event) => {
							if (event.key === "Enter") {
								applyTimelineKeyScale();
							}
						}}
					/>
				</label>
				<button
					type="button"
					class="timeline-apply-button timeline-action--scale-keys"
					disabled=${!canScaleSelectedKeys}
					onClick=${applyTimelineKeyScale}
				>
					${t("timeline.applyKeyScale")}
				</button>
				<div class="timeline-row-filter">
					<div class="timeline-segmented timeline-segmented--filter">
						<${TimelineSegmentButton}
							value=${ROW_FILTER_ALL}
							activeValue=${rowFilterMode}
							label=${t("timeline.filterAll")}
							onClick=${setRowFilterMode}
						/>
						<${TimelineSegmentButton}
							value=${ROW_FILTER_KEYED}
							activeValue=${rowFilterMode}
							label=${t("timeline.filterKeyed")}
							onClick=${setRowFilterMode}
						/>
						<${TimelineSegmentButton}
							value=${ROW_FILTER_FOCUS}
							activeValue=${rowFilterMode}
							label=${t("timeline.filterFocus")}
							onClick=${setRowFilterMode}
						/>
						<${TimelineSegmentButton}
							value=${ROW_FILTER_AUTOKEY}
							activeValue=${rowFilterMode}
							label=${t("timeline.filterAuto")}
							onClick=${setRowFilterMode}
						/>
					</div>
					<input
						...${INTERACTIVE_FIELD_PROPS}
						class="timeline-row-filter__search"
						type="search"
						value=${rowSearchQuery}
						placeholder=${t("timeline.filterSearch")}
						onInput=${(event) => setRowSearchQuery(event.currentTarget.value)}
					/>
				</div>
			</div>
			<div class="timeline-body">
				<div class="timeline-track-list">
					<div class="timeline-track-list__header">
						<span>${t("timeline.tracks")}</span>
						<span class="timeline-track-list__count">
							${filteredRows.length}/${rows.length}
						</span>
					</div>
					${
						filteredRows.length === 0
							? html`<div class="timeline-empty">${t("timeline.noKeys")}</div>`
							: filteredRows.map(
									(row) => html`
										<div
											key=${row.id}
											class=${
												row.autoKey
													? "timeline-track-row is-autokey"
													: row.candidate
														? "timeline-track-row is-candidate"
														: "timeline-track-row"
											}
										>
											<button
												type="button"
												class=${
													row.autoKey
														? "timeline-track-row__autokey is-active"
														: "timeline-track-row__autokey"
												}
												aria-pressed=${row.autoKey}
												title=${`${t("timeline.autoKey")}: ${row.label}`}
												onClick=${(event) => {
													event.stopPropagation();
													controller()?.toggleAutoKeyForTarget?.(row.target);
												}}
											>
												${
													row.autoKey
														? html`<span
																class="timeline-track-row__autokey-diamond"
																aria-hidden="true"
															></span>`
														: html`<${WorkbenchIcon} name="keyframe" size=${12} />`
												}
											</button>
											<${WorkbenchIcon}
												name=${row.icon}
												size=${13}
											/>
											<span class="timeline-track-row__label">${row.label}</span>
											<span class="timeline-track-row__type">
												${row.typeLabel}
											</span>
										</div>
									`,
								)
					}
				</div>
				<div
					ref=${timelineViewportRef}
					class="timeline-dopesheet"
					onWheel=${handleTimelineWheel}
				>
					<div
						ref=${timelineContentRef}
						class="timeline-dopesheet__content"
						style=${{ width: `${timelineContentWidthPct}%` }}
						onPointerDown=${handleTimelinePointerDown}
						onPointerMove=${handleTimelinePointerMove}
						onPointerUp=${endTimelineScrub}
						onPointerCancel=${endTimelineScrub}
						onPointerLeave=${handleTimelinePointerMove}
					>
						<div class="timeline-ruler">
							${ticks.map(
								(frame) => html`
									<span
										key=${`tick-label:${frame}`}
										class="timeline-ruler__tick"
										style=${{
											left: getTimelineLeftCss(frame, startFrame, endFrame),
										}}
									>
										${formatFrame(frame)}
									</span>
								`,
							)}
						</div>
						${ticks.map(
							(frame) => html`
								<span
									key=${`tick-grid:${frame}`}
									class="timeline-grid-line"
									style=${{
										left: getTimelineLeftCss(frame, startFrame, endFrame),
									}}
								></span>
							`,
						)}
						<div
							class="timeline-playhead"
							style=${{ left: playheadLeft }}
						></div>
						${
							filteredRows.length === 0
								? html`<div class="timeline-dopesheet__empty"></div>`
								: filteredRows.map(
										(row) => html`
											<div key=${row.id} class="timeline-dopesheet-row">
												${row.keyFrames.map(
													(frame) =>
														html`<${TimelineKey}
															key=${`${row.id}:${frame}`}
															frame=${frame}
															clip=${clip}
															row=${row}
															selected=${isTimelineKeyFrameSelected(
																row,
																frame,
																selectedKeyIds,
															)}
															onPointerDown=${handleTimelineKeyPointerDown}
															onPointerMove=${handleTimelineKeyPointerMove}
															onPointerUp=${endTimelineKeyDrag}
															onPointerCancel=${endTimelineKeyDrag}
														/>`,
												)}
											</div>
										`,
									)
						}
					</div>
				</div>
			</div>
		</section>
	`;
}
