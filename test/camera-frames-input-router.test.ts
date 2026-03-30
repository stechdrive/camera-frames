import assert from "node:assert/strict";
import { isNativeHistoryTarget } from "../src/interactions/input-router.js";

function createClosestTarget(matches: Record<string, unknown>) {
	return {
		closest(selector: string) {
			for (const [pattern, value] of Object.entries(matches)) {
				if (selector.includes(pattern)) {
					return value;
				}
			}
			return null;
		},
	};
}

{
	const target = createClosestTarget({
		'input[data-draft-editing="true"]': {},
	});
	assert.equal(isNativeHistoryTarget(target), true);
}

{
	const target = createClosestTarget({
		textarea: {},
	});
	assert.equal(isNativeHistoryTarget(target), true);
}

{
	const target = createClosestTarget({
		'input[type="text"]': {},
	});
	assert.equal(isNativeHistoryTarget(target), false);
}

{
	const target = createClosestTarget({});
	assert.equal(isNativeHistoryTarget(target), false);
	assert.equal(isNativeHistoryTarget(null), false);
	assert.equal(isNativeHistoryTarget(undefined), false);
	assert.equal(isNativeHistoryTarget({}), false);
}

console.log("✅ CAMERA_FRAMES input router tests passed!");
