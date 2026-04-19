// Docs-mode entry point. Served from /docs.html as a vite multi-page input
// so the main app shell never mounts here and state cannot leak across.
// See docs/help/FIXTURE_ROADMAP.md for the fixture system design.

import { html, render } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { getFixture, listFixtureIds } from "./fixtures/index.js";
// Side-effect import: registers browser-only fixtures (e.g. wrappers around
// real UI sections that depend on vite's import.meta.glob). Tests running
// under plain Node must import fixtures/index.js only.
import "./fixtures/index-browser.js";

const DEFAULT_LANG = "ja";

// Tiny inline CSS for annotation overlay inside the fixture stage. The
// main app's docs-annotation.css uses `position: fixed` because the
// overlay is painted on top of the whole viewport; fixtures need it
// confined to `.docs-stage` so domToPng includes the badges in the
// capture bounds.
const ANNOTATION_CSS = `
.docs-stage { position: relative; }
.docs-stage > .docs-annotation-overlay {
	position: absolute;
	inset: 0;
	z-index: 2000;
	pointer-events: none;
}
.docs-stage > .docs-annotation-overlay > .docs-annotation {
	position: absolute;
	transform: translate(-50%, -50%);
	background: rgba(255, 190, 70, 0.97);
	color: #121417;
	width: 26px;
	height: 26px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.82rem;
	font-weight: 700;
	line-height: 1;
	box-shadow:
		0 0 0 2px rgba(255, 255, 255, 0.95),
		0 2px 6px rgba(0, 0, 0, 0.6);
	font-variant-numeric: tabular-nums;
}
.docs-stage > .docs-annotation-overlay > .docs-annotation--missing {
	background: rgba(255, 70, 70, 0.95);
	color: #fff;
}
`;

function MissingFixture({ fixtureId, available }) {
	return html`
		<div class="docs-missing">
			<h1>Fixture not found</h1>
			<p>Requested id: <code>${fixtureId || "(none)"}</code></p>
			<p>Known fixtures:</p>
			<ul>
				${available.map(
					(id) => html`
						<li key=${id}>
							<a href=${`?fixture=${encodeURIComponent(id)}`}>${id}</a>
						</li>
					`,
				)}
			</ul>
		</div>
	`;
}

function AnnotationLayer({ annotations }) {
	const [resolved, setResolved] = useState([]);
	useEffect(() => {
		if (!Array.isArray(annotations) || annotations.length === 0) {
			setResolved([]);
			return;
		}
		const stage = document.querySelector(".docs-stage");
		if (!stage) {
			setResolved([]);
			return;
		}
		const stageRect = stage.getBoundingClientRect();
		const next = annotations.map((annotation) => {
			const target = annotation.selector
				? stage.querySelector(annotation.selector)
				: null;
			if (!target) {
				return {
					n: annotation.n,
					label: annotation.label ?? "",
					selector: annotation.selector ?? "",
					x: 8,
					y: 8,
					missing: true,
				};
			}
			const rect = target.getBoundingClientRect();
			return {
				n: annotation.n,
				label: annotation.label ?? "",
				selector: annotation.selector,
				x: rect.left + rect.width / 2 - stageRect.left,
				y: rect.top + rect.height / 2 - stageRect.top,
				missing: false,
			};
		});
		setResolved(next);
	}, [annotations]);
	if (resolved.length === 0) return null;
	return html`
		<div class="docs-annotation-overlay" aria-hidden="true">
			${resolved.map(
				(annotation) => html`
					<span
						key=${`${annotation.n}:${annotation.selector}`}
						class=${
							annotation.missing
								? "docs-annotation docs-annotation--missing"
								: "docs-annotation"
						}
						style=${{
							left: `${annotation.x}px`,
							top: `${annotation.y}px`,
						}}
						title=${annotation.missing
							? `${annotation.label} (selector not found: ${annotation.selector})`
							: annotation.label}
					>
						${annotation.n}
					</span>
				`,
			)}
		</div>
	`;
}

function DocsStage({ fixtureId, lang }) {
	const fixture = getFixture(fixtureId);
	if (!fixture) {
		return html`<${MissingFixture}
			fixtureId=${fixtureId}
			available=${listFixtureIds()}
		/>`;
	}
	const annotations = Array.isArray(fixture.annotations)
		? fixture.annotations
		: [];
	// inline-block so the capture pipeline's domToPng crops to the fixture's
	// natural content size — a default block-level div would span the full
	// iframe viewport and pad captures with dead space on the right and below.
	return html`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${fixtureId}
			data-fixture-type=${fixture.type}
			data-lang=${lang}
		>
			<style>${ANNOTATION_CSS}</style>
			${fixture.mount({ lang })}
			${annotations.length > 0 && html`<${AnnotationLayer} annotations=${annotations}/>`}
		</div>
	`;
}

function readParam(name, fallback) {
	try {
		const value = new URL(globalThis.location.href).searchParams.get(name);
		return value === null ? fallback : value;
	} catch {
		return fallback;
	}
}

function signalReady(fixtureId) {
	let done = false;
	const finish = () => {
		if (done) return;
		done = true;
		globalThis.__DOCS_FIXTURE_READY = true;
		globalThis.__DOCS_FIXTURE_ID = fixtureId;
	};
	// Fast path: visible tabs get a ~32ms ready after two rAFs so layout
	// and first paint have settled.
	requestAnimationFrame(() => {
		requestAnimationFrame(finish);
	});
	// Fallback: backgrounded / hidden tabs (e.g. Claude Preview running
	// the browser off-screen) can throttle rAF down to 0 Hz, leaving the
	// signal stuck forever. setTimeout remains callable under heavy
	// throttling (clamped to ~1s in hidden tabs) and still gives capture
	// pipelines a bounded wait.
	setTimeout(finish, 100);
}

function mount() {
	const root = document.getElementById("docs-root");
	if (!root) return;
	const fixtureId = readParam("fixture", "");
	const lang = readParam("lang", DEFAULT_LANG);
	globalThis.__DOCS_FIXTURE_READY = false;
	globalThis.__DOCS_FIXTURE_ID = fixtureId;
	// Expose the full id list for cross-frame introspection (the capture
	// pipeline opens /docs.html in an iframe and reads this to know what
	// to iterate). Populated after index-browser.js side-effect imports
	// run at module top, so the list includes browser-only fixtures.
	globalThis.__DOCS_FIXTURE_IDS = listFixtureIds();
	render(
		html`<${DocsStage} fixtureId=${fixtureId} lang=${lang} />`,
		root,
	);
	signalReady(fixtureId);
}

mount();
