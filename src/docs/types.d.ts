// Type definitions for the CAMERA_FRAMES docs fixture system.
// Consumed via JSDoc `@type {import("../types").Fixture}` annotations from
// .js source. See docs/help/FIXTURE_ROADMAP.md for the full design.

export type FixtureType =
	| "icon"
	| "panel"
	| "overlay"
	| "viewport"
	| "composite"
	| "reference";

export interface FixtureMountContext {
	/** Locale for this render (e.g. "ja", "en"). */
	lang: string;
}

export interface FixtureSize {
	width?: number | "auto";
	height?: number | "auto";
}

export interface Fixture {
	/**
	 * Unique id across the whole registry. Must match the corresponding
	 * chapter frontmatter `screenshots[].id` so that captured PNGs land
	 * at the right filename.
	 */
	id: string;
	type: FixtureType;
	/** Human-readable title for docs chrome / listings. */
	title: string;
	/**
	 * Render function. Receives a context bag, returns a Preact vnode.
	 * Must be pure: equal context must produce an equivalent tree, and
	 * must not touch real-app state (real store / real controller).
	 */
	mount: (context: FixtureMountContext) => unknown;
	size?: FixtureSize;
	background?: string;
}

export type FixtureRegistry = Record<string, Fixture>;
