import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { computeDropHintStyle } from "../src/ui/drop-hint-layout.js";

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCssRuleBodies(css, selector) {
	const bodies = [];
	const rulePattern = /(?<selectors>[^{}]+)\{(?<body>[^{}]*)\}/gm;
	for (const match of css.matchAll(rulePattern)) {
		const selectors =
			match.groups?.selectors
				?.split(",")
				.map((entry) => entry.trim())
				.filter(Boolean) ?? [];
		if (selectors.includes(selector) && match.groups?.body) {
			bodies.push(match.groups.body);
		}
	}
	assert.ok(bodies.length > 0, `missing CSS rule: ${selector}`);
	return bodies;
}

function getCssDeclaration(css, selector, property) {
	for (const body of getCssRuleBodies(css, selector)) {
		const match = body.match(
			new RegExp(`${escapeRegExp(property)}\\s*:\\s*(?<value>[^;]+);`),
		);
		if (match?.groups?.value) {
			return match.groups.value.trim();
		}
	}
	assert.fail(`missing ${property} in ${selector}`);
}

function getCssNumberDeclaration(css, selector, property) {
	const value = getCssDeclaration(css, selector, property);
	const parsed = Number.parseFloat(value);
	assert.ok(Number.isFinite(parsed), `${selector} ${property} is not numeric`);
	return parsed;
}

function readCssWithImports(url, seen = new Set()) {
	const key = url.href;
	if (seen.has(key)) return "";
	seen.add(key);
	const css = readFileSync(url, "utf8");
	return css.replace(/^@import\s+"(?<path>[^"]+)";\s*$/gm, (...args) => {
		const groups = args.at(-1);
		return readCssWithImports(new URL(groups.path, url), seen);
	});
}

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 0,
			top: 0,
			width: 1200,
			height: 800,
		},
		renderBoxRect: {
			left: 150,
			top: 120,
			width: 900,
			height: 500,
		},
	});
	assert.deepEqual(style, {
		left: "600px",
		top: "370px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 0,
			top: 0,
			width: 1280,
			height: 720,
		},
		renderBoxRect: null,
	});
	assert.deepEqual(style, {
		left: "640px",
		top: "360px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

{
	const style = computeDropHintStyle({
		viewportRect: {
			left: 12,
			top: 24,
			width: 1000,
			height: 600,
		},
		renderBoxRect: {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
		},
	});
	assert.deepEqual(style, {
		left: "512px",
		top: "324px",
		bottom: "auto",
		transform: "translate(-50%, -50%)",
	});
}

{
	const css = readCssWithImports(new URL("../app.css", import.meta.url));
	const backReferenceZ = getCssNumberDeclaration(
		css,
		".reference-image-layer--back",
		"z-index",
	);
	const frontReferenceZ = getCssNumberDeclaration(
		css,
		".reference-image-layer--front",
		"z-index",
	);
	const frameMaskZ = getCssNumberDeclaration(
		css,
		".frame-mask-layer",
		"z-index",
	);
	const renderBoxZ = getCssNumberDeclaration(css, ".render-box", "z-index");
	const referenceSelectionZ = getCssNumberDeclaration(
		css,
		".reference-image-selection-layer",
		"z-index",
	);

	assert.ok(backReferenceZ < frontReferenceZ);
	assert.ok(frontReferenceZ < frameMaskZ);
	assert.ok(frameMaskZ < renderBoxZ);
	assert.ok(frameMaskZ < referenceSelectionZ);
	assert.equal(
		getCssDeclaration(css, ".frame-mask-layer", "pointer-events"),
		"none",
	);
}

console.log("✅ CAMERA_FRAMES viewport shell tests passed!");
