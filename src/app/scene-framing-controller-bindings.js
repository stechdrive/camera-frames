export function createSceneFramingControllerBindings({
	getSceneBounds,
	assetController,
	viewportCamera,
	shotCameraRegistry,
	cameraController,
	interactionController,
	fpsMovement,
} = {}) {
	return {
		getSceneBounds,
		getSceneFramingBounds: () => assetController.getSceneFramingBounds(),
		viewportCamera,
		shotCameraRegistry,
		syncShotCameraEntryFromDocument: (entry) =>
			cameraController?.syncShotCameraEntryFromDocument(entry),
		syncControlsToMode: () => interactionController?.syncControlsToMode(),
		fpsMovement,
	};
}
