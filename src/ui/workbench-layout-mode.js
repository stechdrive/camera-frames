export function shouldUseMobileWorkbenchLayout({
	widthMatches = false,
	coarseMatches = false,
	hoverNoneMatches = false,
} = {}) {
	return Boolean(widthMatches && coarseMatches && hoverNoneMatches);
}
