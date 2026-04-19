// Docs-mode entry point. Served from /docs.html as a vite multi-page input
// so the main app shell never mounts here and state cannot leak across.
// See docs/help/FIXTURE_ROADMAP.md for the fixture system design.

import { html, render } from "htm/preact";
import { getFixture, listFixtureIds } from "./fixtures/index.js";
// Side-effect import: registers browser-only fixtures (e.g. wrappers around
// real UI sections that depend on vite's import.meta.glob). Tests running
// under plain Node must import fixtures/index.js only.
import "./fixtures/index-browser.js";

const DEFAULT_LANG = "ja";

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

function DocsStage({ fixtureId, lang }) {
	const fixture = getFixture(fixtureId);
	if (!fixture) {
		return html`<${MissingFixture}
			fixtureId=${fixtureId}
			available=${listFixtureIds()}
		/>`;
	}
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
			${fixture.mount({ lang })}
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
