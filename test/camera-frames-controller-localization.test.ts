import assert from "node:assert/strict";
import { createControllerLocalization } from "../src/app/controller-localization.js";

{
	const store = {
		locale: { value: "en" },
	};
	const localization = createControllerLocalization({ store });

	assert.equal(localization.currentLocale(), "en");
	assert.equal(localization.t("action.openFiles"), "Open…");
	assert.equal(localization.formatNumber(1.2345), "1.23");
	assert.equal(localization.formatNumber(1.2345, 1), "1.2");
}

{
	const store = {
		locale: { value: "ja" },
	};
	const localization = createControllerLocalization({ store });

	assert.equal(localization.t("action.openFiles"), "開く...");
}

console.log("✅ CAMERA_FRAMES controller localization tests passed!");
