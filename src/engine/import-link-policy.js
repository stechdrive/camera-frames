function normalizeHostName(hostname) {
	return String(hostname ?? "")
		.trim()
		.toLowerCase()
		.replace(/\.+$/, "");
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
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 100 && b >= 64 && b <= 127) ||
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

function getIpv6FirstHextet(value) {
	const firstPart = String(value ?? "").split(":")[0];
	const firstHextet = Number.parseInt(firstPart, 16);
	return Number.isFinite(firstHextet) ? firstHextet : null;
}

function parseIpv4MappedIpv6(hostname) {
	const normalizedIpv6 = normalizeIpv6(hostname);
	if (!normalizedIpv6.startsWith("::ffff:")) {
		return null;
	}

	const mappedValue = normalizedIpv6.slice("::ffff:".length);
	const dottedOctets = parseIpv4(mappedValue);
	if (dottedOctets) {
		return dottedOctets;
	}

	const parts = mappedValue.split(":");
	if (parts.length !== 2) {
		return null;
	}
	const high = Number.parseInt(parts[0], 16);
	const low = Number.parseInt(parts[1], 16);
	if (
		!Number.isInteger(high) ||
		!Number.isInteger(low) ||
		high < 0 ||
		high > 0xffff ||
		low < 0 ||
		low > 0xffff
	) {
		return null;
	}

	return [high >> 8, high & 0xff, low >> 8, low & 0xff];
}

function isPrivateIpv6(hostname) {
	const normalizedIpv6 = normalizeIpv6(hostname);
	const mappedIpv4Octets = parseIpv4MappedIpv6(normalizedIpv6);
	if (mappedIpv4Octets) {
		return isPrivateIpv4(mappedIpv4Octets.join("."));
	}
	const firstHextet = getIpv6FirstHextet(normalizedIpv6);
	return (
		normalizedIpv6 === "::" ||
		normalizedIpv6 === "::1" ||
		(firstHextet !== null && firstHextet >= 0xfc00 && firstHextet <= 0xfdff) ||
		(firstHextet !== null && firstHextet >= 0xfe80 && firstHextet <= 0xfebf)
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
