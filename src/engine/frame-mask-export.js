import { getFrameOutlineSpec } from "./frame-overlay.js";

function appendFrameInteriorPath(context, spec) {
	context.save();
	context.translate(spec.centerX, spec.centerY);
	context.rotate(spec.rotationRadians);
	context.rect(-spec.width * 0.5, -spec.height * 0.5, spec.width, spec.height);
	context.restore();
}

export function createAllFrameMaskPsdLayerDocument(
	frames,
	width,
	height,
	{
		name = "Mask",
		opacity = 0.8,
		hidden = true,
		fillStyle = "rgb(3, 6, 11)",
		createCanvas = null,
	} = {},
) {
	if (!Array.isArray(frames) || frames.length === 0) {
		return null;
	}

	const canvas =
		typeof createCanvas === "function"
			? createCanvas(width, height)
			: (() => {
					const nextCanvas = document.createElement("canvas");
					nextCanvas.width = width;
					nextCanvas.height = height;
					return nextCanvas;
				})();
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Failed to acquire the 2D context for FRAME mask.");
	}

	context.clearRect(0, 0, width, height);
	context.fillStyle = fillStyle;
	context.fillRect(0, 0, width, height);
	context.globalCompositeOperation = "destination-out";
	context.beginPath();
	for (const frame of frames) {
		const spec = getFrameOutlineSpec(
			frame,
			width,
			height,
			width,
			height,
			0,
			0,
			{
				pixelSnapAxisAligned: false,
			},
		);
		appendFrameInteriorPath(context, spec);
	}
	context.fillStyle = "#000";
	context.fill();
	context.globalCompositeOperation = "source-over";

	return {
		name,
		canvas,
		opacity,
		hidden,
	};
}
