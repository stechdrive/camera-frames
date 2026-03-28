import * as splatTransform from "@playcanvas/splat-transform";
// Vite warns about the package's internal `new URL("webp.wasm", import.meta.url)`
// fallback, so we provide the wasm URL explicitly and use this adapter as the
// single source of truth for browser/worker runtime setup.
import webpWasmUrl from "@playcanvas/splat-transform/lib/webp.wasm?url";
import { PIXELFORMAT_BGRA8, Texture, WebgpuGraphicsDevice } from "playcanvas";

export {
	PIXELFORMAT_BGRA8,
	Texture,
	WebgpuGraphicsDevice,
	splatTransform,
	webpWasmUrl,
};
