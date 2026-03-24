import { DEV_STAMP } from "virtual:camera-frames-dev-stamp";
import { signal } from "@preact/signals";

const appName =
	typeof __APP_NAME__ === "string" ? __APP_NAME__ : "camera-frames";
const appVersion =
	typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
const buildSha =
	typeof __APP_BUILD_SHA__ === "string" ? __APP_BUILD_SHA__ : "unknown";
const buildBranch =
	typeof __APP_BUILD_BRANCH__ === "string" ? __APP_BUILD_BRANCH__ : "unknown";
const buildCodeStamp =
	typeof __APP_CODE_STAMP__ === "string" ? __APP_CODE_STAMP__ : "unknown";
const buildTimestamp =
	typeof __APP_BUILD_TIMESTAMP__ === "string" ? __APP_BUILD_TIMESTAMP__ : "";
const runtimeSequenceKey = "__CAMERA_FRAMES_RUNTIME_SEQUENCE__";
const activeRuntimeInfoKey = "__CAMERA_FRAMES_ACTIVE_RUNTIME__";
export const IS_DEV_RUNTIME = Boolean(import.meta.env?.DEV);
export const activeCodeStamp = signal(
	typeof DEV_STAMP === "string" && DEV_STAMP ? DEV_STAMP : buildCodeStamp,
);

export const BUILD_INFO = Object.freeze({
	name: appName,
	version: appVersion,
	commit: buildSha,
	branch: buildBranch,
	codeStamp: buildCodeStamp,
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
		globalThis[activeRuntimeInfoKey] = undefined;
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

export function getCodeStampValue() {
	return activeCodeStamp.value || BUILD_INFO.codeStamp || null;
}

export function getCodeStampLabel() {
	const codeStamp = getCodeStampValue();
	return codeStamp && codeStamp !== "unknown" ? `dev:${codeStamp}` : null;
}

export function getRuntimeLabel(runtimeInfo) {
	return runtimeInfo?.id ? `rt:${runtimeInfo.id}` : null;
}

export function getBuildDebugLabels() {
	const labels = [];
	const commitLabel = getBuildCommitLabel();
	const codeStampLabel = getCodeStampLabel();

	if (commitLabel) {
		labels.push(commitLabel);
	}
	if (codeStampLabel) {
		labels.push(codeStampLabel);
	}

	return labels;
}

if (import.meta.hot) {
	import.meta.hot.accept("virtual:camera-frames-dev-stamp", (nextModule) => {
		const nextStamp = nextModule?.DEV_STAMP;
		if (typeof nextStamp === "string" && nextStamp) {
			activeCodeStamp.value = nextStamp;
			console.info("[CAMERA_FRAMES] code-stamp", {
				codeStamp: nextStamp,
			});
		}
	});
}
