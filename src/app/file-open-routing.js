export function isProjectPackageFile(file) {
	return /\.ssproj$/i.test(String(file?.name ?? "").trim());
}

export function partitionOpenedFiles(
	files,
	{ supportsReferenceImageFile = () => false } = {},
) {
	const referenceFiles = [];
	const assetFiles = [];
	for (const file of files) {
		if (supportsReferenceImageFile(file)) {
			referenceFiles.push(file);
			continue;
		}
		assetFiles.push(file);
	}
	return {
		referenceFiles,
		assetFiles,
	};
}

export function createFileOpenRouting({
	openProjectSource,
	supportsReferenceImageFile,
	importDroppedFiles,
	importReferenceImageFiles,
	fallbackOpenFiles,
	setStatus,
} = {}) {
	async function importOpenedFiles(
		files,
		{ projectFileHandle = null, fileHandles = null } = {},
	) {
		if (!Array.isArray(files) || files.length === 0) {
			return;
		}

		if (files.length === 1 && isProjectPackageFile(files[0])) {
			const fileHandle =
				projectFileHandle ??
				(Array.isArray(fileHandles) &&
				fileHandles[0] &&
				typeof fileHandles[0].getFile === "function"
					? fileHandles[0]
					: null);
			await openProjectSource?.(files[0], {
				fileHandle,
			});
			return;
		}

		const { referenceFiles, assetFiles } = partitionOpenedFiles(files, {
			supportsReferenceImageFile,
		});

		if (assetFiles.length > 0) {
			await importDroppedFiles?.(assetFiles);
		}
		if (referenceFiles.length > 0) {
			await importReferenceImageFiles?.(referenceFiles);
		}
	}

	async function openFiles() {
		if (typeof globalThis.showOpenFilePicker === "function") {
			try {
				const fileHandles = await globalThis.showOpenFilePicker({
					multiple: true,
				});
				const files = await Promise.all(
					fileHandles.map((fileHandle) => fileHandle.getFile()),
				);
				const projectFileHandle =
					files.length === 1 && isProjectPackageFile(files[0])
						? fileHandles[0]
						: null;
				await importOpenedFiles(files, { projectFileHandle });
				return;
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}
				console.error(error);
				setStatus?.(error?.message ?? "");
				return;
			}
		}

		fallbackOpenFiles?.();
	}

	async function handleAssetInputChange(event) {
		const files = [...(event.currentTarget?.files ?? [])];
		if (files.length === 0) {
			return;
		}

		try {
			await importOpenedFiles(files);
		} finally {
			if (event.currentTarget) {
				event.currentTarget.value = "";
			}
		}
	}

	return {
		importOpenedFiles,
		openFiles,
		handleAssetInputChange,
	};
}
