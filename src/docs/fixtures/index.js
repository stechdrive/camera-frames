import { helloFixture } from "./hello.js";
import { iconsAllFixture } from "./icons-all.js";

/** @type {import("../types").FixtureRegistry} */
export const FIXTURES = {
	[helloFixture.id]: helloFixture,
	[iconsAllFixture.id]: iconsAllFixture,
};

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
