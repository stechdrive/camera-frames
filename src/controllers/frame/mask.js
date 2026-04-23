import { normalizeFrameMaskShape } from "../../engine/frame-trajectory.js";
import {
	resolveFrameMaskPreferredMode,
	resolveFrameMaskSelectedIds,
	resolveFrameMaskToggleMode,
} from "../../workspace-model.js";

export function createCameraFrameMaskController({
	runHistoryAction,
	updateUi,
	getActiveShotCameraDocument,
	updateActiveShotCameraDocument,
	getActiveFrames,
}) {
	function setFrameMaskSelectedIds(frameIds) {
		const nextSelectedIds = Array.from(
			new Set(
				(frameIds ?? []).filter((frameId) =>
					getActiveFrames().some((frame) => frame.id === frameId),
				),
			),
		);
		updateActiveShotCameraDocument((documentState) => {
			documentState.frameMask = {
				...documentState.frameMask,
				selectedIds: nextSelectedIds,
			};
			return documentState;
		});
	}

	function getFrameMaskMode() {
		return getActiveShotCameraDocument()?.frameMask?.mode ?? "off";
	}

	function getFrameMaskPreferredMode() {
		return resolveFrameMaskPreferredMode(
			getActiveShotCameraDocument()?.frameMask?.mode,
			getActiveShotCameraDocument()?.frameMask?.preferredMode,
		);
	}

	function setFrameMaskMode(nextValue) {
		const mode =
			nextValue === "selected" || nextValue === "all" ? nextValue : "off";
		runHistoryAction?.("frame.mask-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					mode,
					preferredMode:
						mode === "selected" || mode === "all"
							? mode
							: (documentState.frameMask?.preferredMode ?? "all"),
				};
				return documentState;
			});
		});
		updateUi();
	}

	function toggleFrameMaskMode(targetMode) {
		const mode =
			targetMode === "selected" || targetMode === "all" ? targetMode : "off";
		setFrameMaskMode(getFrameMaskMode() === mode ? "off" : mode);
	}

	function togglePreferredFrameMaskMode() {
		setFrameMaskMode(
			resolveFrameMaskToggleMode({
				mode: getFrameMaskMode(),
				preferredMode: getFrameMaskPreferredMode(),
				hasRememberedSelection: getRememberedFrameMaskSelectedIds().length > 0,
			}),
		);
	}

	function getRememberedFrameMaskSelectedIds() {
		return resolveFrameMaskSelectedIds(
			getActiveFrames(),
			getActiveShotCameraDocument()?.frameMask?.selectedIds ?? [],
		);
	}

	function setFrameMaskOpacity(nextValue) {
		const opacityPct = Math.min(
			100,
			Math.max(0, Math.round(Number(nextValue) || 0)),
		);
		runHistoryAction?.("frame.mask-opacity", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					opacityPct,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function getFrameMaskShape() {
		return normalizeFrameMaskShape(
			getActiveShotCameraDocument()?.frameMask?.shape,
		);
	}

	function setFrameMaskShape(nextValue) {
		const shape = normalizeFrameMaskShape(nextValue);
		runHistoryAction?.("frame.mask-shape", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.frameMask = {
					...documentState.frameMask,
					shape,
				};
				return documentState;
			});
		});
		updateUi();
	}

	return {
		setFrameMaskSelectedIds,
		getFrameMaskMode,
		getFrameMaskPreferredMode,
		setFrameMaskMode,
		toggleFrameMaskMode,
		togglePreferredFrameMaskMode,
		getRememberedFrameMaskSelectedIds,
		setFrameMaskOpacity,
		getFrameMaskShape,
		setFrameMaskShape,
	};
}
