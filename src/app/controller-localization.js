import { translate } from "../i18n.js";

export function createControllerLocalization({ store }) {
	function currentLocale() {
		return store.locale.value;
	}

	function t(key, params) {
		return translate(currentLocale(), key, params);
	}

	function formatNumber(value, digits = 2) {
		return Number(value).toFixed(digits);
	}

	return {
		currentLocale,
		t,
		formatNumber,
	};
}
