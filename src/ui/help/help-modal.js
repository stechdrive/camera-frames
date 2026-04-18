import { html } from "htm/preact";
import { useEffect, useRef } from "preact/hooks";
import { WorkbenchIcon } from "../workbench-icons.js";
import {
	getHelpChapterById,
	getHelpChapterByFilename,
	getHelpChapters,
} from "./help-chapters.js";
import { translateHelp } from "./i18n/index.js";
import { renderBlocks } from "./markdown-renderer.js";

const ASSETS_BASE_URL = new URL(
	"../../../docs/help/assets/",
	import.meta.url,
).href;

export function HelpModal({ store, controller }) {
	const open = store.help.open.value;
	const sectionId = store.help.sectionId.value;
	const anchor = store.help.anchor.value;
	const lang = store.help.lang.value;
	const t = (key) => translateHelp(lang, key);
	const contentRef = useRef(null);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				controller()?.closeHelp?.();
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, controller]);

	useEffect(() => {
		if (!open) return;
		const element = contentRef.current;
		if (!element) return;
		if (anchor) {
			try {
				const target = element.querySelector(`#${CSS.escape(anchor)}`);
				if (target) {
					target.scrollIntoView({ block: "start" });
					return;
				}
			} catch (_error) {
				// fall through to scrollTop reset
			}
		}
		element.scrollTop = 0;
	}, [open, sectionId, anchor]);

	if (!open) return null;

	const chapters = getHelpChapters(lang);
	const activeChapter = getHelpChapterById(sectionId, lang);

	const handleNavigate = (link) => {
		if (!link) return;
		if (link.type === "anchor") {
			controller()?.setHelpAnchor?.(link.anchor);
			return;
		}
		if (link.type === "chapter") {
			controller()?.openHelp?.({
				sectionId: link.sectionId,
				anchor: link.anchor ?? null,
			});
		}
	};

	const rendererOptions = {
		onNavigate: handleNavigate,
		findChapterByFilename: (filename) =>
			getHelpChapterByFilename(filename, lang),
		assetsBaseUrl: ASSETS_BASE_URL,
	};

	const tocChapters = chapters.filter((chapter) => chapter.id !== "index");

	return html`
		<div
			class="help-modal"
			role="dialog"
			aria-modal="true"
			aria-label=${t("help.title")}
			onClick=${(event) => {
				if (event.target === event.currentTarget) {
					controller()?.closeHelp?.();
				}
			}}
		>
			<div class="help-modal__card">
				<header class="help-modal__header">
					<h2 class="help-modal__title">${t("help.title")}</h2>
					<button
						type="button"
						class="help-modal__close"
						aria-label=${t("help.close")}
						onClick=${() => controller()?.closeHelp?.()}
					>
						<${WorkbenchIcon} name="close" size=${18} />
					</button>
				</header>

				<div class="help-modal__body">
					<nav class="help-modal__toc" aria-label=${t("help.toc")}>
						<ul class="help-toc-list">
							${tocChapters.map(
								(chapter) => html`
									<li
										key=${chapter.id}
										class=${chapter.id === sectionId
											? "help-toc-item help-toc-item--active"
											: "help-toc-item"}
									>
										<button
											type="button"
											class="help-toc-button"
											onClick=${() =>
												controller()?.setHelpSection?.(chapter.id)}
										>
											<span class="help-toc-button__index">
												${String(chapter.section).padStart(2, "0")}
											</span>
											<span class="help-toc-button__title">
												${chapter.title}
											</span>
										</button>
									</li>
								`,
							)}
						</ul>
					</nav>

					<article class="help-modal__content" ref=${contentRef}>
						${activeChapter
							? renderBlocks(activeChapter.blocks, rendererOptions)
							: html`<p class="help-empty">${t("help.empty")}</p>`}
					</article>
				</div>
			</div>
		</div>
	`;
}
