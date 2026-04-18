import { helpJaMessages } from "./ja.js";

const TRANSLATIONS = {
	ja: helpJaMessages,
};

const FALLBACK_LANG = "ja";

export function translateHelp(lang, key) {
	const bundle = TRANSLATIONS[lang] ?? TRANSLATIONS[FALLBACK_LANG];
	const value = bundle?.[key];
	if (typeof value === "string") return value;
	return key;
}

export function getHelpSupportedLangs() {
	return Object.keys(TRANSLATIONS);
}
