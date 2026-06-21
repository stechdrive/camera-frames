import {
	createMediabunnyWebmFromFrameRenderer,
	isMediabunnyWebmExportSupported,
} from "./video/mediabunny-webm.js";

export function isWebmVideoExportSupported() {
	return isMediabunnyWebmExportSupported();
}

export async function createWebmFromFrameRenderer(
	renderFrames,
	{ fps = 24, abortSignal = null } = {},
) {
	return createMediabunnyWebmFromFrameRenderer(renderFrames, {
		fps,
		abortSignal,
	});
}

export async function createWebmFromCanvases(
	canvases,
	{ fps = 24, abortSignal = null } = {},
) {
	if (!Array.isArray(canvases) || canvases.length === 0) {
		throw new Error("Video export requires at least one frame.");
	}
	return createWebmFromFrameRenderer(
		async (drawFrame) => {
			for (const canvas of canvases) {
				await drawFrame(canvas);
			}
		},
		{ fps, abortSignal },
	);
}
