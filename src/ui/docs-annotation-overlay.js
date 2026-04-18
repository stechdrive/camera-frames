import { html } from "htm/preact";

export function DocsAnnotationOverlay({ store }) {
	const annotations = store.docsAnnotations.value;
	if (!Array.isArray(annotations) || annotations.length === 0) {
		return null;
	}
	return html`
		<div class="docs-annotation-overlay" aria-hidden="true">
			${annotations.map(
				(annotation) => html`
					<span
						key=${annotation.n}
						class="docs-annotation"
						style=${{
							left: `${annotation.x}px`,
							top: `${annotation.y}px`,
						}}
						title=${annotation.label ?? ""}
					>
						${annotation.n}
					</span>
				`,
			)}
		</div>
	`;
}
