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

export interface FixtureAnnotation {
	/** 1-based sequence number rendered inside the badge. */
	n: number;
	/**
	 * CSS selector resolved against the fixture's rendered DOM at the
	 * root of `.docs-stage`. The selector's first match is centred in
	 * its bounding rect; unresolved selectors render at the stage
	 * top-left with a warning class so the issue is visible in capture.
	 */
	selector: string;
	/** Short human-readable caption surfaced as title attribute. */
	label?: string;
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
	/**
	 * Numbered overlay annotations painted on top of the fixture's
	 * rendered DOM before capture. Resolved after mount via
	 * querySelector against `.docs-stage`.
	 */
	annotations?: FixtureAnnotation[];
}

export type FixtureRegistry = Record<string, Fixture>;

export interface MockMethodCall {
	method: string;
	args: unknown[];
}

export interface MockControllerOptions {
	/** When true, each invocation is logged via console.debug. */
	log?: boolean;
	/**
	 * Override specific method implementations. Un-overridden methods
	 * return undefined (no-op).
	 */
	methods?: Record<string, (...args: unknown[]) => unknown>;
}

export interface MockController {
	/** Log of invocations, in call order. */
	__calls: MockMethodCall[];
	/** The method overrides map, or null if none. */
	__methods: MockControllerOptions["methods"] | null;
	[method: string]: unknown;
}
