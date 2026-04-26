export async function getDroppedFileSystemHandles(dataTransfer, fileCount) {
	const items = Array.from(dataTransfer?.items ?? []);
	if (items.length === 0) {
		return null;
	}
	const handlePromises = [];
	for (const item of items) {
		if (
			item?.kind !== "file" ||
			typeof item.getAsFileSystemHandle !== "function"
		) {
			continue;
		}
		handlePromises.push(
			item
				.getAsFileSystemHandle()
				.then((handle) =>
					handle?.kind === "file" && typeof handle.getFile === "function"
						? handle
						: null,
				)
				.catch(() => null),
		);
	}
	if (handlePromises.length === 0) {
		return null;
	}
	const handles = await Promise.all(handlePromises);
	return handles.length === fileCount ? handles : null;
}

export function partitionDroppedFiles(files, supportsReferenceImageFile) {
	const referenceImageFiles =
		typeof supportsReferenceImageFile === "function"
			? files.filter((file) => supportsReferenceImageFile(file))
			: [];
	const assetFiles =
		referenceImageFiles.length > 0
			? files.filter((file) => !referenceImageFiles.includes(file))
			: files;
	return {
		referenceImageFiles,
		assetFiles,
	};
}
