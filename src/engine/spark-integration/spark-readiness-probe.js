function isObject(value) {
	return value !== null && typeof value === "object";
}

function countArray(value) {
	return Array.isArray(value) ? value.length : 0;
}

function countObjectKeys(value) {
	return isObject(value) ? Object.keys(value).length : 0;
}

function countFlag(value) {
	return value ? 1 : 0;
}

function countPendingTimeout(timeoutId) {
	return Number.isFinite(timeoutId) && timeoutId !== -1 ? 1 : 0;
}

function countWorkerMessages(worker) {
	return countObjectKeys(worker?.messages);
}

function countWorkerExclusive(worker) {
	return Array.isArray(worker?.queue) ? 1 : 0;
}

function hasPagerQueueEntry(entries, splats, chunk) {
	return (
		Array.isArray(entries) &&
		entries.some((entry) => entry?.splats === splats && entry?.chunk === chunk)
	);
}

function getPagerChunkPage(pager, splats, chunk) {
	try {
		if (typeof pager?.getSplatsChunk === "function") {
			return pager.getSplatsChunk(splats, chunk);
		}
	} catch {
		return undefined;
	}

	const chunks =
		pager?.splatsChunkToPage instanceof Map
			? pager.splatsChunkToPage.get(splats)
			: undefined;
	return chunks?.[chunk];
}

function countPagerFetchBacklog(pager) {
	const priority = Array.isArray(pager?.fetchPriority) ? pager.fetchPriority : [];
	const maxPages = Number.isFinite(Number(pager?.maxPages))
		? Math.max(0, Math.floor(Number(pager.maxPages)))
		: Number.POSITIVE_INFINITY;
	let reservedPages = 0;
	let backlog = 0;

	for (const entry of priority) {
		const splats = entry?.splats;
		const chunk = Math.floor(Number(entry?.chunk));
		if (!splats || !Number.isFinite(chunk)) {
			continue;
		}

		const resident = Boolean(getPagerChunkPage(pager, splats, chunk));
		const queued =
			hasPagerQueueEntry(pager.fetched, splats, chunk) ||
			hasPagerQueueEntry(pager.fetchers, splats, chunk);

		if (resident || queued) {
			reservedPages += 1;
			continue;
		}

		if (reservedPages < maxPages) {
			reservedPages += 1;
			backlog += 1;
		}
	}

	return backlog;
}

export function captureSparkReadinessState(sourceSpark) {
	if (!isObject(sourceSpark)) {
		return {
			supported: false,
			pending: false,
			pendingCounts: {},
			pendingReasons: [],
		};
	}

	const pager = sourceSpark.pager;
	const pendingCounts = {
		renderDirty: countFlag(sourceSpark.dirty),
		updateTimeout: countPendingTimeout(sourceSpark.updateTimeoutId),
		sortDirty: countFlag(sourceSpark.sortDirty),
		sortTimeout: countPendingTimeout(sourceSpark.sortTimeoutId),
		sorting: countFlag(sourceSpark.sorting),
		sortWorkerMessages: countWorkerMessages(sourceSpark.sortWorker),
		lodDirty: countFlag(sourceSpark.lodDirty),
		lodWorkerExclusive: countWorkerExclusive(sourceSpark.lodWorker),
		lodWorkerMessages: countWorkerMessages(sourceSpark.lodWorker),
		lodInitQueue: countArray(sourceSpark.lodInitQueue),
		lodUpdates: countArray(sourceSpark.lodUpdates),
		pagerFetchers: countArray(pager?.fetchers),
		pagerFetched: countArray(pager?.fetched),
		pagerNewUploads: countArray(pager?.newUploads),
		pagerReadyUploads: countArray(pager?.readyUploads),
		pagerLodTreeUpdates: countArray(pager?.lodTreeUpdates),
		pagerFetchBacklog: countPagerFetchBacklog(pager),
	};
	const pendingReasons = Object.entries(pendingCounts)
		.filter(([, count]) => count > 0)
		.map(([name, count]) => `${name}:${count}`);

	return {
		supported: true,
		pending: pendingReasons.length > 0,
		pendingCounts,
		pendingReasons,
	};
}
