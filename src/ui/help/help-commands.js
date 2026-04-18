export function createHelpCommands({ store }) {
	return {
		openHelp(options = {}) {
			const { sectionId, anchor } = options || {};
			if (typeof sectionId === "string" && sectionId !== "") {
				store.help.sectionId.value = sectionId;
			}
			if (anchor !== undefined) {
				store.help.anchor.value = anchor;
			}
			store.help.open.value = true;
		},
		closeHelp() {
			store.help.open.value = false;
		},
		toggleHelp() {
			store.help.open.value = !store.help.open.value;
		},
		setHelpSection(sectionId) {
			if (typeof sectionId !== "string" || sectionId === "") return;
			store.help.sectionId.value = sectionId;
			store.help.anchor.value = null;
		},
		setHelpAnchor(anchor) {
			store.help.anchor.value = anchor ?? null;
		},
		setHelpSearchQuery(query) {
			store.help.searchQuery.value = String(query ?? "");
		},
		setHelpLang(lang) {
			if (typeof lang !== "string" || lang === "") return;
			store.help.lang.value = lang;
		},
	};
}
