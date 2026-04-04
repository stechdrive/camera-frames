function countFractionDigitsFromTemplate(template = "") {
	const normalizedTemplate = String(template ?? "").trim();
	if (!normalizedTemplate) {
		return null;
	}
	const matchedNumber =
		normalizedTemplate.match(/[+-]?\d+(?:\.(\d+))?/) ??
		normalizedTemplate.match(/[+-]?\d*(?:\.(\d+))?/);
	if (!matchedNumber) {
		return null;
	}
	return matchedNumber[1]?.length ?? 0;
}

function countFractionDigitsFromStep(step = null) {
	if (step === null || step === undefined) {
		return null;
	}
	const normalizedStep = String(step).trim().toLowerCase();
	if (!normalizedStep || normalizedStep.includes("e")) {
		return null;
	}
	const decimalIndex = normalizedStep.indexOf(".");
	return decimalIndex >= 0 ? normalizedStep.length - decimalIndex - 1 : 0;
}

export function formatNumericDraftDisplayValue(
	numericValue,
	{ formatDisplayValue = null, template = "", step = null } = {},
) {
	if (!Number.isFinite(numericValue)) {
		return String(numericValue ?? "");
	}
	if (typeof formatDisplayValue === "function") {
		return String(formatDisplayValue(numericValue));
	}
	const templateText = String(template ?? "");
	const fractionDigits = Math.max(
		countFractionDigitsFromTemplate(templateText) ?? 0,
		countFractionDigitsFromStep(step) ?? 0,
	);
	const shouldPrefixPositive =
		templateText.trim().startsWith("+") && numericValue >= 0;
	const formattedNumber = Number(numericValue).toFixed(fractionDigits);
	return shouldPrefixPositive ? `+${formattedNumber}` : formattedNumber;
}
