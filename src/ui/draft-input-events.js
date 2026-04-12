export function isDraftInputCompositionActive(
	event,
	fallbackComposing = false,
) {
	const nativeEvent = event?.nativeEvent ?? event;
	return (
		Boolean(fallbackComposing) ||
		nativeEvent?.isComposing === true ||
		nativeEvent?.keyCode === 229
	);
}
