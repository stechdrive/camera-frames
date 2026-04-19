import{f3 as Se,fv as se,gg as ie,fr as n,fA as ae,fz as I,gh as O,gi as Ee,gj as ze,gk as Te,gl as Re,gm as Ce,gn as Oe,go as Pe,gp as Fe,gq as je,gr as Ae,gs as Le,gt as Me,gu as De,gv as Ue,gw as Ve,gx as Ne,gy as He,gz as Ye,gA as We,gB as Be,gC as Ge,gD as Xe,gE as Ke,gF as Ze,gG as qe,gH as Je,gI as Qe,gJ as et,gK as tt,gL as ot,gM as st,gN as it,gO as at,gP as rt,gQ as nt,gR as lt,gS as ct,gT as dt,gU as pt,gV as ut,gW as gt,gX as bt,gY as vt,gZ as _t,g_ as mt,g$ as ht,h0 as ft,h1 as yt,h2 as xt,h3 as $t,h4 as wt,h5 as kt,h6 as It,h7 as St,h8 as Et,h9 as zt,ha as Tt,ga as be,cY as b,gf as Rt,fV as Ct,fT as Ot,hb as Pt,fs as X,fN as Ft,g0 as jt,fI as At,et as Lt,hc as re,hd as Mt,he as Dt,d5 as B,hf as Ut,g2 as Vt,fM as Nt,ge as Ht,fH as Yt,fu as Wt}from"./viewport-shell-BmBbM4u_.js";function Bt({controller:e,open:t=!0,summaryActions:o=null,onToggle:s=null,showList:l=!0,store:c,t:a}){var J,Q;const m=c.referenceImages.assets.value,g=c.referenceImages.items.value,K=Se(g),ye=c.referenceImages.presets.value,W=c.referenceImages.previewSessionVisible.value,xe=c.referenceImages.selectedAssetId.value,Z=c.referenceImages.selectedItemId.value,$e=new Set(c.referenceImages.selectedItemIds.value??[]),we=c.referenceImages.panelPresetId.value,u=g.find(i=>i.id===Z)??null,q=m.find(i=>i.id===((u==null?void 0:u.assetId)??xe))??null,ke=(i,r,d)=>{var h,ee,P,te,F,oe;(ee=(h=e())==null?void 0:h.selectReferenceImageItem)==null||ee.call(h,r,{additive:i.ctrlKey||i.metaKey,toggle:i.ctrlKey||i.metaKey,range:i.shiftKey,orderedIds:d}),(te=(P=e())==null?void 0:P.isReferenceImageSelectionActive)!=null&&te.call(P)&&((oe=(F=e())==null?void 0:F.activateViewportReferenceImageEditModeImplicit)==null||oe.call(F))};function Ie({selected:i=!1,active:r=!1}){const d=["scene-asset-row"];return i&&d.push("scene-asset-row--selected"),r&&d.push("scene-asset-row--active"),d.join(" ")}return n`
		<${se}
			icon="image"
			label=${a("section.referenceImages")}
			helpSectionId="reference-images"
			onOpenHelp=${i=>{var r,d;return(d=(r=e())==null?void 0:r.openHelp)==null?void 0:d.call(r,{sectionId:i})}}
			open=${t}
			summaryMeta=${n`<span class="pill pill--dim">${g.length}</span>`}
			summaryActions=${o}
			onToggle=${s}
		>
			<div class="button-row">
				<button
					type="button"
					class=${W?"button button--primary button--compact":"button button--compact"}
					onClick=${()=>{var i,r;return(r=(i=e())==null?void 0:i.setReferenceImagePreviewSessionVisible)==null?void 0:r.call(i,!W)}}
				>
					${a(W?"action.hideReferenceImages":"action.showReferenceImages")}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${a("referenceImage.activePreset")}</span>
					<select
						value=${we}
						...${ie}
						onChange=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setActiveReferenceImagePreset)==null?void 0:d.call(r,i.currentTarget.value)}}
					>
						${ye.map(i=>n`
								<option key=${i.id} value=${i.id}>
									${i.name}
								</option>
							`)}
					</select>
				</label>
				<div class="field field--action">
					<span>${a("referenceImage.activePresetItems",{count:g.length})}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${()=>{var i,r;return(r=(i=e())==null?void 0:i.duplicateActiveReferenceImagePreset)==null?void 0:r.call(i)}}
					>
						${a("action.duplicateReferencePreset")}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${l&&n`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${a("referenceImage.currentPresetSection")}</strong>
								<span class="pill pill--dim">${g.length}</span>
							</div>
							${g.length>0?n`
											<div class="scene-asset-list">
												${K.map(i=>n`
														<article
															class=${Ie({selected:$e.has(i.id),active:i.id===Z})}
															onClick=${r=>ke(r,i.id,K.map(d=>d.id))}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${i.name}</strong>
																	<span class="scene-asset-row__meta">
																		${i.fileName||a("referenceImage.untitled")} ·
																		${a(`referenceImage.group.${i.group}`)} ·
																		${a("referenceImage.orderLabel",{order:i.order+1})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${ae}
																	icon=${i.previewVisible?"eye":"eye-off"}
																	label=${a(i.previewVisible?"assetVisibility.visible":"assetVisibility.hidden")}
																	active=${i.previewVisible}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,h;r.stopPropagation(),(h=(d=e())==null?void 0:d.setReferenceImagePreviewVisible)==null||h.call(d,i.id,!i.previewVisible)}}
																/>
																<${ae}
																	icon=${i.exportEnabled?"export":"slash-circle"}
																	label=${i.exportEnabled?a("action.excludeReferenceImageFromExport"):a("action.includeReferenceImageInExport")}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,h;r.stopPropagation(),(h=(d=e())==null?void 0:d.setReferenceImageExportEnabled)==null||h.call(d,i.id,!i.exportEnabled)}}
																/>
															</div>
														</article>
													`)}
											</div>
										`:n`<p class="summary">${a("referenceImage.currentCameraEmpty")}</p>`}
						</section>
					`}
				${u&&q?n`
								<${se}
									icon="image"
									label=${u.name}
									open=${!0}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${u.name} ·
											${q.fileName||a("referenceImage.untitled")}
										</p>
										<div class="split-field-row">
											<label class="field">
												<span>${a("field.referenceImageOpacity")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(u.opacity*100)}
														controller=${e}
														historyLabel="reference-image.opacity"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOpacity)==null?void 0:d.call(r,u.id,i)}}
													/>
													<${O} value="%" title=${a("unit.percent")} />
												</div>
											</label>
											<label class="field">
												<span>${a("field.referenceImageScale")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(u.scalePct).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.scale"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageScalePct)==null?void 0:d.call(r,u.id,i)}}
													/>
													<${O} value="%" title=${a("unit.percent")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${a("field.referenceImageOffsetX")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="1"
														value=${Number(((J=u.offsetPx)==null?void 0:J.x)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.x"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"x",i)}}
													/>
													<${O} value="px" title=${a("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${a("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="1"
														value=${Number(((Q=u.offsetPx)==null?void 0:Q.y)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.y"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"y",i)}}
													/>
													<${O} value="px" title=${a("unit.pixel")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${a("field.referenceImageRotation")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="0.01"
														value=${Number(u.rotationDeg).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.rotation"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageRotationDeg)==null?void 0:d.call(r,u.id,i)}}
													/>
													<${O} value="deg" title=${a("unit.degree")} />
												</div>
											</label>
											<label class="field">
												<span>${a("field.referenceImageOrder")}</span>
												<${I}
													inputMode="numeric"
													min="1"
													step="1"
													value=${u.order+1}
													controller=${e}
													historyLabel="reference-image.order"
													onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOrder)==null?void 0:d.call(r,u.id,Math.max(0,Number(i)-1))}}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${a("field.referenceImageGroup")}</span>
												<select
													value=${u.group}
													...${ie}
													onChange=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageGroup)==null?void 0:d.call(r,u.id,i.currentTarget.value)}}
												>
													<option value="back">
														${a("referenceImage.group.back")}
													</option>
													<option value="front">
														${a("referenceImage.group.front")}
													</option>
												</select>
											</label>
										</div>
										<div class="button-row">
											<button
												type="button"
												class=${u.previewVisible?"button button--primary button--compact":"button button--compact"}
												onClick=${()=>{var i,r;return(r=(i=e())==null?void 0:i.setReferenceImagePreviewVisible)==null?void 0:r.call(i,u.id,!u.previewVisible)}}
											>
												${u.previewVisible?a("action.hideReferenceImage"):a("action.showReferenceImage")}
											</button>
											<button
												type="button"
												class=${u.exportEnabled?"button button--primary button--compact":"button button--compact"}
												onClick=${()=>{var i,r;return(r=(i=e())==null?void 0:i.setReferenceImageExportEnabled)==null?void 0:r.call(i,u.id,!u.exportEnabled)}}
											>
												${u.exportEnabled?a("action.excludeReferenceImageFromExport"):a("action.includeReferenceImageInExport")}
											</button>
										</div>
									</div>
								<//>
							`:n`<p class="summary">${a("referenceImage.selectedEmpty")}</p>`}
			</div>
		<//>
	`}const ne={id:"hello",type:"panel",title:"Hello docs fixture",mount:({lang:e})=>n`
		<div class="docs-hello">
			<h1>Hello, docs fixture.</h1>
			<p>
				Phase I skeleton. Fixture id: <code>hello</code>, lang: <code>${e}</code>.
			</p>
			<p>
				This placeholder exists to verify that the docs.html multi-page
				entry boots independently of the main app shell. Real fixtures
				land in later PRs (see <code>docs/help/FIXTURE_ROADMAP.md</code>).
			</p>
		</div>
	`},Gt=`
.docs-icons-all {
	padding: 32px;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-icons-all h1 {
	margin: 0 0 8px 0;
	font-size: 20px;
}
.docs-icons-all p {
	margin: 0 0 24px 0;
	color: #a7afbb;
	font-size: 13px;
}
.docs-icons-all__grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 12px;
	list-style: none;
	margin: 0;
	padding: 0;
}
.docs-icons-all__item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 18px 10px 14px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.02);
}
.docs-icons-all__svg {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #e8ecf1;
}
.docs-icons-all__svg svg {
	width: 100%;
	height: 100%;
}
.docs-icons-all__item code {
	font-size: 11px;
	color: #a7afbb;
	word-break: break-all;
	text-align: center;
}
`;function Xt(){const t=Object.entries(Object.assign({"../../ui/svg/apply-transform.svg":Tt,"../../ui/svg/camera-dslr.svg":zt,"../../ui/svg/camera-frames.svg":Et,"../../ui/svg/camera-property.svg":St,"../../ui/svg/camera.svg":It,"../../ui/svg/chevron-left.svg":kt,"../../ui/svg/chevron-right.svg":wt,"../../ui/svg/clock.svg":$t,"../../ui/svg/close.svg":xt,"../../ui/svg/copy-to-camera.svg":yt,"../../ui/svg/copy-to-viewport.svg":ft,"../../ui/svg/cursor.svg":ht,"../../ui/svg/duplicate.svg":mt,"../../ui/svg/export-tab.svg":_t,"../../ui/svg/export.svg":vt,"../../ui/svg/eye-off.svg":bt,"../../ui/svg/eye.svg":gt,"../../ui/svg/folder-open.svg":ut,"../../ui/svg/frame-plus.svg":pt,"../../ui/svg/frame.svg":dt,"../../ui/svg/grip.svg":ct,"../../ui/svg/help.svg":lt,"../../ui/svg/image.svg":nt,"../../ui/svg/lens.svg":rt,"../../ui/svg/light.svg":at,"../../ui/svg/link.svg":it,"../../ui/svg/lock-open.svg":st,"../../ui/svg/lock.svg":ot,"../../ui/svg/mask-all.svg":tt,"../../ui/svg/mask-selected.svg":et,"../../ui/svg/mask.svg":Qe,"../../ui/svg/menu.svg":Je,"../../ui/svg/move.svg":qe,"../../ui/svg/package-open.svg":Ze,"../../ui/svg/package.svg":Ke,"../../ui/svg/pie-menu.svg":Xe,"../../ui/svg/pin.svg":Ge,"../../ui/svg/pivot.svg":Be,"../../ui/svg/plus.svg":We,"../../ui/svg/redo.svg":Ye,"../../ui/svg/reference-preview-off.svg":He,"../../ui/svg/reference-preview-on.svg":Ne,"../../ui/svg/reference-tool.svg":Ve,"../../ui/svg/reference.svg":Ue,"../../ui/svg/render-box.svg":De,"../../ui/svg/reset.svg":Me,"../../ui/svg/ruler.svg":Le,"../../ui/svg/save.svg":Ae,"../../ui/svg/scene.svg":je,"../../ui/svg/scrub.svg":Fe,"../../ui/svg/selection-clear.svg":Pe,"../../ui/svg/slash-circle.svg":Oe,"../../ui/svg/trash.svg":Ce,"../../ui/svg/undo.svg":Re,"../../ui/svg/view.svg":Te,"../../ui/svg/viewport.svg":ze,"../../ui/svg/zoom.svg":Ee})).map(([o,s])=>{const l=o.match(/\/([^/]+)\.svg$/i),c=l?l[1]:null;return c&&typeof s=="string"?{name:c,rawSvg:s}:null}).filter(Boolean);return t.sort((o,s)=>o.name.localeCompare(s.name)),t}const le={id:"icons-all",type:"reference",title:"All workbench icons",mount:({lang:e})=>{const t=Xt();return n`
			<div class="docs-icons-all">
				<style>${Gt}</style>
				<h1>All workbench icons (${t.length})</h1>
				<p>
					Auto-generated from <code>src/ui/svg/*.svg</code>. Language:
					<code>${e}</code>.
				</p>
				<ul class="docs-icons-all__grid">
					${t.map(o=>n`
							<li
								key=${o.name}
								class="docs-icons-all__item"
								data-icon-name=${o.name}
							>
								<div
									class="docs-icons-all__svg"
									dangerouslySetInnerHTML=${{__html:o.rawSvg}}
								></div>
								<code>${o.name}</code>
							</li>
						`)}
				</ul>
			</div>
		`}},A={[ne.id]:ne,[le.id]:le};function p(e){if(!e||typeof e.id!="string"||e.id.length===0)throw new Error("registerFixture: fixture.id must be a non-empty string");if(Object.hasOwn(A,e.id))throw new Error(`registerFixture: duplicate id "${e.id}"`);A[e.id]=e}function Kt(e){return typeof e!="string"||e===""?null:A[e]??null}function ve(){return Object.keys(A)}const Zt={"cf-test2-default":{id:"cf-test2-default",backdropUrl:"/docs/help/assets/fixture-backdrops/cf-test2-default.png",width:1073,height:1264,description:"cf-test2 の仮のシーン（権利クリア済みの motorbike スプラット）"}};function x(e){const t=Zt[e];if(!t)throw new Error(`makeScene: unknown scene "${e}"`);return t}const qt=960,Jt=600,Qt=`
.docs-layout-host {
	position: relative;
	width: ${qt}px;
	height: ${Jt}px;
	background: #050a13;
	color: #e8ecf1;
	display: grid;
	grid-template-columns: 64px 1fr 320px;
	gap: 12px;
	padding: 16px;
	box-sizing: border-box;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	overflow: hidden;
}
.docs-layout-host__rail {
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 14px;
	background: #10161e;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 10px 4px;
}
.docs-layout-host__rail-item {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.02);
}
.docs-layout-host__rail-item--active {
	border-color: rgba(246, 165, 36, 0.78);
	background: rgba(246, 165, 36, 0.12);
	box-shadow: 0 0 0 1px rgba(246, 165, 36, 0.3);
}
.docs-layout-host__viewport {
	position: relative;
	border-radius: 16px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.06);
	background: #04070c;
}
.docs-layout-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-layout-host__hud {
	position: absolute;
	top: 14px;
	left: 16px;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	border-radius: 8px;
	background: rgba(4, 10, 18, 0.82);
	border: 1px solid rgba(255, 255, 255, 0.1);
	color: rgba(220, 233, 248, 0.96);
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.04em;
	backdrop-filter: blur(6px);
}
.docs-layout-host__hud-badge {
	padding: 1px 6px;
	border-radius: 4px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.08em;
	background: rgba(246, 165, 36, 0.22);
	color: rgba(255, 212, 128, 0.98);
}
.docs-layout-host__inspector {
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 14px;
	background: #10161e;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.docs-layout-host__inspector-tabs {
	display: flex;
	gap: 8px;
}
.docs-layout-host__inspector-tab {
	flex: 1;
	height: 36px;
	border-radius: 9px;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
}
.docs-layout-host__inspector-tab--active {
	background: rgba(246, 165, 36, 0.16);
	border-color: rgba(246, 165, 36, 0.72);
}
.docs-layout-host__inspector-section {
	padding: 14px;
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.02);
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.docs-layout-host__section-title {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.12em;
	color: rgba(198, 216, 236, 0.88);
	text-transform: uppercase;
}
.docs-layout-host__field {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 10px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.04);
	font-size: 12px;
	color: rgba(220, 233, 248, 0.86);
}
.docs-layout-host__field-label {
	width: 50px;
	color: rgba(198, 216, 236, 0.7);
	font-size: 11px;
}
.docs-layout-host__field-value {
	flex: 1;
	text-align: right;
	font-variant-numeric: tabular-nums;
	font-weight: 600;
}
`,eo=[{active:!1},{active:!1},{active:!1},{active:!1},{active:!0},{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}],to={id:"app-layout-overview",type:"composite",title:"Full app layout overview",annotations:[{n:1,selector:".docs-layout-host__viewport",label:"Viewport"},{n:2,selector:".workbench-card--tool-rail",label:"Tool Rail"},{n:3,selector:".workbench-card--inspector",label:"Inspector"},{n:4,selector:".viewport-project-status",label:"Project Status HUD"}],mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-layout-host">
				<style>${Qt}</style>
				<aside class="docs-layout-host__rail workbench-card workbench-card--tool-rail">
					${eo.map((t,o)=>n`
							<div
								key=${o}
								class=${t.active?"docs-layout-host__rail-item docs-layout-host__rail-item--active":"docs-layout-host__rail-item"}
							></div>
						`)}
				</aside>
				<main class="docs-layout-host__viewport">
					<img
						class="docs-layout-host__backdrop"
						src=${e.backdropUrl}
						alt=${e.description}
					/>
					<div class="docs-layout-host__hud viewport-project-status">
						<span>cf-test2</span>
						<span class="docs-layout-host__hud-badge">PKG</span>
					</div>
				</main>
				<aside class="docs-layout-host__inspector workbench-card workbench-card--inspector">
					<div class="docs-layout-host__inspector-tabs">
						${["scene","camera","reference","export"].map(t=>n`
								<div
									key=${t}
									class=${t==="camera"?"docs-layout-host__inspector-tab docs-layout-host__inspector-tab--active":"docs-layout-host__inspector-tab"}
								></div>
							`)}
					</div>
					<section class="docs-layout-host__inspector-section">
						<div class="docs-layout-host__section-title">Shot Camera</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">焦点距離</span>
							<span class="docs-layout-host__field-value">35 mm</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">位置</span>
							<span class="docs-layout-host__field-value">1.2 / 2.4 / -0.5</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">回転</span>
							<span class="docs-layout-host__field-value">45° / -15° / 0°</span>
						</div>
					</section>
					<section class="docs-layout-host__inspector-section">
						<div class="docs-layout-host__section-title">用紙</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">サイズ</span>
							<span class="docs-layout-host__field-value">1754 × 1240 px</span>
						</div>
						<div class="docs-layout-host__field">
							<span class="docs-layout-host__field-label">アンカー</span>
							<span class="docs-layout-host__field-value">center</span>
						</div>
					</section>
				</aside>
			</div>
		`}},oo=800,so=560,io=`
.docs-viewport-host {
	position: relative;
	width: ${oo}px;
	height: ${so}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
/* Show the gizmo inside the fixture — the real app toggles .is-hidden
 * via controller logic that this fixture doesn't drive. */
.docs-viewport-host .viewport-axis-gizmo {
	display: block !important;
}
`,ce={x:{x2:"92",y2:"50"},y:{x2:"50",y2:"8"},z:{x2:"50",y2:"50"}},ao=[{key:"pos-x",cls:"positive--x",label:"X",left:"92%",top:"50%"},{key:"pos-y",cls:"positive--y",label:"Y",left:"50%",top:"8%"},{key:"pos-z",cls:"positive--z",label:"Z",left:"50%",top:"50%"},{key:"neg-x",cls:"negative--x",label:"",left:"8%",top:"50%"},{key:"neg-y",cls:"negative--y",label:"",left:"50%",top:"92%"},{key:"neg-z",cls:"negative--z",label:"",left:"50%",top:"50%"}];function ro(){return n`
		<div class="viewport-axis-gizmo" aria-label="Viewport Axis Gizmo">
			<svg
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${["x","y","z"].map(e=>n`
						<line
							key=${e}
							data-axis-gizmo-line=${e}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${e}`}
							x1="50"
							y1="50"
							x2=${ce[e].x2}
							y2=${ce[e].y2}
						/>
					`)}
			</svg>
			${ao.map(e=>n`
					<button
						key=${e.key}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--${e.cls.split("--")[0]} viewport-axis-gizmo__button--${e.cls.split("--")[1]}`}
						data-axis-gizmo-node=${e.key}
						aria-label=${e.label||e.key}
						style=${{left:e.left,top:e.top}}
					>
						<span>${e.label}</span>
					</button>
				`)}
		</div>
	`}const no={id:"axis-gizmo",type:"viewport",title:"Viewport axis gizmo (orthographic posZ)",mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${io}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${ro()}
			</div>
		`}},L=800,M=560,D=110,U=70,V=580,N=420,lo=`
.docs-viewport-host {
	position: relative;
	width: ${L}px;
	height: ${M}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
/* Force render-box chrome visible without the controller's is-selected /
 * is-resize-active toggles. */
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
`,co=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],po=["top","right","bottom","left"];function H({frames:e=[],anchorOffset:t={left:"50%",top:"50%"}}={}){return n`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{left:`${D}px`,top:`${U}px`,width:`${V}px`,height:`${N}px`}}
		>
			${e.map(o=>n`
					<div
						key=${o.id}
						class=${`frame-item${o.active?" frame-item--active":""}`}
						style=${{left:o.left,top:o.top,width:o.width,height:o.height,border:o.active?"2px solid rgba(255, 190, 70, 0.95)":"2px solid rgba(255, 190, 70, 0.55)",boxSizing:"border-box",background:"transparent"}}
					>
						<span
							style=${{position:"absolute",top:"4px",left:"6px",padding:"2px 8px",borderRadius:"999px",background:"rgba(10, 18, 28, 0.85)",color:"rgba(255, 213, 137, 0.96)",fontSize:"11px",fontWeight:700,letterSpacing:"0.06em"}}
						>
							${o.label}
						</span>
					</div>
				`)}
			${co.map(o=>n`
					<button
						key=${`resize-${o}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${o}`}
						aria-label="resize"
					></button>
				`)}
			${po.map(o=>n`
					<button
						key=${`pan-${o}`}
						type="button"
						class=${`render-box__pan-edge render-box__pan-edge--${o}`}
						aria-label="pan"
					></button>
				`)}
			<div
				id="render-box-meta"
				class="render-box__meta"
				style=${{position:"absolute",top:"-32px",right:"0",padding:"4px 12px",borderRadius:"999px",background:"rgba(10, 18, 28, 0.9)",color:"rgba(198, 216, 236, 0.95)",fontSize:"12px",fontWeight:600,letterSpacing:"0.04em",pointerEvents:"auto"}}
			>
				1754 × 1240 · center
			</div>
			<div
				id="anchor-dot"
				class="render-box__anchor"
				style=${{position:"absolute",left:t.left,top:t.top,transform:"translate(-50%, -50%)",width:"10px",height:"10px",borderRadius:"50%",background:"rgba(114, 227, 157, 0.94)",boxShadow:"0 0 0 2px rgba(10, 18, 28, 0.6)",pointerEvents:"none"}}
			></div>
		</div>
	`}const uo={id:"camera-mode-render-box",type:"viewport",title:"Camera mode with render-box overlay",mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${lo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:[{id:"frame-1",label:"A",active:!0,left:"6%",top:"8%",width:"88%",height:"84%"}]})}
			</div>
		`}},go=`
.docs-overlay-host {
	position: relative;
	width: 640px;
	height: 360px;
	padding: 0;
	background: #04070c;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	box-sizing: border-box;
	overflow: hidden;
}
.docs-overlay-host::before {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 30% 30%, rgba(246, 165, 36, 0.05), transparent 70%),
		radial-gradient(circle at 70% 70%, rgba(56, 134, 234, 0.06), transparent 65%);
	pointer-events: none;
}
/* .app-overlay in the real app is position:fixed to cover the viewport.
 * Inside this fixture we confine it to the host card so the capture
 * crops tightly instead of extending outside .docs-stage bounds. */
.docs-overlay-host .app-overlay {
	position: absolute !important;
	inset: 0 !important;
	display: flex;
	align-items: center;
	justify-content: center;
}
`,bo={id:"confirm-new-project",type:"overlay",title:"Confirm: New Project",mount:()=>n`
			<div class="docs-overlay-host">
				<style>${go}</style>
				<${be} overlay=${{kind:"confirm",title:"新規プロジェクトを作成しますか？",message:"現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。",actions:[{label:"キャンセル",onClick:()=>{}},{label:"破棄して新規作成",primary:!0,onClick:()=>{}}]}} />
			</div>
		`},vo=800,_o=560,mo=`
.docs-viewport-host {
	position: relative;
	width: ${vo}px;
	height: ${_o}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host::before {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 50% 50%, rgba(56, 134, 234, 0.05), transparent 60%);
	pointer-events: none;
}
.docs-viewport-host .drop-hint {
	/* Override the real app's JS-computed inline style so the hint sits
	 * centred inside the mock viewport. */
	position: absolute !important;
	left: 50% !important;
	top: 50% !important;
	transform: translate(-50%, -50%) !important;
}
`,ho={id:"drop-hint",type:"viewport",title:"Viewport drop hint (empty project)",mount:({lang:e})=>{const t=(o,s)=>b(e,o,s);return n`
			<div class="docs-viewport-host">
				<style>${mo}</style>
				<div class="drop-hint">
					<span class="drop-hint__meta">
						CAMERA_FRAMES docs-fixture
					</span>
					<strong>${t("drop.title")}</strong>
					<span>${t("drop.body")}</span>
					<div class="drop-hint__controls">
						<strong class="drop-hint__controls-title">
							${t("drop.controlsTitle")}
						</strong>
						<div class="drop-hint__controls-grid">
							<span>${t("drop.controlOrbit")}</span>
							<span>${t("drop.controlPan")}</span>
							<span>${t("drop.controlDolly")}</span>
							<span>${t("drop.controlAnchorOrbit")}</span>
						</div>
					</div>
				</div>
			</div>
		`}},de="__calls",pe="__methods";function $(e={}){const t=e.log===!0,o=e.methods??null,s=[],l={[de]:s,[pe]:o};return new Proxy(l,{get(c,a){if(typeof a!="string")return Reflect.get(c,a);if(a===de)return s;if(a===pe)return o;const m=o&&Object.hasOwn(o,a)?o[a]:null;return(...g)=>{if(s.push({method:a,args:g}),t&&console.debug(`[mock-controller] ${a}`,g),m)return m(...g)}}})}function v(e={}){const t=Rt(null);return _e(t,e,[]),t}function _e(e,t,o){for(const[s,l]of Object.entries(t)){const c=o.concat(s),a=e==null?void 0:e[s];if(a==null)throw new Error(`createMockStore: unknown path "${c.join(".")}"`);if(fo(a)){yo(a,l,c);continue}if(ue(a)&&ue(l)){_e(a,l,c);continue}throw new Error(`createMockStore: cannot assign "${c.join(".")}" — target is neither a signal nor a namespace`)}}function fo(e){return e!==null&&typeof e=="object"&&"value"in e&&typeof e.peek=="function"}function ue(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function yo(e,t,o){try{e.value=t}catch(s){const l=s instanceof Error?s.message:String(s);throw new Error(`createMockStore: cannot assign to "${o.join(".")}" (computed or read-only): ${l}`)}}const xo=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,$o={id:"export-output-section",type:"panel",title:"Export Output section",size:{width:360},mount:({lang:e})=>{const t=v(),o=$();return n`
			<div class="docs-section-host">
				<style>${xo}</style>
				<div class="docs-section-host__card">
					<${Ct}
						store=${t}
						controller=${()=>o}
						t=${(l,c)=>b(e,l,c)}
						exportBusy=${!1}
						exportPresetIds=${[]}
						exportSelectionMissing=${!1}
						exportTarget="current"
						open=${!0}
					/>
				</div>
			</div>
		`}},wo=`
.docs-overlay-host {
	position: relative;
	width: 640px;
	height: 420px;
	background: #04070c;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
.docs-overlay-host::before {
	content: "";
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 30% 30%, rgba(246, 165, 36, 0.05), transparent 70%),
		radial-gradient(circle at 70% 70%, rgba(56, 134, 234, 0.06), transparent 65%);
	pointer-events: none;
}
.docs-overlay-host .app-overlay {
	position: absolute !important;
	inset: 0 !important;
	display: flex;
	align-items: center;
	justify-content: center;
}
`,ko={id:"export-progress",type:"overlay",title:"Export progress overlay",mount:()=>{const t={kind:"progress",title:"書き出し中",message:"すべての shot をレンダリングしています。",startedAt:Date.now()-47*1e3,phaseLabel:"shot 2 / 4 をレンダリング",phaseDetail:"Camera 2 — PSD 書き出し",phases:[{label:"Camera 1",status:"done"},{label:"Camera 2",status:"active"},{label:"Camera 3",status:"pending"},{label:"Camera 4",status:"pending"}],steps:[{label:"projectをスナップショット",status:"done"},{label:"各ショットをレンダリング",status:"active"},{label:"zip アーカイブを生成",status:"pending"}]};return n`
			<div class="docs-overlay-host">
				<style>${wo}</style>
				<${be} overlay=${t} />
			</div>
		`}},Io=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,So={id:"export-settings-section",type:"panel",title:"Export Settings section",size:{width:360},mount:({lang:e})=>{const t=v(),o=$();return n`
			<div class="docs-section-host">
				<style>${Io}</style>
				<div class="docs-section-host__card">
					<${Ot}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
						activeShotCamera=${t.workspace.activeShotCamera.value}
						exportFormat=${t.shotCamera.exportFormat.value}
						exportGridOverlay=${t.shotCamera.exportGridOverlay.value}
						exportGridLayerMode=${t.shotCamera.exportGridLayerMode.value}
						exportModelLayers=${t.shotCamera.exportModelLayers.value}
						exportSplatLayers=${t.shotCamera.exportSplatLayers.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},Eo=800,zo=560,To=`
.docs-viewport-host {
	position: relative;
	width: ${Eo}px;
	height: ${zo}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
`,Ro={id:"first-scene-loaded",type:"viewport",title:"Viewport after first scene load",mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${To}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
			</div>
		`}},Co=800,Oo=560,Po=`
.docs-viewport-host {
	position: relative;
	width: ${Co}px;
	height: ${Oo}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
`,Fo={id:"measurement-overlay",type:"viewport",title:"Measurement overlay (line + chip)",mount:({lang:e})=>{const t=x("cf-test2-default"),o=v({measurement:{active:!0,startPointWorld:{x:0,y:0,z:0},endPointWorld:{x:1,y:0,z:0},selectedPointKey:"end",lengthInputText:"",overlay:{contextKind:"viewport",start:{visible:!0,x:260,y:360},end:{visible:!0,x:540,y:300},draftEnd:{visible:!1,x:0,y:0},lineVisible:!0,lineUsesDraft:!1,chip:{visible:!0,x:400,y:310,label:"53.42 cm",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}}}),s=$(),l=(c,a)=>b(e,c,a);return n`
			<div class="docs-viewport-host">
				<style>${Po}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${t.backdropUrl}
					alt=${t.description}
				/>
				<${Pt}
					store=${o}
					controller=${()=>s}
					t=${l}
				/>
			</div>
		`}},jo=`
.docs-viewport-host {
	position: relative;
	width: ${L}px;
	height: ${M}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
`,Ao={id:"multiple-frames",type:"viewport",title:"Camera mode with multiple frames",mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${jo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:[{id:"frame-1",label:"A",active:!1,left:"8%",top:"22%",width:"32%",height:"56%"},{id:"frame-2",label:"B",active:!0,left:"34%",top:"12%",width:"32%",height:"76%"},{id:"frame-3",label:"C",active:!1,left:"60%",top:"22%",width:"32%",height:"56%"}]})}
			</div>
		`}},Lo=`
.docs-viewport-host {
	position: relative;
	width: ${L}px;
	height: ${M}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
`,Mo={id:"render-box-camera-mode",type:"viewport",title:"Render-box in camera mode (annotated)",annotations:[{n:1,selector:".render-box__resize-handle--top-right",label:"リサイズハンドル（8 方向）"},{n:2,selector:".render-box__pan-edge--top",label:"パンエッジ（4 辺）"},{n:3,selector:"#anchor-dot",label:"anchor dot"},{n:4,selector:"#render-box-meta",label:"meta ラベル"}],mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Lo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:[{id:"frame-1",label:"A",active:!0,left:"6%",top:"8%",width:"88%",height:"84%"}]})}
			</div>
		`}},Do=`
.docs-menu-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
/* Force the normally position:fixed panel back into the fixture bounds so
 * the capture crops cleanly. */
.docs-menu-host .workbench-menu__panel {
	position: relative !important;
	left: auto !important;
	top: auto !important;
	visibility: visible !important;
	min-width: 320px;
}
.docs-menu-host__focus-ring #header-url-input {
	outline: 2px solid var(--accent-warm, #f6a524);
	outline-offset: 2px;
}
`,Uo=[{icon:"plus",labelKey:"menu.newProjectAction",shortcut:"Ctrl+N"},{icon:"folder-open",labelKey:"action.openFiles",shortcut:"Ctrl+O"},{icon:"save",labelKey:"menu.saveWorkingStateAction",shortcut:"Ctrl+S"},{icon:"package",labelKey:"menu.savePackageAction",shortcut:"Ctrl+Shift+S"}];function me({lang:e,urlValue:t="",focusRing:o=!1}){const s=l=>b(e,l);return n`
		<div class=${`docs-menu-host${o?" docs-menu-host__focus-ring":""}`}>
			<style>${Do}</style>
			<div class="workbench-menu is-open">
				<div class="workbench-menu__panel" role="menu">
					<div class="workbench-menu__group">
						<div class="workbench-menu__field">
							<label for="header-url-input">${s("field.remoteUrl")}</label>
							<input
								id="header-url-input"
								type="text"
								placeholder="https://.../scene.spz or model.glb"
								value=${t}
							/>
						</div>
						<button type="button" class="workbench-menu__item">
							<span class="workbench-menu__item-icon">
								<${X} name="link" size=${14} />
							</span>
							<span>${s("action.loadUrl")}</span>
						</button>
					</div>
					${Uo.map(l=>n`
							<button
								key=${l.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${X} name=${l.icon} size=${14} />
								</span>
								<span class="workbench-menu__item-label">
									${s(l.labelKey)}
								</span>
								<span
									class="workbench-menu__item-shortcut"
									aria-hidden="true"
								>
									<kbd>${l.shortcut}</kbd>
								</span>
							</button>
						`)}
				</div>
			</div>
		</div>
	`}const Vo={id:"open-menu",type:"overlay",title:"Tool Rail File menu (open)",mount:({lang:e})=>me({lang:e})},No={id:"remote-url-input",type:"overlay",title:"Remote URL input (focused)",mount:({lang:e})=>me({lang:e,urlValue:"https://example.com/scene.spz",focusRing:!0})},Ho=`
.docs-tabs-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-tabs-host__card {
	padding: 12px 16px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,Yo={id:"inspector-tabs",type:"panel",title:"Inspector tabs (Camera active)",mount:({lang:e})=>n`
			<div class="docs-tabs-host">
				<style>${Ho}</style>
				<div class="docs-tabs-host__card">
					<${Ft}
						activeTab="camera"
						setActiveTab=${()=>{}}
						t=${(o,s)=>b(e,o,s)}
					/>
				</div>
			</div>
		`},Wo=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,Bo={id:"output-frame-section",type:"panel",title:"Output Frame section",size:{width:360},mount:({lang:e})=>{const t=v(),o=$();return n`
			<div class="docs-section-host">
				<style>${Wo}</style>
				<div class="docs-section-host__card">
					<${jt}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
						anchorOptions=${At(e)}
						exportSizeLabel=${t.exportSizeLabel.value}
						widthLabel=${t.widthLabel.value}
						heightLabel=${t.heightLabel.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},Go=240,Xo=200,Ko=480,Zo=400,qo=`
.docs-pie-host {
	position: relative;
	width: ${Ko}px;
	height: ${Zo}px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;function he({lang:e,coarse:t=!1}){const o=(c,a)=>b(e,c,a),s=Lt({mode:"camera",t:o,viewportToolMode:"select",viewportOrthographic:!1,referencePreviewSessionVisible:!0,hasReferenceImages:!1,frameMaskMode:"off"}),l=s.find(c=>c.id==="tool-select")??null;return n`
		<div class="docs-pie-host">
			<style>${qo}</style>
			<div
				class=${t?"viewport-pie viewport-pie--coarse":"viewport-pie"}
				style=${{left:`${Go}px`,top:`${Xo}px`}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${(l==null?void 0:l.label)??o("action.quickMenu")}
					</span>
				</button>
				${s.map(c=>{const a=Math.cos(c.angle)*re,m=Math.sin(c.angle)*re,g=["viewport-pie__item",c.id===(l==null?void 0:l.id)||c.active?"viewport-pie__item--active":"",c.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ");return n`
						<button
							key=${c.id}
							type="button"
							class=${g}
							style=${{left:`${a}px`,top:`${m}px`}}
							disabled=${!!c.disabled}
						>
							<span class="viewport-pie__item-icon">
								<${X} name=${c.icon} size=${18} />
							</span>
						</button>
					`})}
			</div>
		</div>
	`}const Jo={id:"pie-menu",type:"overlay",title:"Viewport pie menu (open)",mount:({lang:e})=>he({lang:e,coarse:!1})},Qo={id:"pie-menu-expanded",type:"overlay",title:"Viewport pie menu (coarse / expanded)",mount:({lang:e})=>he({lang:e,coarse:!0})},es=`
.docs-splat-toolbar-host {
	position: relative;
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-splat-toolbar-host .viewport-splat-edit-toolbar {
	position: relative !important;
	bottom: auto !important;
	left: auto !important;
	right: auto !important;
	margin: 0;
	max-width: none;
}
/* The popover is position:absolute above the toolbar in the real app
 * (bottom:100%). domToPng only captures what lives inside the stage's
 * bounding rect, so pull the popover back in-flow above the bar and
 * let the container height grow naturally. */
.docs-splat-toolbar-host .viewport-splat-edit-popover {
	position: relative !important;
	bottom: auto !important;
	left: auto !important;
	transform: none !important;
	margin-bottom: 0.4rem;
	align-self: stretch;
}
`;function Y(e,t){const o=$();return n`
		<div class="docs-splat-toolbar-host">
			<style>${es}</style>
			<${Mt}
				store=${e}
				controller=${()=>o}
				t=${(l,c)=>b(t,l,c)}
			/>
		</div>
	`}const ts={id:"splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (box tool, unplaced)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit"});return Y(t,e)}},os={id:"per-splat-brush-preview",type:"overlay",title:"Splat edit toolbar (brush tool)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"brush",brushSize:30,brushDepthMode:"depth",brushDepth:.2}});return Y(t,e)}},ss={id:"per-splat-box-tool",type:"overlay",title:"Splat edit toolbar (box tool, placed)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",boxPlaced:!0,boxCenter:{x:.5,y:1.2,z:-.3},boxSize:{x:1,y:.6,z:1.4},boxRotation:{x:0,y:0,z:0,w:1},selectionCount:12345}});return Y(t,e)}},is={id:"per-splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (annotated)",annotations:[{n:1,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)",label:"Tool 選択"},{n:2,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)",label:"選択操作"},{n:3,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)",label:"編集アクション"},{n:4,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info",label:"選択数"}],mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",selectionCount:42}});return Y(t,e)}},as=800,rs=560,ns=200,ls=110,cs=400,ds=300,ps=-4,us=`
.docs-viewport-host {
	position: relative;
	width: ${as}px;
	height: ${rs}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-reference-image {
	position: absolute;
	background: linear-gradient(
		135deg,
		rgba(246, 165, 36, 0.32),
		rgba(56, 134, 234, 0.32)
	);
	border: 1px dashed rgba(255, 255, 255, 0.28);
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(255, 248, 230, 0.92);
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
	box-shadow: 0 18px 44px rgba(0, 0, 0, 0.38);
}
.docs-viewport-host .frame-item__resize-handle,
.docs-viewport-host .frame-item__edge,
.docs-viewport-host .frame-item__anchor {
	/* The real app only reveals these when selected / active; class
	 * modifiers already apply here, but force opacity in case the
	 * shared styles gate on additional state. */
	opacity: 1;
}
`,gs=["top","right","bottom","left"],bs=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],vs=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],_s={id:"reference-edit-mode",type:"viewport",title:"Reference image edit mode",mount:()=>{const e=x("cf-test2-default"),t={left:`${ns}px`,top:`${ls}px`,width:`${cs}px`,height:`${ds}px`,transform:`rotate(${ps}deg)`,transformOrigin:"50% 50%"};return n`
			<div class="docs-viewport-host">
				<style>${us}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				<div class="reference-image-layer reference-image-layer--front">
					<div
						class="reference-image-layer__entry reference-image-layer__entry--selected reference-image-layer__entry--interactive docs-reference-image"
						style=${t}
					>
						<span>reference image (preview)</span>
					</div>
				</div>
				<div class="reference-image-selection-layer">
					<div
						class="frame-item frame-item--selected frame-item--active reference-image-transform-box"
						data-anchor-handle="center"
						style=${t}
					>
						${gs.map(o=>n`
								<button
									key=${`edge-${o}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${o}`}
									aria-label=${o}
								></button>
							`)}
						${bs.map(o=>n`
								<button
									key=${`resize-${o}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${o}`}
									aria-label="resize"
								></button>
							`)}
						${vs.map(o=>n`
								<button
									key=${`rotate-${o}`}
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${o}`}
									aria-label="rotate"
								></button>
							`)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{left:"50%",top:"50%"}}
							aria-label="anchor"
						></button>
					</div>
				</div>
			</div>
		`}},ms=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`;function j(e,t){return{id:e,name:t,itemRefs:[]}}function G({id:e,name:t,fileName:o,group:s,order:l}){return{id:e,assetId:`asset-${e}`,name:t,fileName:o,group:s,order:l,previewVisible:!0,exportEnabled:!0,opacity:1,scalePct:100,rotationDeg:0,offsetPx:{x:0,y:0},anchor:{ax:.5,ay:.5}}}function fe(e,t){const o=$();return n`
		<div class="docs-section-host">
			<style>${ms}</style>
			<div class="docs-section-host__card">
				<${Bt}
					store=${e}
					controller=${()=>o}
					t=${(l,c)=>b(t,l,c)}
					open=${!0}
				/>
			</div>
		</div>
	`}const hs={id:"reference-presets",type:"panel",title:"Reference Presets row",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[j("reference-preset-blank","(blank)"),j("reference-preset-outdoor","屋外ロケハン"),j("reference-preset-storyboard","コンテ A")],panelPresetId:"reference-preset-outdoor",items:[]}});return fe(t,e)}},fs={id:"reference-manager",type:"panel",title:"Reference Manager list",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[j("reference-preset-blank","(blank)")],panelPresetId:"reference-preset-blank",items:[G({id:"ref-1",name:"Layout",fileName:"layout.png",group:"front",order:0}),G({id:"ref-2",name:"Rough Sketch",fileName:"rough.png",group:"back",order:1}),G({id:"ref-3",name:"Pose Reference",fileName:"pose-reference.jpg",group:"front",order:2})]}});return fe(t,e)}},ys=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,xs={id:"section-display-zoom",type:"panel",title:"Display Zoom section",size:{width:360},mount:({lang:e})=>{const t=v(),o=$();return n`
			<div class="docs-section-host">
				<style>${ys}</style>
				<div class="docs-section-host__card">
					<${Dt}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
					/>
				</div>
			</div>
		`}},$s=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,ws={id:"shot-camera-manager",type:"panel",title:"Shot Camera Manager list",size:{width:360},annotations:[{n:1,selector:"#new-shot-camera",label:"追加"},{n:2,selector:"#duplicate-shot-camera",label:"複製"},{n:3,selector:"#delete-shot-camera",label:"削除"},{n:4,selector:".shot-camera-manager__list",label:"shot 一覧"}],mount:({lang:e})=>{const t=B({id:"shot-camera-1",name:"Camera 1"}),o=[t,B({id:"shot-camera-2",name:"Camera 2",source:t}),B({id:"shot-camera-3",name:"Camera 3",source:t})],s=o[1],l=$();return n`
			<div class="docs-section-host">
				<style>${$s}</style>
				<div class="docs-section-host__card">
					<${Ut}
						activeShotCamera=${s}
						controller=${()=>l}
						shotCameras=${o}
						t=${(a,m)=>b(e,a,m)}
					/>
				</div>
			</div>
		`}},ks=`
.docs-section-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-section-host__card {
	width: 360px;
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
`,Is={id:"shot-camera-properties",type:"panel",title:"Shot Camera Properties section",size:{width:360},mount:({lang:e})=>{const t=v({shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),o=$();return n`
			<div class="docs-section-host">
				<style>${ks}</style>
				<div class="docs-section-host__card">
					<${Vt}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
						equivalentMmValue=${t.equivalentMmValue.value}
						fovLabel=${t.fovLabel.value}
						shotCameraClipMode="auto"
						open=${!0}
					/>
				</div>
			</div>
		`}},Ss=`
.docs-rail-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
	color: #e8ecf1;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.docs-rail-host__card {
	width: 64px;
	padding: 12px 8px;
	background: #10161e;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 14px;
}
`,Es={id:"tool-rail",type:"panel",title:"Viewport tool rail",mount:({lang:e})=>{const t=v(),o=$(),s=(l,c)=>b(e,l,c);return n`
			<div class="docs-rail-host">
				<style>${Ss}</style>
				<div class="docs-rail-host__card">
					<${Nt}
						store=${t}
						controller=${()=>o}
						t=${s}
						mode="camera"
						projectMenuItems=${[{id:"new-project",icon:"plus",label:s("menu.newProjectAction"),shortcut:"Ctrl+N"},{id:"open-files",icon:"folder-open",label:s("action.openFiles"),shortcut:"Ctrl+O"},{id:"save-project",icon:"save",label:s("menu.saveWorkingStateAction"),shortcut:"Ctrl+S"},{id:"export-project",icon:"package",label:s("menu.savePackageAction"),shortcut:"Ctrl+Shift+S"}]}
						showQuickMenu=${!0}
					/>
				</div>
			</div>
		`}},zs=`
.docs-viewport-host {
	position: relative;
	width: ${L}px;
	height: ${M}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-viewport-host .render-box__resize-handle {
	opacity: 1 !important;
}
.docs-viewport-host .render-box__pan-edge {
	opacity: 0.5;
}
.docs-trajectory-layer {
	position: absolute;
	inset: 0;
	pointer-events: none;
}
.docs-trajectory-layer svg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	overflow: visible;
}
.docs-trajectory-path {
	fill: none;
	stroke: rgba(255, 225, 136, 0.95);
	stroke-width: 2.5;
	stroke-linecap: round;
	stroke-linejoin: round;
	filter: drop-shadow(0 0 6px rgba(255, 225, 136, 0.45));
}
.docs-trajectory-handle-line {
	fill: none;
	stroke: rgba(255, 225, 136, 0.55);
	stroke-width: 1.5;
	stroke-dasharray: 4 3;
}
.docs-trajectory-node {
	position: absolute;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 225, 136, 0.96);
	border: 2px solid rgba(40, 28, 8, 0.85);
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.48);
}
.docs-trajectory-node--active {
	background: rgba(255, 120, 80, 0.98);
	border-color: rgba(40, 16, 8, 0.88);
}
.docs-trajectory-tangent {
	position: absolute;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 215, 110, 0.88);
	border: 1.5px solid rgba(40, 28, 8, 0.75);
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.38);
}
`,Ts=[{id:"frame-1",label:"A",active:!1,left:8,top:28,width:22,height:44},{id:"frame-2",label:"B",active:!0,left:39,top:12,width:22,height:76},{id:"frame-3",label:"C",active:!1,left:70,top:28,width:22,height:44}],w={x:D+V*.19,y:U+N*.5},_={x:D+V*.5,y:U+N*.5},k={x:D+V*.81,y:U+N*.5},S={x:w.x+60,y:w.y-70},E={x:_.x-60,y:_.y+70},z={x:_.x+60,y:_.y-70},T={x:k.x-60,y:k.y+70};function Rs(e){return{id:e.id,label:e.label,active:e.active,left:`${e.left}%`,top:`${e.top}%`,width:`${e.width}%`,height:`${e.height}%`}}const Cs={id:"trajectory-spline",type:"viewport",title:"Camera mode with spline trajectory",mount:()=>{const e=x("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${zs}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:Ts.map(Rs)})}
				<div class="docs-trajectory-layer">
					<svg>
						<path
							class="docs-trajectory-path"
							d=${`M ${w.x} ${w.y} C ${S.x} ${S.y}, ${E.x} ${E.y}, ${_.x} ${_.y} C ${z.x} ${z.y}, ${T.x} ${T.y}, ${k.x} ${k.y}`}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${w.x}
							y1=${w.y}
							x2=${S.x}
							y2=${S.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${E.x}
							y1=${E.y}
							x2=${_.x}
							y2=${_.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${_.x}
							y1=${_.y}
							x2=${z.x}
							y2=${z.y}
						/>
						<line
							class="docs-trajectory-handle-line"
							x1=${T.x}
							y1=${T.y}
							x2=${k.x}
							y2=${k.y}
						/>
					</svg>
					<span
						class="docs-trajectory-node"
						style=${{left:`${w.x}px`,top:`${w.y}px`}}
					></span>
					<span
						class="docs-trajectory-node docs-trajectory-node--active"
						style=${{left:`${_.x}px`,top:`${_.y}px`}}
					></span>
					<span
						class="docs-trajectory-node"
						style=${{left:`${k.x}px`,top:`${k.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{left:`${S.x}px`,top:`${S.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{left:`${E.x}px`,top:`${E.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{left:`${z.x}px`,top:`${z.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent"
						style=${{left:`${T.x}px`,top:`${T.y}px`}}
					></span>
				</div>
			</div>
		`}},Os=800,Ps=560,f=400,y=310,R=70,C=90,Fs=`
.docs-viewport-host {
	position: relative;
	width: ${Os}px;
	height: ${Ps}px;
	background: #04070c;
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	color: #e8ecf1;
}
.docs-viewport-host__backdrop {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
	user-select: none;
}
.docs-gizmo-layer {
	position: absolute;
	inset: 0;
	pointer-events: none;
}
.docs-gizmo-layer svg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	overflow: visible;
}
.docs-gizmo-handle {
	position: absolute;
	transform: translate(-50%, -50%);
	min-width: 26px;
	min-height: 26px;
	padding: 0 8px;
	border-radius: 999px;
	background: rgba(6, 17, 30, 0.94);
	border: 1px solid currentColor;
	color: currentColor;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	letter-spacing: 0.06em;
	font-size: 12px;
}
.docs-gizmo-handle--x { color: #ff5f74; }
.docs-gizmo-handle--y { color: #bddb35; }
.docs-gizmo-handle--z { color: #5ba7ff; }
.docs-gizmo-handle--scale {
	color: rgba(245, 215, 130, 0.98);
	border-color: rgba(245, 215, 130, 0.98);
	background: rgba(40, 28, 8, 0.92);
	border-radius: 6px;
}
`,js={id:"transform-gizmo",type:"viewport",title:"Transform gizmo over selected asset",mount:()=>{const e=x("cf-test2-default"),t={x:f+R*.95,y:y+R*.15},o={x:f-R*.1,y:y-R*.98},s={x:f+R*.5,y:y+R*.75};return n`
			<div class="docs-viewport-host">
				<style>${Fs}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				<div class="docs-gizmo-layer">
					<svg>
						<!-- Rotate rings (ellipses approximating the projected rings) -->
						<ellipse
							cx=${f}
							cy=${y}
							rx=${C}
							ry=${C*.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${f}
							cy=${y}
							rx=${C*.32}
							ry=${C}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${f}
							cy=${y}
							rx=${C*.78}
							ry=${C*.78}
							fill="none"
							stroke="#5ba7ff"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<!-- Move arrows -->
						<line
							x1=${f}
							y1=${y}
							x2=${t.x}
							y2=${t.y}
							stroke="#ff5f74"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${f}
							y1=${y}
							x2=${o.x}
							y2=${o.y}
							stroke="#bddb35"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${f}
							y1=${y}
							x2=${s.x}
							y2=${s.y}
							stroke="#5ba7ff"
							stroke-width="3"
							stroke-linecap="round"
						/>
					</svg>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--x docs-gizmo-handle docs-gizmo-handle--x"
						style=${{left:`${t.x}px`,top:`${t.y}px`}}
					>
						X
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--y docs-gizmo-handle docs-gizmo-handle--y"
						style=${{left:`${o.x}px`,top:`${o.y}px`}}
					>
						Y
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--z docs-gizmo-handle docs-gizmo-handle--z"
						style=${{left:`${s.x}px`,top:`${s.y}px`}}
					>
						Z
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--scale docs-gizmo-handle docs-gizmo-handle--scale"
						style=${{left:`${f}px`,top:`${y}px`}}
					>
						S
					</span>
				</div>
			</div>
		`}};p(xs);p(Is);p(ws);p(Bo);p(So);p($o);p(ko);p(ho);p(Ro);p(no);p(Es);p(uo);p(Ao);p(Mo);p(Fo);p(hs);p(fs);p(bo);p(Vo);p(No);p(Yo);p(Jo);p(Qo);p(_s);p(ts);p(os);p(ss);p(is);p(Cs);p(js);p(to);const As="ja",Ls=`
.docs-stage { position: relative; }
.docs-stage > .docs-annotation-overlay {
	position: absolute;
	inset: 0;
	z-index: 2000;
	pointer-events: none;
}
.docs-stage > .docs-annotation-overlay > .docs-annotation {
	position: absolute;
	transform: translate(-50%, -50%);
	background: rgba(255, 190, 70, 0.97);
	color: #121417;
	width: 26px;
	height: 26px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.82rem;
	font-weight: 700;
	line-height: 1;
	box-shadow:
		0 0 0 2px rgba(255, 255, 255, 0.95),
		0 2px 6px rgba(0, 0, 0, 0.6);
	font-variant-numeric: tabular-nums;
}
.docs-stage > .docs-annotation-overlay > .docs-annotation--missing {
	background: rgba(255, 70, 70, 0.95);
	color: #fff;
}
`;function Ms({fixtureId:e,available:t}){return n`
		<div class="docs-missing">
			<h1>Fixture not found</h1>
			<p>Requested id: <code>${e||"(none)"}</code></p>
			<p>Known fixtures:</p>
			<ul>
				${t.map(o=>n`
						<li key=${o}>
							<a href=${`?fixture=${encodeURIComponent(o)}`}>${o}</a>
						</li>
					`)}
			</ul>
		</div>
	`}function Ds({annotations:e}){const[t,o]=Yt([]);return Wt(()=>{if(!Array.isArray(e)||e.length===0){o([]);return}const s=document.querySelector(".docs-stage");if(!s){o([]);return}const l=s.getBoundingClientRect(),c=e.map(a=>{const m=a.selector?s.querySelector(a.selector):null;if(!m)return{n:a.n,label:a.label??"",selector:a.selector??"",x:8,y:8,missing:!0};const g=m.getBoundingClientRect();return{n:a.n,label:a.label??"",selector:a.selector,x:g.left+g.width/2-l.left,y:g.top+g.height/2-l.top,missing:!1}});o(c)},[e]),t.length===0?null:n`
		<div class="docs-annotation-overlay" aria-hidden="true">
			${t.map(s=>n`
					<span
						key=${`${s.n}:${s.selector}`}
						class=${s.missing?"docs-annotation docs-annotation--missing":"docs-annotation"}
						style=${{left:`${s.x}px`,top:`${s.y}px`}}
						title=${s.missing?`${s.label} (selector not found: ${s.selector})`:s.label}
					>
						${s.n}
					</span>
				`)}
		</div>
	`}function Us({fixtureId:e,lang:t}){const o=Kt(e);if(!o)return n`<${Ms}
			fixtureId=${e}
			available=${ve()}
		/>`;const s=Array.isArray(o.annotations)?o.annotations:[];return n`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${e}
			data-fixture-type=${o.type}
			data-lang=${t}
		>
			<style>${Ls}</style>
			${o.mount({lang:t})}
			${s.length>0&&n`<${Ds} annotations=${s}/>`}
		</div>
	`}function ge(e,t){try{const o=new URL(globalThis.location.href).searchParams.get(e);return o===null?t:o}catch{return t}}function Vs(e){let t=!1;const o=()=>{t||(t=!0,globalThis.__DOCS_FIXTURE_READY=!0,globalThis.__DOCS_FIXTURE_ID=e)};requestAnimationFrame(()=>{requestAnimationFrame(o)}),setTimeout(o,100)}function Ns(){const e=document.getElementById("docs-root");if(!e)return;const t=ge("fixture",""),o=ge("lang",As);globalThis.__DOCS_FIXTURE_READY=!1,globalThis.__DOCS_FIXTURE_ID=t,globalThis.__DOCS_FIXTURE_IDS=ve(),Ht(n`<${Us} fixtureId=${t} lang=${o} />`,e),Vs(t)}Ns();
