// Fixture registry (node-safe). Only fixtures whose entire transitive import
// graph avoids vite-only primitives (e.g. `import.meta.glob`) are registered
// here. Browser-only fixtures (section wrappers that mount real UI which
// transitively pulls `src/ui/workbench-icons.js`) are registered at docs-app
// boot via `./index-browser.js`, so node-run tests can still import this
// module to validate the base registry contract.

import { helloFixture } from "./hello.js";
import { iconsAllFixture } from "./icons-all.js";

/** @type {import("../types").FixtureRegistry} */
export const FIXTURES = {
	[helloFixture.id]: helloFixture,
	[iconsAllFixture.id]: iconsAllFixture,
};

/**
 * Register a fixture at runtime. Used by browser-only registration modules.
 * Throws if the id collides with an existing entry.
 * @param {import("../types").Fixture} fixture
 */
export function registerFixture(fixture) {
	if (!fixture || typeof fixture.id !== "string" || fixture.id.length === 0) {
		throw new Error("registerFixture: fixture.id must be a non-empty string");
	}
	if (Object.hasOwn(FIXTURES, fixture.id)) {
		throw new Error(`registerFixture: duplicate id "${fixture.id}"`);
	}
	FIXTURES[fixture.id] = fixture;
}

/**
 * @param {string} id
 * @returns {import("../types").Fixture | null}
 */
export function getFixture(id) {
	if (typeof id !== "string" || id === "") return null;
	return FIXTURES[id] ?? null;
}

/** @returns {string[]} */
export function listFixtureIds() {
	return Object.keys(FIXTURES);
}

/** @returns {import("../types").Fixture[]} */
export function listFixtures() {
	return Object.values(FIXTURES);
}
