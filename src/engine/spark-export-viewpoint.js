export const DEFAULT_EXPORT_SUPER_XY = 1;

export function createSparkExportViewpointManager({ spark }) {
	let viewpoint = null;
	let targetWidth = 0;
	let targetHeight = 0;
	let targetSuperXY = DEFAULT_EXPORT_SUPER_XY;

	function ensureViewpoint({
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		const needsNewViewpoint =
			!viewpoint ||
			targetWidth !== width ||
			targetHeight !== height ||
			targetSuperXY !== superXY;

		if (!needsNewViewpoint) {
			return viewpoint;
		}

		viewpoint?.dispose();
		viewpoint = spark.newViewpoint({
			autoUpdate: false,
			target: {
				width,
				height,
				superXY,
			},
		});
		targetWidth = width;
		targetHeight = height;
		targetSuperXY = superXY;
		return viewpoint;
	}

	async function capturePixels({
		scene,
		camera,
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
		update = true,
		forceOrigin = true,
	}) {
		const activeViewpoint = ensureViewpoint({
			width,
			height,
			superXY,
		});
		await activeViewpoint.prepare({
			scene,
			camera,
			update,
			forceOrigin,
		});
		activeViewpoint.renderTarget({
			scene,
			camera,
		});
		return activeViewpoint.readTarget();
	}

	function dispose() {
		viewpoint?.dispose();
		viewpoint = null;
		targetWidth = 0;
		targetHeight = 0;
		targetSuperXY = DEFAULT_EXPORT_SUPER_XY;
	}

	return {
		ensureViewpoint,
		capturePixels,
		dispose,
	};
}
