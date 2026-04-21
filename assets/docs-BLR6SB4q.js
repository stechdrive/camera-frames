import{f3 as Ce,fB as ie,go as ae,ft as n,fG as re,fF as I,gp as R,gq as Pe,gr as Ae,gs as Fe,gt as Oe,gu as je,gv as Le,gw as Me,gx as De,gy as Ue,gz as He,gA as Ve,gB as Ne,gC as Ye,gD as Be,gE as We,gF as Ge,gG as Xe,gH as Ke,gI as Ze,gJ as qe,gK as Je,gL as Qe,gM as et,gN as tt,gO as ot,gP as st,gQ as it,gR as at,gS as rt,gT as nt,gU as lt,gV as ct,gW as dt,gX as pt,gY as ut,gZ as gt,g_ as bt,g$ as vt,h0 as _t,h1 as ht,h2 as mt,h3 as ft,h4 as yt,h5 as xt,h6 as $t,h7 as wt,h8 as kt,h9 as It,ha as St,hb as Et,hc as Tt,hd as zt,he as Rt,hf as Ct,hg as Pt,hh as At,hi as Ft,hj as Ot,gi as _e,cY as b,gn as jt,g1 as Lt,f$ as Mt,hk as Dt,fu as G,fV as Ut,fD as Ht,g8 as Vt,fO as Nt,et as Yt,hl as ne,hm as Bt,fH as Wt,hn as Gt,d5 as B,ho as Xt,ga as Kt,fU as Zt,gm as qt,fN as Jt,fw as Qt}from"./viewport-shell-FofjvnX9.js";function eo({controller:e,open:t=!0,summaryActions:o=null,onToggle:s=null,showList:l=!0,store:c,t:a}){var Q,ee;const _=c.referenceImages.assets.value,g=c.referenceImages.items.value,Z=Ce(g),Ie=c.referenceImages.presets.value,Y=c.referenceImages.previewSessionVisible.value,Se=c.referenceImages.selectedAssetId.value,q=c.referenceImages.selectedItemId.value,Ee=new Set(c.referenceImages.selectedItemIds.value??[]),Te=c.referenceImages.panelPresetId.value,u=g.find(i=>i.id===q)??null,J=_.find(i=>i.id===((u==null?void 0:u.assetId)??Se))??null,ze=(i,r,d)=>{var m,te,P,oe,A,se;(te=(m=e())==null?void 0:m.selectReferenceImageItem)==null||te.call(m,r,{additive:i.ctrlKey||i.metaKey,toggle:i.ctrlKey||i.metaKey,range:i.shiftKey,orderedIds:d}),(oe=(P=e())==null?void 0:P.isReferenceImageSelectionActive)!=null&&oe.call(P)&&((se=(A=e())==null?void 0:A.activateViewportReferenceImageEditModeImplicit)==null||se.call(A))};function Re({selected:i=!1,active:r=!1}){const d=["scene-asset-row"];return i&&d.push("scene-asset-row--selected"),r&&d.push("scene-asset-row--active"),d.join(" ")}return n`
		<${ie}
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
					class=${Y?"button button--primary button--compact":"button button--compact"}
					onClick=${()=>{var i,r;return(r=(i=e())==null?void 0:i.setReferenceImagePreviewSessionVisible)==null?void 0:r.call(i,!Y)}}
				>
					${a(Y?"action.hideReferenceImages":"action.showReferenceImages")}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${a("referenceImage.activePreset")}</span>
					<select
						value=${Te}
						...${ae}
						onChange=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setActiveReferenceImagePreset)==null?void 0:d.call(r,i.currentTarget.value)}}
					>
						${Ie.map(i=>n`
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
												${Z.map(i=>n`
														<article
															class=${Re({selected:Ee.has(i.id),active:i.id===q})}
															onClick=${r=>ze(r,i.id,Z.map(d=>d.id))}
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
																<${re}
																	icon=${i.previewVisible?"eye":"eye-off"}
																	label=${a(i.previewVisible?"assetVisibility.visible":"assetVisibility.hidden")}
																	active=${i.previewVisible}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,m;r.stopPropagation(),(m=(d=e())==null?void 0:d.setReferenceImagePreviewVisible)==null||m.call(d,i.id,!i.previewVisible)}}
																/>
																<${re}
																	icon=${i.exportEnabled?"export":"slash-circle"}
																	label=${i.exportEnabled?a("action.excludeReferenceImageFromExport"):a("action.includeReferenceImageInExport")}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,m;r.stopPropagation(),(m=(d=e())==null?void 0:d.setReferenceImageExportEnabled)==null||m.call(d,i.id,!i.exportEnabled)}}
																/>
															</div>
														</article>
													`)}
											</div>
										`:n`<p class="summary">${a("referenceImage.currentCameraEmpty")}</p>`}
						</section>
					`}
				${u&&J?n`
								<${ie}
									icon="image"
									label=${u.name}
									open=${!0}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${u.name} ·
											${J.fileName||a("referenceImage.untitled")}
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
													<${R} value="%" title=${a("unit.percent")} />
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
													<${R} value="%" title=${a("unit.percent")} />
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
														value=${Number(((Q=u.offsetPx)==null?void 0:Q.x)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.x"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"x",i)}}
													/>
													<${R} value="px" title=${a("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${a("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="1"
														value=${Number(((ee=u.offsetPx)==null?void 0:ee.y)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.y"
														onCommit=${i=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"y",i)}}
													/>
													<${R} value="px" title=${a("unit.pixel")} />
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
													<${R} value="deg" title=${a("unit.degree")} />
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
													...${ae}
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
	`}const le={id:"hello",type:"panel",title:"Hello docs fixture",mount:({lang:e})=>n`
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
	`},to=`
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
`;function oo(){const t=Object.entries(Object.assign({"../../ui/svg/apply-transform.svg":Ot,"../../ui/svg/camera-dslr.svg":Ft,"../../ui/svg/camera-frames.svg":At,"../../ui/svg/camera-property.svg":Pt,"../../ui/svg/camera.svg":Ct,"../../ui/svg/chevron-left.svg":Rt,"../../ui/svg/chevron-right.svg":zt,"../../ui/svg/clock.svg":Tt,"../../ui/svg/close.svg":Et,"../../ui/svg/copy-to-camera.svg":St,"../../ui/svg/copy-to-viewport.svg":It,"../../ui/svg/cursor.svg":kt,"../../ui/svg/duplicate.svg":wt,"../../ui/svg/export-tab.svg":$t,"../../ui/svg/export.svg":xt,"../../ui/svg/eye-off.svg":yt,"../../ui/svg/eye.svg":ft,"../../ui/svg/folder-open.svg":mt,"../../ui/svg/frame-plus.svg":ht,"../../ui/svg/frame.svg":_t,"../../ui/svg/grip.svg":vt,"../../ui/svg/help.svg":bt,"../../ui/svg/image.svg":gt,"../../ui/svg/lens.svg":ut,"../../ui/svg/light.svg":pt,"../../ui/svg/link.svg":dt,"../../ui/svg/lock-open.svg":ct,"../../ui/svg/lock.svg":lt,"../../ui/svg/mask-all.svg":nt,"../../ui/svg/mask-selected.svg":rt,"../../ui/svg/mask.svg":at,"../../ui/svg/menu.svg":it,"../../ui/svg/move.svg":st,"../../ui/svg/package-open.svg":ot,"../../ui/svg/package.svg":tt,"../../ui/svg/pie-menu.svg":et,"../../ui/svg/pin.svg":Qe,"../../ui/svg/pivot.svg":Je,"../../ui/svg/plus.svg":qe,"../../ui/svg/redo.svg":Ze,"../../ui/svg/reference-preview-off.svg":Ke,"../../ui/svg/reference-preview-on.svg":Xe,"../../ui/svg/reference-tool.svg":Ge,"../../ui/svg/reference.svg":We,"../../ui/svg/render-box.svg":Be,"../../ui/svg/reset.svg":Ye,"../../ui/svg/ruler.svg":Ne,"../../ui/svg/save.svg":Ve,"../../ui/svg/scene.svg":He,"../../ui/svg/scrub.svg":Ue,"../../ui/svg/selection-clear.svg":De,"../../ui/svg/settings.svg":Me,"../../ui/svg/slash-circle.svg":Le,"../../ui/svg/trash.svg":je,"../../ui/svg/undo.svg":Oe,"../../ui/svg/view.svg":Fe,"../../ui/svg/viewport.svg":Ae,"../../ui/svg/zoom.svg":Pe})).map(([o,s])=>{const l=o.match(/\/([^/]+)\.svg$/i),c=l?l[1]:null;return c&&typeof s=="string"?{name:c,rawSvg:s}:null}).filter(Boolean);return t.sort((o,s)=>o.name.localeCompare(s.name)),t}const ce={id:"icons-all",type:"reference",title:"All workbench icons",mount:({lang:e})=>{const t=oo();return n`
			<div class="docs-icons-all">
				<style>${to}</style>
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
		`}},L={[le.id]:le,[ce.id]:ce};function p(e){if(!e||typeof e.id!="string"||e.id.length===0)throw new Error("registerFixture: fixture.id must be a non-empty string");if(Object.hasOwn(L,e.id))throw new Error(`registerFixture: duplicate id "${e.id}"`);L[e.id]=e}function so(e){return typeof e!="string"||e===""?null:L[e]??null}function he(){return Object.keys(L)}const io="/camera-frames/docs/help/assets/fixture-backdrops/",ao={"cf-test2-default":{id:"cf-test2-default",backdropUrl:`${io}cf-test2-default.png`,width:1073,height:1264,description:"cf-test2 の仮のシーン（権利クリア済みの motorbike スプラット）"}};function w(e){const t=ao[e];if(!t)throw new Error(`makeScene: unknown scene "${e}"`);return t}const ro=960,no=600,lo=`
.docs-layout-host {
	position: relative;
	width: ${ro}px;
	height: ${no}px;
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
`,co=[{active:!1},{active:!1},{active:!1},{active:!1},{active:!0},{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}],po={id:"app-layout-overview",type:"composite",title:"Full app layout overview",annotations:[{n:1,selector:".docs-layout-host__viewport",label:"Viewport"},{n:2,selector:".workbench-card--tool-rail",label:"Tool Rail"},{n:3,selector:".workbench-card--inspector",label:"Inspector"},{n:4,selector:".viewport-project-status",label:"Project Status HUD"}],mount:()=>{const e=w("cf-test2-default");return n`
			<div class="docs-layout-host">
				<style>${lo}</style>
				<aside class="docs-layout-host__rail workbench-card workbench-card--tool-rail">
					${co.map((t,o)=>n`
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
		`}},uo=800,go=560,bo=`
.docs-viewport-host {
	position: relative;
	width: ${uo}px;
	height: ${go}px;
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
`,de={x:{x2:"92",y2:"50"},y:{x2:"50",y2:"8"},z:{x2:"50",y2:"50"}},vo=[{key:"pos-x",cls:"positive--x",label:"X",left:"92%",top:"50%"},{key:"pos-y",cls:"positive--y",label:"Y",left:"50%",top:"8%"},{key:"pos-z",cls:"positive--z",label:"Z",left:"50%",top:"50%"},{key:"neg-x",cls:"negative--x",label:"",left:"8%",top:"50%"},{key:"neg-y",cls:"negative--y",label:"",left:"50%",top:"92%"},{key:"neg-z",cls:"negative--z",label:"",left:"50%",top:"50%"}];function _o(){return n`
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
							x2=${de[e].x2}
							y2=${de[e].y2}
						/>
					`)}
			</svg>
			${vo.map(e=>n`
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
	`}const ho={id:"axis-gizmo",type:"viewport",title:"Viewport axis gizmo (orthographic posZ)",mount:()=>{const e=w("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${bo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${_o()}
			</div>
		`}},M=800,D=560,me=110,fe=70,X=580,K=420,mo="rgba(255, 87, 72, 0.92)",pe="rgba(255, 182, 170, 0.98)",fo="rgba(255, 87, 72, 0.18)",yo="#ffd8d1";function U(e){return{widthPct:e*(1536/1754)*100,heightPct:e*(864/1240)*100}}const xo=`
.docs-viewport-host {
	position: relative;
	width: ${M}px;
	height: ${D}px;
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
`,$o=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],wo=["top","right","bottom","left"];function H({frames:e=[],anchorOffset:t={left:"50%",top:"50%"}}={}){return n`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{left:`${me}px`,top:`${fe}px`,width:`${X}px`,height:`${K}px`}}
		>
			${e.map(o=>n`
					<div
						key=${o.id}
						class=${`frame-item${o.active?" frame-item--active frame-item--selected":""}`}
						style=${{left:o.left,top:o.top,width:o.width,height:o.height,border:`2px solid ${mo}`,boxSizing:"border-box",background:"transparent",boxShadow:o.active?`inset 0 0 0 1px ${pe}`:"none"}}
					>
						${o.active&&n`
							<span
								aria-hidden="true"
								style=${{position:"absolute",inset:"-1px",border:`1px dashed ${pe}`,borderRadius:"1px",pointerEvents:"none"}}
							></span>
						`}
						<span
							style=${{position:"absolute",top:"-22px",left:"0",padding:"2px 9px",borderRadius:"999px",background:fo,color:yo,fontFamily:'"Consolas", "Andale Mono", monospace',fontSize:"11px",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}
						>
							${o.label}
						</span>
					</div>
				`)}
			${$o.map(o=>n`
					<button
						key=${`resize-${o}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${o}`}
						aria-label="resize"
					></button>
				`)}
			${wo.map(o=>n`
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
	`}const ko={id:"camera-mode-render-box",type:"viewport",title:"Camera mode with render-box overlay",mount:()=>{const e=w("cf-test2-default"),{widthPct:t,heightPct:o}=U(1);return n`
			<div class="docs-viewport-host">
				<style>${xo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
			</div>
		`}},Io=`
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
`,So={id:"confirm-new-project",type:"overlay",title:"Confirm: New Project",mount:()=>n`
			<div class="docs-overlay-host">
				<style>${Io}</style>
				<${_e} overlay=${{kind:"confirm",title:"新規プロジェクトを作成しますか？",message:"現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。",actions:[{label:"キャンセル",onClick:()=>{}},{label:"破棄して新規作成",primary:!0,onClick:()=>{}}]}} />
			</div>
		`},Eo=800,To=560,zo=`
.docs-viewport-host {
	position: relative;
	width: ${Eo}px;
	height: ${To}px;
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
`,Ro={id:"drop-hint",type:"viewport",title:"Viewport drop hint (empty project)",mount:({lang:e})=>{const t=(o,s)=>b(e,o,s);return n`
			<div class="docs-viewport-host">
				<style>${zo}</style>
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
		`}},ue="__calls",ge="__methods";function h(e={}){const t=e.log===!0,o=e.methods??null,s=[],l={[ue]:s,[ge]:o};return new Proxy(l,{get(c,a){if(typeof a!="string")return Reflect.get(c,a);if(a===ue)return s;if(a===ge)return o;const _=o&&Object.hasOwn(o,a)?o[a]:null;return(...g)=>{if(s.push({method:a,args:g}),t&&console.debug(`[mock-controller] ${a}`,g),_)return _(...g)}}})}function v(e={}){const t=jt(null);return ye(t,e,[]),t}function ye(e,t,o){for(const[s,l]of Object.entries(t)){const c=o.concat(s),a=e==null?void 0:e[s];if(a==null)throw new Error(`createMockStore: unknown path "${c.join(".")}"`);if(Co(a)){Po(a,l,c);continue}if(be(a)&&be(l)){ye(a,l,c);continue}throw new Error(`createMockStore: cannot assign "${c.join(".")}" — target is neither a signal nor a namespace`)}}function Co(e){return e!==null&&typeof e=="object"&&"value"in e&&typeof e.peek=="function"}function be(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function Po(e,t,o){try{e.value=t}catch(s){const l=s instanceof Error?s.message:String(s);throw new Error(`createMockStore: cannot assign to "${o.join(".")}" (computed or read-only): ${l}`)}}const Ao=`
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
`,Fo={id:"export-output-section",type:"panel",title:"Export Output section",size:{width:360},mount:({lang:e})=>{const t=v(),o=h();return n`
			<div class="docs-section-host">
				<style>${Ao}</style>
				<div class="docs-section-host__card">
					<${Lt}
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
		`}},Oo=`
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
`,jo={id:"export-progress",type:"overlay",title:"Export progress overlay",mount:()=>{const t={kind:"progress",title:"書き出し中",message:"すべての shot をレンダリングしています。",startedAt:Date.now()-47*1e3,phaseLabel:"shot 2 / 4 をレンダリング",phaseDetail:"Camera 2 — PSD 書き出し",phases:[{label:"Camera 1",status:"done"},{label:"Camera 2",status:"active"},{label:"Camera 3",status:"pending"},{label:"Camera 4",status:"pending"}],steps:[{label:"projectをスナップショット",status:"done"},{label:"各ショットをレンダリング",status:"active"},{label:"zip アーカイブを生成",status:"pending"}]};return n`
			<div class="docs-overlay-host">
				<style>${Oo}</style>
				<${_e} overlay=${t} />
			</div>
		`}},Lo=`
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
`,Mo={id:"export-settings-section",type:"panel",title:"Export Settings section",size:{width:360},mount:({lang:e})=>{const t=v(),o=h();return n`
			<div class="docs-section-host">
				<style>${Lo}</style>
				<div class="docs-section-host__card">
					<${Mt}
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
		`}},Do=800,Uo=560,Ho=`
.docs-viewport-host {
	position: relative;
	width: ${Do}px;
	height: ${Uo}px;
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
`,Vo={id:"first-scene-loaded",type:"viewport",title:"Viewport after first scene load",mount:()=>{const e=w("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Ho}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
			</div>
		`}},No=800,Yo=560,Bo=`
.docs-viewport-host {
	position: relative;
	width: ${No}px;
	height: ${Yo}px;
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
`,Wo={id:"measurement-overlay",type:"viewport",title:"Measurement overlay (line + chip)",mount:({lang:e})=>{const t=w("cf-test2-default"),o=v({measurement:{active:!0,startPointWorld:{x:0,y:0,z:0},endPointWorld:{x:1,y:0,z:0},selectedPointKey:"end",lengthInputText:"",overlay:{contextKind:"viewport",start:{visible:!0,x:260,y:360},end:{visible:!0,x:540,y:300},draftEnd:{visible:!1,x:0,y:0},lineVisible:!0,lineUsesDraft:!1,chip:{visible:!0,x:400,y:310,label:"53.42 cm",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}}}),s=h(),l=(c,a)=>b(e,c,a);return n`
			<div class="docs-viewport-host">
				<style>${Bo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${t.backdropUrl}
					alt=${t.description}
				/>
				<${Dt}
					store=${o}
					controller=${()=>s}
					t=${l}
				/>
			</div>
		`}},Go=`
.docs-viewport-host {
	position: relative;
	width: ${M}px;
	height: ${D}px;
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
`,Xo=[{id:"frame-1",label:"FRAME A",center:{x:.5,y:.5},scale:1,active:!1},{id:"frame-2",label:"FRAME B",center:{x:.5755,y:.5169},scale:.5537,active:!0}];function Ko(e){const{widthPct:t,heightPct:o}=U(e.scale);return{id:e.id,label:e.label,active:e.active,left:`${e.center.x*100-t/2}%`,top:`${e.center.y*100-o/2}%`,width:`${t}%`,height:`${o}%`}}const Zo={id:"multiple-frames",type:"viewport",title:"Camera mode with multiple frames (zoom-in / TU)",mount:()=>{const e=w("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Go}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:Xo.map(Ko)})}
			</div>
		`}},qo=`
.docs-viewport-host {
	position: relative;
	width: ${M}px;
	height: ${D}px;
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
`,Jo={id:"render-box-camera-mode",type:"viewport",title:"Render-box in camera mode (annotated)",annotations:[{n:1,selector:".render-box__resize-handle--top-right",label:"リサイズハンドル（8 方向）"},{n:2,selector:".render-box__pan-edge--top",label:"パンエッジ（4 辺）"},{n:3,selector:"#anchor-dot",label:"anchor dot"},{n:4,selector:"#render-box-meta",label:"meta ラベル"}],mount:()=>{const e=w("cf-test2-default"),{widthPct:t,heightPct:o}=U(1);return n`
			<div class="docs-viewport-host">
				<style>${qo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
			</div>
		`}},Qo=`
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
`,es=[{icon:"plus",labelKey:"menu.newProjectAction",shortcut:"Ctrl+N"},{icon:"folder-open",labelKey:"action.openFiles",shortcut:"Ctrl+O"},{icon:"save",labelKey:"menu.saveWorkingStateAction",shortcut:"Ctrl+S"},{icon:"package",labelKey:"menu.savePackageAction",shortcut:"Ctrl+Shift+S"}];function xe({lang:e,urlValue:t="",focusRing:o=!1}){const s=l=>b(e,l);return n`
		<div class=${`docs-menu-host${o?" docs-menu-host__focus-ring":""}`}>
			<style>${Qo}</style>
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
								<${G} name="link" size=${14} />
							</span>
							<span>${s("action.loadUrl")}</span>
						</button>
					</div>
					${es.map(l=>n`
							<button
								key=${l.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${G} name=${l.icon} size=${14} />
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
	`}const ts={id:"open-menu",type:"overlay",title:"Tool Rail File menu (open)",mount:({lang:e})=>xe({lang:e})},os={id:"remote-url-input",type:"overlay",title:"Remote URL input (focused)",mount:({lang:e})=>xe({lang:e,urlValue:"https://example.com/scene.spz",focusRing:!0})},ss=`
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
`,is={id:"inspector-tabs",type:"panel",title:"Inspector tabs (Camera active)",mount:({lang:e})=>n`
			<div class="docs-tabs-host">
				<style>${ss}</style>
				<div class="docs-tabs-host__card">
					<${Ut}
						activeTab="camera"
						setActiveTab=${()=>{}}
						t=${(o,s)=>b(e,o,s)}
					/>
				</div>
			</div>
		`},as=`
.docs-widget-host {
	padding: 24px;
	display: inline-block;
	background: #08111d;
	box-sizing: border-box;
}
.docs-widget-host__card {
	padding: 20px;
	background: #161a1f;
	color: #e8ecf1;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 10px;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	display: inline-flex;
}
`,rs={id:"lighting-widget",type:"panel",title:"Lighting Direction widget",mount:()=>{const e=h();return n`
			<div class="docs-widget-host">
				<style>${as}</style>
				<div class="docs-widget-host__card">
					<${Ht}
						controller=${()=>e}
						azimuthDeg=${36.87}
						elevationDeg=${45}
						viewAzimuthDeg=${0}
						onLiveChange=${()=>{}}
					/>
				</div>
			</div>
		`}},ns=`
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
`,ls={id:"output-frame-section",type:"panel",title:"Output Frame section",size:{width:360},mount:({lang:e})=>{const t=v(),o=h();return n`
			<div class="docs-section-host">
				<style>${ns}</style>
				<div class="docs-section-host__card">
					<${Vt}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
						anchorOptions=${Nt(e)}
						exportSizeLabel=${t.exportSizeLabel.value}
						widthLabel=${t.widthLabel.value}
						heightLabel=${t.heightLabel.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},cs=240,ds=200,ps=480,us=400,gs=`
.docs-pie-host {
	position: relative;
	width: ${ps}px;
	height: ${us}px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;function $e({lang:e,coarse:t=!1}){const o=(c,a)=>b(e,c,a),s=Yt({mode:"camera",t:o,viewportToolMode:"select",viewportOrthographic:!1,referencePreviewSessionVisible:!0,hasReferenceImages:!1,frameMaskMode:"off"}),l=s.find(c=>c.id==="tool-select")??null;return n`
		<div class="docs-pie-host">
			<style>${gs}</style>
			<div
				class=${t?"viewport-pie viewport-pie--coarse":"viewport-pie"}
				style=${{left:`${cs}px`,top:`${ds}px`}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${(l==null?void 0:l.label)??o("action.quickMenu")}
					</span>
				</button>
				${s.map(c=>{const a=Math.cos(c.angle)*ne,_=Math.sin(c.angle)*ne,g=["viewport-pie__item",c.id===(l==null?void 0:l.id)||c.active?"viewport-pie__item--active":"",c.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ");return n`
						<button
							key=${c.id}
							type="button"
							class=${g}
							style=${{left:`${a}px`,top:`${_}px`}}
							disabled=${!!c.disabled}
						>
							<span class="viewport-pie__item-icon">
								<${G} name=${c.icon} size=${18} />
							</span>
						</button>
					`})}
			</div>
		</div>
	`}const bs={id:"pie-menu",type:"overlay",title:"Viewport pie menu (open)",mount:({lang:e})=>$e({lang:e,coarse:!1})},vs={id:"pie-menu-expanded",type:"overlay",title:"Viewport pie menu (coarse / expanded)",mount:({lang:e})=>$e({lang:e,coarse:!0})},_s=`
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
`;function V(e,t){const o=h();return n`
		<div class="docs-splat-toolbar-host">
			<style>${_s}</style>
			<${Bt}
				store=${e}
				controller=${()=>o}
				t=${(l,c)=>b(t,l,c)}
			/>
		</div>
	`}const hs={id:"splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (box tool, unplaced)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit"});return V(t,e)}},ms={id:"per-splat-brush-preview",type:"overlay",title:"Splat edit toolbar (brush tool)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"brush",brushSize:30,brushDepthMode:"depth",brushDepth:.2}});return V(t,e)}},fs={id:"per-splat-box-tool",type:"overlay",title:"Splat edit toolbar (box tool, placed)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",boxPlaced:!0,boxCenter:{x:.5,y:1.2,z:-.3},boxSize:{x:1,y:.6,z:1.4},boxRotation:{x:0,y:0,z:0,w:1},selectionCount:12345}});return V(t,e)}},ys={id:"per-splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (annotated)",annotations:[{n:1,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)",label:"Tool 選択"},{n:2,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)",label:"選択操作"},{n:3,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)",label:"編集アクション"},{n:4,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info",label:"選択数"}],mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",selectionCount:42}});return V(t,e)}},xs=800,$s=560,ws=200,ks=110,Is=400,Ss=300,Es=-4,Ts=`
.docs-viewport-host {
	position: relative;
	width: ${xs}px;
	height: ${$s}px;
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
`,zs=["top","right","bottom","left"],Rs=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Cs=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Ps={id:"reference-edit-mode",type:"viewport",title:"Reference image edit mode",mount:()=>{const e=w("cf-test2-default"),t={left:`${ws}px`,top:`${ks}px`,width:`${Is}px`,height:`${Ss}px`,transform:`rotate(${Es}deg)`,transformOrigin:"50% 50%"};return n`
			<div class="docs-viewport-host">
				<style>${Ts}</style>
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
						${zs.map(o=>n`
								<button
									key=${`edge-${o}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${o}`}
									aria-label=${o}
								></button>
							`)}
						${Rs.map(o=>n`
								<button
									key=${`resize-${o}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${o}`}
									aria-label="resize"
								></button>
							`)}
						${Cs.map(o=>n`
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
		`}},As=`
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
.docs-section-host__card .browser-group__heading strong {
	white-space: nowrap;
}
`;function C({id:e,kind:t,label:o,visible:s=!0}){return{id:e,kind:t,label:o,visible:s}}const Fs={id:"scene-manager",type:"panel",title:"Scene Manager (kind-grouped asset list)",size:{width:360},mount:({lang:e})=>{const t=[C({id:1,kind:"model",label:"Environment.glb"}),C({id:2,kind:"model",label:"Figure.glb"}),C({id:3,kind:"splat",label:"MainScan.ply"}),C({id:4,kind:"splat",label:"Foreground.spz",visible:!1}),C({id:5,kind:"splat",label:"Background.ply"})],o=t[2],s=v({selectedSceneAssetIds:[o.id],selectedSceneAssetId:o.id}),l=h();return n`
			<div class="docs-section-host">
				<style>${As}</style>
				<div class="docs-section-host__card">
					<${Wt}
						controller=${()=>l}
						draggedAssetId=${null}
						dragHoverState=${null}
						sceneAssets=${t}
						selectedSceneAsset=${o}
						setDraggedAssetId=${()=>{}}
						setDragHoverState=${()=>{}}
						store=${s}
						t=${(a,_)=>b(e,a,_)}
					/>
				</div>
			</div>
		`}},Os=`
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
`;function j(e,t){return{id:e,name:t,itemRefs:[]}}function W({id:e,name:t,fileName:o,group:s,order:l}){return{id:e,assetId:`asset-${e}`,name:t,fileName:o,group:s,order:l,previewVisible:!0,exportEnabled:!0,opacity:1,scalePct:100,rotationDeg:0,offsetPx:{x:0,y:0},anchor:{ax:.5,ay:.5}}}function we(e,t){const o=h();return n`
		<div class="docs-section-host">
			<style>${Os}</style>
			<div class="docs-section-host__card">
				<${eo}
					store=${e}
					controller=${()=>o}
					t=${(l,c)=>b(t,l,c)}
					open=${!0}
				/>
			</div>
		</div>
	`}const js={id:"reference-presets",type:"panel",title:"Reference Presets row",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[j("reference-preset-blank","(blank)"),j("reference-preset-outdoor","屋外ロケハン"),j("reference-preset-storyboard","コンテ A")],panelPresetId:"reference-preset-outdoor",items:[]}});return we(t,e)}},Ls={id:"reference-manager",type:"panel",title:"Reference Manager list",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[j("reference-preset-blank","(blank)")],panelPresetId:"reference-preset-blank",items:[W({id:"ref-1",name:"Layout",fileName:"layout.png",group:"front",order:0}),W({id:"ref-2",name:"Rough Sketch",fileName:"rough.png",group:"back",order:1}),W({id:"ref-3",name:"Pose Reference",fileName:"pose-reference.jpg",group:"front",order:2})]}});return we(t,e)}},Ms=`
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
`,Ds={id:"section-display-zoom",type:"panel",title:"Display Zoom section",size:{width:360},mount:({lang:e})=>{const t=v(),o=h();return n`
			<div class="docs-section-host">
				<style>${Ms}</style>
				<div class="docs-section-host__card">
					<${Gt}
						store=${t}
						controller=${()=>o}
						t=${l=>b(e,l)}
					/>
				</div>
			</div>
		`}},Us=`
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
`,Hs={id:"shot-camera-manager",type:"panel",title:"Shot Camera Manager list",size:{width:360},annotations:[{n:1,selector:"#new-shot-camera",label:"追加"},{n:2,selector:"#duplicate-shot-camera",label:"複製"},{n:3,selector:"#delete-shot-camera",label:"削除"},{n:4,selector:".shot-camera-manager__list",label:"shot 一覧"}],mount:({lang:e})=>{const t=B({id:"shot-camera-1",name:"Camera 1"}),o=[t,B({id:"shot-camera-2",name:"Camera 2",source:t}),B({id:"shot-camera-3",name:"Camera 3",source:t})],s=o[1],l=h();return n`
			<div class="docs-section-host">
				<style>${Us}</style>
				<div class="docs-section-host__card">
					<${Xt}
						activeShotCamera=${s}
						controller=${()=>l}
						shotCameras=${o}
						t=${(a,_)=>b(e,a,_)}
					/>
				</div>
			</div>
		`}},Vs=`
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
`,Ns={id:"shot-camera-properties",type:"panel",title:"Shot Camera Properties section",size:{width:360},mount:({lang:e})=>{const t=v({shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),o=h();return n`
			<div class="docs-section-host">
				<style>${Vs}</style>
				<div class="docs-section-host__card">
					<${Kt}
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
		`}},Ys=`
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
`,Bs={id:"tool-rail",type:"panel",title:"Viewport tool rail",mount:({lang:e})=>{const t=v(),o=h(),s=(l,c)=>b(e,l,c);return n`
			<div class="docs-rail-host">
				<style>${Ys}</style>
				<div class="docs-rail-host__card">
					<${Zt}
						store=${t}
						controller=${()=>o}
						t=${s}
						mode="camera"
						projectMenuItems=${[{id:"new-project",icon:"plus",label:s("menu.newProjectAction"),shortcut:"Ctrl+N"},{id:"open-files",icon:"folder-open",label:s("action.openFiles"),shortcut:"Ctrl+O"},{id:"save-project",icon:"save",label:s("menu.saveWorkingStateAction"),shortcut:"Ctrl+S"},{id:"export-project",icon:"package",label:s("menu.savePackageAction"),shortcut:"Ctrl+Shift+S"}]}
						showQuickMenu=${!0}
					/>
				</div>
			</div>
		`}},Ws=`
.docs-viewport-host {
	position: relative;
	width: ${M}px;
	height: ${D}px;
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
/* Trajectory styling mirrors .frame-trajectory-layer__* in app.css so
 * the capture matches the live spline overlay's palette (warm path,
 * cyan-vs-orange in/out tangent distinction, peach active node). */
.docs-trajectory-path {
	fill: none;
	stroke: rgba(255, 170, 120, 0.92);
	stroke-width: 3.5;
	stroke-linecap: round;
	stroke-linejoin: round;
}
.docs-trajectory-handle-line {
	fill: none;
	stroke-width: 2;
	stroke-dasharray: 10 8;
	filter: drop-shadow(0 0 1px rgba(6, 10, 18, 0.92));
}
.docs-trajectory-handle-line--in {
	stroke: rgba(145, 222, 255, 0.84);
}
.docs-trajectory-handle-line--out {
	stroke: rgba(255, 208, 158, 0.84);
}
.docs-trajectory-node {
	position: absolute;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 121, 88, 0.78);
	border: 2px solid rgba(9, 16, 25, 0.86);
}
.docs-trajectory-node--active {
	background: rgba(255, 225, 190, 0.98);
}
.docs-trajectory-tangent {
	position: absolute;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	border: 2px solid rgba(9, 16, 25, 0.86);
	filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.28));
}
.docs-trajectory-tangent--in {
	background: rgba(46, 118, 154, 0.98);
}
.docs-trajectory-tangent--out {
	background: rgba(163, 92, 34, 0.98);
}
`,k=[{id:"frame-1",label:"FRAME A",center:{x:.3933,y:.5404},scale:1,active:!1,tangent:{in:{x:-.0874,y:.0026},out:{x:.0874,y:-.0026}}},{id:"frame-2",label:"FRAME B",center:{x:.6461,y:.4232},scale:.8549,active:!0,tangent:{in:{x:-.077,y:.0809},out:{x:.077,y:-.0809}}}];function ke(e,t){return{x:me+X*e,y:fe+K*t}}function Gs(e){const{widthPct:t,heightPct:o}=U(e.scale);return{id:e.id,label:e.label,active:e.active,left:e.center.x*100-t/2,top:e.center.y*100-o/2,width:t,height:o}}const Xs=k.map(Gs),x=ke(k[0].center.x,k[0].center.y),$=ke(k[1].center.x,k[1].center.y);function N(e,t){return{x:e.x+t.x*X,y:e.y+t.y*K}}const F=N(x,k[0].tangent.in),S=N(x,k[0].tangent.out),E=N($,k[1].tangent.in),O=N($,k[1].tangent.out);function Ks(e){return{id:e.id,label:e.label,active:e.active,left:`${e.left}%`,top:`${e.top}%`,width:`${e.width}%`,height:`${e.height}%`}}const Zs={id:"trajectory-spline",type:"viewport",title:"Camera mode with spline trajectory (cf-test2 Camera 3)",mount:()=>{const e=w("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Ws}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${H({frames:Xs.map(Ks)})}
				<div class="docs-trajectory-layer">
					<svg>
						<path
							class="docs-trajectory-path"
							d=${`M ${x.x} ${x.y} C ${S.x} ${S.y}, ${E.x} ${E.y}, ${$.x} ${$.y}`}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${F.x}
							y1=${F.y}
							x2=${x.x}
							y2=${x.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${x.x}
							y1=${x.y}
							x2=${S.x}
							y2=${S.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${E.x}
							y1=${E.y}
							x2=${$.x}
							y2=${$.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${$.x}
							y1=${$.y}
							x2=${O.x}
							y2=${O.y}
						/>
					</svg>
					<span
						class="docs-trajectory-node"
						style=${{left:`${x.x}px`,top:`${x.y}px`}}
					></span>
					<span
						class="docs-trajectory-node docs-trajectory-node--active"
						style=${{left:`${$.x}px`,top:`${$.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${F.x}px`,top:`${F.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${S.x}px`,top:`${S.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${E.x}px`,top:`${E.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${O.x}px`,top:`${O.y}px`}}
					></span>
				</div>
			</div>
		`}},qs=800,Js=560,f=400,y=310,T=70,z=90,Qs=`
.docs-viewport-host {
	position: relative;
	width: ${qs}px;
	height: ${Js}px;
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
`,ei={id:"transform-gizmo",type:"viewport",title:"Transform gizmo over selected asset",mount:()=>{const e=w("cf-test2-default"),t={x:f+T*.95,y:y+T*.15},o={x:f-T*.1,y:y-T*.98},s={x:f+T*.5,y:y+T*.75};return n`
			<div class="docs-viewport-host">
				<style>${Qs}</style>
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
							rx=${z}
							ry=${z*.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${f}
							cy=${y}
							rx=${z*.32}
							ry=${z}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${f}
							cy=${y}
							rx=${z*.78}
							ry=${z*.78}
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
		`}};p(Ds);p(Ns);p(Hs);p(ls);p(Mo);p(Fo);p(jo);p(Ro);p(Vo);p(ho);p(Bs);p(ko);p(Zo);p(Jo);p(Wo);p(js);p(Ls);p(So);p(ts);p(os);p(is);p(bs);p(vs);p(Ps);p(hs);p(ms);p(fs);p(ys);p(Zs);p(ei);p(po);p(Fs);p(rs);const ti="ja",oi=`
.docs-stage { position: relative; }
.docs-stage .button {
	white-space: nowrap;
}
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
`;function si({fixtureId:e,available:t}){return n`
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
	`}function ii({annotations:e}){const[t,o]=Jt([]);return Qt(()=>{if(!Array.isArray(e)||e.length===0){o([]);return}const s=document.querySelector(".docs-stage");if(!s){o([]);return}const l=s.getBoundingClientRect(),c=e.map(a=>{const _=a.selector?s.querySelector(a.selector):null;if(!_)return{n:a.n,label:a.label??"",selector:a.selector??"",x:8,y:8,missing:!0};const g=_.getBoundingClientRect();return{n:a.n,label:a.label??"",selector:a.selector,x:g.left+g.width/2-l.left,y:g.top+g.height/2-l.top,missing:!1}});o(c)},[e]),t.length===0?null:n`
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
	`}function ai({fixtureId:e,lang:t}){const o=so(e);if(!o)return n`<${si}
			fixtureId=${e}
			available=${he()}
		/>`;const s=Array.isArray(o.annotations)?o.annotations:[];return n`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${e}
			data-fixture-type=${o.type}
			data-lang=${t}
		>
			<style>${oi}</style>
			${o.mount({lang:t})}
			${s.length>0&&n`<${ii} annotations=${s}/>`}
		</div>
	`}function ve(e,t){try{const o=new URL(globalThis.location.href).searchParams.get(e);return o===null?t:o}catch{return t}}function ri(e){let t=!1;const o=()=>{t||(t=!0,globalThis.__DOCS_FIXTURE_READY=!0,globalThis.__DOCS_FIXTURE_ID=e)};requestAnimationFrame(()=>{requestAnimationFrame(o)}),setTimeout(o,100)}function ni(){const e=document.getElementById("docs-root");if(!e)return;const t=ve("fixture",""),o=ve("lang",ti);globalThis.__DOCS_FIXTURE_READY=!1,globalThis.__DOCS_FIXTURE_ID=t,globalThis.__DOCS_FIXTURE_IDS=he(),qt(n`<${ai} fixtureId=${t} lang=${o} />`,e),ri(t)}ni();
