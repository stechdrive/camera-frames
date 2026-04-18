import {
	createShotCameraDocument,
	getNextShotCameraNumber,
	getShotCameraDocumentId,
} from "../../workspace-model.js";

export function createCameraDocumentOpsController({
	store,
	shotCameraRegistry,
	runHistoryAction,
	updateUi,
	setStatus,
	t,
	setShotCameraDocuments,
	syncShotCameraEntryFromDocument,
	syncActiveShotCameraDocumentFromLiveCamera,
	placeCameraAtHome,
	copyPose,
	getActiveShotCameraDocument,
	getActiveShotCameraEntry,
	beforeActiveShotCameraChange = null,
	afterActiveShotCameraChange = null,
	clearFrameDrag,
	clearOutputFramePan,
	clearControlMomentum,
}) {
	function buildShotCameraDocumentName(nextNumber) {
		return t("shotCamera.defaultName", { index: nextNumber });
	}

	function createWorkspaceShotCameraDocument(sourceDocument = null) {
		const nextNumber = getNextShotCameraNumber(
			store.workspace.shotCameras.value,
		);
		return createShotCameraDocument({
			id: getShotCameraDocumentId(nextNumber),
			name: buildShotCameraDocumentName(nextNumber),
			source: sourceDocument,
		});
	}

	function createShotCamera() {
		const nextDocument = createWorkspaceShotCameraDocument();
		runHistoryAction?.("camera.create", () => {
			setShotCameraDocuments([
				...store.workspace.shotCameras.value,
				nextDocument,
			]);

			const entry = shotCameraRegistry.get(nextDocument.id);
			if (entry) {
				placeCameraAtHome(entry.camera, "camera");
				syncShotCameraEntryFromDocument(entry);
			}

			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextDocument.id;
			syncActiveShotCameraDocumentFromLiveCamera();
			clearFrameDrag();
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
		setStatus(
			t("status.createdShotCamera", {
				name: nextDocument.name,
			}),
		);
	}

	function duplicateActiveShotCamera() {
		const activeDocument = getActiveShotCameraDocument();
		const activeEntry = getActiveShotCameraEntry();
		if (!activeDocument || !activeEntry) {
			createShotCamera();
			return;
		}

		const nextDocument = createWorkspaceShotCameraDocument(activeDocument);
		runHistoryAction?.("camera.duplicate", () => {
			setShotCameraDocuments([
				...store.workspace.shotCameras.value,
				nextDocument,
			]);

			const entry = shotCameraRegistry.get(nextDocument.id);
			if (entry) {
				copyPose(activeEntry.camera, entry.camera);
				syncShotCameraEntryFromDocument(entry);
			}

			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextDocument.id;
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
		setStatus(
			t("status.duplicatedShotCamera", {
				name: nextDocument.name,
			}),
		);
	}

	function deleteActiveShotCamera() {
		const activeDocument = getActiveShotCameraDocument();
		if (!activeDocument || store.workspace.shotCameras.value.length <= 1) {
			return;
		}

		const currentDocuments = store.workspace.shotCameras.value;
		const activeIndex = currentDocuments.findIndex(
			(documentState) => documentState.id === activeDocument.id,
		);
		const nextDocuments = currentDocuments.filter(
			(documentState) => documentState.id !== activeDocument.id,
		);
		const nextActiveDocument =
			nextDocuments[Math.min(activeIndex, nextDocuments.length - 1)] ??
			nextDocuments[0] ??
			null;
		if (!nextActiveDocument) {
			return;
		}

		runHistoryAction?.("camera.delete", () => {
			setShotCameraDocuments(nextDocuments);
			beforeActiveShotCameraChange?.(
				store.workspace.activeShotCameraId.value,
				nextActiveDocument.id,
			);
			store.workspace.activeShotCameraId.value = nextActiveDocument.id;
			clearFrameDrag();
			clearOutputFramePan();
			clearControlMomentum();
			updateUi();
			afterActiveShotCameraChange?.(
				nextActiveDocument.id,
				store.workspace.activeShotCameraId.value,
			);
		});
		setStatus(
			t("status.deletedShotCamera", {
				name: activeDocument.name,
			}),
		);
	}

	return {
		createShotCamera,
		duplicateActiveShotCamera,
		deleteActiveShotCamera,
	};
}
