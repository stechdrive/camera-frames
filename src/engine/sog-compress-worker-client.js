const GPU_WORKER_STALL_TIMEOUT_MS = 30000;
const CPU_WORKER_STALL_TIMEOUT_MS = 180000;

class SogCompressWorkerClient {
	constructor() {
		this.worker = new Worker(
			new URL("./sog-compress.worker.js", import.meta.url),
			{
				type: "module",
			},
		);
		this.pending = new Map();
		this.token = 1;
		this.readyPromise = new Promise((resolve, reject) => {
			this.resolveReady = resolve;
			this.rejectReady = reject;
		});
		this.worker.addEventListener("message", (event) => {
			const message = event.data;
			if (message?.type === "ready") {
				this.resolveReady?.();
				return;
			}

			const pending = this.pending.get(message?.token);
			if (!pending) {
				return;
			}

			if (message.type === "progress") {
				pending.lastActivityAt = Date.now();
				pending.lastText = String(message.text ?? "");
				pending.onProgress?.({
					text: String(message.text ?? ""),
					progress: Number(message.progress ?? 0),
				});
				return;
			}

			this.pending.delete(message.token);
			globalThis.clearInterval(pending.watchdogId);

			if (message.type === "done") {
				pending.resolve(new Uint8Array(message.data));
				return;
			}

			pending.reject(new Error(String(message.error ?? "Worker failed.")));
		});
		this.worker.addEventListener("error", (event) => {
			event.preventDefault?.();
			const error =
				event.error ??
				new Error(
					String(event.message || "SOG compression worker failed to start."),
				);
			this.destroy(error);
		});
	}

	destroy(error = new Error("SOG compression worker stopped.")) {
		try {
			this.worker.terminate();
		} catch {}
		this.rejectReady?.(error);
		for (const pending of this.pending.values()) {
			globalThis.clearInterval(pending.watchdogId);
			pending.reject(error);
		}
		this.pending.clear();
		if (client === this) {
			client = null;
		}
	}

	async compress({
		serializedColumns,
		outputFileName,
		sogIterations,
		forceCpu = false,
		onProgress,
	}) {
		await this.readyPromise;
		const token = this.token++;
		const stallTimeoutMs = forceCpu
			? CPU_WORKER_STALL_TIMEOUT_MS
			: GPU_WORKER_STALL_TIMEOUT_MS;
		const resultPromise = new Promise((resolve, reject) => {
			const pending = {
				resolve,
				reject,
				onProgress,
				lastActivityAt: Date.now(),
				lastText: "Starting worker…",
				watchdogId: null,
			};
			this.pending.set(token, pending);
			pending.watchdogId = globalThis.setInterval(() => {
				if (Date.now() - pending.lastActivityAt < stallTimeoutMs) {
					return;
				}
				console.warn(
					`[CAMERA_FRAMES] SOG worker stalled after ${Math.round(stallTimeoutMs / 1000)}s at "${pending.lastText}"`,
				);
				this.pending.delete(token);
				this.destroy(
					new Error(
						`SOG worker stalled for ${Math.round(stallTimeoutMs / 1000)}s at "${pending.lastText}".`,
					),
				);
			}, 1000);
		});

		const transferList = [];
		const messageSerializedColumns = {
			numRows: Number(serializedColumns?.numRows ?? 0),
			maxShBands: Number(serializedColumns?.maxShBands ?? 2),
			columnNames: Array.isArray(serializedColumns?.columnNames)
				? [...serializedColumns.columnNames]
				: [],
			columnData: Array.isArray(serializedColumns?.columnData)
				? serializedColumns.columnData.map((entry) => {
						const typed =
							entry instanceof Float32Array ? entry : new Float32Array(entry);
						transferList.push(typed.buffer);
						return typed;
					})
				: [],
		};
		this.worker.postMessage(
			{
				type: "compress",
				token,
				outputFileName,
				sogIterations,
				forceCpu,
				serializedColumns: messageSerializedColumns,
			},
			transferList,
		);

		return await resultPromise;
	}
}

let client = null;

function getSogCompressWorkerClient() {
	client ??= new SogCompressWorkerClient();
	return client;
}

export async function compressEmbeddedSplatSourceAsSogInWorker(options) {
	return await getSogCompressWorkerClient().compress(options);
}
