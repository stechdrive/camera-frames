function describeDecodeFailure(error) {
	if (error instanceof Error) {
		return `${error.name || "Error"}: ${error.message || "Unknown error"}`;
	}
	if (error && typeof error === "object") {
		const eventType =
			typeof error.type === "string" && error.type ? error.type : "unknown";
		return `Event(${eventType})`;
	}
	return String(error ?? "Unknown error");
}

async function probeBlobReadability(blob) {
	const probeSize = Math.min(Math.max(0, Number(blob?.size ?? 0)), 64);
	try {
		await blob.slice(0, probeSize).arrayBuffer();
		return `readable (${probeSize} byte probe succeeded)`;
	} catch (error) {
		return `unreadable (${describeDecodeFailure(error)})`;
	}
}

export async function loadBlobImageDrawable(
	blob,
	{
		filename = "",
		description = "Image",
		errorName = "BlobImageDecodeError",
		createImageBitmapFn = globalThis.createImageBitmap,
		createObjectUrl = (value) => URL.createObjectURL(value),
		revokeObjectUrl = (value) => URL.revokeObjectURL(value),
		createImageElement = () => new Image(),
	} = {},
) {
	if (!(blob instanceof Blob)) {
		throw new TypeError(`${description} source is not a Blob.`);
	}
	let bitmapError = null;
	try {
		if (typeof createImageBitmapFn !== "function") {
			throw new Error("createImageBitmap unavailable");
		}
		const imageBitmap = await createImageBitmapFn(blob);
		return {
			drawable: imageBitmap,
			cleanup: () => {
				try {
					imageBitmap.close?.();
				} catch {
					// ignore
				}
			},
		};
	} catch (error) {
		bitmapError = error;
	}

	let objectUrl = "";
	let imageError = null;
	try {
		objectUrl = createObjectUrl(blob);
		const image = await new Promise((resolve, reject) => {
			const element = createImageElement();
			const clearHandlers = () => {
				element.onload = null;
				element.onerror = null;
			};
			element.onload = () => {
				clearHandlers();
				resolve(element);
			};
			element.onerror = (event) => {
				clearHandlers();
				reject(
					new Error(
						`HTMLImageElement emitted "${event?.type ?? "error"}" while decoding.`,
					),
				);
			};
			try {
				element.src = objectUrl;
			} catch (error) {
				clearHandlers();
				reject(error);
			}
		});
		let cleanedUp = false;
		return {
			drawable: image,
			cleanup: () => {
				if (!cleanedUp) {
					cleanedUp = true;
					revokeObjectUrl(objectUrl);
				}
			},
		};
	} catch (error) {
		imageError = error;
		if (objectUrl) {
			revokeObjectUrl(objectUrl);
		}
	}

	const readability = await probeBlobReadability(blob);
	const label = String(filename || blob.name || description.toLowerCase());
	const decodeError = new Error(
		[
			`${description} "${label}" could not be decoded.`,
			`Blob size=${blob.size} bytes, type="${blob.type || "unknown"}", ${readability}.`,
			`createImageBitmap: ${describeDecodeFailure(bitmapError)}.`,
			`HTMLImageElement: ${describeDecodeFailure(imageError)}.`,
		].join(" "),
		{ cause: imageError ?? bitmapError },
	);
	decodeError.name = errorName;
	throw decodeError;
}
