import { html } from "htm/preact";
import { WorkbenchIcon } from "./workbench-icons.js";

export function SectionHeading({ icon, title, children }) {
	return html`
		<div class="section-heading">
			<div class="section-heading__title">
				${
					icon &&
					html`
						<span class="section-heading__icon">
							<${WorkbenchIcon} name=${icon} size=${14} />
						</span>
					`
				}
				<h2>${title}</h2>
			</div>
			${children && html`<div class="section-heading__meta">${children}</div>`}
		</div>
	`;
}

export function WorkbenchTabs({ tabs, activeTab, setActiveTab, ariaLabel }) {
	return html`
		<div class="workbench-tabs" role="tablist" aria-label=${ariaLabel}>
			${tabs.map(
				(tab) => html`
					<button
						key=${tab.id}
						type="button"
						role="tab"
						aria-selected=${activeTab === tab.id}
						class=${
							activeTab === tab.id
								? "workbench-tab workbench-tab--active"
								: "workbench-tab"
						}
						onClick=${() => setActiveTab(tab.id)}
					>
						<span class="workbench-tab__content">
							${
								tab.icon &&
								html`
								<span class="workbench-tab__icon">
									<${WorkbenchIcon} name=${tab.icon} size=${14} />
								</span>
							`
							}
							<span>${tab.label}</span>
						</span>
					</button>
				`,
			)}
		</div>
	`;
}

export function HeaderWordmark({ title, compact = false }) {
	return html`
		<div class=${compact ? "panel-header__brand panel-header__brand--compact" : "panel-header__brand"}>
			<span class="panel-header__brand-mark">
				<${WorkbenchIcon} name="camera-frames" size=${compact ? 16 : 18} />
			</span>
			<h1>${title}</h1>
		</div>
	`;
}

export function IconButton({
	icon,
	label,
	active = false,
	compact = false,
	disabled = false,
	className = "",
	id,
	onClick,
	type = "button",
}) {
	const classes = [
		"button",
		"button--icon",
		compact ? "button--compact" : "",
		active ? "button--primary" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");
	return html`
		<button
			id=${id}
			type=${type}
			class=${classes}
			aria-label=${label}
			title=${label}
			disabled=${disabled}
			onClick=${onClick}
		>
			<${WorkbenchIcon} name=${icon} size=${15} />
		</button>
	`;
}
