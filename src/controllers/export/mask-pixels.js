export function createAlphaPreviewPixels(pixels) {
	const previewPixels = new Uint8Array(pixels.length);
	for (let index = 0; index < pixels.length; index += 4) {
		const value = pixels[index + 3];
		previewPixels[index + 0] = value;
		previewPixels[index + 1] = value;
		previewPixels[index + 2] = value;
		previewPixels[index + 3] = value;
	}
	return previewPixels;
}

export function extractAlphaChannel(pixels) {
	const alpha = new Uint8ClampedArray(Math.floor(pixels.length / 4));
	for (let index = 0; index < alpha.length; index += 1) {
		alpha[index] = pixels[index * 4 + 3];
	}
	return alpha;
}

export function buildLayerMaskPixels(
	sourcePixels,
	modelVisibilityPixels = null,
	splatOccluderPixels = null,
) {
	const maskPixels = new Uint8Array(sourcePixels.length);
	for (let index = 0; index < sourcePixels.length; index += 4) {
		const sourceAlpha = sourcePixels[index + 3] / 255;
		const modelVisibilityAlpha = modelVisibilityPixels
			? (Math.max(
					modelVisibilityPixels[index + 0],
					modelVisibilityPixels[index + 1],
					modelVisibilityPixels[index + 2],
				) /
					255) *
				(modelVisibilityPixels[index + 3] / 255)
			: sourceAlpha;
		const splatOccluderAlpha = splatOccluderPixels
			? splatOccluderPixels[index + 3] / 255
			: 0;
		const visibleAlpha = Math.max(
			0,
			Math.min(1, modelVisibilityAlpha * (1 - splatOccluderAlpha)),
		);
		const value = Math.round(visibleAlpha * 255);
		maskPixels[index + 0] = value;
		maskPixels[index + 1] = value;
		maskPixels[index + 2] = value;
		maskPixels[index + 3] = value;
	}
	return maskPixels;
}

export function fillSplatMaskDarkSpeckles(pixels, width, height, sourceAlpha) {
	const currentThreshold = 24;
	const neighborThreshold = 6;
	const neighborMaskThreshold = 224;
	const result = new Uint8ClampedArray(pixels);

	for (let y = 1; y < height - 1; y += 1) {
		for (let x = 1; x < width - 1; x += 1) {
			const index = y * width + x;
			const pixelOffset = index * 4;
			const currentAlpha = pixels[pixelOffset + 3];
			if (currentAlpha > currentThreshold) {
				continue;
			}

			if (sourceAlpha[index] <= 0) {
				continue;
			}

			let visibleNeighbors = 0;
			for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
				for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
					if (offsetX === 0 && offsetY === 0) {
						continue;
					}
					const neighborOffset =
						((y + offsetY) * width + (x + offsetX)) * 4 + 3;
					if (pixels[neighborOffset] >= neighborMaskThreshold) {
						visibleNeighbors += 1;
					}
				}
			}

			if (visibleNeighbors >= neighborThreshold) {
				result[pixelOffset + 0] = 255;
				result[pixelOffset + 1] = 255;
				result[pixelOffset + 2] = 255;
				result[pixelOffset + 3] = 255;
			}
		}
	}

	return result;
}

export function buildSplatLayerMaskPixels(
	sourcePixels,
	compositePixels,
	lowerPixels,
	width,
	height,
) {
	const contributionEpsilon = 1 / 255;
	const solveDenominatorEpsilon = 1e-3;
	const result = new Uint8ClampedArray(sourcePixels.length);
	const sourceAlpha = extractAlphaChannel(sourcePixels);

	for (let index = 0; index < result.length; index += 4) {
		const sourceAlphaValue = sourcePixels[index + 3];
		if (sourceAlphaValue === 0) {
			continue;
		}

		const sourceAlphaNormalized = sourceAlphaValue / 255;
		const compositeAlphaNormalized = compositePixels[index + 3] / 255;
		const lowerAlphaNormalized = lowerPixels[index + 3] / 255;
		const estimates = [];

		const alphaDenominator = sourceAlphaNormalized * (1 - lowerAlphaNormalized);
		if (alphaDenominator > contributionEpsilon) {
			estimates.push({
				value:
					(compositeAlphaNormalized - lowerAlphaNormalized) / alphaDenominator,
				weight: alphaDenominator * 2,
			});
		}

		for (let channel = 0; channel < 3; channel += 1) {
			const sourcePremultiplied =
				(sourcePixels[index + channel] / 255) * sourceAlphaNormalized;
			const compositePremultiplied =
				(compositePixels[index + channel] / 255) * compositeAlphaNormalized;
			const lowerPremultiplied =
				(lowerPixels[index + channel] / 255) * lowerAlphaNormalized;
			const denominator =
				sourcePremultiplied - sourceAlphaNormalized * lowerPremultiplied;
			if (Math.abs(denominator) <= solveDenominatorEpsilon) {
				continue;
			}

			estimates.push({
				value: (compositePremultiplied - lowerPremultiplied) / denominator,
				weight: Math.abs(denominator),
			});
		}

		let maskNormalized = 1;
		if (estimates.length > 0) {
			const weighted = estimates.reduce(
				(sum, { value, weight }) =>
					sum + Math.max(0, Math.min(1, value)) * weight,
				0,
			);
			const totalWeight = estimates.reduce(
				(sum, { weight }) => sum + weight,
				0,
			);
			maskNormalized = totalWeight > 0 ? weighted / totalWeight : 1;
		} else {
			const contribution =
				Math.abs(compositeAlphaNormalized - lowerAlphaNormalized) +
				Math.abs(
					compositePixels[index + 0] * compositeAlphaNormalized -
						lowerPixels[index + 0] * lowerAlphaNormalized,
				) /
					(255 * 255) +
				Math.abs(
					compositePixels[index + 1] * compositeAlphaNormalized -
						lowerPixels[index + 1] * lowerAlphaNormalized,
				) /
					(255 * 255) +
				Math.abs(
					compositePixels[index + 2] * compositeAlphaNormalized -
						lowerPixels[index + 2] * lowerAlphaNormalized,
				) /
					(255 * 255);
			maskNormalized = contribution > contributionEpsilon ? 1 : 0;
		}

		const maskValue = Math.round(maskNormalized * 255);
		result[index + 0] = maskValue;
		result[index + 1] = maskValue;
		result[index + 2] = maskValue;
		result[index + 3] = maskValue;
	}

	return fillSplatMaskDarkSpeckles(result, width, height, sourceAlpha);
}
