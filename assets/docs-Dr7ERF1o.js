import{f5 as Oe,fD as re,gq as ne,fv as n,fI as le,fH as S,gr as O,gs as Pe,gt as Ce,gu as Fe,gv as je,gw as Le,gx as Me,gy as De,gz as Ue,gA as Ne,gB as He,gC as Ve,gD as Ye,gE as Be,gF as We,gG as Ge,gH as Xe,gI as Ke,gJ as Ze,gK as qe,gL as Je,gM as Qe,gN as et,gO as tt,gP as ot,gQ as st,gR as it,gS as at,gT as rt,gU as nt,gV as lt,gW as ct,gX as dt,gY as pt,gZ as ut,g_ as gt,g$ as bt,h0 as vt,h1 as ht,h2 as _t,h3 as mt,h4 as ft,h5 as yt,h6 as xt,h7 as $t,h8 as wt,h9 as kt,ha as It,hb as St,hc as Et,hd as Tt,he as zt,hf as Rt,hg as At,hh as Ot,hi as Pt,hj as Ct,hk as Ft,hl as jt,gk as me,cY as v,gp as Lt,g3 as Mt,g1 as Dt,hm as Ut,fw as Z,fX as Nt,fF as Ht,ga as Vt,fQ as Yt,eu as Bt,hn as ce,ho as Wt,fJ as Gt,hp as Xt,d5 as X,hq as Kt,gc as Zt,fW as qt,go as Jt,fP as Qt,fy as eo}from"./viewport-shell-D0LGYkuT.js";function to({controller:e,open:t=!0,summaryActions:o=null,onToggle:s=null,showList:l=!0,store:c,t:i}){var te,oe;const b=c.referenceImages.assets.value,g=c.referenceImages.items.value,C=Oe(g),G=c.referenceImages.presets.value,A=c.referenceImages.previewSessionVisible.value,Ee=c.referenceImages.selectedAssetId.value,Q=c.referenceImages.selectedItemId.value,Te=new Set(c.referenceImages.selectedItemIds.value??[]),ze=c.referenceImages.panelPresetId.value,u=g.find(a=>a.id===Q)??null,ee=b.find(a=>a.id===((u==null?void 0:u.assetId)??Ee))??null,Re=(a,r,d)=>{var f,se,F,ie,j,ae;(se=(f=e())==null?void 0:f.selectReferenceImageItem)==null||se.call(f,r,{additive:a.ctrlKey||a.metaKey,toggle:a.ctrlKey||a.metaKey,range:a.shiftKey,orderedIds:d}),(ie=(F=e())==null?void 0:F.isReferenceImageSelectionActive)!=null&&ie.call(F)&&((ae=(j=e())==null?void 0:j.activateViewportReferenceImageEditModeImplicit)==null||ae.call(j))};function Ae({selected:a=!1,active:r=!1}){const d=["scene-asset-row"];return a&&d.push("scene-asset-row--selected"),r&&d.push("scene-asset-row--active"),d.join(" ")}return n`
		<${re}
			icon="image"
			label=${i("section.referenceImages")}
			helpSectionId="reference-images"
			onOpenHelp=${a=>{var r,d;return(d=(r=e())==null?void 0:r.openHelp)==null?void 0:d.call(r,{sectionId:a})}}
			open=${t}
			summaryMeta=${n`<span class="pill pill--dim">${g.length}</span>`}
			summaryActions=${o}
			onToggle=${s}
		>
			<div class="button-row">
				<button
					type="button"
					class=${A?"button button--primary button--compact":"button button--compact"}
					onClick=${()=>{var a,r;return(r=(a=e())==null?void 0:a.setReferenceImagePreviewSessionVisible)==null?void 0:r.call(a,!A)}}
				>
					${i(A?"action.hideReferenceImages":"action.showReferenceImages")}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${i("referenceImage.activePreset")}</span>
					<select
						value=${ze}
						...${ne}
						onChange=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setActiveReferenceImagePreset)==null?void 0:d.call(r,a.currentTarget.value)}}
					>
						${G.map(a=>n`
								<option key=${a.id} value=${a.id}>
									${a.name}
								</option>
							`)}
					</select>
				</label>
				<div class="field field--action">
					<span>${i("referenceImage.activePresetItems",{count:g.length})}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${()=>{var a,r;return(r=(a=e())==null?void 0:a.duplicateActiveReferenceImagePreset)==null?void 0:r.call(a)}}
					>
						${i("action.duplicateReferencePreset")}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${l&&n`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${i("referenceImage.currentPresetSection")}</strong>
								<span class="pill pill--dim">${g.length}</span>
							</div>
							${g.length>0?n`
											<div class="scene-asset-list">
												${C.map(a=>n`
														<article
															class=${Ae({selected:Te.has(a.id),active:a.id===Q})}
															onClick=${r=>Re(r,a.id,C.map(d=>d.id))}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${a.name}</strong>
																	<span class="scene-asset-row__meta">
																		${a.fileName||i("referenceImage.untitled")} ·
																		${i(`referenceImage.group.${a.group}`)} ·
																		${i("referenceImage.orderLabel",{order:a.order+1})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${le}
																	icon=${a.previewVisible?"eye":"eye-off"}
																	label=${i(a.previewVisible?"assetVisibility.visible":"assetVisibility.hidden")}
																	active=${a.previewVisible}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,f;r.stopPropagation(),(f=(d=e())==null?void 0:d.setReferenceImagePreviewVisible)==null||f.call(d,a.id,!a.previewVisible)}}
																/>
																<${le}
																	icon=${a.exportEnabled?"export":"slash-circle"}
																	label=${a.exportEnabled?i("action.excludeReferenceImageFromExport"):i("action.includeReferenceImageInExport")}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${r=>{var d,f;r.stopPropagation(),(f=(d=e())==null?void 0:d.setReferenceImageExportEnabled)==null||f.call(d,a.id,!a.exportEnabled)}}
																/>
															</div>
														</article>
													`)}
											</div>
										`:n`<p class="summary">${i("referenceImage.currentCameraEmpty")}</p>`}
						</section>
					`}
				${u&&ee?n`
								<${re}
									icon="image"
									label=${u.name}
									open=${!0}
								>
									<div class="reference-selected-panel">
										<p class="summary">
											${u.name} ·
											${ee.fileName||i("referenceImage.untitled")}
										</p>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageOpacity")}</span>
												<div class="numeric-unit">
													<${S}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(u.opacity*100)}
														controller=${e}
														historyLabel="reference-image.opacity"
														onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOpacity)==null?void 0:d.call(r,u.id,a)}}
													/>
													<${O} value="%" title=${i("unit.percent")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageScale")}</span>
												<div class="numeric-unit">
													<${S}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(u.scalePct).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.scale"
														onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageScalePct)==null?void 0:d.call(r,u.id,a)}}
													/>
													<${O} value="%" title=${i("unit.percent")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageOffsetX")}</span>
												<div class="numeric-unit">
													<${S}
														inputMode="decimal"
														step="1"
														value=${Number(((te=u.offsetPx)==null?void 0:te.x)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.x"
														onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"x",a)}}
													/>
													<${O} value="px" title=${i("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${S}
														inputMode="decimal"
														step="1"
														value=${Number(((oe=u.offsetPx)==null?void 0:oe.y)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.y"
														onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOffsetPx)==null?void 0:d.call(r,u.id,"y",a)}}
													/>
													<${O} value="px" title=${i("unit.pixel")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageRotation")}</span>
												<div class="numeric-unit">
													<${S}
														inputMode="decimal"
														step="0.01"
														value=${Number(u.rotationDeg).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.rotation"
														onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageRotationDeg)==null?void 0:d.call(r,u.id,a)}}
													/>
													<${O} value="deg" title=${i("unit.degree")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageOrder")}</span>
												<${S}
													inputMode="numeric"
													min="1"
													step="1"
													value=${u.order+1}
													controller=${e}
													historyLabel="reference-image.order"
													onCommit=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageOrder)==null?void 0:d.call(r,u.id,Math.max(0,Number(a)-1))}}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageGroup")}</span>
												<select
													value=${u.group}
													...${ne}
													onChange=${a=>{var r,d;return(d=(r=e())==null?void 0:r.setReferenceImageGroup)==null?void 0:d.call(r,u.id,a.currentTarget.value)}}
												>
													<option value="back">
														${i("referenceImage.group.back")}
													</option>
													<option value="front">
														${i("referenceImage.group.front")}
													</option>
												</select>
											</label>
										</div>
										<div class="button-row">
											<button
												type="button"
												class=${u.previewVisible?"button button--primary button--compact":"button button--compact"}
												onClick=${()=>{var a,r;return(r=(a=e())==null?void 0:a.setReferenceImagePreviewVisible)==null?void 0:r.call(a,u.id,!u.previewVisible)}}
											>
												${u.previewVisible?i("action.hideReferenceImage"):i("action.showReferenceImage")}
											</button>
											<button
												type="button"
												class=${u.exportEnabled?"button button--primary button--compact":"button button--compact"}
												onClick=${()=>{var a,r;return(r=(a=e())==null?void 0:a.setReferenceImageExportEnabled)==null?void 0:r.call(a,u.id,!u.exportEnabled)}}
											>
												${u.exportEnabled?i("action.excludeReferenceImageFromExport"):i("action.includeReferenceImageInExport")}
											</button>
										</div>
									</div>
								<//>
							`:n`<p class="summary">${i("referenceImage.selectedEmpty")}</p>`}
			</div>
		<//>
	`}const de={id:"hello",type:"panel",title:"Hello docs fixture",mount:({lang:e})=>n`
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
	`},oo=`
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
`;function so(){const t=Object.entries(Object.assign({"../../ui/svg/apply-transform.svg":jt,"../../ui/svg/camera-dslr.svg":Ft,"../../ui/svg/camera-frames.svg":Ct,"../../ui/svg/camera-property.svg":Pt,"../../ui/svg/camera.svg":Ot,"../../ui/svg/chevron-left.svg":At,"../../ui/svg/chevron-right.svg":Rt,"../../ui/svg/clock.svg":zt,"../../ui/svg/close.svg":Tt,"../../ui/svg/copy-to-camera.svg":Et,"../../ui/svg/copy-to-viewport.svg":St,"../../ui/svg/cursor.svg":It,"../../ui/svg/duplicate.svg":kt,"../../ui/svg/export-tab.svg":wt,"../../ui/svg/export.svg":$t,"../../ui/svg/eye-off.svg":xt,"../../ui/svg/eye.svg":yt,"../../ui/svg/folder-open.svg":ft,"../../ui/svg/frame-plus.svg":mt,"../../ui/svg/frame.svg":_t,"../../ui/svg/grip.svg":ht,"../../ui/svg/help.svg":vt,"../../ui/svg/image.svg":bt,"../../ui/svg/lens.svg":gt,"../../ui/svg/light.svg":ut,"../../ui/svg/link.svg":pt,"../../ui/svg/lock-open.svg":dt,"../../ui/svg/lock.svg":ct,"../../ui/svg/mask-all.svg":lt,"../../ui/svg/mask-selected.svg":nt,"../../ui/svg/mask.svg":rt,"../../ui/svg/menu.svg":at,"../../ui/svg/move.svg":it,"../../ui/svg/package-open.svg":st,"../../ui/svg/package.svg":ot,"../../ui/svg/pie-menu.svg":tt,"../../ui/svg/pin.svg":et,"../../ui/svg/pivot.svg":Qe,"../../ui/svg/plus.svg":Je,"../../ui/svg/redo.svg":qe,"../../ui/svg/reference-preview-off.svg":Ze,"../../ui/svg/reference-preview-on.svg":Ke,"../../ui/svg/reference-tool.svg":Xe,"../../ui/svg/reference.svg":Ge,"../../ui/svg/render-box.svg":We,"../../ui/svg/reset.svg":Be,"../../ui/svg/ruler.svg":Ye,"../../ui/svg/save.svg":Ve,"../../ui/svg/scene.svg":He,"../../ui/svg/scrub.svg":Ne,"../../ui/svg/selection-clear.svg":Ue,"../../ui/svg/settings.svg":De,"../../ui/svg/slash-circle.svg":Me,"../../ui/svg/trash.svg":Le,"../../ui/svg/undo.svg":je,"../../ui/svg/view.svg":Fe,"../../ui/svg/viewport.svg":Ce,"../../ui/svg/zoom.svg":Pe})).map(([o,s])=>{const l=o.match(/\/([^/]+)\.svg$/i),c=l?l[1]:null;return c&&typeof s=="string"?{name:c,rawSvg:s}:null}).filter(Boolean);return t.sort((o,s)=>o.name.localeCompare(s.name)),t}const pe={id:"icons-all",type:"reference",title:"All workbench icons",mount:({lang:e})=>{const t=so();return n`
			<div class="docs-icons-all">
				<style>${oo}</style>
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
		`}},U={[de.id]:de,[pe.id]:pe};function p(e){if(!e||typeof e.id!="string"||e.id.length===0)throw new Error("registerFixture: fixture.id must be a non-empty string");if(Object.hasOwn(U,e.id))throw new Error(`registerFixture: duplicate id "${e.id}"`);U[e.id]=e}function io(e){return typeof e!="string"||e===""?null:U[e]??null}function fe(){return Object.keys(U)}const ao="/camera-frames/docs/help/assets/fixture-backdrops/",ro={"cf-test2-default":{id:"cf-test2-default",backdropUrl:`${ao}cf-test2-default.png`,width:1073,height:1264,description:"cf-test2 の仮のシーン（権利クリア済みの motorbike スプラット）"}};function k(e){const t=ro[e];if(!t)throw new Error(`makeScene: unknown scene "${e}"`);return t}const no=960,lo=600,co=`
.docs-layout-host {
	position: relative;
	width: ${no}px;
	height: ${lo}px;
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
`,po=[{active:!1},{active:!1},{active:!1},{active:!1},{active:!0},{active:!1},{active:!1},{active:!1},{active:!1},{active:!1}],uo={id:"app-layout-overview",type:"composite",title:"Full app layout overview",annotations:[{n:1,selector:".docs-layout-host__viewport",label:"Viewport",placement:"center"},{n:2,selector:".workbench-card--tool-rail",label:"Tool Rail",placement:"center"},{n:3,selector:".workbench-card--inspector",label:"Inspector",placement:"center"},{n:4,selector:".viewport-project-status",label:"Project Status HUD",placement:"right"}],mount:()=>{const e=k("cf-test2-default");return n`
			<div class="docs-layout-host">
				<style>${co}</style>
				<aside class="docs-layout-host__rail workbench-card workbench-card--tool-rail">
					${po.map((t,o)=>n`
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
		`}},go=800,bo=560,vo=`
.docs-viewport-host {
	position: relative;
	width: ${go}px;
	height: ${bo}px;
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
`,ue={x:{x2:"92",y2:"50"},y:{x2:"50",y2:"8"},z:{x2:"50",y2:"50"}},ho=[{key:"pos-x",cls:"positive--x",label:"X",left:"92%",top:"50%"},{key:"pos-y",cls:"positive--y",label:"Y",left:"50%",top:"8%"},{key:"pos-z",cls:"positive--z",label:"Z",left:"50%",top:"50%"},{key:"neg-x",cls:"negative--x",label:"",left:"8%",top:"50%"},{key:"neg-y",cls:"negative--y",label:"",left:"50%",top:"92%"},{key:"neg-z",cls:"negative--z",label:"",left:"50%",top:"50%"}];function _o(){return n`
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
							x2=${ue[e].x2}
							y2=${ue[e].y2}
						/>
					`)}
			</svg>
			${ho.map(e=>n`
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
	`}const mo={id:"axis-gizmo",type:"viewport",title:"Viewport axis gizmo (orthographic posZ)",mount:()=>{const e=k("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${vo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${_o()}
			</div>
		`}},N=800,H=560,ye=110,xe=70,q=580,J=420,fo="rgba(255, 87, 72, 0.92)",ge="rgba(255, 182, 170, 0.98)",yo="rgba(255, 87, 72, 0.18)",xo="#ffd8d1";function V(e){return{widthPct:e*(1536/1754)*100,heightPct:e*(864/1240)*100}}const $o=`
.docs-viewport-host {
	position: relative;
	width: ${N}px;
	height: ${H}px;
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
`,wo=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],ko=["top","right","bottom","left"];function Y({frames:e=[],anchorOffset:t={left:"50%",top:"50%"}}={}){return n`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{left:`${ye}px`,top:`${xe}px`,width:`${q}px`,height:`${J}px`}}
		>
			${e.map(o=>n`
					<div
						key=${o.id}
						class=${`frame-item${o.active?" frame-item--active frame-item--selected":""}`}
						style=${{left:o.left,top:o.top,width:o.width,height:o.height,border:`2px solid ${fo}`,boxSizing:"border-box",background:"transparent",boxShadow:o.active?`inset 0 0 0 1px ${ge}`:"none"}}
					>
						${o.active&&n`
							<span
								aria-hidden="true"
								style=${{position:"absolute",inset:"-1px",border:`1px dashed ${ge}`,borderRadius:"1px",pointerEvents:"none"}}
							></span>
						`}
						<span
							style=${{position:"absolute",top:"-22px",left:"0",padding:"2px 9px",borderRadius:"999px",background:yo,color:xo,fontFamily:'"Consolas", "Andale Mono", monospace',fontSize:"11px",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}
						>
							${o.label}
						</span>
					</div>
				`)}
			${wo.map(o=>n`
					<button
						key=${`resize-${o}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${o}`}
						aria-label="resize"
					></button>
				`)}
			${ko.map(o=>n`
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
	`}const Io={id:"camera-mode-render-box",type:"viewport",title:"Camera mode with render-box overlay",mount:()=>{const e=k("cf-test2-default"),{widthPct:t,heightPct:o}=V(1);return n`
			<div class="docs-viewport-host">
				<style>${$o}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
			</div>
		`}},So=`
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
`,Eo={id:"confirm-new-project",type:"overlay",title:"Confirm: New Project",mount:()=>n`
			<div class="docs-overlay-host">
				<style>${So}</style>
				<${me} overlay=${{kind:"confirm",title:"新規プロジェクトを作成しますか？",message:"現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。",actions:[{label:"キャンセル",onClick:()=>{}},{label:"破棄して新規作成",primary:!0,onClick:()=>{}}]}} />
			</div>
		`},To=800,zo=560,Ro=`
.docs-viewport-host {
	position: relative;
	width: ${To}px;
	height: ${zo}px;
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
`,Ao={id:"drop-hint",type:"viewport",title:"Viewport drop hint (empty project)",mount:({lang:e})=>{const t=(o,s)=>v(e,o,s);return n`
			<div class="docs-viewport-host">
				<style>${Ro}</style>
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
		`}},be="__calls",ve="__methods";function m(e={}){const t=e.log===!0,o=e.methods??null,s=[],l={[be]:s,[ve]:o};return new Proxy(l,{get(c,i){if(typeof i!="string")return Reflect.get(c,i);if(i===be)return s;if(i===ve)return o;const b=o&&Object.hasOwn(o,i)?o[i]:null;return(...g)=>{if(s.push({method:i,args:g}),t&&console.debug(`[mock-controller] ${i}`,g),b)return b(...g)}}})}function h(e={}){const t=Lt(null);return $e(t,e,[]),t}function $e(e,t,o){for(const[s,l]of Object.entries(t)){const c=o.concat(s),i=e==null?void 0:e[s];if(i==null)throw new Error(`createMockStore: unknown path "${c.join(".")}"`);if(Oo(i)){Po(i,l,c);continue}if(he(i)&&he(l)){$e(i,l,c);continue}throw new Error(`createMockStore: cannot assign "${c.join(".")}" — target is neither a signal nor a namespace`)}}function Oo(e){return e!==null&&typeof e=="object"&&"value"in e&&typeof e.peek=="function"}function he(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function Po(e,t,o){try{e.value=t}catch(s){const l=s instanceof Error?s.message:String(s);throw new Error(`createMockStore: cannot assign to "${o.join(".")}" (computed or read-only): ${l}`)}}const Co=`
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
`,Fo={id:"export-output-section",type:"panel",title:"Export Output section",size:{width:360},mount:({lang:e})=>{const t=h(),o=m();return n`
			<div class="docs-section-host">
				<style>${Co}</style>
				<div class="docs-section-host__card">
					<${Mt}
						store=${t}
						controller=${()=>o}
						t=${(l,c)=>v(e,l,c)}
						exportBusy=${!1}
						exportPresetIds=${[]}
						exportSelectionMissing=${!1}
						exportTarget="current"
						open=${!0}
					/>
				</div>
			</div>
		`}},jo=`
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
`,Lo={id:"export-progress",type:"overlay",title:"Export progress overlay",mount:()=>{const t={kind:"progress",title:"書き出し中",message:"すべての shot をレンダリングしています。",startedAt:Date.now()-47*1e3,phaseLabel:"shot 2 / 4 をレンダリング",phaseDetail:"Camera 2 — PSD 書き出し",phases:[{label:"Camera 1",status:"done"},{label:"Camera 2",status:"active"},{label:"Camera 3",status:"pending"},{label:"Camera 4",status:"pending"}],steps:[{label:"projectをスナップショット",status:"done"},{label:"各ショットをレンダリング",status:"active"},{label:"zip アーカイブを生成",status:"pending"}]};return n`
			<div class="docs-overlay-host">
				<style>${jo}</style>
				<${me} overlay=${t} />
			</div>
		`}},Mo=`
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
`,Do={id:"export-settings-section",type:"panel",title:"Export Settings section",size:{width:360},mount:({lang:e})=>{const t=h(),o=m();return n`
			<div class="docs-section-host">
				<style>${Mo}</style>
				<div class="docs-section-host__card">
					<${Dt}
						store=${t}
						controller=${()=>o}
						t=${l=>v(e,l)}
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
		`}},Uo=800,No=560,Ho=`
.docs-viewport-host {
	position: relative;
	width: ${Uo}px;
	height: ${No}px;
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
`,Vo={id:"first-scene-loaded",type:"viewport",title:"Viewport after first scene load",mount:()=>{const e=k("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Ho}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
			</div>
		`}},Yo=800,Bo=560,Wo=`
.docs-viewport-host {
	position: relative;
	width: ${Yo}px;
	height: ${Bo}px;
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
`,Go={id:"measurement-overlay",type:"viewport",title:"Measurement overlay (line + chip)",mount:({lang:e})=>{const t=k("cf-test2-default"),o=h({measurement:{active:!0,startPointWorld:{x:0,y:0,z:0},endPointWorld:{x:1,y:0,z:0},selectedPointKey:"end",lengthInputText:"",overlay:{contextKind:"viewport",start:{visible:!0,x:260,y:360},end:{visible:!0,x:540,y:300},draftEnd:{visible:!1,x:0,y:0},lineVisible:!0,lineUsesDraft:!1,chip:{visible:!0,x:400,y:310,label:"53.42 cm",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}}}),s=m(),l=(c,i)=>v(e,c,i);return n`
			<div class="docs-viewport-host">
				<style>${Wo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${t.backdropUrl}
					alt=${t.description}
				/>
				<${Ut}
					store=${o}
					controller=${()=>s}
					t=${l}
				/>
			</div>
		`}},Xo=`
.docs-viewport-host {
	position: relative;
	width: ${N}px;
	height: ${H}px;
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
`,Ko=[{id:"frame-1",label:"FRAME A",center:{x:.5,y:.5},scale:1,active:!1},{id:"frame-2",label:"FRAME B",center:{x:.5755,y:.5169},scale:.5537,active:!0}];function Zo(e){const{widthPct:t,heightPct:o}=V(e.scale);return{id:e.id,label:e.label,active:e.active,left:`${e.center.x*100-t/2}%`,top:`${e.center.y*100-o/2}%`,width:`${t}%`,height:`${o}%`}}const qo={id:"multiple-frames",type:"viewport",title:"Camera mode with multiple frames (zoom-in / TU)",mount:()=>{const e=k("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Xo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:Ko.map(Zo)})}
			</div>
		`}},Jo=`
.docs-viewport-host {
	position: relative;
	width: ${N}px;
	height: ${H}px;
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
`,Qo={id:"render-box-camera-mode",type:"viewport",title:"Render-box in camera mode (annotated)",annotations:[{n:1,selector:".render-box__resize-handle--top-right",label:"リサイズハンドル（8 方向）",placement:"top-right"},{n:2,selector:".render-box__pan-edge--top",label:"パンエッジ（4 辺）",placement:"above"},{n:3,selector:"#anchor-dot",label:"anchor dot",placement:"right"},{n:4,selector:"#render-box-meta",label:"meta ラベル",placement:"left"}],mount:()=>{const e=k("cf-test2-default"),{widthPct:t,heightPct:o}=V(1);return n`
			<div class="docs-viewport-host">
				<style>${Jo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
			</div>
		`}},es=`
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
`,ts=[{icon:"plus",labelKey:"menu.newProjectAction",shortcut:"Ctrl+N"},{icon:"folder-open",labelKey:"action.openFiles",shortcut:"Ctrl+O"},{icon:"save",labelKey:"menu.saveWorkingStateAction",shortcut:"Ctrl+S"},{icon:"package",labelKey:"menu.savePackageAction",shortcut:"Ctrl+Shift+S"}];function we({lang:e,urlValue:t="",focusRing:o=!1}){const s=l=>v(e,l);return n`
		<div class=${`docs-menu-host${o?" docs-menu-host__focus-ring":""}`}>
			<style>${es}</style>
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
								<${Z} name="link" size=${14} />
							</span>
							<span>${s("action.loadUrl")}</span>
						</button>
					</div>
					${ts.map(l=>n`
							<button
								key=${l.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${Z} name=${l.icon} size=${14} />
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
	`}const os={id:"open-menu",type:"overlay",title:"Tool Rail File menu (open)",mount:({lang:e})=>we({lang:e})},ss={id:"remote-url-input",type:"overlay",title:"Remote URL input (focused)",mount:({lang:e})=>we({lang:e,urlValue:"https://example.com/scene.spz",focusRing:!0})},is=`
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
`,as={id:"inspector-tabs",type:"panel",title:"Inspector tabs (Camera active)",mount:({lang:e})=>n`
			<div class="docs-tabs-host">
				<style>${is}</style>
				<div class="docs-tabs-host__card">
					<${Nt}
						activeTab="camera"
						setActiveTab=${()=>{}}
						t=${(o,s)=>v(e,o,s)}
					/>
				</div>
			</div>
		`},rs=`
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
`,ns={id:"lighting-widget",type:"panel",title:"Lighting Direction widget",mount:()=>{const e=m();return n`
			<div class="docs-widget-host">
				<style>${rs}</style>
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
		`}},ls=`
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
`,cs={id:"output-frame-section",type:"panel",title:"Output Frame section",size:{width:360},mount:({lang:e})=>{const t=h(),o=m();return n`
			<div class="docs-section-host">
				<style>${ls}</style>
				<div class="docs-section-host__card">
					<${Vt}
						store=${t}
						controller=${()=>o}
						t=${l=>v(e,l)}
						anchorOptions=${Yt(e)}
						exportSizeLabel=${t.exportSizeLabel.value}
						widthLabel=${t.widthLabel.value}
						heightLabel=${t.heightLabel.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},ds=240,ps=200,us=480,gs=400,bs=`
.docs-pie-host {
	position: relative;
	width: ${us}px;
	height: ${gs}px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;function ke({lang:e,coarse:t=!1}){const o=(c,i)=>v(e,c,i),s=Bt({mode:"camera",t:o,viewportToolMode:"select",viewportOrthographic:!1,referencePreviewSessionVisible:!0,hasReferenceImages:!1,frameMaskMode:"off"}),l=s.find(c=>c.id==="tool-select")??null;return n`
		<div class="docs-pie-host">
			<style>${bs}</style>
			<div
				class=${t?"viewport-pie viewport-pie--coarse":"viewport-pie"}
				style=${{left:`${ds}px`,top:`${ps}px`}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${(l==null?void 0:l.label)??o("action.quickMenu")}
					</span>
				</button>
				${s.map(c=>{const i=Math.cos(c.angle)*ce,b=Math.sin(c.angle)*ce,g=["viewport-pie__item",c.id===(l==null?void 0:l.id)||c.active?"viewport-pie__item--active":"",c.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ");return n`
						<button
							key=${c.id}
							type="button"
							class=${g}
							style=${{left:`${i}px`,top:`${b}px`}}
							disabled=${!!c.disabled}
						>
							<span class="viewport-pie__item-icon">
								<${Z} name=${c.icon} size=${18} />
							</span>
						</button>
					`})}
			</div>
		</div>
	`}const vs={id:"pie-menu",type:"overlay",title:"Viewport pie menu (open)",mount:({lang:e})=>ke({lang:e,coarse:!1})},hs={id:"pie-menu-expanded",type:"overlay",title:"Viewport pie menu (coarse / expanded)",mount:({lang:e})=>ke({lang:e,coarse:!0})},_s=`
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
`;function B(e,t){const o=m();return n`
		<div class="docs-splat-toolbar-host">
			<style>${_s}</style>
			<${Wt}
				store=${e}
				controller=${()=>o}
				t=${(l,c)=>v(t,l,c)}
			/>
		</div>
	`}const ms={id:"splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (box tool, unplaced)",mount:({lang:e})=>{const t=h({viewportToolMode:"splat-edit"});return B(t,e)}},fs={id:"per-splat-brush-preview",type:"overlay",title:"Splat edit toolbar (brush tool)",mount:({lang:e})=>{const t=h({viewportToolMode:"splat-edit",splatEdit:{tool:"brush",brushSize:30,brushDepthMode:"depth",brushDepth:.2}});return B(t,e)}},ys={id:"per-splat-box-tool",type:"overlay",title:"Splat edit toolbar (box tool, placed)",mount:({lang:e})=>{const t=h({viewportToolMode:"splat-edit",splatEdit:{tool:"box",boxPlaced:!0,boxCenter:{x:.5,y:1.2,z:-.3},boxSize:{x:1,y:.6,z:1.4},boxRotation:{x:0,y:0,z:0,w:1},selectionCount:12345}});return B(t,e)}},xs={id:"per-splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (annotated)",annotations:[{n:1,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)",label:"Tool 選択"},{n:2,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)",label:"選択操作"},{n:3,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)",label:"編集アクション"},{n:4,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info",label:"選択数"}],mount:({lang:e})=>{const t=h({viewportToolMode:"splat-edit",splatEdit:{tool:"box",selectionCount:42}});return B(t,e)}},$s=800,ws=560,ks=200,Is=110,Ss=400,Es=300,Ts=-4,zs=`
.docs-viewport-host {
	position: relative;
	width: ${$s}px;
	height: ${ws}px;
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
`,Rs=["top","right","bottom","left"],As=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Os=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Ps={id:"reference-edit-mode",type:"viewport",title:"Reference image edit mode",mount:()=>{const e=k("cf-test2-default"),t={left:`${ks}px`,top:`${Is}px`,width:`${Ss}px`,height:`${Es}px`,transform:`rotate(${Ts}deg)`,transformOrigin:"50% 50%"};return n`
			<div class="docs-viewport-host">
				<style>${zs}</style>
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
						${Rs.map(o=>n`
								<button
									key=${`edge-${o}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${o}`}
									aria-label=${o}
								></button>
							`)}
						${As.map(o=>n`
								<button
									key=${`resize-${o}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${o}`}
									aria-label="resize"
								></button>
							`)}
						${Os.map(o=>n`
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
		`}},Cs=`
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
`;function P({id:e,kind:t,label:o,visible:s=!0}){return{id:e,kind:t,label:o,visible:s}}const Fs={id:"scene-manager",type:"panel",title:"Scene Manager (kind-grouped asset list)",size:{width:360},mount:({lang:e})=>{const t=[P({id:1,kind:"model",label:"Environment.glb"}),P({id:2,kind:"model",label:"Figure.glb"}),P({id:3,kind:"splat",label:"MainScan.ply"}),P({id:4,kind:"splat",label:"Foreground.spz",visible:!1}),P({id:5,kind:"splat",label:"Background.ply"})],o=t[2],s=h({selectedSceneAssetIds:[o.id],selectedSceneAssetId:o.id}),l=m();return n`
			<div class="docs-section-host">
				<style>${Cs}</style>
				<div class="docs-section-host__card">
					<${Gt}
						controller=${()=>l}
						draggedAssetId=${null}
						dragHoverState=${null}
						sceneAssets=${t}
						selectedSceneAsset=${o}
						setDraggedAssetId=${()=>{}}
						setDragHoverState=${()=>{}}
						store=${s}
						t=${(i,b)=>v(e,i,b)}
					/>
				</div>
			</div>
		`}},js=`
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
`;function D(e,t){return{id:e,name:t,itemRefs:[]}}function K({id:e,name:t,fileName:o,group:s,order:l}){return{id:e,assetId:`asset-${e}`,name:t,fileName:o,group:s,order:l,previewVisible:!0,exportEnabled:!0,opacity:1,scalePct:100,rotationDeg:0,offsetPx:{x:0,y:0},anchor:{ax:.5,ay:.5}}}function Ie(e,t){const o=m();return n`
		<div class="docs-section-host">
			<style>${js}</style>
			<div class="docs-section-host__card">
				<${to}
					store=${e}
					controller=${()=>o}
					t=${(l,c)=>v(t,l,c)}
					open=${!0}
				/>
			</div>
		</div>
	`}const Ls={id:"reference-presets",type:"panel",title:"Reference Presets row",size:{width:360},mount:({lang:e})=>{const t=h({referenceImages:{presets:[D("reference-preset-blank","(blank)"),D("reference-preset-outdoor","屋外ロケハン"),D("reference-preset-storyboard","コンテ A")],panelPresetId:"reference-preset-outdoor",items:[]}});return Ie(t,e)}},Ms={id:"reference-manager",type:"panel",title:"Reference Manager list",size:{width:360},mount:({lang:e})=>{const t=h({referenceImages:{presets:[D("reference-preset-blank","(blank)")],panelPresetId:"reference-preset-blank",items:[K({id:"ref-1",name:"Layout",fileName:"layout.png",group:"front",order:0}),K({id:"ref-2",name:"Rough Sketch",fileName:"rough.png",group:"back",order:1}),K({id:"ref-3",name:"Pose Reference",fileName:"pose-reference.jpg",group:"front",order:2})]}});return Ie(t,e)}},Ds=`
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
`,Us={id:"section-display-zoom",type:"panel",title:"Display Zoom section",size:{width:360},mount:({lang:e})=>{const t=h(),o=m();return n`
			<div class="docs-section-host">
				<style>${Ds}</style>
				<div class="docs-section-host__card">
					<${Xt}
						store=${t}
						controller=${()=>o}
						t=${l=>v(e,l)}
					/>
				</div>
			</div>
		`}},Ns=`
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
`,Hs={id:"shot-camera-manager",type:"panel",title:"Shot Camera Manager list",size:{width:360},annotations:[{n:1,selector:"#new-shot-camera",label:"追加",placement:"above"},{n:2,selector:"#duplicate-shot-camera",label:"複製",placement:"above"},{n:3,selector:"#delete-shot-camera",label:"削除",placement:"above"},{n:4,selector:".shot-camera-manager__list",label:"shot 一覧",placement:"right"}],mount:({lang:e})=>{const t=X({id:"shot-camera-1",name:"Camera 1"}),o=[t,X({id:"shot-camera-2",name:"Camera 2",source:t}),X({id:"shot-camera-3",name:"Camera 3",source:t})],s=o[1],l=m();return n`
			<div class="docs-section-host">
				<style>${Ns}</style>
				<div class="docs-section-host__card">
					<${Kt}
						activeShotCamera=${s}
						controller=${()=>l}
						shotCameras=${o}
						t=${(i,b)=>v(e,i,b)}
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
`,Ys={id:"shot-camera-properties",type:"panel",title:"Shot Camera Properties section",size:{width:360},mount:({lang:e})=>{const t=h({shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),o=m();return n`
			<div class="docs-section-host">
				<style>${Vs}</style>
				<div class="docs-section-host__card">
					<${Zt}
						store=${t}
						controller=${()=>o}
						t=${l=>v(e,l)}
						equivalentMmValue=${t.equivalentMmValue.value}
						fovLabel=${t.fovLabel.value}
						shotCameraClipMode="auto"
						open=${!0}
					/>
				</div>
			</div>
		`}},Bs=`
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
`,Ws={id:"tool-rail",type:"panel",title:"Viewport tool rail",mount:({lang:e})=>{const t=h(),o=m(),s=(l,c)=>v(e,l,c);return n`
			<div class="docs-rail-host">
				<style>${Bs}</style>
				<div class="docs-rail-host__card">
					<${qt}
						store=${t}
						controller=${()=>o}
						t=${s}
						mode="camera"
						projectMenuItems=${[{id:"new-project",icon:"plus",label:s("menu.newProjectAction"),shortcut:"Ctrl+N"},{id:"open-files",icon:"folder-open",label:s("action.openFiles"),shortcut:"Ctrl+O"},{id:"save-project",icon:"save",label:s("menu.saveWorkingStateAction"),shortcut:"Ctrl+S"},{id:"export-project",icon:"package",label:s("menu.savePackageAction"),shortcut:"Ctrl+Shift+S"}]}
						showQuickMenu=${!0}
					/>
				</div>
			</div>
		`}},Gs=`
.docs-viewport-host {
	position: relative;
	width: ${N}px;
	height: ${H}px;
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
`,I=[{id:"frame-1",label:"FRAME A",center:{x:.3933,y:.5404},scale:1,active:!1,tangent:{in:{x:-.0874,y:.0026},out:{x:.0874,y:-.0026}}},{id:"frame-2",label:"FRAME B",center:{x:.6461,y:.4232},scale:.8549,active:!0,tangent:{in:{x:-.077,y:.0809},out:{x:.077,y:-.0809}}}];function Se(e,t){return{x:ye+q*e,y:xe+J*t}}function Xs(e){const{widthPct:t,heightPct:o}=V(e.scale);return{id:e.id,label:e.label,active:e.active,left:e.center.x*100-t/2,top:e.center.y*100-o/2,width:t,height:o}}const Ks=I.map(Xs),$=Se(I[0].center.x,I[0].center.y),w=Se(I[1].center.x,I[1].center.y);function W(e,t){return{x:e.x+t.x*q,y:e.y+t.y*J}}const L=W($,I[0].tangent.in),E=W($,I[0].tangent.out),T=W(w,I[1].tangent.in),M=W(w,I[1].tangent.out);function Zs(e){return{id:e.id,label:e.label,active:e.active,left:`${e.left}%`,top:`${e.top}%`,width:`${e.width}%`,height:`${e.height}%`}}const qs={id:"trajectory-spline",type:"viewport",title:"Camera mode with spline trajectory (cf-test2 Camera 3)",mount:()=>{const e=k("cf-test2-default");return n`
			<div class="docs-viewport-host">
				<style>${Gs}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:Ks.map(Zs)})}
				<div class="docs-trajectory-layer">
					<svg>
						<path
							class="docs-trajectory-path"
							d=${`M ${$.x} ${$.y} C ${E.x} ${E.y}, ${T.x} ${T.y}, ${w.x} ${w.y}`}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${L.x}
							y1=${L.y}
							x2=${$.x}
							y2=${$.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${$.x}
							y1=${$.y}
							x2=${E.x}
							y2=${E.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${T.x}
							y1=${T.y}
							x2=${w.x}
							y2=${w.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${w.x}
							y1=${w.y}
							x2=${M.x}
							y2=${M.y}
						/>
					</svg>
					<span
						class="docs-trajectory-node"
						style=${{left:`${$.x}px`,top:`${$.y}px`}}
					></span>
					<span
						class="docs-trajectory-node docs-trajectory-node--active"
						style=${{left:`${w.x}px`,top:`${w.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${L.x}px`,top:`${L.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${E.x}px`,top:`${E.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${T.x}px`,top:`${T.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${M.x}px`,top:`${M.y}px`}}
					></span>
				</div>
			</div>
		`}},Js=800,Qs=560,y=400,x=310,z=70,R=90,ei=`
.docs-viewport-host {
	position: relative;
	width: ${Js}px;
	height: ${Qs}px;
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
`,ti={id:"transform-gizmo",type:"viewport",title:"Transform gizmo over selected asset",mount:()=>{const e=k("cf-test2-default"),t={x:y+z*.95,y:x+z*.15},o={x:y-z*.1,y:x-z*.98},s={x:y+z*.5,y:x+z*.75};return n`
			<div class="docs-viewport-host">
				<style>${ei}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				<div class="docs-gizmo-layer">
					<svg>
						<!-- Rotate rings (ellipses approximating the projected rings) -->
						<ellipse
							cx=${y}
							cy=${x}
							rx=${R}
							ry=${R*.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${y}
							cy=${x}
							rx=${R*.32}
							ry=${R}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${y}
							cy=${x}
							rx=${R*.78}
							ry=${R*.78}
							fill="none"
							stroke="#5ba7ff"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<!-- Move arrows -->
						<line
							x1=${y}
							y1=${x}
							x2=${t.x}
							y2=${t.y}
							stroke="#ff5f74"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${y}
							y1=${x}
							x2=${o.x}
							y2=${o.y}
							stroke="#bddb35"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${y}
							y1=${x}
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
						style=${{left:`${y}px`,top:`${x}px`}}
					>
						S
					</span>
				</div>
			</div>
		`}};p(Us);p(Ys);p(Hs);p(cs);p(Do);p(Fo);p(Lo);p(Ao);p(Vo);p(mo);p(Ws);p(Io);p(qo);p(Qo);p(Go);p(Ls);p(Ms);p(Eo);p(os);p(ss);p(as);p(vs);p(hs);p(Ps);p(ms);p(fs);p(ys);p(xs);p(qs);p(ti);p(uo);p(Fs);p(ns);const oi="ja",si=`
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
`;function ii({fixtureId:e,available:t}){return n`
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
	`}const ai=15,ri=3,_=ai+ri;function ni(e,t,o){const s=e.left-t.left,l=e.top-t.top,c=e.right-t.left,i=e.bottom-t.top,b=s+e.width/2,g=l+e.height/2;switch(o){case"center":return{x:b,y:g};case"top-left":return{x:s-_,y:l-_};case"bottom-right":return{x:c+_,y:i+_};case"bottom-left":return{x:s-_,y:i+_};case"above":return{x:b,y:l-_};case"below":return{x:b,y:i+_};case"left":return{x:s-_,y:g};case"right":return{x:c+_,y:g};default:return{x:c+_,y:l-_}}}function li({annotations:e}){const[t,o]=Qt([]);return eo(()=>{if(!Array.isArray(e)||e.length===0){o([]);return}const s=document.querySelector(".docs-stage");if(!s){o([]);return}const l=s.getBoundingClientRect(),c=e.map(i=>{const b=i.selector?s.querySelector(i.selector):null;if(!b)return{n:i.n,label:i.label??"",selector:i.selector??"",x:8,y:8,missing:!0};const g=b.getBoundingClientRect(),C=i.placement??"top-right",{x:G,y:A}=ni(g,l,C);return{n:i.n,label:i.label??"",selector:i.selector,x:G,y:A,missing:!1}});o(c)},[e]),t.length===0?null:n`
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
	`}function ci({fixtureId:e,lang:t}){const o=io(e);if(!o)return n`<${ii}
			fixtureId=${e}
			available=${fe()}
		/>`;const s=Array.isArray(o.annotations)?o.annotations:[];return n`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${e}
			data-fixture-type=${o.type}
			data-lang=${t}
		>
			<style>${si}</style>
			${o.mount({lang:t})}
			${s.length>0&&n`<${li} annotations=${s}/>`}
		</div>
	`}function _e(e,t){try{const o=new URL(globalThis.location.href).searchParams.get(e);return o===null?t:o}catch{return t}}function di(e){let t=!1;const o=()=>{t||(t=!0,globalThis.__DOCS_FIXTURE_READY=!0,globalThis.__DOCS_FIXTURE_ID=e)};requestAnimationFrame(()=>{requestAnimationFrame(o)}),setTimeout(o,100)}function pi(){const e=document.getElementById("docs-root");if(!e)return;const t=_e("fixture",""),o=_e("lang",oi);globalThis.__DOCS_FIXTURE_READY=!1,globalThis.__DOCS_FIXTURE_ID=t,globalThis.__DOCS_FIXTURE_IDS=fe(),Jt(n`<${ci} fixtureId=${t} lang=${o} />`,e),di(t)}pi();
