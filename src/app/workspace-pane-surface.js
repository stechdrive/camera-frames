function resolveElement(value) {
	return value?.current ?? value ?? null;
}

function createFallbackRect() {
	return {
		left: 0,
		top: 0,
		right: 1,
		bottom: 1,
		width: 1,
		height: 1,
		x: 0,
		y: 0,
		toJSON() {
			return this;
		},
	};
}

/**
 * Presents a stable DOM-like surface whose event target stays fixed while its
 * geometry follows the currently active workspace pane. Spark PointerControls
 * only relies on this small surface contract, so it does not need to know about
 * the workspace layout or duplicate its listeners per pane.
 */
export function createActiveWorkspacePaneSurface({
	eventTarget,
	workspaceShell,
	getActivePaneElement,
}) {
	const getEventTarget = () => resolveElement(eventTarget);
	const getWorkspaceShell = () => resolveElement(workspaceShell);
	const getGeometryElement = () =>
		resolveElement(getActivePaneElement?.()) ??
		getWorkspaceShell() ??
		getEventTarget();

	return {
		addEventListener(...args) {
			return getEventTarget()?.addEventListener?.(...args);
		},
		removeEventListener(...args) {
			return getEventTarget()?.removeEventListener?.(...args);
		},
		setPointerCapture(pointerId) {
			return getEventTarget()?.setPointerCapture?.(pointerId);
		},
		releasePointerCapture(pointerId) {
			return getEventTarget()?.releasePointerCapture?.(pointerId);
		},
		getBoundingClientRect() {
			return (
				getGeometryElement()?.getBoundingClientRect?.() ?? createFallbackRect()
			);
		},
		focus(...args) {
			return getEventTarget()?.focus?.(...args);
		},
		contains(target) {
			return getEventTarget()?.contains?.(target) ?? false;
		},
		get clientWidth() {
			const element = getGeometryElement();
			return Math.max(
				Number(element?.clientWidth) ||
					Number(element?.getBoundingClientRect?.()?.width) ||
					1,
				1,
			);
		},
		get clientHeight() {
			const element = getGeometryElement();
			return Math.max(
				Number(element?.clientHeight) ||
					Number(element?.getBoundingClientRect?.()?.height) ||
					1,
				1,
			);
		},
		get parentElement() {
			return getWorkspaceShell()?.parentElement ?? null;
		},
		get style() {
			return getWorkspaceShell()?.style ?? getEventTarget()?.style;
		},
		get classList() {
			return getWorkspaceShell()?.classList ?? getEventTarget()?.classList;
		},
		get dataset() {
			return getWorkspaceShell()?.dataset ?? getEventTarget()?.dataset;
		},
	};
}
