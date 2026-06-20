import {
	normalizeCompositionGuidePattern,
	normalizeCompositionGuideScope,
	sanitizeCompositionGuideState,
} from "../../engine/composition-guides.js";

export function createCameraCompositionGuideController({
	runHistoryAction,
	updateUi,
	updateActiveShotCameraDocument,
}) {
	function updateCompositionGuide(historyLabel, patch) {
		runHistoryAction?.(historyLabel, () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.compositionGuide = {
					...sanitizeCompositionGuideState(documentState.compositionGuide),
					...patch,
				};
				return documentState;
			});
		});
		updateUi();
	}

	function setCompositionGuideEnabled(nextValue) {
		updateCompositionGuide("camera.composition-guide.enabled", {
			enabled: Boolean(nextValue),
		});
	}

	function setCompositionGuideScope(nextValue) {
		updateCompositionGuide("camera.composition-guide.scope", {
			scope: normalizeCompositionGuideScope(nextValue),
		});
	}

	function setCompositionGuidePattern(nextValue) {
		updateCompositionGuide("camera.composition-guide.pattern", {
			pattern: normalizeCompositionGuidePattern(nextValue),
		});
	}

	return {
		setCompositionGuideEnabled,
		setCompositionGuideScope,
		setCompositionGuidePattern,
	};
}
