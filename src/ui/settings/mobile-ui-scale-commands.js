import {
	clampMobileUiScale,
	writePersistedMobileUiUserScale,
} from "../mobile-ui-scale.js";

export function createMobileUiScaleCommands({ store }) {
	return {
		openMobileUiSettings() {
			store.mobileUi.settingsOpen.value = true;
		},
		closeMobileUiSettings() {
			store.mobileUi.settingsOpen.value = false;
		},
		toggleMobileUiSettings() {
			store.mobileUi.settingsOpen.value = !store.mobileUi.settingsOpen.value;
		},
		setMobileUiUserScale(rawValue) {
			const value = clampMobileUiScale(rawValue);
			store.mobileUi.userScale.value = value;
			writePersistedMobileUiUserScale(value);
		},
		resetMobileUiUserScale() {
			store.mobileUi.userScale.value = null;
			writePersistedMobileUiUserScale(null);
		},
	};
}
