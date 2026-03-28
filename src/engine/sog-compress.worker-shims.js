const workerGlobal = globalThis;

workerGlobal.window ??= workerGlobal;
workerGlobal.self ??= workerGlobal;
workerGlobal.devicePixelRatio ??= 1;
workerGlobal.matchMedia ??= (query) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: () => {},
	removeListener: () => {},
	addEventListener: () => {},
	removeEventListener: () => {},
	dispatchEvent: () => false,
});
