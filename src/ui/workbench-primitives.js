import { html } from "htm/preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import { WorkbenchIcon } from "./workbench-icons.js";

const TOOLTIP_GAP_PX = 10;
const TOOLTIP_VIEWPORT_MARGIN_PX = 10;

function getTooltipViewportPosition(triggerRect, tooltipRect, placement) {
	let left = triggerRect.left;
	let top = triggerRect.top;

	if (placement === "left") {
		left = triggerRect.left - tooltipRect.width - TOOLTIP_GAP_PX;
		top = triggerRect.top + (triggerRect.height - tooltipRect.height) * 0.5;
	} else if (placement === "top") {
		left = triggerRect.left + (triggerRect.width - tooltipRect.width) * 0.5;
		top = triggerRect.top - tooltipRect.height - TOOLTIP_GAP_PX;
	} else if (placement === "bottom") {
		left = triggerRect.left + (triggerRect.width - tooltipRect.width) * 0.5;
		top = triggerRect.bottom + TOOLTIP_GAP_PX;
	} else {
		left = triggerRect.right + TOOLTIP_GAP_PX;
		top = triggerRect.top + (triggerRect.height - tooltipRect.height) * 0.5;
	}

	const maxLeft =
		window.innerWidth - tooltipRect.width - TOOLTIP_VIEWPORT_MARGIN_PX;
	const maxTop =
		window.innerHeight - tooltipRect.height - TOOLTIP_VIEWPORT_MARGIN_PX;

	return {
		left: Math.min(
			Math.max(left, TOOLTIP_VIEWPORT_MARGIN_PX),
			Math.max(TOOLTIP_VIEWPORT_MARGIN_PX, maxLeft),
		),
		top: Math.min(
			Math.max(top, TOOLTIP_VIEWPORT_MARGIN_PX),
			Math.max(TOOLTIP_VIEWPORT_MARGIN_PX, maxTop),
		),
	};
}

export function TooltipBubble({
	title,
	description = "",
	shortcut = "",
	placement = "right",
}) {
	const anchorRef = useRef(null);
	const tooltipRef = useRef(null);
	const [visible, setVisible] = useState(false);
	const [tooltipStyle, setTooltipStyle] = useState({
		left: `${TOOLTIP_VIEWPORT_MARGIN_PX}px`,
		top: `${TOOLTIP_VIEWPORT_MARGIN_PX}px`,
		visibility: "hidden",
	});

	if (!title && !description && !shortcut) {
		return null;
	}

	useEffect(() => {
		const trigger = anchorRef.current?.parentElement;
		if (!trigger) {
			return undefined;
		}

		const handlePointerEnter = () => setVisible(true);
		const handlePointerLeave = () => setVisible(false);
		const handlePointerDown = () => setVisible(false);
		const handleClick = () => setVisible(false);
		const handleFocusIn = () => setVisible(true);
		const handleFocusOut = (event) => {
			if (!trigger.contains(event.relatedTarget)) {
				setVisible(false);
			}
		};
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				setVisible(false);
			}
		};

		trigger.addEventListener("mouseenter", handlePointerEnter);
		trigger.addEventListener("mouseleave", handlePointerLeave);
		trigger.addEventListener("pointerdown", handlePointerDown, true);
		trigger.addEventListener("click", handleClick, true);
		trigger.addEventListener("focusin", handleFocusIn);
		trigger.addEventListener("focusout", handleFocusOut);
		trigger.addEventListener("keydown", handleKeyDown);

		return () => {
			trigger.removeEventListener("mouseenter", handlePointerEnter);
			trigger.removeEventListener("mouseleave", handlePointerLeave);
			trigger.removeEventListener("pointerdown", handlePointerDown, true);
			trigger.removeEventListener("click", handleClick, true);
			trigger.removeEventListener("focusin", handleFocusIn);
			trigger.removeEventListener("focusout", handleFocusOut);
			trigger.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!visible) {
			return undefined;
		}

		const updatePosition = () => {
			const trigger = anchorRef.current?.parentElement;
			const tooltip = tooltipRef.current;
			if (!trigger || !tooltip) {
				return;
			}

			const triggerRect = trigger.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();
			const { left, top } = getTooltipViewportPosition(
				triggerRect,
				tooltipRect,
				placement,
			);
			setTooltipStyle({
				left: `${left}px`,
				top: `${top}px`,
				visibility: "visible",
			});
		};

		updatePosition();
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [visible, placement]);

	const tooltipNode =
		visible && typeof document !== "undefined"
			? createPortal(
					html`
						<span
							ref=${tooltipRef}
							class="workbench-tooltip workbench-tooltip--visible"
							style=${tooltipStyle}
						>
							${
								title &&
								html`<strong class="workbench-tooltip__title">${title}</strong>`
							}
							${
								description &&
								html`
									<span class="workbench-tooltip__description"
										>${description}</span
									>
								`
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
					`,
					document.body,
				)
			: null;

	return html`
		<span ref=${anchorRef} class="workbench-tooltip-anchor" aria-hidden="true"></span>
		${tooltipNode}
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

export function WorkbenchTabs({
	tabs,
	activeTab,
	setActiveTab,
	ariaLabel,
	iconOnly = false,
}) {
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
									<${WorkbenchIcon}
										name=${tab.icon}
										size=${iconOnly ? 17 : 14}
									/>
								</span>
							`
							}
							${!iconOnly && html`<span>${tab.label}</span>`}
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
	panelPlacement = "down",
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
			<div
				class=${
					panelPlacement === "up"
						? "workbench-menu__panel workbench-menu__panel--up"
						: "workbench-menu__panel"
				}
			>
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

export function DisclosureBlock({
	icon,
	label,
	children,
	open = false,
	summaryMeta = null,
	summaryActions = null,
	onToggle = null,
	className = "",
}) {
	return html`
		<details
			class=${className ? `panel-disclosure ${className}` : "panel-disclosure"}
			open=${open}
			onToggle=${(event) => onToggle?.(Boolean(event.currentTarget.open))}
		>
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
				<span class="panel-disclosure__summary-right">
					${
						summaryMeta &&
						html`<span class="panel-disclosure__summary-meta">${summaryMeta}</span>`
					}
					${
						summaryActions &&
						html`
							<span class="panel-disclosure__summary-actions">
								${summaryActions}
							</span>
						`
					}
					<span class="panel-disclosure__chevron">
						<${WorkbenchIcon} name="chevron-right" size=${12} />
					</span>
				</span>
			</summary>
			<div class="panel-disclosure__body">${children}</div>
		</details>
	`;
}
