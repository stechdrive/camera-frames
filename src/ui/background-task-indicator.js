import { html } from "htm/preact";

function formatAutoLodMessage(task, t) {
	const label = task?.label ?? "3DGS";
	const current = Number.isFinite(task?.current) ? task.current : 0;
	const total = Number.isFinite(task?.total) ? task.total : 0;
	if (task?.status === "done") {
		return t("backgroundTask.autoLodDone");
	}
	if (task?.status === "failed") {
		return t("backgroundTask.autoLodFailed");
	}
	if (total > 1) {
		return t("backgroundTask.autoLodRunningMulti", {
			current: Math.min(total, current + 1),
			total,
			name: label,
		});
	}
	return t("backgroundTask.autoLodRunningSingle", { name: label });
}

function renderAutoLodIcon(task) {
	if (task?.status === "done") {
		return html`<span class="background-task-pill__icon background-task-pill__icon--done">✓</span>`;
	}
	if (task?.status === "failed") {
		return html`<span class="background-task-pill__icon background-task-pill__icon--failed">⚠</span>`;
	}
	return html`<span
		class="background-task-pill__icon background-task-pill__icon--spin"
		aria-hidden="true"
	></span>`;
}

export function BackgroundTaskIndicator({ store, t }) {
	const task = store?.backgroundTask?.value;
	if (!task) {
		return null;
	}

	let modifier = "";
	let message = "";
	let icon = null;
	if (task.kind === "auto-lod") {
		modifier =
			task.status === "failed"
				? "background-task-pill--failed"
				: task.status === "done"
					? "background-task-pill--done"
					: "background-task-pill--running";
		message = formatAutoLodMessage(task, t);
		icon = renderAutoLodIcon(task);
	} else {
		// Unknown kind — render a neutral running pill if there's a label.
		if (!task.label) {
			return null;
		}
		modifier = "background-task-pill--running";
		message = task.label;
		icon = renderAutoLodIcon({ status: "running" });
	}

	return html`
		<div
			class=${`background-task-pill ${modifier}`}
			role="status"
			aria-live="polite"
		>
			${icon}
			<span class="background-task-pill__message">${message}</span>
		</div>
	`;
}
