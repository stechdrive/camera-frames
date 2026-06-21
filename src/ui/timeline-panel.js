import { html } from "htm/preact";
import { useMemo, useRef } from "preact/hooks";
import { INTERACTIVE_FIELD_PROPS } from "./workbench-controls.js";
import { IconButton } from "./workbench-primitives.js";
import { WorkbenchIcon } from "./workbench-icons.js";

const TIMELINE_ZOOM_MIN = 1;
const TIMELINE_ZOOM_MAX = 8;
const KEY_TARGET_CAMERA = "camera";
const KEY_TARGET_OBJECTS = "objects";
const KEY_TARGET_BOTH = "both";

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

function buildTimelineTicks({ startFrame, endFrame, zoom }) {
	const durationFrames = Math.max(1, endFrame - startFrame + 1);
	const targetTickCount = Math.max(4, Math.round(6 * Math.max(1, zoom)));
	const step = pickNiceFrameStep(durationFrames / targetTickCount);
	const ticks = new Set([startFrame, endFrame]);
	const firstTick = Math.ceil(startFrame / step) * step;
	for (let frame = firstTick; frame <= endFrame; frame += step) {
		if (frame >= startFrame) {
			ticks.add(frame);
		}
	}
	return [...ticks].sort((left, right) => left - right);
}

function buildTargetLabel(binding, shotCameras, sceneAssets) {
	if (binding.target.kind === "shot-camera") {
		return (
			shotCameras.find((camera) => camera.id === binding.target.id)?.name ??
			(binding.labelCache || binding.target.id)
		);
	}
	return (
		sceneAssets.find((asset) => String(asset.id) === String(binding.target.id))
			?.label ??
		(binding.labelCache || binding.target.id)
	);
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

function buildTimelineRows(clip, shotCameras, sceneAssets) {
	return (clip.bindings ?? []).map((binding) => ({
		id: binding.id,
		label: buildTargetLabel(binding, shotCameras, sceneAssets),
		kind: binding.target.kind,
		keyFrames: collectBindingKeyFrames(binding),
	}));
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

function TimelineKey({ frame, clip }) {
	const startFrame = clip.startFrame;
	const durationFrames = Math.max(1, clip.durationFrames);
	const endFrame = startFrame + durationFrames - 1;
	const inRange = frame >= startFrame && frame <= endFrame;
	return html`
		<span
			class=${inRange ? "timeline-key" : "timeline-key timeline-key--out"}
			style=${{ left: getTimelineLeftCss(frame, startFrame, endFrame) }}
			title=${formatFrame(frame)}
		></span>
	`;
}

export function TimelinePanel({ store, controller, t = (key) => key }) {
	const timelineContentRef = useRef(null);
	const timelineScrubbingRef = useRef(false);
	const animation = store.animation;
	const documentState = animation.document.value;
	const clip = animation.activeClip.value;
	const enabled = documentState.enabled;
	const panelOpen = animation.panelOpen.value;
	const startFrame = clip.startFrame;
	const endFrame = startFrame + clip.durationFrames - 1;
	const currentFrame = clampNumber(animation.timelineFrame.value, startFrame);
	const playheadLeft = getTimelineLeftCss(currentFrame, startFrame, endFrame);
	const timelineZoom = Math.min(
		TIMELINE_ZOOM_MAX,
		Math.max(TIMELINE_ZOOM_MIN, clampNumber(animation.zoom.value, 1)),
	);
	const timelineContentWidthPct = Math.max(100, timelineZoom * 100);
	const rows = useMemo(
		() =>
			buildTimelineRows(
				clip,
				store.workspace.shotCameras.value,
				store.sceneAssets.value,
			),
		[clip, store.workspace.shotCameras.value, store.sceneAssets.value],
	);
	const ticks = useMemo(
		() => buildTimelineTicks({ startFrame, endFrame, zoom: timelineZoom }),
		[startFrame, endFrame, timelineZoom],
	);
	const keyTarget = buildKeyTargetState({ store, t });

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

	const seekTimelineAtPointer = (event) => {
		event.preventDefault();
		controller()?.setTimelineFrame?.(frameFromPointerEvent(event));
	};

	const handleTimelinePointerDown = (event) => {
		if (event.button !== 0) {
			return;
		}
		timelineScrubbingRef.current = true;
		try {
			event.currentTarget.setPointerCapture?.(event.pointerId);
		} catch (_error) {
			// Pointer capture can fail for synthetic test events.
		}
		seekTimelineAtPointer(event);
	};

	const handleTimelinePointerMove = (event) => {
		if (!timelineScrubbingRef.current) {
			return;
		}
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
			class=${enabled ? "timeline-panel is-enabled" : "timeline-panel"}
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
				<button
					type="button"
					class=${enabled ? "timeline-toggle is-active" : "timeline-toggle"}
					aria-pressed=${enabled}
					onClick=${() => controller()?.toggleAnimationEnabled?.()}
				>
					<${WorkbenchIcon} name="play" size=${14} />
					<span>${t("timeline.animation")}</span>
					<span class="timeline-toggle__state">
						${enabled ? t("timeline.enabled") : t("timeline.disabled")}
					</span>
				</button>
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
					disabled=${!enabled}
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
				<button
					type="button"
					class=${animation.autoKey.value ? "timeline-chip is-active" : "timeline-chip"}
					onClick=${() =>
						controller()?.setAnimationAutoKey?.(!animation.autoKey.value)}
				>
					<${WorkbenchIcon} name="keyframe" size=${13} />
					<span>${t("timeline.autoKey")}</span>
				</button>
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
					disabled=${!enabled || keyTarget.addKeyDisabled}
					className="timeline-action--add-key"
					onClick=${() => controller()?.insertKeyForSelection?.()}
				/>
			</div>
			<div class="timeline-body">
				<div class="timeline-track-list">
					<div class="timeline-track-list__header">${t("timeline.tracks")}</div>
					${
						rows.length === 0
							? html`<div class="timeline-empty">${t("timeline.noKeys")}</div>`
							: rows.map(
									(row) => html`
										<div key=${row.id} class="timeline-track-row">
											<${WorkbenchIcon}
												name=${row.kind === "shot-camera" ? "camera" : "scene"}
												size=${13}
											/>
											<span>${row.label}</span>
										</div>
									`,
								)
					}
				</div>
				<div class="timeline-dopesheet">
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
							rows.length === 0
								? html`<div class="timeline-dopesheet__empty"></div>`
								: rows.map(
										(row) => html`
											<div key=${row.id} class="timeline-dopesheet-row">
												${row.keyFrames.map(
													(frame) =>
														html`<${TimelineKey}
															key=${`${row.id}:${frame}`}
															frame=${frame}
															clip=${clip}
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
