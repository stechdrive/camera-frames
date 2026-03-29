import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
	clampStandardFrameHorizontalEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm,
	snapStandardFrameHorizontalEquivalentMm,
} from "../engine/camera-lens.js";
import { WorkbenchIcon } from "./workbench-icons.js";

export function stopUiEvent(event) {
	event.stopPropagation();
}

export function stopUiWheelEvent(event) {
	event.preventDefault();
	event.stopPropagation();
}

export function isHistoryShortcutEvent(event) {
	const hasHistoryModifier = event.ctrlKey || event.metaKey;
	return hasHistoryModifier && (event.code === "KeyZ" || event.code === "KeyY");
}

function stopUiEventUnlessHistoryShortcut(event) {
	if (isHistoryShortcutEvent(event)) {
		return;
	}
	stopUiEvent(event);
}

export const INTERACTIVE_FIELD_PROPS = {
	onPointerDown: stopUiEvent,
	onClick: stopUiEvent,
	onWheel: stopUiWheelEvent,
	onKeyDown: stopUiEventUnlessHistoryShortcut,
};

export const DEFAULT_NUMERIC_SCRUB_MODIFIERS = Object.freeze({
	normal: 1,
	shift: 0.25,
	alt: 0.1,
	altShift: 0.025,
});
const NUMERIC_SCRUB_EDGE_MARGIN_PX = 12;
const NUMERIC_SCRUB_EDGE_SLOW_ZONE_PX = 84;
const NUMERIC_SCRUB_EDGE_SLOW_MIN_FACTOR = 0.55;
const NUMERIC_SCRUB_EDGE_HOLD_DELAY_MS = 90;
const NUMERIC_SCRUB_EDGE_HOLD_RATE_PX_PER_FRAME = 1.0;

export function NumericUnitLabel({ value, title = "" }) {
	return html`
		<span class="numeric-unit__label" aria-label=${title || value}>${value}</span>
	`;
}

const LIGHT_DIRECTION_WIDGET_SIZE = 132;
const LIGHT_DIRECTION_WIDGET_RADIUS = 46;
const LIGHT_DIRECTION_WIDGET_CENTER = LIGHT_DIRECTION_WIDGET_SIZE / 2;
const LIGHT_DIRECTION_EQUATOR_RY = 16;
const LIGHT_DIRECTION_WIDGET_DEGREES_PER_PIXEL =
	90 / LIGHT_DIRECTION_WIDGET_RADIUS;

function resolveNumericScrubModifiers(overrides = null) {
	return {
		...DEFAULT_NUMERIC_SCRUB_MODIFIERS,
		...(overrides ?? {}),
	};
}

function normalizeDegrees(value) {
	const numericValue = Number(value);
	if (!Number.isFinite(numericValue)) {
		return 0;
	}
	const wrapped = ((((numericValue + 180) % 360) + 360) % 360) - 180;
	return wrapped === -180 ? 180 : wrapped;
}

function clampUnit(value) {
	return Math.max(-1, Math.min(1, value));
}

function getLightDirectionVector(relativeAzimuthDeg, elevationDeg) {
	const azimuthRad = (Number(relativeAzimuthDeg) * Math.PI) / 180;
	const elevationRad = (Number(elevationDeg) * Math.PI) / 180;
	const cosElevation = Math.cos(elevationRad);
	return {
		x: Math.sin(azimuthRad) * cosElevation,
		y: Math.sin(elevationRad),
		z: Math.cos(azimuthRad) * cosElevation,
	};
}

function normalizeVector3(vector) {
	const length = Math.hypot(vector.x, vector.y, vector.z);
	if (!Number.isFinite(length) || length <= 1e-8) {
		return { x: 0, y: 0, z: 1 };
	}
	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length,
	};
}

function rotateVectorAroundYAxis(vector, degrees) {
	const radians = (degrees * Math.PI) / 180;
	const cosAngle = Math.cos(radians);
	const sinAngle = Math.sin(radians);
	return {
		x: vector.x * cosAngle + vector.z * sinAngle,
		y: vector.y,
		z: -vector.x * sinAngle + vector.z * cosAngle,
	};
}

function rotateVectorAroundXAxis(vector, degrees) {
	const radians = (degrees * Math.PI) / 180;
	const cosAngle = Math.cos(radians);
	const sinAngle = Math.sin(radians);
	return {
		x: vector.x,
		y: vector.y * cosAngle - vector.z * sinAngle,
		z: vector.y * sinAngle + vector.z * cosAngle,
	};
}

function getLightDirectionAnglesFromVector(vector) {
	const normalized = normalizeVector3(vector);
	return {
		azimuthDeg: normalizeDegrees(
			(Math.atan2(normalized.x, normalized.z) * 180) / Math.PI,
		),
		elevationDeg: (Math.asin(clampUnit(normalized.y)) * 180) / Math.PI,
	};
}

function getLightingDirectionWidgetPosition(
	azimuthDeg,
	elevationDeg,
	viewAzimuthDeg,
) {
	const relativeAzimuthRad =
		(normalizeDegrees(azimuthDeg - viewAzimuthDeg) * Math.PI) / 180;
	const elevationRad = (Number(elevationDeg) * Math.PI) / 180;
	const cosElevation = Math.cos(elevationRad);
	return {
		x:
			LIGHT_DIRECTION_WIDGET_CENTER +
			Math.sin(relativeAzimuthRad) *
				cosElevation *
				LIGHT_DIRECTION_WIDGET_RADIUS,
		y:
			LIGHT_DIRECTION_WIDGET_CENTER -
			Math.sin(elevationRad) * LIGHT_DIRECTION_WIDGET_RADIUS,
		isFrontHemisphere: Math.cos(relativeAzimuthRad) * cosElevation >= 0,
		relativeAzimuthDeg: normalizeDegrees(azimuthDeg - viewAzimuthDeg),
	};
}

function advanceLightingDirectionByPointerDelta(
	relativeAzimuthDeg,
	elevationDeg,
	deltaX,
	deltaY,
) {
	const yawedVector = rotateVectorAroundYAxis(
		getLightDirectionVector(relativeAzimuthDeg, elevationDeg),
		deltaX * LIGHT_DIRECTION_WIDGET_DEGREES_PER_PIXEL,
	);
	const pitchedVector = rotateVectorAroundXAxis(
		yawedVector,
		deltaY * LIGHT_DIRECTION_WIDGET_DEGREES_PER_PIXEL,
	);
	return getLightDirectionAnglesFromVector(pitchedVector);
}

export function NumericDraftInput({
	value,
	inputMode = "decimal",
	onCommit,
	onScrubDelta = null,
	onScrubStart = null,
	controller = null,
	historyLabel = "",
	scrubModifiers = null,
	scrubHandleSide = "auto",
	scrubStartValue = null,
	...props
}) {
	const formattedValue = String(value);
	const [draftValue, setDraftValue] = useState(formattedValue);
	const [isEditing, setIsEditing] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const [resolvedHandleSide, setResolvedHandleSide] = useState(
		scrubHandleSide === "start" ? "start" : "end",
	);
	const scrubStateRef = useRef(null);
	const inputRef = useRef(null);
	const resolvedScrubModifiers = resolveNumericScrubModifiers(scrubModifiers);

	useEffect(() => {
		if (!isEditing && !isScrubbing) {
			setDraftValue(formattedValue);
		}
	}, [formattedValue, isEditing, isScrubbing]);

	useEffect(() => {
		if (scrubHandleSide !== "auto") {
			setResolvedHandleSide(scrubHandleSide === "start" ? "start" : "end");
			return;
		}

		if (!inputRef.current) {
			return;
		}

		const nextTextAlign = globalThis
			.getComputedStyle(inputRef.current)
			.getPropertyValue("text-align")
			.trim()
			.toLowerCase();
		const nextSide =
			nextTextAlign === "right" || nextTextAlign === "end" ? "start" : "end";
		setResolvedHandleSide((currentSide) =>
			currentSide === nextSide ? currentSide : nextSide,
		);
	}, [scrubHandleSide]);

	function resetDraft() {
		setDraftValue(formattedValue);
		setIsEditing(false);
	}

	function focusAndSelectInput() {
		requestAnimationFrame(() => {
			inputRef.current?.focus?.({ preventScroll: true });
			inputRef.current?.select?.();
		});
	}

	function commitDraft(nextRawValue) {
		const nextValue = String(nextRawValue ?? "").trim();
		if (nextValue === "") {
			resetDraft();
			return;
		}
		onCommit?.(nextValue);
		setIsEditing(false);
	}

	function parseNumber(valueToParse) {
		const nextValue = Number(valueToParse);
		return Number.isFinite(nextValue) ? nextValue : null;
	}

	function clampValue(nextValue) {
		let clamped = nextValue;
		const min = parseNumber(props.min);
		const max = parseNumber(props.max);
		if (min !== null) {
			clamped = Math.max(min, clamped);
		}
		if (max !== null) {
			clamped = Math.min(max, clamped);
		}
		return clamped;
	}

	function getScrubMultiplier(event) {
		if (event.altKey && event.shiftKey) {
			return resolvedScrubModifiers.altShift;
		}
		if (event.altKey) {
			return resolvedScrubModifiers.alt;
		}
		if (event.shiftKey) {
			return resolvedScrubModifiers.shift;
		}
		return resolvedScrubModifiers.normal;
	}

	function getStepValue() {
		const step = Number(props.step);
		return Number.isFinite(step) && step > 0 ? step : 1;
	}

	function getViewportClientWidth() {
		const width = Number(globalThis.innerWidth);
		return Number.isFinite(width) && width > 0 ? width : null;
	}

	function getEdgeApproachFactor(currentClientX, viewportWidth, deltaPixels) {
		if (viewportWidth === null || Math.abs(deltaPixels) <= 0) {
			return 1;
		}

		let distanceToEdge = null;
		if (deltaPixels < 0) {
			distanceToEdge = currentClientX;
		} else if (deltaPixels > 0) {
			distanceToEdge = viewportWidth - currentClientX;
		}

		if (
			distanceToEdge === null ||
			distanceToEdge >= NUMERIC_SCRUB_EDGE_SLOW_ZONE_PX
		) {
			return 1;
		}

		const normalizedDistance = Math.max(
			0,
			Math.min(1, distanceToEdge / NUMERIC_SCRUB_EDGE_SLOW_ZONE_PX),
		);
		const easedDistance = normalizedDistance * normalizedDistance;
		return (
			NUMERIC_SCRUB_EDGE_SLOW_MIN_FACTOR +
			(1 - NUMERIC_SCRUB_EDGE_SLOW_MIN_FACTOR) * easedDistance
		);
	}

	function finishScrub(mode = "commit") {
		const scrubState = scrubStateRef.current;
		if (!scrubState) {
			return;
		}

		if (scrubState.edgeHoldFrameId) {
			globalThis.cancelAnimationFrame(scrubState.edgeHoldFrameId);
			scrubState.edgeHoldFrameId = 0;
		}

		scrubState.handle.removeEventListener("pointermove", scrubState.onMove);
		scrubState.handle.removeEventListener("pointerup", scrubState.onUp);
		scrubState.handle.removeEventListener("pointercancel", scrubState.onCancel);
		scrubState.handle.releasePointerCapture?.(scrubState.pointerId);
		scrubStateRef.current = null;
		setIsScrubbing(false);
		if (mode === "cancel") {
			controller?.()?.cancelHistoryTransaction?.();
			return;
		}
		controller?.()?.commitHistoryTransaction?.(historyLabel);
	}

	function beginScrub(event) {
		stopUiEvent(event);
		event.preventDefault();

		const startValue =
			scrubStartValue !== null && scrubStartValue !== undefined
				? parseNumber(scrubStartValue)
				: parseNumber(formattedValue);
		if (startValue === null) {
			return;
		}

		onScrubStart?.();
		controller?.()?.beginHistoryTransaction?.(historyLabel);
		setIsEditing(false);
		setIsScrubbing(true);
		const handle = event.currentTarget;
		handle.setPointerCapture?.(event.pointerId);
		const scrubState = {
			pointerId: event.pointerId,
			handle,
			lastClientX: event.clientX,
			appliedValue: startValue,
			edgeHoldDirection: 0,
			edgeHoldMultiplier: 1,
			edgeHoldEngagedAt: 0,
			edgeHoldLastTimestamp: 0,
			edgeHoldFrameId: 0,
			onMove: null,
			onUp: null,
			onCancel: null,
		};

		const applyNumericDelta = (deltaValue) => {
			if (!Number.isFinite(deltaValue) || Math.abs(deltaValue) <= 1e-8) {
				return;
			}
			const nextValue = clampValue(scrubState.appliedValue + deltaValue);
			const nextDraftValue = String(nextValue);
			const appliedDeltaValue = nextValue - scrubState.appliedValue;
			if (
				!Number.isFinite(appliedDeltaValue) ||
				Math.abs(appliedDeltaValue) <= 1e-8
			) {
				return;
			}
			scrubState.appliedValue = nextValue;
			setDraftValue(nextDraftValue);
			if (onScrubDelta) {
				onScrubDelta(appliedDeltaValue, nextValue);
			} else {
				onCommit?.(nextDraftValue);
			}
		};

		const stopEdgeHold = () => {
			if (scrubState.edgeHoldFrameId) {
				globalThis.cancelAnimationFrame(scrubState.edgeHoldFrameId);
			}
			scrubState.edgeHoldDirection = 0;
			scrubState.edgeHoldFrameId = 0;
			scrubState.edgeHoldEngagedAt = 0;
			scrubState.edgeHoldLastTimestamp = 0;
		};

		const runEdgeHold = (timestamp) => {
			if (
				scrubStateRef.current !== scrubState ||
				!scrubState.edgeHoldDirection
			) {
				scrubState.edgeHoldFrameId = 0;
				return;
			}
			if (!scrubState.edgeHoldEngagedAt) {
				scrubState.edgeHoldEngagedAt = timestamp;
			}
			if (!scrubState.edgeHoldLastTimestamp) {
				scrubState.edgeHoldLastTimestamp = timestamp;
			}

			const elapsedMs = timestamp - scrubState.edgeHoldLastTimestamp;
			scrubState.edgeHoldLastTimestamp = timestamp;
			if (
				timestamp - scrubState.edgeHoldEngagedAt >=
				NUMERIC_SCRUB_EDGE_HOLD_DELAY_MS
			) {
				const frameScale = elapsedMs / 16.6667;
				const deltaPixels =
					scrubState.edgeHoldDirection *
					NUMERIC_SCRUB_EDGE_HOLD_RATE_PX_PER_FRAME *
					frameScale;
				applyNumericDelta(
					deltaPixels * getStepValue() * scrubState.edgeHoldMultiplier,
				);
			}

			scrubState.edgeHoldFrameId =
				globalThis.requestAnimationFrame(runEdgeHold);
		};

		const ensureEdgeHold = (direction, multiplier) => {
			if (
				scrubState.edgeHoldDirection === direction &&
				Math.abs(scrubState.edgeHoldMultiplier - multiplier) <= 1e-8 &&
				scrubState.edgeHoldFrameId
			) {
				return;
			}
			stopEdgeHold();
			scrubState.edgeHoldDirection = direction;
			scrubState.edgeHoldMultiplier = multiplier;
			scrubState.edgeHoldFrameId =
				globalThis.requestAnimationFrame(runEdgeHold);
		};

		const onMove = (moveEvent) => {
			if (moveEvent.pointerId !== scrubState.pointerId) {
				return;
			}
			stopUiEvent(moveEvent);
			moveEvent.preventDefault();
			const currentClientX = moveEvent.clientX;
			const deltaPixels = currentClientX - scrubState.lastClientX;
			const viewportWidth = getViewportClientWidth();
			const hitLeftEdge = currentClientX <= NUMERIC_SCRUB_EDGE_MARGIN_PX;
			const hitRightEdge =
				viewportWidth !== null &&
				currentClientX >= viewportWidth - NUMERIC_SCRUB_EDGE_MARGIN_PX;

			if (Math.abs(deltaPixels) <= 0) {
				return;
			}

			const scrubMultiplier = getScrubMultiplier(moveEvent);
			const approachFactor = getEdgeApproachFactor(
				currentClientX,
				viewportWidth,
				deltaPixels,
			);
			scrubState.lastClientX = currentClientX;
			applyNumericDelta(
				deltaPixels * getStepValue() * scrubMultiplier * approachFactor,
			);

			if (deltaPixels < 0 && hitLeftEdge) {
				ensureEdgeHold(-1, scrubMultiplier * approachFactor);
			} else if (deltaPixels > 0 && hitRightEdge) {
				ensureEdgeHold(1, scrubMultiplier * approachFactor);
			} else {
				stopEdgeHold();
			}
		};

		const onUp = (upEvent) => {
			if (upEvent.pointerId !== event.pointerId) {
				return;
			}
			stopUiEvent(upEvent);
			upEvent.preventDefault();
			finishScrub("commit");
		};

		const onCancel = (cancelEvent) => {
			if (cancelEvent.pointerId !== event.pointerId) {
				return;
			}
			stopUiEvent(cancelEvent);
			cancelEvent.preventDefault();
			finishScrub("cancel");
		};

		scrubState.onMove = onMove;
		scrubState.onUp = onUp;
		scrubState.onCancel = onCancel;
		scrubStateRef.current = scrubState;
		handle.addEventListener("pointermove", onMove);
		handle.addEventListener("pointerup", onUp);
		handle.addEventListener("pointercancel", onCancel);
	}

	return html`
		<div
			class=${
				isScrubbing
					? `numeric-scrub numeric-scrub--handle-${resolvedHandleSide} is-scrubbing`
					: `numeric-scrub numeric-scrub--handle-${resolvedHandleSide}`
			}
			data-history-scope="app"
		>
			<input
				ref=${inputRef}
				...${props}
				type="text"
				inputMode=${inputMode}
				spellcheck="false"
				autocomplete="off"
				data-draft-editing=${isEditing ? "true" : "false"}
				value=${isEditing ? draftValue : formattedValue}
				onFocus=${(event) => {
					stopUiEvent(event);
					setIsEditing(true);
					setDraftValue(String(event.currentTarget.value ?? formattedValue));
				}}
				onInput=${(event) => {
					stopUiEvent(event);
					setIsEditing(true);
					setDraftValue(event.currentTarget.value);
				}}
				onBlur=${(event) => {
					commitDraft(event.currentTarget.value);
				}}
				onChange=${stopUiEvent}
				onPointerDown=${(event) => {
					stopUiEvent(event);
					event.preventDefault();
					setIsEditing(true);
					setDraftValue(String(inputRef.current?.value ?? formattedValue));
					focusAndSelectInput();
				}}
				onClick=${stopUiEvent}
				onWheel=${stopUiWheelEvent}
				onKeyDown=${(event) => {
					if (isHistoryShortcutEvent(event)) {
						return;
					}
					stopUiEvent(event);
					if (event.key === "Enter") {
						event.preventDefault();
						commitDraft(event.currentTarget.value);
						event.currentTarget.blur();
						return;
					}
					if (event.key === "Escape") {
						event.preventDefault();
						resetDraft();
						event.currentTarget.blur();
					}
				}}
			/>
			<button
				type="button"
				class="numeric-scrub__handle"
				tabIndex="-1"
				aria-hidden="true"
				onPointerDown=${beginScrub}
				onClick=${(event) => {
					stopUiEvent(event);
					event.preventDefault();
				}}
			>
				<${WorkbenchIcon} name="scrub" size=${13} />
			</button>
		</div>
	`;
}

export function DirectionalScrubControl({
	controller = null,
	historyLabel = "",
	ariaLabel = "",
	step = 0.02,
	scrubModifiers = null,
	onDelta,
}) {
	const [isScrubbing, setIsScrubbing] = useState(false);
	const scrubStateRef = useRef(null);
	const resolvedScrubModifiers = resolveNumericScrubModifiers(scrubModifiers);

	function getScrubMultiplier(event) {
		if (event.altKey && event.shiftKey) {
			return resolvedScrubModifiers.altShift;
		}
		if (event.altKey) {
			return resolvedScrubModifiers.alt;
		}
		if (event.shiftKey) {
			return resolvedScrubModifiers.shift;
		}
		return resolvedScrubModifiers.normal;
	}

	function getStepValue() {
		const numericStep = Number(step);
		return Number.isFinite(numericStep) && numericStep > 0 ? numericStep : 0.02;
	}

	function finishScrub(mode = "commit") {
		const scrubState = scrubStateRef.current;
		if (!scrubState) {
			return;
		}

		scrubState.surface.removeEventListener("pointermove", scrubState.onMove);
		scrubState.surface.removeEventListener("pointerup", scrubState.onUp);
		scrubState.surface.removeEventListener(
			"pointercancel",
			scrubState.onCancel,
		);
		scrubState.surface.releasePointerCapture?.(scrubState.pointerId);
		scrubState.surface.style.setProperty("--directional-scrub-offset", "0px");
		scrubStateRef.current = null;
		setIsScrubbing(false);
		if (mode === "cancel") {
			controller?.()?.cancelHistoryTransaction?.();
			return;
		}
		controller?.()?.commitHistoryTransaction?.(historyLabel);
	}

	function beginScrub(event) {
		stopUiEvent(event);
		event.preventDefault();

		controller?.()?.beginHistoryTransaction?.(historyLabel);
		setIsScrubbing(true);
		const surface = event.currentTarget;
		surface.setPointerCapture?.(event.pointerId);
		const scrubState = {
			pointerId: event.pointerId,
			surface,
			startClientX: event.clientX,
			appliedDistance: 0,
			onMove: null,
			onUp: null,
			onCancel: null,
		};

		const onMove = (moveEvent) => {
			if (moveEvent.pointerId !== scrubState.pointerId) {
				return;
			}
			stopUiEvent(moveEvent);
			moveEvent.preventDefault();
			const thumbTravelMax = Math.max(
				10,
				Math.min(20, (scrubState.surface.clientWidth - 34) * 0.5),
			);
			const thumbOffsetPixels = Math.max(
				-thumbTravelMax,
				Math.min(thumbTravelMax, moveEvent.clientX - scrubState.startClientX),
			);
			scrubState.surface.style.setProperty(
				"--directional-scrub-offset",
				`${thumbOffsetPixels}px`,
			);
			const nextDistance =
				(moveEvent.clientX - scrubState.startClientX) *
				getStepValue() *
				getScrubMultiplier(moveEvent);
			const deltaDistance = nextDistance - scrubState.appliedDistance;
			if (!Number.isFinite(deltaDistance) || Math.abs(deltaDistance) <= 1e-8) {
				return;
			}
			scrubState.appliedDistance = nextDistance;
			onDelta?.(deltaDistance);
		};

		const onUp = (upEvent) => {
			if (upEvent.pointerId !== scrubState.pointerId) {
				return;
			}
			stopUiEvent(upEvent);
			upEvent.preventDefault();
			finishScrub("commit");
		};

		const onCancel = (cancelEvent) => {
			if (cancelEvent.pointerId !== scrubState.pointerId) {
				return;
			}
			stopUiEvent(cancelEvent);
			cancelEvent.preventDefault();
			finishScrub("cancel");
		};

		scrubState.onMove = onMove;
		scrubState.onUp = onUp;
		scrubState.onCancel = onCancel;
		scrubStateRef.current = scrubState;

		surface.addEventListener("pointermove", onMove);
		surface.addEventListener("pointerup", onUp);
		surface.addEventListener("pointercancel", onCancel);
	}

	return html`
		<div
			class=${isScrubbing ? "directional-scrub is-scrubbing" : "directional-scrub"}
			data-history-scope="app"
		>
			<button
				type="button"
				class="directional-scrub__surface"
				aria-label=${ariaLabel}
				onPointerDown=${beginScrub}
				onClick=${(clickEvent) => {
					stopUiEvent(clickEvent);
					clickEvent.preventDefault();
				}}
			>
				<span class="directional-scrub__chevron directional-scrub__chevron--start">
					<${WorkbenchIcon} name="chevron-left" size=${16} />
				</span>
				<span class="directional-scrub__track" aria-hidden="true"></span>
				<span class="directional-scrub__thumb" aria-hidden="true">
					<span class="directional-scrub__thumb-bar"></span>
				</span>
				<span class="directional-scrub__chevron directional-scrub__chevron--end">
					<${WorkbenchIcon} name="chevron-right" size=${16} />
				</span>
			</button>
		</div>
	`;
}

export function LightingDirectionControl({
	controller,
	azimuthDeg,
	elevationDeg,
	viewAzimuthDeg = 0,
	historyLabel = "lighting.model.direction",
	onLiveChange,
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [liveViewAzimuthDeg, setLiveViewAzimuthDeg] = useState(viewAzimuthDeg);
	const dragStateRef = useRef(null);
	const liveViewAzimuthDegRef = useRef(viewAzimuthDeg);

	useEffect(() => {
		liveViewAzimuthDegRef.current = viewAzimuthDeg;
		setLiveViewAzimuthDeg(viewAzimuthDeg);
	}, [viewAzimuthDeg]);

	useEffect(() => {
		let frameId = 0;
		const syncHeading = () => {
			const nextHeadingDeg = controller?.()?.getActiveCameraHeadingDeg?.();
			if (Number.isFinite(nextHeadingDeg)) {
				const normalizedHeadingDeg = normalizeDegrees(nextHeadingDeg + 180);
				if (
					Math.abs(
						normalizeDegrees(
							normalizedHeadingDeg - liveViewAzimuthDegRef.current,
						),
					) >= 0.1
				) {
					liveViewAzimuthDegRef.current = normalizedHeadingDeg;
					setLiveViewAzimuthDeg(normalizedHeadingDeg);
				}
			}
			frameId = globalThis.requestAnimationFrame(syncHeading);
		};

		frameId = globalThis.requestAnimationFrame(syncHeading);
		return () => {
			globalThis.cancelAnimationFrame(frameId);
		};
	}, [controller]);

	const position = getLightingDirectionWidgetPosition(
		azimuthDeg,
		elevationDeg,
		liveViewAzimuthDeg,
	);
	const rayPath = `M ${LIGHT_DIRECTION_WIDGET_CENTER} ${LIGHT_DIRECTION_WIDGET_CENTER} L ${position.x} ${position.y}`;
	const backHemisphereMarkup = !position.isFrontHemisphere
		? html`
				<path
					d=${rayPath}
					class="lighting-direction-control__ray lighting-direction-control__ray--back"
				/>
				<circle
					cx=${position.x}
					cy=${position.y}
					r="5"
					class="lighting-direction-control__handle lighting-direction-control__handle--back"
				/>
			`
		: null;
	const frontHemisphereMarkup = position.isFrontHemisphere
		? html`
				<path d=${rayPath} class="lighting-direction-control__ray" />
				<circle
					cx=${position.x}
					cy=${position.y}
					r="6"
					class="lighting-direction-control__handle"
				/>
			`
		: null;

	function finishDrag(mode = "commit") {
		const dragState = dragStateRef.current;
		if (!dragState) {
			return;
		}

		dragState.target.removeEventListener("pointermove", dragState.onMove);
		dragState.target.removeEventListener("pointerup", dragState.onUp);
		dragState.target.removeEventListener("pointercancel", dragState.onCancel);
		dragState.target.releasePointerCapture?.(dragState.pointerId);
		dragStateRef.current = null;
		setIsDragging(false);

		if (mode === "cancel") {
			controller?.()?.cancelHistoryTransaction?.();
			return;
		}
		controller?.()?.commitHistoryTransaction?.(historyLabel);
	}

	function beginDrag(event) {
		stopUiEvent(event);
		event.preventDefault();

		const target = event.currentTarget;
		controller?.()?.beginHistoryTransaction?.(historyLabel);
		target.setPointerCapture?.(event.pointerId);
		setIsDragging(true);

		const dragState = {
			pointerId: event.pointerId,
			target,
			previousClientX: event.clientX,
			previousClientY: event.clientY,
			relativeAzimuthDeg: position.relativeAzimuthDeg,
			elevationDeg,
			onMove: null,
			onUp: null,
			onCancel: null,
		};

		const onMove = (moveEvent) => {
			if (moveEvent.pointerId !== dragState.pointerId) {
				return;
			}
			stopUiEvent(moveEvent);
			moveEvent.preventDefault();
			const deltaX = moveEvent.clientX - dragState.previousClientX;
			const deltaY = moveEvent.clientY - dragState.previousClientY;
			dragState.previousClientX = moveEvent.clientX;
			dragState.previousClientY = moveEvent.clientY;
			const nextDirection = advanceLightingDirectionByPointerDelta(
				dragState.relativeAzimuthDeg,
				dragState.elevationDeg,
				deltaX,
				deltaY,
			);
			dragState.relativeAzimuthDeg = nextDirection.azimuthDeg;
			dragState.elevationDeg = nextDirection.elevationDeg;
			onLiveChange?.({
				azimuthDeg: normalizeDegrees(
					nextDirection.azimuthDeg + liveViewAzimuthDegRef.current,
				),
				elevationDeg: nextDirection.elevationDeg,
			});
		};

		const onUp = (upEvent) => {
			if (upEvent.pointerId !== dragState.pointerId) {
				return;
			}
			stopUiEvent(upEvent);
			upEvent.preventDefault();
			finishDrag("commit");
		};

		const onCancel = (cancelEvent) => {
			if (cancelEvent.pointerId !== dragState.pointerId) {
				return;
			}
			stopUiEvent(cancelEvent);
			cancelEvent.preventDefault();
			finishDrag("cancel");
		};

		dragState.onMove = onMove;
		dragState.onUp = onUp;
		dragState.onCancel = onCancel;
		dragStateRef.current = dragState;

		target.addEventListener("pointermove", onMove);
		target.addEventListener("pointerup", onUp);
		target.addEventListener("pointercancel", onCancel);
	}

	return html`
		<div class="lighting-direction-control">
			<button
				type="button"
				class=${
					isDragging
						? "lighting-direction-control__surface is-dragging"
						: "lighting-direction-control__surface"
				}
				onPointerDown=${beginDrag}
			>
				<svg
					viewBox=${`0 0 ${LIGHT_DIRECTION_WIDGET_SIZE} ${LIGHT_DIRECTION_WIDGET_SIZE}`}
					class="lighting-direction-control__svg"
					aria-hidden="true"
				>
					${backHemisphereMarkup}
					<circle
						cx=${LIGHT_DIRECTION_WIDGET_CENTER}
						cy=${LIGHT_DIRECTION_WIDGET_CENTER}
						r=${LIGHT_DIRECTION_WIDGET_RADIUS}
						class="lighting-direction-control__sphere"
					/>
					<circle
						cx=${LIGHT_DIRECTION_WIDGET_CENTER}
						cy=${LIGHT_DIRECTION_WIDGET_CENTER}
						r=${LIGHT_DIRECTION_WIDGET_RADIUS}
						class="lighting-direction-control__occluder"
					/>
					<ellipse
						cx=${LIGHT_DIRECTION_WIDGET_CENTER}
						cy=${LIGHT_DIRECTION_WIDGET_CENTER}
						rx=${LIGHT_DIRECTION_WIDGET_RADIUS}
						ry=${LIGHT_DIRECTION_EQUATOR_RY}
						class="lighting-direction-control__equator"
					/>
					<path
						d=${`M ${LIGHT_DIRECTION_WIDGET_CENTER} ${
							LIGHT_DIRECTION_WIDGET_CENTER - LIGHT_DIRECTION_WIDGET_RADIUS
						} V ${
							LIGHT_DIRECTION_WIDGET_CENTER + LIGHT_DIRECTION_WIDGET_RADIUS
						}`}
						class="lighting-direction-control__view-axis"
					/>
					<circle
						cx=${LIGHT_DIRECTION_WIDGET_CENTER}
						cy=${LIGHT_DIRECTION_WIDGET_CENTER}
						r="3.5"
						class="lighting-direction-control__origin"
					/>
					${frontHemisphereMarkup}
				</svg>
			</button>
		</div>
	`;
}

export function TextDraftInput({
	value,
	onCommit,
	selectOnFocus = false,
	...props
}) {
	const formattedValue = String(value ?? "");
	const [draftValue, setDraftValue] = useState(formattedValue);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!isEditing) {
			setDraftValue(formattedValue);
		}
	}, [formattedValue, isEditing]);

	function resetDraft() {
		setDraftValue(formattedValue);
		setIsEditing(false);
	}

	function commitDraft(nextRawValue) {
		onCommit?.(String(nextRawValue ?? ""));
		setIsEditing(false);
	}

	function handlePointerDown(event) {
		if (selectOnFocus) {
			event.preventDefault();
			stopUiEvent(event);
			const target = event.currentTarget;
			setIsEditing(true);
			setDraftValue(String(target.value ?? formattedValue));
			requestAnimationFrame(() => {
				target?.focus?.();
				target?.select?.();
			});
			return;
		}
		stopUiEvent(event);
	}

	return html`
		<input
			...${props}
			type="text"
			data-draft-editing=${isEditing ? "true" : "false"}
			value=${isEditing ? draftValue : formattedValue}
			onPointerDown=${handlePointerDown}
			onFocus=${(event) => {
				stopUiEvent(event);
				setIsEditing(true);
				setDraftValue(String(event.currentTarget.value ?? formattedValue));
				if (selectOnFocus) {
					requestAnimationFrame(() => {
						event.currentTarget?.select?.();
					});
				}
			}}
			onInput=${(event) => {
				stopUiEvent(event);
				setIsEditing(true);
				setDraftValue(event.currentTarget.value);
			}}
			onBlur=${(event) => {
				commitDraft(event.currentTarget.value);
			}}
			onChange=${(event) => {
				commitDraft(event.currentTarget.value);
			}}
			onClick=${stopUiEvent}
			onWheel=${stopUiWheelEvent}
			onKeyDown=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (event.key === "Enter") {
					event.preventDefault();
					commitDraft(event.currentTarget.value);
					event.currentTarget.blur();
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					resetDraft();
					event.currentTarget.blur();
				}
			}}
		/>
	`;
}

export function HistoryRangeInput({
	controller,
	historyLabel,
	onLiveChange,
	...props
}) {
	const [transactionActive, setTransactionActive] = useState(false);

	function beginTransaction(event) {
		stopUiEvent(event);
		if (transactionActive) {
			return;
		}
		controller?.()?.beginHistoryTransaction?.(historyLabel);
		setTransactionActive(true);
	}

	function commitTransaction() {
		if (!transactionActive) {
			return;
		}
		controller?.()?.commitHistoryTransaction?.(historyLabel);
		setTransactionActive(false);
	}

	function cancelTransaction() {
		if (!transactionActive) {
			return;
		}
		controller?.()?.cancelHistoryTransaction?.();
		setTransactionActive(false);
	}

	return html`
		<input
			...${props}
			type="range"
			data-history-scope="app"
			onPointerDown=${(event) => {
				beginTransaction(event);
			}}
			onInput=${(event) => {
				if (!transactionActive) {
					beginTransaction(event);
				} else {
					stopUiEvent(event);
				}
				onLiveChange?.(event);
			}}
			onChange=${(event) => {
				if (!transactionActive) {
					beginTransaction(event);
				} else {
					stopUiEvent(event);
				}
				onLiveChange?.(event);
				commitTransaction();
			}}
			onPointerUp=${(event) => {
				stopUiEvent(event);
				commitTransaction();
			}}
			onPointerCancel=${(event) => {
				stopUiEvent(event);
				cancelTransaction();
			}}
			onBlur=${() => {
				commitTransaction();
			}}
			onKeyDown=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (
					[
						"ArrowLeft",
						"ArrowRight",
						"ArrowUp",
						"ArrowDown",
						"Home",
						"End",
						"PageUp",
						"PageDown",
					].includes(event.key)
				) {
					beginTransaction(event);
				}
			}}
			onKeyUp=${(event) => {
				if (isHistoryShortcutEvent(event)) {
					return;
				}
				stopUiEvent(event);
				if (
					[
						"ArrowLeft",
						"ArrowRight",
						"ArrowUp",
						"ArrowDown",
						"Home",
						"End",
						"PageUp",
						"PageDown",
					].includes(event.key)
				) {
					commitTransaction();
				}
			}}
			onWheel=${stopUiWheelEvent}
		/>
	`;
}

export function applyStandardFrameHorizontalEquivalentMm(
	setBaseFov,
	nextValue,
	{ snap = false } = {},
) {
	const numericValue = Number(nextValue);
	if (!Number.isFinite(numericValue)) {
		return;
	}

	const normalizedValue = snap
		? snapStandardFrameHorizontalEquivalentMm(numericValue)
		: clampStandardFrameHorizontalEquivalentMm(numericValue);
	setBaseFov?.(
		getBaseHorizontalFovDegreesForStandardFrameHorizontalEquivalentMm(
			normalizedValue,
		),
	);
}
