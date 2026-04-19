// Docs-mode entry point. Served from /docs.html as a vite multi-page input
// so the main app shell never mounts here and state cannot leak across.
// See docs/help/FIXTURE_ROADMAP.md for the fixture system design.

import { html, render } from "htm/preact";
import { getFixture, listFixtureIds } from "./fixtures/index.js";

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
	return html`
		<div
			class="docs-stage"
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
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			globalThis.__DOCS_FIXTURE_READY = true;
			globalThis.__DOCS_FIXTURE_ID = fixtureId;
		});
	});
}

function mount() {
	const root = document.getElementById("docs-root");
	if (!root) return;
	const fixtureId = readParam("fixture", "");
	const lang = readParam("lang", DEFAULT_LANG);
	globalThis.__DOCS_FIXTURE_READY = false;
	globalThis.__DOCS_FIXTURE_ID = fixtureId;
	render(
		html`<${DocsStage} fixtureId=${fixtureId} lang=${lang} />`,
		root,
	);
	signalReady(fixtureId);
}

mount();
