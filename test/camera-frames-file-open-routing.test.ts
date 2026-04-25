import assert from "node:assert/strict";
import {
	createFileOpenRouting,
	isProjectPackageFile,
	partitionOpenedFiles,
} from "../src/app/file-open-routing.js";

assert.equal(isProjectPackageFile({ name: "test.ssproj" }), true);
assert.equal(isProjectPackageFile({ name: "TEST.SSPROJ" }), true);
assert.equal(isProjectPackageFile({ name: "scene.glb" }), false);
assert.deepEqual(
	partitionOpenedFiles(
		[{ name: "scene.glb" }, { name: "board.png" }, { name: "capture.psd" }],
		{
			supportsReferenceImageFile: (file) =>
				[".png", ".psd"].some((extension) =>
					String(file.name).toLowerCase().endsWith(extension),
				),
		},
	),
	{
		referenceFiles: [{ name: "board.png" }, { name: "capture.psd" }],
		assetFiles: [{ name: "scene.glb" }],
	},
);

{
	const calls = [];
	const routing = createFileOpenRouting({
		openProjectSource: async (file, options) => {
			calls.push(["open-project", file.name, options.fileHandle?.id ?? null]);
		},
		supportsReferenceImageFile: (file) => file.name.endsWith(".png"),
		importDroppedFiles: async (files) => {
			calls.push(["import-assets", files.map((file) => file.name)]);
		},
		importReferenceImageFiles: async (files) => {
			calls.push(["import-references", files.map((file) => file.name)]);
		},
	});

	await routing.importOpenedFiles([{ name: "shot.ssproj" }], {
		projectFileHandle: { id: "handle-a" },
	});
	await routing.importOpenedFiles([{ name: "dropped.ssproj" }], {
		fileHandles: [{ id: "drop-handle", getFile: async () => ({}) }],
	});
	await routing.importOpenedFiles([
		{ name: "scene.glb" },
		{ name: "board.png" },
		{ name: "mesh.gltf" },
	]);

	assert.deepEqual(calls, [
		["open-project", "shot.ssproj", "handle-a"],
		["open-project", "dropped.ssproj", "drop-handle"],
		["import-assets", ["scene.glb", "mesh.gltf"]],
		["import-references", ["board.png"]],
	]);
}

{
	const originalPicker = globalThis.showOpenFilePicker;
	const errors = [];
	const originalConsoleError = console.error;
	console.error = (error) => errors.push(error);
	try {
		const calls = [];
		const projectHandle = {
			id: "picker-project",
			getFile: async () => ({ name: "camera.ssproj" }),
		};
		globalThis.showOpenFilePicker = async () => [projectHandle];

		const routing = createFileOpenRouting({
			openProjectSource: async (file, options) => {
				calls.push(["open-project", file.name, options.fileHandle?.id ?? null]);
			},
			setStatus: (message) => {
				calls.push(["status", message]);
			},
		});

		await routing.openFiles();

		assert.deepEqual(calls, [
			["open-project", "camera.ssproj", "picker-project"],
		]);
		assert.equal(errors.length, 0);
	} finally {
		console.error = originalConsoleError;
		globalThis.showOpenFilePicker = originalPicker;
	}
}

{
	const originalPicker = globalThis.showOpenFilePicker;
	try {
		const calls = [];
		globalThis.showOpenFilePicker = async () => {
			const error = new Error("cancelled");
			error.name = "AbortError";
			throw error;
		};

		const routing = createFileOpenRouting({
			fallbackOpenFiles: () => calls.push(["fallback"]),
			setStatus: (message) => calls.push(["status", message]),
		});

		await routing.openFiles();
		assert.deepEqual(calls, []);
	} finally {
		globalThis.showOpenFilePicker = originalPicker;
	}
}

{
	const originalPicker = globalThis.showOpenFilePicker;
	const originalConsoleError = console.error;
	const errors = [];
	console.error = (error) => errors.push(error);
	try {
		const calls = [];
		globalThis.showOpenFilePicker = async () => {
			throw new Error("picker failed");
		};

		const routing = createFileOpenRouting({
			setStatus: (message) => calls.push(["status", message]),
		});

		await routing.openFiles();

		assert.equal(errors.length, 1);
		assert.deepEqual(calls, [["status", "picker failed"]]);
	} finally {
		console.error = originalConsoleError;
		globalThis.showOpenFilePicker = originalPicker;
	}
}

{
	const originalPicker = globalThis.showOpenFilePicker;
	try {
		globalThis.showOpenFilePicker = undefined;
		const calls = [];
		const routing = createFileOpenRouting({
			fallbackOpenFiles: () => calls.push(["fallback"]),
		});

		await routing.openFiles();
		assert.deepEqual(calls, [["fallback"]]);
	} finally {
		if (originalPicker) {
			globalThis.showOpenFilePicker = originalPicker;
		}
	}
}

{
	const calls = [];
	const routing = createFileOpenRouting({
		importDroppedFiles: async (files) => {
			calls.push(["import-assets", files.map((file) => file.name)]);
		},
	});
	const input = {
		files: [{ name: "scene.glb" }],
		value: "filled",
	};

	await routing.handleAssetInputChange({
		currentTarget: input,
	});

	assert.deepEqual(calls, [["import-assets", ["scene.glb"]]]);
	assert.equal(input.value, "");
}

console.log("✅ CAMERA_FRAMES file open routing tests passed!");
