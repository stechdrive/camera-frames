import {
	PIXELFORMAT_BGRA8,
	Texture,
	WebgpuGraphicsDevice,
	splatTransform,
	webpWasmUrl,
} from "./sog-compress-runtime.js";
import { buildDataTableFromSerializedSogColumns } from "./sog-data-table.js";

let cachedGpuDevice = null;
let cachedBackbuffer = null;

async function createGpuDevice() {
	if (cachedGpuDevice) {
		return cachedGpuDevice;
	}
	if (!globalThis.navigator?.gpu) {
		throw new Error("WebGPU is not available in this worker.");
	}

	splatTransform.WebPCodec.wasmUrl ??= webpWasmUrl;
	const canvas = new OffscreenCanvas(1024, 512);
	const graphicsDevice = new WebgpuGraphicsDevice(canvas, {
		antialias: false,
		depth: false,
		stencil: false,
		powerPreference: "high-performance",
	});
	await graphicsDevice.createDevice();

	cachedBackbuffer = new Texture(graphicsDevice, {
		width: 1024,
		height: 512,
		name: "CameraFramesSogWorkerBackbuffer",
		mipmaps: false,
		format: PIXELFORMAT_BGRA8,
	});
	graphicsDevice.externalBackbuffer = cachedBackbuffer;
	cachedGpuDevice = graphicsDevice;
	return graphicsDevice;
}

async function writeSogBundle({
	outputFileName,
	filteredDataTable,
	sogIterations,
	createDevice,
}) {
	const outputFileSystem = new splatTransform.MemoryFileSystem();
	splatTransform.WebPCodec.wasmUrl ??= webpWasmUrl;
	await splatTransform.writeSog(
		{
			filename: outputFileName,
			dataTable: filteredDataTable,
			bundle: true,
			iterations: sogIterations,
			createDevice,
		},
		outputFileSystem,
	);
	return outputFileSystem.results.get(outputFileName) ?? null;
}

function createProgressLogger(token) {
	let lastText = "";
	let lastPercent = -1;
	return {
		log: () => {},
		warn: console.warn,
		error: console.error,
		debug: () => {},
		output: () => {},
		onProgress: (node) => {
			if (node.depth === 0) {
				if (node.step <= 0) {
					return;
				}
				const text = node.stepName
					? `Step ${node.step}/${node.totalSteps}: ${node.stepName}`
					: `Step ${node.step}/${node.totalSteps}`;
				if (text === lastText) {
					return;
				}
				lastText = text;
				lastPercent = -1;
				globalThis.postMessage({
					type: "progress",
					token,
					text,
					progress: 0,
				});
				return;
			}

			const parentStep = node.parent?.step ?? node.step;
			const parentTotal = node.parent?.totalSteps ?? node.totalSteps;
			const parentName = node.parent?.stepName ?? node.stepName ?? "";
			const roundedPercent = Math.max(
				0,
				Math.min(
					100,
					Math.round((100 * node.step) / Math.max(1, node.totalSteps)),
				),
			);
			if (parentName === lastText && roundedPercent === lastPercent) {
				return;
			}
			lastText = parentName;
			lastPercent = roundedPercent;
			globalThis.postMessage({
				type: "progress",
				token,
				text: parentName
					? `Step ${parentStep}/${parentTotal}: ${parentName}`
					: `Step ${parentStep}/${parentTotal}`,
				progress: roundedPercent,
			});
		},
	};
}

function postWorkerProgress(token, text, progress = 0) {
	globalThis.postMessage({
		type: "progress",
		token,
		text,
		progress,
	});
}

async function compressToSog({
	token,
	outputFileName,
	serializedColumns,
	sogIterations,
	forceCpu = false,
}) {
	splatTransform.logger.setLogger(createProgressLogger(token));
	postWorkerProgress(token, "Building SOG data table…", 0);
	const filteredDataTable = buildDataTableFromSerializedSogColumns(
		serializedColumns,
		{
			Column: splatTransform.Column,
			DataTable: splatTransform.DataTable,
		},
	);

	const useGpu = !forceCpu && Boolean(globalThis.navigator?.gpu);
	let outputBytes = null;
	if (!useGpu) {
		if (forceCpu) {
			postWorkerProgress(token, "CPU mode forced after worker retry.", 0);
		}
		postWorkerProgress(token, "WebGPU unavailable. Using CPU compression.", 0);
		postWorkerProgress(token, "Writing SOG on CPU…", 0);
		outputBytes = await writeSogBundle({
			outputFileName,
			filteredDataTable,
			sogIterations,
			createDevice: undefined,
		});
	} else {
		try {
			postWorkerProgress(
				token,
				"WebGPU detected. Preparing GPU compression…",
				0,
			);
			outputBytes = await writeSogBundle({
				outputFileName,
				filteredDataTable,
				sogIterations,
				createDevice: createGpuDevice,
			});
		} catch (error) {
			postWorkerProgress(
				token,
				`Worker GPU path failed, retrying on CPU. ${String(error?.message ?? error ?? "")}`.trim(),
				0,
			);
			postWorkerProgress(token, "Writing SOG on CPU…", 0);
			outputBytes = await writeSogBundle({
				outputFileName,
				filteredDataTable,
				sogIterations,
				createDevice: undefined,
			});
		}
	}

	if (!outputBytes) {
		throw new Error(`Failed to write "${outputFileName}" as SOG.`);
	}

	const copy = new Uint8Array(outputBytes.byteLength);
	copy.set(outputBytes);
	globalThis.postMessage(
		{
			type: "done",
			token,
			data: copy.buffer,
		},
		[copy.buffer],
	);
}

globalThis.addEventListener("message", async (event) => {
	const message = event.data;
	if (message?.type !== "compress") {
		return;
	}

	try {
		await compressToSog({
			token: message.token,
			outputFileName: String(message.outputFileName ?? "output.sog"),
			serializedColumns: {
				numRows: Number(message.serializedColumns?.numRows ?? 0),
				maxShBands: Number(message.serializedColumns?.maxShBands ?? 2),
				columnNames: Array.isArray(message.serializedColumns?.columnNames)
					? message.serializedColumns.columnNames
					: [],
				columnData: Array.isArray(message.serializedColumns?.columnData)
					? message.serializedColumns.columnData.map((entry) =>
							entry instanceof Float32Array ? entry : new Float32Array(entry),
						)
					: [],
			},
			sogIterations: Number(message.sogIterations ?? 10),
			forceCpu: message.forceCpu === true,
		});
	} catch (error) {
		globalThis.postMessage({
			type: "error",
			token: message?.token ?? 0,
			error: String(
				error?.stack ?? error?.message ?? error ?? "Worker failed.",
			),
		});
	}
});

globalThis.postMessage({ type: "ready" });
