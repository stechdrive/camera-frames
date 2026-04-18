// Mock controller for docs fixtures. Any method name is accepted; by default
// it records the invocation on `__calls` and returns undefined. Specific
// methods can be stubbed via the `methods` option when a fixture needs the
// UI to see a non-undefined return value (e.g. a predicate).

const SPECIAL_PROP_CALLS = "__calls";
const SPECIAL_PROP_METHODS = "__methods";

/**
 * @typedef {object} MockMethodCall
 * @property {string} method
 * @property {unknown[]} args
 */

/**
 * @typedef {object} MockControllerOptions
 * @property {boolean} [log=false]
 *   When true, each invocation is logged via console.debug.
 * @property {Record<string, (...args: unknown[]) => unknown>} [methods]
 *   Map of method-name -> implementation. Un-overridden methods no-op.
 */

/**
 * Create a proxy-backed controller stand-in.
 *
 * @param {MockControllerOptions} [options]
 */
export function createMockController(options = {}) {
	const log = options.log === true;
	const methods = options.methods ?? null;
	/** @type {MockMethodCall[]} */
	const calls = [];
	const target = { [SPECIAL_PROP_CALLS]: calls, [SPECIAL_PROP_METHODS]: methods };
	return new Proxy(target, {
		get(box, prop) {
			if (typeof prop !== "string") {
				return Reflect.get(box, prop);
			}
			if (prop === SPECIAL_PROP_CALLS) return calls;
			if (prop === SPECIAL_PROP_METHODS) return methods;
			const override =
				methods && Object.hasOwn(methods, prop) ? methods[prop] : null;
			return (...args) => {
				calls.push({ method: prop, args });
				if (log) {
					console.debug(`[mock-controller] ${prop}`, args);
				}
				if (override) return override(...args);
				return undefined;
			};
		},
	});
}
