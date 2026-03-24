const appName =
	typeof __APP_NAME__ === "string" ? __APP_NAME__ : "camera-frames";
const appVersion =
	typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
const buildSha =
	typeof __APP_BUILD_SHA__ === "string" ? __APP_BUILD_SHA__ : "unknown";
const buildBranch =
	typeof __APP_BUILD_BRANCH__ === "string" ? __APP_BUILD_BRANCH__ : "unknown";
const buildTimestamp =
	typeof __APP_BUILD_TIMESTAMP__ === "string" ? __APP_BUILD_TIMESTAMP__ : "";
const runtimeSequenceKey = "__CAMERA_FRAMES_RUNTIME_SEQUENCE__";
const activeRuntimeInfoKey = "__CAMERA_FRAMES_ACTIVE_RUNTIME__";

export const BUILD_INFO = Object.freeze({
	name: appName,
	version: appVersion,
	commit: buildSha,
	branch: buildBranch,
	builtAt: buildTimestamp,
});

function nextRuntimeSequence() {
	const currentSequence = Number(globalThis[runtimeSequenceKey] ?? 0);
	const nextSequence = currentSequence + 1;
	globalThis[runtimeSequenceKey] = nextSequence;
	return nextSequence;
}

function createRuntimeId(sequence) {
	return `${Date.now().toString(36)}-${sequence.toString(36)}`;
}

export function createRuntimeInfo() {
	const sequence = nextRuntimeSequence();
	const runtimeInfo = Object.freeze({
		id: createRuntimeId(sequence),
		sequence,
		startedAt: new Date().toISOString(),
	});
	globalThis[activeRuntimeInfoKey] = runtimeInfo;
	return runtimeInfo;
}

export function clearActiveRuntimeInfo(runtimeId) {
	const activeRuntimeInfo = globalThis[activeRuntimeInfoKey];
	if (activeRuntimeInfo?.id === runtimeId) {
		delete globalThis[activeRuntimeInfoKey];
	}
}

export function getBuildVersionLabel() {
	return `v${BUILD_INFO.version}`;
}

export function getBuildCommitLabel() {
	return BUILD_INFO.commit && BUILD_INFO.commit !== "unknown"
		? BUILD_INFO.commit
		: null;
}

export function getRuntimeLabel(runtimeInfo) {
	return runtimeInfo?.id ? `rt:${runtimeInfo.id}` : null;
}
