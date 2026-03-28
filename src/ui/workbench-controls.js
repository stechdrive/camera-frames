import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import {
	clampStandardFrameEquivalentMm,
	getBaseHorizontalFovDegreesForStandardFrameEquivalentMm,
	snapStandardFrameEquivalentMm,
} from "../engine/camera-lens.js";

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

export function NumericDraftInput({
	value,
	inputMode = "decimal",
	onCommit,
	...props
}) {
	const formattedValue = String(value);
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
		const nextValue = String(nextRawValue ?? "").trim();
		if (nextValue === "") {
			resetDraft();
			return;
		}
		onCommit?.(nextValue);
		setIsEditing(false);
	}

	return html`
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
		: clampStandardFrameEquivalentMm(Math.round(numericValue));
	setBaseFov?.(
		getBaseHorizontalFovDegreesForStandardFrameEquivalentMm(normalizedValue),
	);
}
