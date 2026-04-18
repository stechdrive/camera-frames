export function createRuntimeListeners() {
	const disposers = [];

	function listen(target, eventName, handler, options = false) {
		target.addEventListener(eventName, handler, options);
		disposers.push(() =>
			target.removeEventListener(eventName, handler, options),
		);
	}

	function disposeAllListeners() {
		while (disposers.length > 0) {
			const dispose = disposers.pop();
			dispose();
		}
	}

	return { listen, disposers, disposeAllListeners };
}
