import { html } from "htm/preact";

/** @type {import("../types").Fixture} */
export const helloFixture = {
	id: "hello",
	type: "panel",
	title: "Hello docs fixture",
	mount: ({ lang }) => html`
		<div class="docs-hello">
			<h1>Hello, docs fixture.</h1>
			<p>
				Phase I skeleton. Fixture id: <code>hello</code>, lang: <code>${lang}</code>.
			</p>
			<p>
				This placeholder exists to verify that the docs.html multi-page
				entry boots independently of the main app shell. Real fixtures
				land in later PRs (see <code>docs/help/FIXTURE_ROADMAP.md</code>).
			</p>
		</div>
	`,
};
