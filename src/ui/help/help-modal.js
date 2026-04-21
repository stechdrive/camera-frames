import { html } from "htm/preact";
import { useEffect, useRef } from "preact/hooks";
import { WorkbenchIcon } from "../workbench-icons.js";
import {
	getHelpChapterById,
	getHelpChapterByFilename,
	getHelpChapters,
} from "./help-chapters.js";
import { buildHitSnippet, searchHelpChapters } from "./help-search.js";
import { translateHelp } from "./i18n/index.js";
import { renderBlocks } from "./markdown-renderer.js";

// Help images are referenced from chapter Markdown as `../assets/...` and
// rewritten by resolveImageSrc() to sit under this base. Using
// `import.meta.env.BASE_URL` lets the same path resolve correctly in dev
// (base `/`) and in the GitHub Pages build (base `/camera-frames/`).
// The old form — `new URL("../../../docs/help/assets/", import.meta.url)`
// — silently pointed at `https://host/docs/help/assets/` in production,
// dropping the `/camera-frames/` prefix and 404-ing every help screenshot.
const ASSETS_BASE_URL = `${import.meta.env.BASE_URL}docs/help/assets/`;

export function HelpModal({ store, controller }) {
	const open = store.help.open.value;
	const sectionId = store.help.sectionId.value;
	const anchor = store.help.anchor.value;
	const lang = store.help.lang.value;
	const searchQuery = store.help.searchQuery.value;
	const t = (key) => translateHelp(lang, key);
	const contentRef = useRef(null);

	useEffect(() => {
		if (!open) return undefined;
		const handleKey = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				if (searchQuery) {
					controller()?.setHelpSearchQuery?.("");
				} else {
					controller()?.closeHelp?.();
				}
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, searchQuery, controller]);

	useEffect(() => {
		if (!open || searchQuery) return;
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
	}, [open, sectionId, anchor, searchQuery]);

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
			controller()?.setHelpSearchQuery?.("");
		}
	};

	const rendererOptions = {
		onNavigate: handleNavigate,
		findChapterByFilename: (filename) =>
			getHelpChapterByFilename(filename, lang),
		assetsBaseUrl: ASSETS_BASE_URL,
	};

	const searchResults = searchQuery
		? searchHelpChapters(searchQuery, lang)
		: [];
	const searchChapterIds = new Set(
		searchResults.map((result) => result.chapter.id),
	);

	const tocChapters = chapters.filter((chapter) => chapter.id !== "index");
	const displayedToc = searchQuery
		? tocChapters.filter((chapter) => searchChapterIds.has(chapter.id))
		: tocChapters;

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
					<div class="help-modal__search">
						<input
							type="search"
							class="help-modal__search-input"
							placeholder=${t("help.search.placeholder")}
							value=${searchQuery}
							onInput=${(event) =>
								controller()?.setHelpSearchQuery?.(event.currentTarget.value)}
						/>
					</div>
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
							${displayedToc.length === 0
								? html`<li class="help-toc-empty">${t("help.search.noResults")}</li>`
								: displayedToc.map(
										(chapter) => html`
											<li
												key=${chapter.id}
												class=${chapter.id === sectionId && !searchQuery
													? "help-toc-item help-toc-item--active"
													: "help-toc-item"}
											>
												<button
													type="button"
													class="help-toc-button"
													onClick=${() => {
														controller()?.setHelpSection?.(chapter.id);
														controller()?.setHelpSearchQuery?.("");
													}}
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
						${searchQuery
							? renderSearchResults({
									results: searchResults,
									query: searchQuery,
									controller,
									t,
								})
							: activeChapter
								? renderBlocks(activeChapter.blocks, rendererOptions)
								: html`<p class="help-empty">${t("help.empty")}</p>`}
					</article>
				</div>
			</div>
		</div>
	`;
}

function renderSearchResults({ results, query, controller, t }) {
	if (results.length === 0) {
		return html`<p class="help-search-empty">${t("help.search.noResults")}</p>`;
	}
	return html`
		<div class="help-search-results">
			<p class="help-search-summary">
				${t("help.search.resultsHint")} — <code>${query}</code>
			</p>
			${results.map(
				(result) => html`
					<section key=${result.chapter.id} class="help-search-result">
						<h3 class="help-search-result__title">
							<button
								type="button"
								class="help-search-result__link"
								onClick=${() => {
									controller()?.openHelp?.({
										sectionId: result.chapter.id,
									});
									controller()?.setHelpSearchQuery?.("");
								}}
							>
								${String(result.chapter.section).padStart(2, "0")} ·
								${result.chapter.title}
							</button>
						</h3>
						${result.hits.length > 0 &&
						html`
							<ul class="help-search-result__hits">
								${result.hits.map(
									(hit, index) => html`
										<li
											key=${index}
											class=${`help-search-hit help-search-hit--${hit.kind}`}
										>
											${renderSnippet(hit)}
										</li>
									`,
								)}
							</ul>
						`}
					</section>
				`,
			)}
		</div>
	`;
}

function renderSnippet(hit) {
	const snippet = buildHitSnippet(hit);
	if (!snippet) return null;
	return html`<span class="help-search-snippet">
		${snippet.prefix}${snippet.beforeMatch}<mark class="help-search-mark">${snippet.match}</mark>${snippet.afterMatch}${snippet.suffix}
	</span>`;
}
