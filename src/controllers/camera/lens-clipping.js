import {
	BASE_RENDER_BOX,
	DEFAULT_CAMERA_FAR,
	DEFAULT_CAMERA_NEAR,
} from "../../constants.js";

export function clampClipNear(value) {
	return Math.max(DEFAULT_CAMERA_NEAR, Number(value) || DEFAULT_CAMERA_NEAR);
}

export function clampClipFar(value, near) {
	return Math.max(near + 0.01, Number(value) || DEFAULT_CAMERA_FAR);
}

export function getResolvedShotCameraClipping(
	documentState,
	camera,
	getAutoClipRange,
) {
	if (!documentState) {
		return getAutoClipRange(camera);
	}

	const near = clampClipNear(documentState.clipping.near);
	if (documentState.clipping.mode !== "manual") {
		const autoClip = getAutoClipRange(camera);
		return {
			near,
			far: clampClipFar(Math.max(autoClip.far, DEFAULT_CAMERA_FAR), near),
		};
	}

	return {
		near,
		far: clampClipFar(documentState.clipping.far, near),
	};
}

export function createCameraLensClippingController({
	store,
	state,
	runHistoryAction,
	updateUi,
	setStatus,
	t,
	horizontalToVerticalFovDegrees,
	getShotCameraDocument,
	updateActiveShotCameraDocument,
	getActiveShotCameraEntry,
	getAutoClipRange,
}) {
	function syncShotCameraEntryFromDocument(entry) {
		const documentState = getShotCameraDocument(entry.id);
		if (!documentState) {
			return;
		}

		const { near, far } = getResolvedShotCameraClipping(
			documentState,
			entry.camera,
			getAutoClipRange,
		);
		entry.camera.aspect = BASE_RENDER_BOX.width / BASE_RENDER_BOX.height;
		entry.camera.fov = horizontalToVerticalFovDegrees(
			documentState.lens.baseFovX,
			entry.camera.aspect,
		);
		entry.camera.near = near;
		entry.camera.far = far;

		if (documentState.id === store.workspace.activeShotCameraId.value) {
			store.shotCamera.nearLive.value = near;
			store.shotCamera.farLive.value = far;
		}
	}

	function syncActiveShotCameraFromDocument() {
		const activeEntry = getActiveShotCameraEntry();
		if (!activeEntry) {
			return;
		}

		syncShotCameraEntryFromDocument(activeEntry);
	}

	function setBaseFovX(nextValue) {
		runHistoryAction?.("camera.lens", () => {
			state.baseFovX = Number(nextValue);
		});
		updateUi();
	}

	function setViewportBaseFovX(nextValue) {
		runHistoryAction?.("viewport.lens", () => {
			state.viewportBaseFovX = Number(nextValue);
			state.viewportBaseFovXDirty = true;
		});
		updateUi();
	}

	function setShotCameraClippingMode(nextValue) {
		const mode = nextValue === "manual" ? "manual" : "auto";
		runHistoryAction?.("camera.clip-mode", () => {
			updateActiveShotCameraDocument((documentState) => {
				documentState.clipping.mode = mode;
				return documentState;
			});
		});
		updateUi();
		setStatus(
			t("status.shotCameraClipMode", {
				mode: t(`clipMode.${mode}`),
			}),
		);
	}

	function setShotCameraNear(nextValue) {
		runHistoryAction?.("camera.near", () => {
			updateActiveShotCameraDocument((documentState) => {
				const near = clampClipNear(nextValue);
				documentState.clipping.near = near;
				documentState.clipping.far = clampClipFar(
					documentState.clipping.far,
					near,
				);
				return documentState;
			});
		});
		updateUi();
	}

	function setShotCameraFar(nextValue) {
		runHistoryAction?.("camera.far", () => {
			updateActiveShotCameraDocument((documentState) => {
				const near = clampClipNear(documentState.clipping.near);
				documentState.clipping.far = clampClipFar(nextValue, near);
				return documentState;
			});
		});
		updateUi();
	}

	return {
		syncShotCameraEntryFromDocument,
		syncActiveShotCameraFromDocument,
		setBaseFovX,
		setViewportBaseFovX,
		setShotCameraClippingMode,
		setShotCameraNear,
		setShotCameraFar,
	};
}
