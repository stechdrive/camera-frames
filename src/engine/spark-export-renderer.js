import * as THREE from "three";
import {
	assignSparkExportBufferState,
	captureSparkExportBufferOutputs,
	captureSparkExportBufferState,
} from "./spark-integration/spark-export-buffer-state.js";

export const DEFAULT_EXPORT_SUPER_XY = 1;

function createRenderTarget(width, height, superXY) {
	return new THREE.WebGLRenderTarget(width * superXY, height * superXY, {
		format: THREE.RGBAFormat,
		type: THREE.UnsignedByteType,
		colorSpace: THREE.SRGBColorSpace,
	});
}

export function createSparkExportRendererManager({ sourceSpark }) {
	let exportTarget = null;
	let targetWidth = 0;
	let targetHeight = 0;
	let targetSuperXY = DEFAULT_EXPORT_SUPER_XY;
	let exportSuperPixels = null;
	let exportTargetPixels = null;

	function disposeExportTarget() {
		exportTarget?.dispose();
		exportTarget = null;
		targetWidth = 0;
		targetHeight = 0;
		targetSuperXY = DEFAULT_EXPORT_SUPER_XY;
		exportSuperPixels = null;
		exportTargetPixels = null;
	}

	function ensureExportTarget({
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		const needsNewTarget =
			!exportTarget ||
			targetWidth !== width ||
			targetHeight !== height ||
			targetSuperXY !== superXY;

		if (!needsNewTarget) {
			return exportTarget;
		}

		disposeExportTarget();
		exportTarget = createRenderTarget(width, height, superXY);
		targetWidth = width;
		targetHeight = height;
		targetSuperXY = superXY;
		return exportTarget;
	}

	function captureBufferState() {
		return captureSparkExportBufferState(sourceSpark);
	}

	function assignExportTarget({
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		ensureExportTarget({ width, height, superXY });
		assignSparkExportBufferState(sourceSpark, {
			target: exportTarget,
			backTarget: undefined,
			superXY,
			superPixels: exportSuperPixels,
			targetPixels: exportTargetPixels,
			encodeLinear: true,
		});
	}

	function syncExportBuffersFromSpark() {
		const nextBuffers = captureSparkExportBufferOutputs(sourceSpark);
		exportSuperPixels = nextBuffers.superPixels;
		exportTargetPixels = nextBuffers.targetPixels;
	}

	function clearExportTarget({
		width = targetWidth,
		height = targetHeight,
		superXY = targetSuperXY,
	} = {}) {
		if (!sourceSpark?.renderer) {
			return;
		}

		ensureExportTarget({ width, height, superXY });

		const renderer = sourceSpark.renderer;
		const previousTarget = renderer.getRenderTarget();
		const previousAutoClear = renderer.autoClear;
		const previousClearAlpha = renderer.getClearAlpha();
		const previousClearColor = renderer
			.getClearColor(new THREE.Color())
			.clone();

		try {
			renderer.setRenderTarget(exportTarget);
			renderer.autoClear = true;
			renderer.setClearColor(0x000000, 0);
			renderer.clear(true, true, true);
		} finally {
			renderer.setRenderTarget(previousTarget);
			renderer.autoClear = previousAutoClear;
			renderer.setClearColor(previousClearColor, previousClearAlpha);
		}
	}

	function restoreBufferState(previousState) {
		syncExportBuffersFromSpark();
		assignSparkExportBufferState(sourceSpark, previousState);
	}

	async function withExportTarget(config, callback) {
		const previousState = captureBufferState();
		assignExportTarget(config);

		try {
			return await callback();
		} finally {
			restoreBufferState(previousState);
		}
	}

	async function prepareFrame({
		scene,
		camera,
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
		update = true,
	}) {
		ensureExportTarget({ width, height, superXY });
		if (!update) {
			return exportTarget;
		}

		await withExportTarget({ width, height, superXY }, () =>
			sourceSpark.update({
				scene,
				camera,
			}),
		);
		return exportTarget;
	}

	function renderFrame({
		scene,
		camera,
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		ensureExportTarget({ width, height, superXY });
		return withExportTarget({ width, height, superXY }, () => {
			clearExportTarget({ width, height, superXY });
			return sourceSpark.renderTarget({
				scene,
				camera,
			});
		});
	}

	async function readPixels({
		width = targetWidth,
		height = targetHeight,
		superXY = targetSuperXY,
	} = {}) {
		if (!exportTarget) {
			throw new Error("Export renderer has not been prepared.");
		}

		return withExportTarget({ width, height, superXY }, () =>
			sourceSpark.readTarget(),
		);
	}

	async function capturePixels({
		scene,
		camera,
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
		update = true,
	}) {
		await prepareFrame({
			scene,
			camera,
			width,
			height,
			superXY,
			update,
		});
		await renderFrame({
			scene,
			camera,
			width,
			height,
			superXY,
		});
		return readPixels({
			width,
			height,
			superXY,
		});
	}

	function dispose() {
		disposeExportTarget();
	}

	return {
		ensureExportTarget,
		prepareFrame,
		renderFrame,
		readPixels,
		capturePixels,
		dispose,
	};
}
