import * as THREE from "three";

export const DEFAULT_EXPORT_SUPER_XY = 1;

export function createSparkExportViewpointManager({ spark }) {
	let viewpoint = null;
	let target = null;
	let targetWidth = 0;
	let targetHeight = 0;
	let targetSuperXY = DEFAULT_EXPORT_SUPER_XY;
	let superPixels = null;
	let targetPixels = null;

	function supportsDedicatedViewpoint() {
		return typeof spark?.newViewpoint === "function";
	}

	function disposeFallbackTarget() {
		target?.dispose?.();
		target = null;
		superPixels = null;
		targetPixels = null;
	}

	function applyFallbackOverrides(superXY) {
		const previousState = {
			target: spark.target ?? null,
			backTarget: spark.backTarget ?? null,
			superXY: spark.superXY ?? DEFAULT_EXPORT_SUPER_XY,
			encodeLinear: spark.encodeLinear ?? false,
		};
		spark.target = target;
		spark.backTarget = null;
		spark.superXY = superXY;
		// Match Spark target-mode behavior so splats are written to the sRGB target correctly.
		spark.encodeLinear = true;
		return previousState;
	}

	function restoreFallbackOverrides(previousState) {
		if (!previousState) {
			return;
		}

		spark.target = previousState.target;
		spark.backTarget = previousState.backTarget;
		spark.superXY = previousState.superXY;
		spark.encodeLinear = previousState.encodeLinear;
	}

	function ensureFallbackTarget({
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		const superWidth = width * superXY;
		const superHeight = height * superXY;
		const needsNewTarget =
			!target ||
			target.width !== superWidth ||
			target.height !== superHeight ||
			targetSuperXY !== superXY;

		if (!needsNewTarget) {
			return target;
		}

		disposeFallbackTarget();
		target = new THREE.WebGLRenderTarget(superWidth, superHeight, {
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType,
			colorSpace: THREE.SRGBColorSpace,
		});
		targetWidth = width;
		targetHeight = height;
		targetSuperXY = superXY;
		return target;
	}

	function ensureViewpoint({
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		if (supportsDedicatedViewpoint()) {
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

		ensureFallbackTarget({
			width,
			height,
			superXY,
		});
		return spark;
	}

	async function prepareFrame({
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
		if (supportsDedicatedViewpoint()) {
			await activeViewpoint.prepare({
				scene,
				camera,
				update,
				forceOrigin,
			});
			return activeViewpoint;
		}

		if (update && typeof activeViewpoint.update === "function") {
			const previousState = applyFallbackOverrides(superXY);
			try {
				await activeViewpoint.update({
					scene,
					camera,
				});
			} finally {
				restoreFallbackOverrides(previousState);
			}
		}
		return activeViewpoint;
	}

	function renderFrame({
		scene,
		camera,
		width,
		height,
		superXY = DEFAULT_EXPORT_SUPER_XY,
	}) {
		const activeViewpoint = ensureViewpoint({
			width,
			height,
			superXY,
		});
		const previousState = applyFallbackOverrides(superXY);
		try {
			activeViewpoint.renderTarget({
				scene,
				camera,
			});
		} finally {
			restoreFallbackOverrides(previousState);
		}
		return activeViewpoint;
	}

	async function readPixels() {
		if (!supportsDedicatedViewpoint() && !target) {
			throw new Error("Export target has not been prepared.");
		}

		if (supportsDedicatedViewpoint() && !viewpoint) {
			throw new Error("Export viewpoint has not been prepared.");
		}

		if (supportsDedicatedViewpoint()) {
			return viewpoint.readTarget();
		}

		const { width, height } = target;
		const byteSize = width * height * 4;
		if (!superPixels || superPixels.length < byteSize) {
			superPixels = new Uint8Array(byteSize);
		}

		await spark.renderer.readRenderTargetPixelsAsync(
			target,
			0,
			0,
			width,
			height,
			superPixels,
		);

		if (targetSuperXY === 1) {
			return superPixels;
		}

		const subWidth = width / targetSuperXY;
		const subHeight = height / targetSuperXY;
		const subSize = subWidth * subHeight * 4;
		if (!targetPixels || targetPixels.length < subSize) {
			targetPixels = new Uint8Array(subSize);
		}

		const super2 = targetSuperXY * targetSuperXY;
		for (let y = 0; y < subHeight; y += 1) {
			const row = y * subWidth;
			for (let x = 0; x < subWidth; x += 1) {
				const superCol = x * targetSuperXY;
				let r = 0;
				let g = 0;
				let b = 0;
				let a = 0;
				for (let sy = 0; sy < targetSuperXY; sy += 1) {
					const superRow = (y * targetSuperXY + sy) * width;
					for (let sx = 0; sx < targetSuperXY; sx += 1) {
						const superIndex = (superRow + superCol + sx) * 4;
						r += superPixels[superIndex];
						g += superPixels[superIndex + 1];
						b += superPixels[superIndex + 2];
						a += superPixels[superIndex + 3];
					}
				}

				const pixelIndex = (row + x) * 4;
				targetPixels[pixelIndex] = r / super2;
				targetPixels[pixelIndex + 1] = g / super2;
				targetPixels[pixelIndex + 2] = b / super2;
				targetPixels[pixelIndex + 3] = a / super2;
			}
		}

		return targetPixels;
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
		await prepareFrame({
			scene,
			camera,
			width,
			height,
			superXY,
			update,
			forceOrigin,
		});
		renderFrame({
			scene,
			camera,
			width,
			height,
			superXY,
		});
		return readPixels();
	}

	function dispose() {
		viewpoint?.dispose();
		viewpoint = null;
		disposeFallbackTarget();
		targetWidth = 0;
		targetHeight = 0;
		targetSuperXY = DEFAULT_EXPORT_SUPER_XY;
	}

	return {
		ensureViewpoint,
		prepareFrame,
		renderFrame,
		readPixels,
		capturePixels,
		dispose,
	};
}
