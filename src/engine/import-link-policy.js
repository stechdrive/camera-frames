function normalizeHostName(hostname) {
	return String(hostname ?? "")
		.trim()
		.toLowerCase();
}

function isLocalHostName(hostname) {
	const normalizedHost = normalizeHostName(hostname);
	return (
		normalizedHost === "localhost" ||
		normalizedHost.endsWith(".local") ||
		normalizedHost === "host.docker.internal"
	);
}

function parseIpv4(hostname) {
	const parts = normalizeHostName(hostname).split(".");
	if (parts.length !== 4) {
		return null;
	}

	const octets = parts.map((part) => Number(part));
	if (
		octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
	) {
		return null;
	}

	return octets;
}

function isPrivateIpv4(hostname) {
	const octets = parseIpv4(hostname);
	if (!octets) {
		return false;
	}

	const [a, b] = octets;
	return (
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168)
	);
}

function normalizeIpv6(hostname) {
	const normalizedHost = normalizeHostName(hostname);
	if (!normalizedHost) {
		return "";
	}
	if (normalizedHost.startsWith("[") && normalizedHost.endsWith("]")) {
		return normalizedHost.slice(1, -1);
	}
	return normalizedHost;
}

function isPrivateIpv6(hostname) {
	const normalizedIpv6 = normalizeIpv6(hostname);
	return (
		normalizedIpv6 === "::1" ||
		normalizedIpv6.startsWith("fc") ||
		normalizedIpv6.startsWith("fd") ||
		normalizedIpv6.startsWith("fe80:")
	);
}

export function getBlockedStartupUrlReason(value) {
	let parsedUrl = null;
	try {
		parsedUrl = new URL(value);
	} catch {
		return "invalid";
	}

	if (parsedUrl.protocol !== "https:") {
		return "https-only";
	}

	const hostName = parsedUrl.hostname;
	if (
		isLocalHostName(hostName) ||
		isPrivateIpv4(hostName) ||
		isPrivateIpv6(hostName)
	) {
		return "private-host";
	}

	return null;
}

export function validateStartupUrls(values) {
	const allowed = [];
	const blocked = [];

	for (const value of values) {
		const reason = getBlockedStartupUrlReason(value);
		if (reason) {
			blocked.push({ url: value, reason });
			continue;
		}
		allowed.push(value);
	}

	return { allowed, blocked };
}
