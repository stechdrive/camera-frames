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

export const BUILD_INFO = Object.freeze({
	name: appName,
	version: appVersion,
	commit: buildSha,
	branch: buildBranch,
	builtAt: buildTimestamp,
});

export function getBuildVersionLabel() {
	return `v${BUILD_INFO.version}`;
}

export function getBuildCommitLabel() {
	return BUILD_INFO.commit && BUILD_INFO.commit !== "unknown"
		? BUILD_INFO.commit
		: null;
}
