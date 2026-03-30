import { html } from "htm/preact";

const iconModules = import.meta.glob("./svg/*.svg", {
	eager: true,
	query: "?raw",
	import: "default",
});

const SPRITE_HOST_ID = "workbench-icon-sprite-host";
let spriteMarkupCache = "";
let spriteMounted = false;

function escapeAttribute(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function getIconNameFromPath(path) {
	const match = path.match(/\/([^/]+)\.svg$/i);
	return match ? match[1] : null;
}

function normalizeSymbolAttributes(svgAttributes = "") {
	let attributes = svgAttributes
		.replace(/\s+xmlns(?::[\w-]+)?=(["']).*?\1/gi, "")
		.replace(/\s+width=(["']).*?\1/gi, "")
		.replace(/\s+height=(["']).*?\1/gi, "")
		.replace(/\s+viewBox=(["']).*?\1/gi, "")
		.replace(/\s+aria-hidden=(["']).*?\1/gi, "")
		.replace(/\s+focusable=(["']).*?\1/gi, "");

	const strokeWidthMatch = attributes.match(/\sstroke-width=(["'])(.*?)\1/i);
	const defaultStrokeWidth = strokeWidthMatch?.[2]?.trim() || "1.8";
	attributes = attributes.replace(
		/\sstroke-width=(["']).*?\1/gi,
		` stroke-width="var(--workbench-icon-stroke-width, ${escapeAttribute(defaultStrokeWidth)})"`,
	);

	if (!/\sfill=/i.test(attributes)) {
		attributes += ' fill="none"';
	}
	if (!/\sstroke=/i.test(attributes)) {
		attributes += ' stroke="currentColor"';
	}
	if (!/\sstroke-width=/i.test(attributes)) {
		attributes += ' stroke-width="var(--workbench-icon-stroke-width, 1.8)"';
	}
	if (!/\sstroke-linecap=/i.test(attributes)) {
		attributes += ' stroke-linecap="round"';
	}
	if (!/\sstroke-linejoin=/i.test(attributes)) {
		attributes += ' stroke-linejoin="round"';
	}

	return attributes.trim();
}

function convertSvgFileToSymbol(name, rawSvg) {
	const match = rawSvg.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);
	if (!match) {
		return "";
	}
	const [, attributeSource, innerMarkup] = match;
	const viewBoxMatch = attributeSource.match(/\sviewBox=(["'])(.*?)\1/i);
	const viewBox = viewBoxMatch?.[2] || "0 0 24 24";
	const symbolAttributes = normalizeSymbolAttributes(attributeSource);
	return `<symbol id="${escapeAttribute(name)}" viewBox="${escapeAttribute(viewBox)}"${symbolAttributes ? ` ${symbolAttributes}` : ""}>${innerMarkup.trim()}</symbol>`;
}

function buildSpriteMarkup() {
	const symbols = Object.entries(iconModules)
		.map(([path, rawSvg]) => [getIconNameFromPath(path), rawSvg])
		.filter(([name, rawSvg]) => Boolean(name) && typeof rawSvg === "string")
		.map(([name, rawSvg]) => convertSvgFileToSymbol(name, rawSvg))
		.filter(Boolean)
		.join("");
	return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
}

function ensureWorkbenchIconSpriteMounted() {
	if (spriteMounted || typeof document === "undefined") {
		return;
	}
	if (!spriteMarkupCache) {
		spriteMarkupCache = buildSpriteMarkup();
	}
	let host = document.getElementById(SPRITE_HOST_ID);
	if (!host) {
		host = document.createElement("div");
		host.id = SPRITE_HOST_ID;
		host.setAttribute("aria-hidden", "true");
		host.style.position = "absolute";
		host.style.width = "0";
		host.style.height = "0";
		host.style.overflow = "hidden";
		host.style.pointerEvents = "none";
		host.style.opacity = "0";
		host.innerHTML = spriteMarkupCache;
		document.body.prepend(host);
	}
	spriteMounted = true;
}

export function WorkbenchIcon({
	name,
	className = "",
	size = 16,
	strokeWidth = 1.8,
}) {
	ensureWorkbenchIconSpriteMounted();
	const classes = ["workbench-icon"];
	if (className) {
		classes.push(className);
	}
	return html`
		<svg
			class=${classes.join(" ")}
			width=${size}
			height=${size}
			viewBox="0 0 24 24"
			style=${{ "--workbench-icon-stroke-width": String(strokeWidth) }}
			aria-hidden="true"
			focusable="false"
		>
			<use href=${`#${name || "camera-frames"}`}></use>
		</svg>
	`;
}
