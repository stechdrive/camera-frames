export function shouldUseMobileWorkbenchLayout({
	widthMatches = false,
	coarsePointerMatches = false,
	noHoverMatches = false,
} = {}) {
	return Boolean(widthMatches && coarsePointerMatches && noHoverMatches);
}

export function shouldUseCompactDesktopWorkbenchLayout({
	widthMatches = false,
	coarsePointerMatches = false,
	noHoverMatches = false,
} = {}) {
	return Boolean(widthMatches && !(coarsePointerMatches && noHoverMatches));
}
