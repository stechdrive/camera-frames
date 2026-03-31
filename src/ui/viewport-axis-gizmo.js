import { html } from "htm/preact";

const AXIS_KEYS = ["x", "y", "z"];

export function ViewportAxisGizmo({ controller, rootRef, svgRef }) {
	return html`
		<div
			ref=${rootRef}
			class="viewport-axis-gizmo is-hidden"
			aria-label="Viewport Axis Gizmo"
		>
			<svg
				ref=${svgRef}
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${AXIS_KEYS.map(
					(axisKey) => html`
						<line
							key=${axisKey}
							data-axis-gizmo-line=${axisKey}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${axisKey}`}
							x1="50"
							y1="50"
							x2="50"
							y2="50"
						/>
					`,
				)}
			</svg>
			${AXIS_KEYS.flatMap((axisKey) => [
				html`
					<button
						key=${`pos-${axisKey}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--positive viewport-axis-gizmo__button--${axisKey}`}
						data-axis-gizmo-node=${`pos-${axisKey}`}
						aria-label=${axisKey.toUpperCase()}
						title=${axisKey.toUpperCase()}
						onClick=${() =>
							controller()?.alignViewportToOrthographicView?.(
								`pos${axisKey.toUpperCase()}`,
								{ toggleOppositeOnRepeat: true },
							)}
					>
						<span>${axisKey.toUpperCase()}</span>
					</button>
				`,
				html`
					<button
						key=${`neg-${axisKey}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--negative viewport-axis-gizmo__button--${axisKey}`}
						data-axis-gizmo-node=${`neg-${axisKey}`}
						aria-label=${`-${axisKey.toUpperCase()}`}
						title=${`-${axisKey.toUpperCase()}`}
						onClick=${() =>
							controller()?.alignViewportToOrthographicView?.(
								`neg${axisKey.toUpperCase()}`,
								{ toggleOppositeOnRepeat: true },
							)}
					>
						<span></span>
					</button>
				`,
				html`
					<button
						key=${`axis-${axisKey}`}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--axis-center viewport-axis-gizmo__button--${axisKey}`}
						data-axis-gizmo-node=${`axis-${axisKey}`}
						aria-label=${axisKey.toUpperCase()}
						title=${axisKey.toUpperCase()}
						onClick=${() =>
							controller()?.toggleViewportOrthographicAxis?.(axisKey)}
					>
						<span>${axisKey.toUpperCase()}</span>
					</button>
				`,
			])}
		</div>
	`;
}
