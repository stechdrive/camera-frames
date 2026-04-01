export function createCanvasFromPixels(
	pixels,
	width,
	height,
	{
		createCanvas = () => document.createElement("canvas"),
		previewContextError = "error.previewContext",
	} = {},
) {
	const canvas = createCanvas();
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error(previewContextError);
	}

	const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
	context.putImageData(imageData, 0, 0);
	return canvas;
}

export function createSolidColorCanvas(
	width,
	height,
	color,
	{
		createCanvas = () => document.createElement("canvas"),
		previewContextError = "error.previewContext",
	} = {},
) {
	const canvas = createCanvas();
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error(previewContextError);
	}
	context.fillStyle = color;
	context.fillRect(0, 0, width, height);
	return canvas;
}
