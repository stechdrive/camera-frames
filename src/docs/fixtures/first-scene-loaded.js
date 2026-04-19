// Viewport fixture: an empty-chrome viewport with a pre-rendered splat
// backdrop, representing "project just loaded, no tool overlays yet".
// Uses the cf-test2 backdrop captured via Phase IV's /__backdrop
// endpoint. This is the first fixture to exercise the backdrop system;
// later viewport fixtures (render-box, gizmos, trajectory) will mount
// the same backdrop plus the real DOM overlays on top.

import { html } from "htm/preact";
import { makeScene } from "../mock/scenes.js";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 560;

const STYLE = `
.docs-viewport-host {
	position: relative;
	width: ${VIEWPORT_WIDTH}px;
	height: ${VIEWPORT_HEIGHT}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
`;

/** @type {import("../types").Fixture} */
export const firstSceneLoadedFixture = {
	id: "first-scene-loaded",
	type: "viewport",
	title: "Viewport after first scene load",
	mount: () => {
		const scene = makeScene("cf-test2-default");
		return html`
			<div class="docs-viewport-host">
				<style>${STYLE}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${scene.backdropUrl}
					alt=${scene.description ?? "viewport backdrop"}
				/>
			</div>
		`;
	},
};
