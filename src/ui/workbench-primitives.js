import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { WorkbenchIcon } from "./workbench-icons.js";

export function TooltipBubble({
	title,
	description = "",
	shortcut = "",
	placement = "right",
}) {
	if (!title && !description && !shortcut) {
		return null;
	}

	return html`
		<span class=${`workbench-tooltip workbench-tooltip--${placement}`}>
			${title && html`<strong class="workbench-tooltip__title">${title}</strong>`}
			${
				description &&
				html`<span class="workbench-tooltip__description">${description}</span>`
			}
			${
				shortcut &&
				html`
					<span class="workbench-tooltip__shortcut">
						<kbd>${shortcut}</kbd>
					</span>
				`
			}
		</span>
	`;
}

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
								? "workbench-tab workbench-tab--active workbench-tab--tooltip"
								: "workbench-tab workbench-tab--tooltip"
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
						<${TooltipBubble}
							title=${tab.tooltip?.title ?? tab.label}
							description=${tab.tooltip?.description ?? ""}
							shortcut=${tab.tooltip?.shortcut ?? ""}
							placement=${tab.tooltip?.placement ?? "bottom"}
						/>
					</button>
				`,
			)}
		</div>
	`;
}

export function HeaderWordmark({ title, compact = false }) {
	return html`
		<div class=${compact ? "panel-header__brand panel-header__brand--compact" : "panel-header__brand"}>
			<h1>${title}</h1>
		</div>
	`;
}

export function HeaderMenu({
	icon = "menu",
	label,
	items = [],
	children,
	tooltip = null,
}) {
	const visibleItems = items.filter(Boolean);
	const [open, setOpen] = useState(false);
	const detailsRef = useRef(null);

	useEffect(() => {
		if (!open) {
			return undefined;
		}

		const handlePointerDown = (event) => {
			if (!detailsRef.current?.contains(event.target)) {
				setOpen(false);
			}
		};

		const handleFocusIn = (event) => {
			if (!detailsRef.current?.contains(event.target)) {
				setOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		document.addEventListener("focusin", handleFocusIn);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
			document.removeEventListener("focusin", handleFocusIn);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	return html`
		<details
			ref=${detailsRef}
			class="workbench-menu"
			open=${open}
			onToggle=${(event) => setOpen(Boolean(event.currentTarget.open))}
		>
			<summary
				class="workbench-menu__trigger workbench-menu__trigger--tooltip"
				aria-label=${label}
			>
				<${WorkbenchIcon} name=${icon} size=${16} />
				<${TooltipBubble}
					title=${tooltip?.title ?? label}
					description=${tooltip?.description ?? ""}
					shortcut=${tooltip?.shortcut ?? ""}
					placement=${tooltip?.placement ?? "right"}
				/>
			</summary>
			<div class="workbench-menu__panel">
				${children}
				${visibleItems.map(
					(item) => html`
						<button
							key=${item.id ?? item.label}
							type="button"
							class=${
								item.destructive
									? "workbench-menu__item workbench-menu__item--destructive"
									: "workbench-menu__item"
							}
							onClick=${(event) => {
								setOpen(false);
								item.onClick?.();
							}}
						>
							${
								item.icon &&
								html`
									<span class="workbench-menu__item-icon">
										<${WorkbenchIcon} name=${item.icon} size=${14} />
									</span>
								`
							}
							<span>${item.label}</span>
						</button>
					`,
				)}
			</div>
		</details>
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
	tooltip = null,
}) {
	const classes = [
		"button",
		"button--icon",
		"button--tooltip",
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
			disabled=${disabled}
			onClick=${onClick}
		>
			<${WorkbenchIcon} name=${icon} size=${15} />
			<${TooltipBubble}
				title=${tooltip?.title ?? label}
				description=${tooltip?.description ?? ""}
				shortcut=${tooltip?.shortcut ?? ""}
				placement=${tooltip?.placement ?? "bottom"}
			/>
		</button>
	`;
}

export function DisclosureBlock({ icon, label, children, open = false }) {
	return html`
		<details class="panel-disclosure" open=${open}>
			<summary class="panel-disclosure__summary">
				<span class="panel-disclosure__summary-main">
					${
						icon &&
						html`
							<span class="panel-disclosure__icon">
								<${WorkbenchIcon} name=${icon} size=${14} />
							</span>
						`
					}
					<span>${label}</span>
				</span>
				<span class="panel-disclosure__chevron">
					<${WorkbenchIcon} name="chevron-right" size=${12} />
				</span>
			</summary>
			<div class="panel-disclosure__body">${children}</div>
		</details>
	`;
}
