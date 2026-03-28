import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
	clampStandardFrameEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	snapStandardFrameEquivalentMm,
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
	controller = null,
	historyLabel = "",
	scrubModifiers = null,
	...props
}) {
	const formattedValue = String(value);
	const [draftValue, setDraftValue] = useState(formattedValue);
	const [isEditing, setIsEditing] = useState(false);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const scrubStateRef = useRef(null);
	const resolvedScrubModifiers = resolveNumericScrubModifiers(scrubModifiers);

	useEffect(() => {
		if (!isEditing && !isScrubbing) {
			setDraftValue(formattedValue);
		}
	}, [formattedValue, isEditing, isScrubbing]);

	function resetDraft() {
		setDraftValue(formattedValue);
		setIsEditing(false);
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

	function finishScrub(mode = "commit") {
		const scrubState = scrubStateRef.current;
		if (!scrubState) {
			return;
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

		const startValue = parseNumber(formattedValue);
		if (startValue === null) {
			return;
		}

		controller?.()?.beginHistoryTransaction?.(historyLabel);
		setIsEditing(false);
		setIsScrubbing(true);
		const handle = event.currentTarget;
		handle.setPointerCapture?.(event.pointerId);

		const onMove = (moveEvent) => {
			if (moveEvent.pointerId !== event.pointerId) {
				return;
			}
			stopUiEvent(moveEvent);
			moveEvent.preventDefault();
			const deltaPixels = Math.round(moveEvent.clientX - event.clientX);
			const nextValue = clampValue(
				startValue +
					deltaPixels * getStepValue() * getScrubMultiplier(moveEvent),
			);
			const nextDraftValue = String(nextValue);
			setDraftValue(nextDraftValue);
			onCommit?.(nextDraftValue);
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

		scrubStateRef.current = {
			pointerId: event.pointerId,
			handle,
			onMove,
			onUp,
			onCancel,
		};
		handle.addEventListener("pointermove", onMove);
		handle.addEventListener("pointerup", onUp);
		handle.addEventListener("pointercancel", onCancel);
	}

	return html`
		<div
			class=${isScrubbing ? "numeric-scrub is-scrubbing" : "numeric-scrub"}
			data-history-scope="app"
		>
			<input
				...${props}
				type="number"
				inputMode=${inputMode}
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
				onChange=${(event) => {
					commitDraft(event.currentTarget.value);
				}}
				onPointerDown=${stopUiEvent}
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
				const normalizedHeadingDeg = normalizeDegrees(nextHeadingDeg);
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

export function TextDraftInput({ value, onCommit, ...props }) {
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

	return html`
		<input
			...${props}
			type="text"
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
			onChange=${(event) => {
				commitDraft(event.currentTarget.value);
			}}
			onPointerDown=${stopUiEvent}
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

export function applyStandardFrameEquivalentMm(
	setBaseFov,
	nextValue,
	{ snap = false } = {},
) {
	const numericValue = Number(nextValue);
	if (!Number.isFinite(numericValue)) {
		return;
	}

	const normalizedValue = snap
		? snapStandardFrameEquivalentMm(numericValue)
		: clampStandardFrameEquivalentMm(numericValue);
	setBaseFov?.(
		getBaseHorizontalFovDegreesForStandardFrameEquivalentMm(normalizedValue),
	);
}
