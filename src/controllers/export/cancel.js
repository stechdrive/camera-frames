export function createExportAbortError(message = "Export cancelled.") {
	const error = new Error(message);
	error.name = "AbortError";
	return error;
}

export function isExportAbortError(error) {
	return error?.name === "AbortError";
}

export function throwIfExportAborted(abortSignal) {
	if (!abortSignal?.aborted) {
		return;
	}
	const reason = abortSignal.reason;
	if (reason instanceof Error) {
		throw reason;
	}
	throw createExportAbortError();
}
