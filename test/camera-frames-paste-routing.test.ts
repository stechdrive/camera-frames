import assert from "node:assert/strict";
import { getPastedReferenceImageFiles } from "../src/interactions/input/paste-routing.js";

const fixedNow = new Date(2026, 4, 1, 12, 34, 56);

{
	const sourceFile = new File([new Uint8Array([1, 2, 3])], "", {
		type: "image/png",
	});
	const files = getPastedReferenceImageFiles(
		{
			items: [
				{
					kind: "file",
					getAsFile: () => sourceFile,
				},
			],
		},
		{
			supportsReferenceImageFile: () => false,
			now: fixedNow,
		},
	);

	assert.equal(files.length, 1);
	assert.equal(files[0].name, "clipboard-20260501-123456.png");
	assert.equal(files[0].type, "image/png");
	assert.equal(files[0].size, sourceFile.size);
}

{
	const sourceFile = new File([new Uint8Array([1])], "board.png", {
		type: "",
	});
	const files = getPastedReferenceImageFiles(
		{
			items: [
				{
					kind: "file",
					getAsFile: () => sourceFile,
				},
			],
		},
		{
			supportsReferenceImageFile: (file) =>
				String(file?.name ?? "").endsWith(".png"),
			now: fixedNow,
		},
	);

	assert.equal(files.length, 1);
	assert.equal(files[0], sourceFile);
}

{
	const files = getPastedReferenceImageFiles(
		{
			items: [{ kind: "string", getAsFile: () => null }],
			files: [
				new File([new Uint8Array([2])], "fallback.png", {
					type: "image/png",
				}),
			],
		},
		{
			supportsReferenceImageFile: (file) =>
				String(file?.name ?? "").endsWith(".png"),
			now: fixedNow,
		},
	);

	assert.equal(files.length, 1);
	assert.equal(files[0].name, "fallback.png");
}

{
	const files = getPastedReferenceImageFiles(
		{
			files: [
				new File([new Uint8Array([1])], "", { type: "image/jpeg" }),
				new File([new Uint8Array([2])], "", { type: "image/webp" }),
			],
		},
		{
			supportsReferenceImageFile: () => false,
			now: fixedNow,
		},
	);

	assert.deepEqual(
		files.map((file) => file.name),
		["clipboard-20260501-123456.jpg", "clipboard-20260501-123456-2.webp"],
	);
}

console.log("✅ CAMERA_FRAMES paste routing tests passed!");
