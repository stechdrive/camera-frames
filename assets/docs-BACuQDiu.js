import{f9 as Le,fK as ne,gx as ae,fC as l,fP as le,fO as I,gy as C,gz as Me,gA as De,gB as Ue,gC as Ne,gD as He,gE as Ve,gF as Ye,gG as Be,gH as We,gI as Ge,gJ as Xe,gK as Ke,gL as Ze,gM as qe,gN as Qe,gO as Je,gP as et,gQ as tt,gR as ot,gS as st,gT as it,gU as rt,gV as nt,gW as at,gX as lt,gY as ct,gZ as dt,g_ as pt,g$ as ut,h0 as gt,h1 as bt,h2 as ht,h3 as vt,h4 as mt,h5 as _t,h6 as ft,h7 as yt,h8 as $t,h9 as xt,ha as wt,hb as kt,hc as St,hd as It,he as Et,hf as Tt,hg as zt,hh as Rt,hi as At,hj as Ct,hk as Ot,hl as Ft,hm as Pt,hn as jt,ho as Lt,hp as Mt,hq as Dt,hr as Ut,hs as Nt,gw as Ht,fX as _e,g1 as fe,ht as Vt,g2 as ye,gj as $e,gh as xe,cM as h,gr as we,ga as Yt,g8 as Bt,fD as Z,fM as Wt,hu as Gt,ey as Xt,hv as ce,fQ as Kt,hw as Zt,cW as X,hx as qt,hy as Qt,gv as Jt,fW as eo,fF as to}from"./viewport-shell-B0S_XDcn.js";function oo({controller:e,open:t=!0,summaryActions:o=null,onToggle:s=null,showList:n=!0,store:c,t:i}){var te,oe;const b=c.referenceImages.assets.value,g=c.referenceImages.items.value,F=Le(g),G=c.referenceImages.presets.value,A=c.referenceImages.previewSessionVisible.value,Ce=c.referenceImages.selectedAssetId.value,J=c.referenceImages.selectedItemId.value,Oe=new Set(c.referenceImages.selectedItemIds.value??[]),Fe=c.referenceImages.panelPresetId.value,u=g.find(r=>r.id===J)??null,ee=b.find(r=>r.id===((u==null?void 0:u.assetId)??Ce))??null,Pe=(r,a,d)=>{var f,se,P,ie,j,re;(se=(f=e())==null?void 0:f.selectReferenceImageItem)==null||se.call(f,a,{additive:r.ctrlKey||r.metaKey,toggle:r.ctrlKey||r.metaKey,range:r.shiftKey,orderedIds:d}),(ie=(P=e())==null?void 0:P.isReferenceImageSelectionActive)!=null&&ie.call(P)&&((re=(j=e())==null?void 0:j.activateViewportReferenceImageEditModeImplicit)==null||re.call(j))};function je({selected:r=!1,active:a=!1}){const d=["scene-asset-row"];return r&&d.push("scene-asset-row--selected"),a&&d.push("scene-asset-row--active"),d.join(" ")}return l`
		<${ne}
			icon="image"
			label=${i("section.referenceImages")}
			helpSectionId="reference-images"
			onOpenHelp=${r=>{var a,d;return(d=(a=e())==null?void 0:a.openHelp)==null?void 0:d.call(a,{sectionId:r})}}
			open=${t}
			summaryMeta=${l`<span class="pill pill--dim">${g.length}</span>`}
			summaryActions=${o}
			onToggle=${s}
		>
			<div class="button-row">
				<button
					type="button"
					class=${A?"button button--primary button--compact":"button button--compact"}
					onClick=${()=>{var r,a;return(a=(r=e())==null?void 0:r.setReferenceImagePreviewSessionVisible)==null?void 0:a.call(r,!A)}}
				>
					${i(A?"action.hideReferenceImages":"action.showReferenceImages")}
				</button>
			</div>
			<div class="split-field-row">
				<label class="field">
					<span>${i("referenceImage.activePreset")}</span>
					<select
						value=${Fe}
						...${ae}
						onChange=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setActiveReferenceImagePreset)==null?void 0:d.call(a,r.currentTarget.value)}}
					>
						${G.map(r=>l`
								<option key=${r.id} value=${r.id}>
									${r.name}
								</option>
							`)}
					</select>
				</label>
				<div class="field field--action">
					<span>${i("referenceImage.activePresetItems",{count:g.length})}</span>
					<button
						type="button"
						class="button button--compact"
						onClick=${()=>{var r,a;return(a=(r=e())==null?void 0:r.duplicateActiveReferenceImagePreset)==null?void 0:a.call(r)}}
					>
						${i("action.duplicateReferencePreset")}
					</button>
				</div>
			</div>
			<div class="reference-panel-stack">
				${n&&l`
						<section class="reference-panel-group">
							<div class="panel-inline-header">
								<strong>${i("referenceImage.currentPresetSection")}</strong>
								<span class="pill pill--dim">${g.length}</span>
							</div>
							${g.length>0?l`
											<div class="scene-asset-list">
												${F.map(r=>l`
														<article
															class=${je({selected:Oe.has(r.id),active:r.id===J})}
															onClick=${a=>Pe(a,r.id,F.map(d=>d.id))}
														>
															<div class="scene-asset-row__main scene-asset-row__main--flat">
																<div class="scene-asset-row__title-group">
																	<strong>${r.name}</strong>
																	<span class="scene-asset-row__meta">
																		${r.fileName||i("referenceImage.untitled")} ·
																		${i(`referenceImage.group.${r.group}`)} ·
																		${i("referenceImage.orderLabel",{order:r.order+1})}
																	</span>
																</div>
															</div>
															<div class="scene-asset-row__toolbar">
																<${le}
																	icon=${r.previewVisible?"eye":"eye-off"}
																	label=${i(r.previewVisible?"assetVisibility.visible":"assetVisibility.hidden")}
																	active=${r.previewVisible}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${a=>{var d,f;a.stopPropagation(),(f=(d=e())==null?void 0:d.setReferenceImagePreviewVisible)==null||f.call(d,r.id,!r.previewVisible)}}
																/>
																<${le}
																	icon=${r.exportEnabled?"export":"slash-circle"}
																	label=${r.exportEnabled?i("action.excludeReferenceImageFromExport"):i("action.includeReferenceImageInExport")}
																	compact=${!0}
																	className="scene-asset-row__icon-button"
																	onClick=${a=>{var d,f;a.stopPropagation(),(f=(d=e())==null?void 0:d.setReferenceImageExportEnabled)==null||f.call(d,r.id,!r.exportEnabled)}}
																/>
															</div>
														</article>
													`)}
											</div>
										`:l`<p class="summary">${i("referenceImage.currentCameraEmpty")}</p>`}
						</section>
					`}
				${u&&ee?l`
								<${ne}
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
													<${I}
														inputMode="decimal"
														min="0"
														max="100"
														step="1"
														value=${Math.round(u.opacity*100)}
														controller=${e}
														historyLabel="reference-image.opacity"
														onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageOpacity)==null?void 0:d.call(a,u.id,r)}}
													/>
													<${C} value="%" title=${i("unit.percent")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageScale")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														min="0.1"
														step="0.01"
														value=${Number(u.scalePct).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.scale"
														onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageScalePct)==null?void 0:d.call(a,u.id,r)}}
													/>
													<${C} value="%" title=${i("unit.percent")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageOffsetX")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="1"
														value=${Number(((te=u.offsetPx)==null?void 0:te.x)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.x"
														onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageOffsetPx)==null?void 0:d.call(a,u.id,"x",r)}}
													/>
													<${C} value="px" title=${i("unit.pixel")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageOffsetY")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="1"
														value=${Number(((oe=u.offsetPx)==null?void 0:oe.y)??0).toFixed(0)}
														controller=${e}
														historyLabel="reference-image.offset.y"
														onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageOffsetPx)==null?void 0:d.call(a,u.id,"y",r)}}
													/>
													<${C} value="px" title=${i("unit.pixel")} />
												</div>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageRotation")}</span>
												<div class="numeric-unit">
													<${I}
														inputMode="decimal"
														step="0.01"
														value=${Number(u.rotationDeg).toFixed(2)}
														controller=${e}
														historyLabel="reference-image.rotation"
														onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageRotationDeg)==null?void 0:d.call(a,u.id,r)}}
													/>
													<${C} value="deg" title=${i("unit.degree")} />
												</div>
											</label>
											<label class="field">
												<span>${i("field.referenceImageOrder")}</span>
												<${I}
													inputMode="numeric"
													min="1"
													step="1"
													value=${u.order+1}
													controller=${e}
													historyLabel="reference-image.order"
													onCommit=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageOrder)==null?void 0:d.call(a,u.id,Math.max(0,Number(r)-1))}}
												/>
											</label>
										</div>
										<div class="split-field-row">
											<label class="field">
												<span>${i("field.referenceImageGroup")}</span>
												<select
													value=${u.group}
													...${ae}
													onChange=${r=>{var a,d;return(d=(a=e())==null?void 0:a.setReferenceImageGroup)==null?void 0:d.call(a,u.id,r.currentTarget.value)}}
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
												onClick=${()=>{var r,a;return(a=(r=e())==null?void 0:r.setReferenceImagePreviewVisible)==null?void 0:a.call(r,u.id,!u.previewVisible)}}
											>
												${u.previewVisible?i("action.hideReferenceImage"):i("action.showReferenceImage")}
											</button>
											<button
												type="button"
												class=${u.exportEnabled?"button button--primary button--compact":"button button--compact"}
												onClick=${()=>{var r,a;return(a=(r=e())==null?void 0:r.setReferenceImageExportEnabled)==null?void 0:a.call(r,u.id,!u.exportEnabled)}}
											>
												${u.exportEnabled?i("action.excludeReferenceImageFromExport"):i("action.includeReferenceImageInExport")}
											</button>
										</div>
									</div>
								<//>
							`:l`<p class="summary">${i("referenceImage.selectedEmpty")}</p>`}
			</div>
		<//>
	`}const de={id:"hello",type:"panel",title:"Hello docs fixture",mount:({lang:e})=>l`
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
	`},so=`
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
`;function io(){const t=Object.entries(Object.assign({"../../ui/svg/apply-transform.svg":Nt,"../../ui/svg/camera-dslr.svg":Ut,"../../ui/svg/camera-frames.svg":Dt,"../../ui/svg/camera-property.svg":Mt,"../../ui/svg/camera.svg":Lt,"../../ui/svg/chevron-left.svg":jt,"../../ui/svg/chevron-right.svg":Pt,"../../ui/svg/clock.svg":Ft,"../../ui/svg/close.svg":Ot,"../../ui/svg/copy-to-camera.svg":Ct,"../../ui/svg/copy-to-viewport.svg":At,"../../ui/svg/cursor.svg":Rt,"../../ui/svg/duplicate.svg":zt,"../../ui/svg/export-tab.svg":Tt,"../../ui/svg/export.svg":Et,"../../ui/svg/eye-off.svg":It,"../../ui/svg/eye.svg":St,"../../ui/svg/folder-open.svg":kt,"../../ui/svg/frame-plus.svg":wt,"../../ui/svg/frame.svg":xt,"../../ui/svg/grip.svg":$t,"../../ui/svg/help.svg":yt,"../../ui/svg/image.svg":ft,"../../ui/svg/lens.svg":_t,"../../ui/svg/light.svg":mt,"../../ui/svg/link.svg":vt,"../../ui/svg/lock-open.svg":ht,"../../ui/svg/lock.svg":bt,"../../ui/svg/mask-all.svg":gt,"../../ui/svg/mask-selected.svg":ut,"../../ui/svg/mask.svg":pt,"../../ui/svg/menu.svg":dt,"../../ui/svg/move.svg":ct,"../../ui/svg/package-open.svg":lt,"../../ui/svg/package.svg":at,"../../ui/svg/pie-menu.svg":nt,"../../ui/svg/pin.svg":rt,"../../ui/svg/pivot.svg":it,"../../ui/svg/plus.svg":st,"../../ui/svg/redo.svg":ot,"../../ui/svg/reference-preview-off.svg":tt,"../../ui/svg/reference-preview-on.svg":et,"../../ui/svg/reference-tool.svg":Je,"../../ui/svg/reference.svg":Qe,"../../ui/svg/render-box.svg":qe,"../../ui/svg/reset.svg":Ze,"../../ui/svg/ruler.svg":Ke,"../../ui/svg/save.svg":Xe,"../../ui/svg/scene.svg":Ge,"../../ui/svg/scrub.svg":We,"../../ui/svg/selection-clear.svg":Be,"../../ui/svg/settings.svg":Ye,"../../ui/svg/slash-circle.svg":Ve,"../../ui/svg/trash.svg":He,"../../ui/svg/undo.svg":Ne,"../../ui/svg/view.svg":Ue,"../../ui/svg/viewport.svg":De,"../../ui/svg/zoom.svg":Me})).map(([o,s])=>{const n=o.match(/\/([^/]+)\.svg$/i),c=n?n[1]:null;return c&&typeof s=="string"?{name:c,rawSvg:s}:null}).filter(Boolean);return t.sort((o,s)=>o.name.localeCompare(s.name)),t}const pe={id:"icons-all",type:"reference",title:"All workbench icons",mount:({lang:e})=>{const t=io();return l`
			<div class="docs-icons-all">
				<style>${so}</style>
				<h1>All workbench icons (${t.length})</h1>
				<p>
					Auto-generated from <code>src/ui/svg/*.svg</code>. Language:
					<code>${e}</code>.
				</p>
				<ul class="docs-icons-all__grid">
					${t.map(o=>l`
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
		`}},U={[de.id]:de,[pe.id]:pe};function p(e){if(!e||typeof e.id!="string"||e.id.length===0)throw new Error("registerFixture: fixture.id must be a non-empty string");if(Object.hasOwn(U,e.id))throw new Error(`registerFixture: duplicate id "${e.id}"`);U[e.id]=e}function ro(e){return typeof e!="string"||e===""?null:U[e]??null}function ke(){return Object.keys(U)}const ue="__calls",ge="__methods";function m(e={}){const t=e.log===!0,o=e.methods??null,s=[],n={[ue]:s,[ge]:o};return new Proxy(n,{get(c,i){if(typeof i!="string")return Reflect.get(c,i);if(i===ue)return s;if(i===ge)return o;const b=o&&Object.hasOwn(o,i)?o[i]:null;return(...g)=>{if(s.push({method:i,args:g}),t&&console.debug(`[mock-controller] ${i}`,g),b)return b(...g)}}})}const no="/camera-frames/docs/help/assets/fixture-backdrops/",ao={"cf-test2-default":{id:"cf-test2-default",backdropUrl:`${no}cf-test2-default.png`,width:1073,height:1264,description:"cf-test2 の仮のシーン（権利クリア済みの motorbike スプラット）"}};function k(e){const t=ao[e];if(!t)throw new Error(`makeScene: unknown scene "${e}"`);return t}function v(e={}){const t=Ht(null);return Se(t,e,[]),t}function Se(e,t,o){for(const[s,n]of Object.entries(t)){const c=o.concat(s),i=e==null?void 0:e[s];if(i==null)throw new Error(`createMockStore: unknown path "${c.join(".")}"`);if(lo(i)){co(i,n,c);continue}if(be(i)&&be(n)){Se(i,n,c);continue}throw new Error(`createMockStore: cannot assign "${c.join(".")}" — target is neither a signal nor a namespace`)}}function lo(e){return e!==null&&typeof e=="object"&&"value"in e&&typeof e.peek=="function"}function be(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function co(e,t,o){try{e.value=t}catch(s){const n=s instanceof Error?s.message:String(s);throw new Error(`createMockStore: cannot assign to "${o.join(".")}" (computed or read-only): ${n}`)}}const po=960,uo=600,go=`
.docs-layout-host {
	position: relative;
	width: ${po}px;
	height: ${uo}px;
	background: #050a13;
	color: #e8ecf1;
	box-sizing: border-box;
	font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
	overflow: hidden;
}
.docs-layout-host__rail-wrap {
	position: absolute;
	left: 16px;
	top: 16px;
	z-index: 12;
	pointer-events: auto;
}
.docs-layout-host__rail-wrap .workbench-card--tool-rail {
	position: relative;
	width: 3.55rem;
	padding: 0.45rem;
	border-radius: 22px;
	cursor: default;
}
.docs-layout-host__rail-wrap .workbench-tool-rail {
	flex-direction: column;
	flex-wrap: nowrap;
	align-items: center;
	width: 100%;
}
.docs-layout-host__rail-wrap .workbench-tool-rail__group {
	flex-direction: column;
	width: 100%;
}
.docs-layout-host__rail-wrap .workbench-tool-rail__divider {
	width: 100%;
	height: 1px;
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0) 0%,
		rgba(255, 255, 255, 0.16) 25%,
		rgba(255, 255, 255, 0.16) 75%,
		rgba(255, 255, 255, 0) 100%
	);
}
.docs-layout-host__viewport {
	position: relative;
	position: absolute;
	left: 92px;
	top: 16px;
	right: 356px;
	bottom: 16px;
	border-radius: 14px;
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
.docs-layout-host__inspector {
	position: absolute;
	top: 16px;
	right: 16px;
	bottom: 16px;
	width: 324px;
	z-index: 11;
	box-sizing: border-box;
	overflow: hidden;
}
.docs-layout-host__inspector.workbench-card--inspector {
	width: 324px;
	height: calc(100% - 32px);
	max-height: none;
	padding: 0.55rem;
	overflow: hidden;
}
.docs-layout-host__inspector .workbench-inspector-stack {
	overflow: hidden;
	max-height: 482px;
}
.docs-layout-host__inspector .workbench-inspector-stack--split {
	grid-template-columns: 1fr;
	gap: 0.5rem;
}
.docs-layout-host__inspector .disclosure-block {
	min-width: 0;
}
.docs-layout-host__viewport .viewport-project-status {
	top: 1rem;
	right: 1rem;
	max-width: calc(100% - 2rem);
}
.docs-layout-host__viewport .viewport-lod-scale__range {
	width: 4.2rem;
	min-width: 4.2rem;
}
.docs-layout-host .tooltip-bubble {
	display: none;
}
`,bo={id:"app-layout-overview",type:"composite",title:"Full app layout overview",annotations:[{n:1,selector:".docs-layout-host__viewport",label:"ビューポート",placement:"center"},{n:2,selector:".workbench-card--tool-rail",label:"ツールレール",placement:"center"},{n:3,selector:".workbench-card--inspector",label:"インスペクター",placement:"center"},{n:4,selector:".viewport-project-status",label:"プロジェクト状態 HUD",placement:"right"}],mount:({lang:e})=>{const t=k("cf-test2-default"),o=v({locale:e,project:{name:"cf-test2",dirty:!1,packageDirty:!0},history:{canUndo:!0,canRedo:!0},shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),s=m({methods:{canFitOutputFrameToSafeArea:()=>!0}}),n=(b,g)=>h(e,b,g),c=[{id:"new-project",icon:"plus",label:n("menu.newProjectAction"),shortcut:"Ctrl+N"},{id:"open-files",icon:"folder-open",label:n("action.openFiles"),shortcut:"Ctrl+O"},{id:"save-project",icon:"save",label:n("menu.saveWorkingStateAction"),shortcut:"Ctrl+S"},{id:"export-project",icon:"package",label:n("menu.savePackageAction"),shortcut:"Ctrl+Shift+S"}],i=_e(e);return l`
			<div class="docs-layout-host">
				<style>${go}</style>
				<div class="docs-layout-host__rail-wrap">
					<section class="workbench-card workbench-card--tool-rail">
						<${fe}
							controller=${()=>s}
							mode="camera"
							projectMenuItems=${c}
							showQuickMenu=${!0}
							store=${o}
							t=${n}
						/>
					</section>
				</div>
				<main class="docs-layout-host__viewport">
					<img
						class="docs-layout-host__backdrop"
						src=${t.backdropUrl}
						alt=${t.description}
					/>
					<${Vt}
						store=${o}
						controller=${()=>s}
						t=${n}
					/>
				</main>
				<aside class="docs-layout-host__inspector workbench-card workbench-card--inspector">
					<div class="workbench-inspector-header">
						<${ye}
							activeTab="camera"
							setActiveTab=${()=>{}}
							t=${n}
						/>
					</div>
					<div class="workbench-inspector-tab-title">
						<strong>${n("section.shotCamera")}</strong>
					</div>
					<div class="workbench-inspector-stack workbench-inspector-stack--split">
						<${$e}
							store=${o}
							controller=${()=>s}
							t=${n}
							equivalentMmValue=${o.equivalentMmValue.value}
							fovLabel=${o.fovLabel.value}
							shotCameraClipMode="auto"
							open=${!0}
						/>
						<${xe}
							anchorOptions=${i}
							controller=${()=>s}
							exportSizeLabel=${o.exportSizeLabel.value}
							heightLabel=${o.heightLabel.value}
							store=${o}
							t=${n}
							widthLabel=${o.widthLabel.value}
							open=${!0}
						/>
					</div>
				</aside>
			</div>
		`}},ho=800,vo=560,mo=`
.docs-viewport-host {
	position: relative;
	width: ${ho}px;
	height: ${vo}px;
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
`,he={x:{x2:"92",y2:"50"},y:{x2:"50",y2:"8"},z:{x2:"50",y2:"50"}},_o=[{key:"pos-x",cls:"positive--x",label:"X",left:"92%",top:"50%"},{key:"pos-y",cls:"positive--y",label:"Y",left:"50%",top:"8%"},{key:"pos-z",cls:"positive--z",label:"Z",left:"50%",top:"50%"},{key:"neg-x",cls:"negative--x",label:"",left:"8%",top:"50%"},{key:"neg-y",cls:"negative--y",label:"",left:"50%",top:"92%"},{key:"neg-z",cls:"negative--z",label:"",left:"50%",top:"50%"}];function fo(){return l`
		<div class="viewport-axis-gizmo" aria-label="Viewport Axis Gizmo">
			<svg
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${["x","y","z"].map(e=>l`
						<line
							key=${e}
							data-axis-gizmo-line=${e}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${e}`}
							x1="50"
							y1="50"
							x2=${he[e].x2}
							y2=${he[e].y2}
						/>
					`)}
			</svg>
			${_o.map(e=>l`
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
	`}const yo={id:"axis-gizmo",type:"viewport",title:"Viewport axis gizmo (orthographic posZ)",mount:()=>{const e=k("cf-test2-default");return l`
			<div class="docs-viewport-host">
				<style>${mo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${fo()}
			</div>
		`}},N=800,H=560,Ie=110,Ee=70,q=580,Q=420,$o="rgba(255, 87, 72, 0.92)",ve="rgba(255, 182, 170, 0.98)",xo="rgba(255, 87, 72, 0.18)",wo="#ffd8d1";function V(e){return{widthPct:e*(1536/1754)*100,heightPct:e*(864/1240)*100}}const ko=`
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
`,So=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Io=["top","right","bottom","left"];function Y({frames:e=[],anchorOffset:t={left:"50%",top:"50%"}}={}){return l`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{left:`${Ie}px`,top:`${Ee}px`,width:`${q}px`,height:`${Q}px`}}
		>
			${e.map(o=>l`
					<div
						key=${o.id}
						class=${`frame-item${o.active?" frame-item--active frame-item--selected":""}`}
						style=${{left:o.left,top:o.top,width:o.width,height:o.height,border:`2px solid ${$o}`,boxSizing:"border-box",background:"transparent",boxShadow:o.active?`inset 0 0 0 1px ${ve}`:"none"}}
					>
						${o.active&&l`
							<span
								aria-hidden="true"
								style=${{position:"absolute",inset:"-1px",border:`1px dashed ${ve}`,borderRadius:"1px",pointerEvents:"none"}}
							></span>
						`}
						<span
							style=${{position:"absolute",top:"-22px",left:"0",padding:"2px 9px",borderRadius:"999px",background:xo,color:wo,fontFamily:'"Consolas", "Andale Mono", monospace',fontSize:"11px",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}
						>
							${o.label}
						</span>
					</div>
				`)}
			${So.map(o=>l`
					<button
						key=${`resize-${o}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${o}`}
						aria-label="resize"
					></button>
				`)}
			${Io.map(o=>l`
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
	`}const Eo={id:"camera-mode-render-box",type:"viewport",title:"Camera mode with render-box overlay",mount:()=>{const e=k("cf-test2-default"),{widthPct:t,heightPct:o}=V(1);return l`
			<div class="docs-viewport-host">
				<style>${ko}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
			</div>
		`}},To=`
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
`,zo={id:"confirm-new-project",type:"overlay",title:"Confirm: New Project",mount:()=>l`
			<div class="docs-overlay-host">
				<style>${To}</style>
				<${we} overlay=${{kind:"confirm",title:"新規プロジェクトを作成しますか？",message:"現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。",actions:[{label:"キャンセル",onClick:()=>{}},{label:"破棄して新規作成",primary:!0,onClick:()=>{}}]}} />
			</div>
		`},Ro=800,Ao=560,Co=`
.docs-viewport-host {
	position: relative;
	width: ${Ro}px;
	height: ${Ao}px;
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
`,Oo={id:"drop-hint",type:"viewport",title:"Viewport drop hint (empty project)",mount:({lang:e})=>{const t=(o,s)=>h(e,o,s);return l`
			<div class="docs-viewport-host">
				<style>${Co}</style>
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
		`}},Fo=`
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
`,Po={id:"export-output-section",type:"panel",title:"Export Output section",size:{width:360},mount:({lang:e})=>{const t=v(),o=m();return l`
			<div class="docs-section-host">
				<style>${Fo}</style>
				<div class="docs-section-host__card">
					<${Yt}
						store=${t}
						controller=${()=>o}
						t=${(n,c)=>h(e,n,c)}
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
`,Lo={id:"export-progress",type:"overlay",title:"Export progress overlay",mount:()=>{const t={kind:"progress",title:"書き出し中",message:"すべての shot をレンダリングしています。",startedAt:Date.now()-47*1e3,phaseLabel:"shot 2 / 4 をレンダリング",phaseDetail:"Camera 2 — PSD 書き出し",phases:[{label:"Camera 1",status:"done"},{label:"Camera 2",status:"active"},{label:"Camera 3",status:"pending"},{label:"Camera 4",status:"pending"}],steps:[{label:"projectをスナップショット",status:"done"},{label:"各ショットをレンダリング",status:"active"},{label:"zip アーカイブを生成",status:"pending"}]};return l`
			<div class="docs-overlay-host">
				<style>${jo}</style>
				<${we} overlay=${t} />
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
`,Do={id:"export-settings-section",type:"panel",title:"Export Settings section",size:{width:360},mount:({lang:e})=>{const t=v(),o=m();return l`
			<div class="docs-section-host">
				<style>${Mo}</style>
				<div class="docs-section-host__card">
					<${Bt}
						store=${t}
						controller=${()=>o}
						t=${n=>h(e,n)}
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
		`}},Uo=`
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
`,No=[{icon:"plus",labelKey:"menu.newProjectAction",shortcut:"Ctrl+N"},{icon:"folder-open",labelKey:"action.openFiles",shortcut:"Ctrl+O"},{icon:"save",labelKey:"menu.saveWorkingStateAction",shortcut:"Ctrl+S"},{icon:"package",labelKey:"menu.savePackageAction",shortcut:"Ctrl+Shift+S"}];function Te({lang:e,urlValue:t="",focusRing:o=!1}){const s=n=>h(e,n);return l`
		<div class=${`docs-menu-host${o?" docs-menu-host__focus-ring":""}`}>
			<style>${Uo}</style>
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
					${No.map(n=>l`
							<button
								key=${n.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${Z} name=${n.icon} size=${14} />
								</span>
								<span class="workbench-menu__item-label">
									${s(n.labelKey)}
								</span>
								<span
									class="workbench-menu__item-shortcut"
									aria-hidden="true"
								>
									<kbd>${n.shortcut}</kbd>
								</span>
							</button>
						`)}
				</div>
			</div>
		</div>
	`}const Ho={id:"open-menu",type:"overlay",title:"Tool Rail File menu (open)",mount:({lang:e})=>Te({lang:e})},Vo={id:"remote-url-input",type:"overlay",title:"Remote URL input (focused)",mount:({lang:e})=>Te({lang:e,urlValue:"https://example.com/scene.spz",focusRing:!0})},Yo=800,Bo=560,Wo=`
.docs-viewport-host {
	position: relative;
	width: ${Yo}px;
	height: ${Bo}px;
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
`,Go={id:"first-scene-loaded",type:"viewport",title:"Viewport after first scene load",mount:()=>{const e=k("cf-test2-default");return l`
			<div class="docs-viewport-host">
				<style>${Wo}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
			</div>
		`}},Xo=`
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
`,Ko={id:"inspector-tabs",type:"panel",title:"Inspector tabs (Camera active)",mount:({lang:e})=>l`
			<div class="docs-tabs-host">
				<style>${Xo}</style>
				<div class="docs-tabs-host__card">
					<${ye}
						activeTab="camera"
						setActiveTab=${()=>{}}
						t=${(o,s)=>h(e,o,s)}
					/>
				</div>
			</div>
		`},Zo=`
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
`,qo={id:"lighting-widget",type:"panel",title:"Lighting Direction widget",mount:()=>{const e=m();return l`
			<div class="docs-widget-host">
				<style>${Zo}</style>
				<div class="docs-widget-host__card">
					<${Wt}
						controller=${()=>e}
						azimuthDeg=${36.87}
						elevationDeg=${45}
						viewAzimuthDeg=${0}
						onLiveChange=${()=>{}}
					/>
				</div>
			</div>
		`}},Qo=800,Jo=560,es=`
.docs-viewport-host {
	position: relative;
	width: ${Qo}px;
	height: ${Jo}px;
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
`,ts={id:"measurement-overlay",type:"viewport",title:"Measurement overlay (line + chip)",mount:({lang:e})=>{const t=k("cf-test2-default"),o=v({measurement:{active:!0,startPointWorld:{x:0,y:0,z:0},endPointWorld:{x:1,y:0,z:0},selectedPointKey:"end",lengthInputText:"",overlay:{contextKind:"viewport",start:{visible:!0,x:260,y:360},end:{visible:!0,x:540,y:300},draftEnd:{visible:!1,x:0,y:0},lineVisible:!0,lineUsesDraft:!1,chip:{visible:!0,x:400,y:310,label:"53.42 cm",placement:"above"},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}}}),s=m(),n=(c,i)=>h(e,c,i);return l`
			<div class="docs-viewport-host">
				<style>${es}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${t.backdropUrl}
					alt=${t.description}
				/>
				<${Gt}
					store=${o}
					controller=${()=>s}
					t=${n}
				/>
			</div>
		`}},os=`
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
`,ss=[{id:"frame-1",label:"FRAME A",center:{x:.5,y:.5},scale:1,active:!1},{id:"frame-2",label:"FRAME B",center:{x:.5755,y:.5169},scale:.5537,active:!0}];function is(e){const{widthPct:t,heightPct:o}=V(e.scale);return{id:e.id,label:e.label,active:e.active,left:`${e.center.x*100-t/2}%`,top:`${e.center.y*100-o/2}%`,width:`${t}%`,height:`${o}%`}}const rs={id:"multiple-frames",type:"viewport",title:"Camera mode with multiple frames (zoom-in / TU)",mount:()=>{const e=k("cf-test2-default");return l`
			<div class="docs-viewport-host">
				<style>${os}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:ss.map(is)})}
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
`,as={id:"output-frame-section",type:"panel",title:"Output Frame section",size:{width:360},mount:({lang:e})=>{const t=v(),o=m();return l`
			<div class="docs-section-host">
				<style>${ns}</style>
				<div class="docs-section-host__card">
					<${xe}
						store=${t}
						controller=${()=>o}
						t=${n=>h(e,n)}
						anchorOptions=${_e(e)}
						exportSizeLabel=${t.exportSizeLabel.value}
						widthLabel=${t.widthLabel.value}
						heightLabel=${t.heightLabel.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},ls=240,cs=200,ds=480,ps=400,us=`
.docs-pie-host {
	position: relative;
	width: ${ds}px;
	height: ${ps}px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;function ze({lang:e,coarse:t=!1}){const o=(c,i)=>h(e,c,i),s=Xt({mode:"camera",t:o,viewportToolMode:"select",viewportOrthographic:!1,referencePreviewSessionVisible:!0,hasReferenceImages:!1,frameMaskMode:"off"}),n=s.find(c=>c.id==="tool-select")??null;return l`
		<div class="docs-pie-host">
			<style>${us}</style>
			<div
				class=${t?"viewport-pie viewport-pie--coarse":"viewport-pie"}
				style=${{left:`${ls}px`,top:`${cs}px`}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${(n==null?void 0:n.label)??o("action.quickMenu")}
					</span>
				</button>
				${s.map(c=>{const i=Math.cos(c.angle)*ce,b=Math.sin(c.angle)*ce,g=["viewport-pie__item",c.id===(n==null?void 0:n.id)||c.active?"viewport-pie__item--active":"",c.disabled?"viewport-pie__item--disabled":""].filter(Boolean).join(" ");return l`
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
	`}const gs={id:"pie-menu",type:"overlay",title:"Viewport pie menu (open)",mount:({lang:e})=>ze({lang:e,coarse:!1})},bs={id:"pie-menu-expanded",type:"overlay",title:"Viewport pie menu (coarse / expanded)",mount:({lang:e})=>ze({lang:e,coarse:!0})},hs=800,vs=560,ms=200,_s=110,fs=400,ys=300,$s=-4,xs=`
.docs-viewport-host {
	position: relative;
	width: ${hs}px;
	height: ${vs}px;
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
`,ws=["top","right","bottom","left"],ks=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Ss=["top-left","top","top-right","right","bottom-right","bottom","bottom-left","left"],Is={id:"reference-edit-mode",type:"viewport",title:"Reference image edit mode",mount:()=>{const e=k("cf-test2-default"),t={left:`${ms}px`,top:`${_s}px`,width:`${fs}px`,height:`${ys}px`,transform:`rotate(${$s}deg)`,transformOrigin:"50% 50%"};return l`
			<div class="docs-viewport-host">
				<style>${xs}</style>
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
						${ws.map(o=>l`
								<button
									key=${`edge-${o}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${o}`}
									aria-label=${o}
								></button>
							`)}
						${ks.map(o=>l`
								<button
									key=${`resize-${o}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${o}`}
									aria-label="resize"
								></button>
							`)}
						${Ss.map(o=>l`
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
		`}},Es=`
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
`;function D(e,t){return{id:e,name:t,itemRefs:[]}}function K({id:e,name:t,fileName:o,group:s,order:n}){return{id:e,assetId:`asset-${e}`,name:t,fileName:o,group:s,order:n,previewVisible:!0,exportEnabled:!0,opacity:1,scalePct:100,rotationDeg:0,offsetPx:{x:0,y:0},anchor:{ax:.5,ay:.5}}}function Re(e,t){const o=m();return l`
		<div class="docs-section-host">
			<style>${Es}</style>
			<div class="docs-section-host__card">
				<${oo}
					store=${e}
					controller=${()=>o}
					t=${(n,c)=>h(t,n,c)}
					open=${!0}
				/>
			</div>
		</div>
	`}const Ts={id:"reference-presets",type:"panel",title:"Reference Presets row",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[D("reference-preset-blank","(blank)"),D("reference-preset-outdoor","屋外ロケハン"),D("reference-preset-storyboard","コンテ A")],panelPresetId:"reference-preset-outdoor",items:[]}});return Re(t,e)}},zs={id:"reference-manager",type:"panel",title:"Reference Manager list",size:{width:360},mount:({lang:e})=>{const t=v({referenceImages:{presets:[D("reference-preset-blank","(blank)")],panelPresetId:"reference-preset-blank",items:[K({id:"ref-1",name:"Layout",fileName:"layout.png",group:"front",order:0}),K({id:"ref-2",name:"Rough Sketch",fileName:"rough.png",group:"back",order:1}),K({id:"ref-3",name:"Pose Reference",fileName:"pose-reference.jpg",group:"front",order:2})]}});return Re(t,e)}},Rs=`
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
`,As={id:"render-box-camera-mode",type:"viewport",title:"Render-box in camera mode (annotated)",annotations:[{n:1,selector:".render-box__resize-handle--top-right",label:"リサイズハンドル（8 方向）",placement:"top-right"},{n:2,selector:".render-box__pan-edge--top",label:"パンエッジ（4 辺）",placement:"above"},{n:3,selector:"#anchor-dot",label:"anchor dot",placement:"right"},{n:4,selector:"#render-box-meta",label:"meta ラベル",placement:"left"}],mount:()=>{const e=k("cf-test2-default"),{widthPct:t,heightPct:o}=V(1);return l`
			<div class="docs-viewport-host">
				<style>${Rs}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description}
				/>
				${Y({frames:[{id:"frame-1",label:"A",active:!0,left:`${(100-t)/2}%`,top:`${(100-o)/2}%`,width:`${t}%`,height:`${o}%`}]})}
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
`;function O({id:e,kind:t,label:o,visible:s=!0}){return{id:e,kind:t,label:o,visible:s}}const Os={id:"scene-manager",type:"panel",title:"Scene Manager (kind-grouped asset list)",size:{width:360},mount:({lang:e})=>{const t=[O({id:1,kind:"model",label:"Environment.glb"}),O({id:2,kind:"model",label:"Figure.glb"}),O({id:3,kind:"splat",label:"MainScan.ply"}),O({id:4,kind:"splat",label:"Foreground.spz",visible:!1}),O({id:5,kind:"splat",label:"Background.ply"})],o=t[2],s=v({selectedSceneAssetIds:[o.id],selectedSceneAssetId:o.id}),n=m();return l`
			<div class="docs-section-host">
				<style>${Cs}</style>
				<div class="docs-section-host__card">
					<${Kt}
						controller=${()=>n}
						draggedAssetId=${null}
						dragHoverState=${null}
						sceneAssets=${t}
						selectedSceneAsset=${o}
						setDraggedAssetId=${()=>{}}
						setDragHoverState=${()=>{}}
						store=${s}
						t=${(i,b)=>h(e,i,b)}
					/>
				</div>
			</div>
		`}},Fs=`
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
`,Ps={id:"section-display-zoom",type:"panel",title:"Display Zoom section",size:{width:360},mount:({lang:e})=>{const t=v(),o=m();return l`
			<div class="docs-section-host">
				<style>${Fs}</style>
				<div class="docs-section-host__card">
					<${Zt}
						store=${t}
						controller=${()=>o}
						t=${n=>h(e,n)}
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
`,Ls={id:"shot-camera-manager",type:"panel",title:"Shot Camera Manager list",size:{width:360},annotations:[{n:1,selector:"#new-shot-camera",label:"追加",placement:"above"},{n:2,selector:"#duplicate-shot-camera",label:"複製",placement:"above"},{n:3,selector:"#delete-shot-camera",label:"削除",placement:"above"},{n:4,selector:".shot-camera-manager__list",label:"shot 一覧",placement:"right"}],mount:({lang:e})=>{const t=X({id:"shot-camera-1",name:"Camera 1"}),o=[t,X({id:"shot-camera-2",name:"Camera 2",source:t}),X({id:"shot-camera-3",name:"Camera 3",source:t})],s=o[1],n=m();return l`
			<div class="docs-section-host">
				<style>${js}</style>
				<div class="docs-section-host__card">
					<${qt}
						activeShotCamera=${s}
						controller=${()=>n}
						shotCameras=${o}
						t=${(i,b)=>h(e,i,b)}
					/>
				</div>
			</div>
		`}},Ms=`
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
`,Ds={id:"shot-camera-properties",type:"panel",title:"Shot Camera Properties section",size:{width:360},mount:({lang:e})=>{const t=v({shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),o=m();return l`
			<div class="docs-section-host">
				<style>${Ms}</style>
				<div class="docs-section-host__card">
					<${$e}
						store=${t}
						controller=${()=>o}
						t=${n=>h(e,n)}
						equivalentMmValue=${t.equivalentMmValue.value}
						fovLabel=${t.fovLabel.value}
						shotCameraClipMode="auto"
						open=${!0}
					/>
				</div>
			</div>
		`}},Us=`
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
`;function B(e,t){const o=m();return l`
		<div class="docs-splat-toolbar-host">
			<style>${Us}</style>
			<${Qt}
				store=${e}
				controller=${()=>o}
				t=${(n,c)=>h(t,n,c)}
			/>
		</div>
	`}const Ns={id:"splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (box tool, unplaced)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit"});return B(t,e)}},Hs={id:"per-splat-brush-preview",type:"overlay",title:"Splat edit toolbar (brush tool)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"brush",brushSize:30,brushDepthMode:"depth",brushDepth:.2}});return B(t,e)}},Vs={id:"per-splat-box-tool",type:"overlay",title:"Splat edit toolbar (box tool, placed)",mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",boxPlaced:!0,boxCenter:{x:.5,y:1.2,z:-.3},boxSize:{x:1,y:.6,z:1.4},boxRotation:{x:0,y:0,z:0,w:1},selectionCount:12345}});return B(t,e)}},Ys={id:"per-splat-edit-toolbar",type:"overlay",title:"Splat edit toolbar (annotated)",annotations:[{n:1,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)",label:"Tool 選択"},{n:2,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)",label:"選択操作"},{n:3,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)",label:"編集アクション"},{n:4,selector:".viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info",label:"選択数"}],mount:({lang:e})=>{const t=v({viewportToolMode:"splat-edit",splatEdit:{tool:"box",selectionCount:42}});return B(t,e)}},Bs=`
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
`,Ws={id:"tool-rail",type:"panel",title:"Viewport tool rail",mount:({lang:e})=>{const t=v(),o=m(),s=(n,c)=>h(e,n,c);return l`
			<div class="docs-rail-host">
				<style>${Bs}</style>
				<div class="docs-rail-host__card">
					<${fe}
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
`,S=[{id:"frame-1",label:"FRAME A",center:{x:.3933,y:.5404},scale:1,active:!1,tangent:{in:{x:-.0874,y:.0026},out:{x:.0874,y:-.0026}}},{id:"frame-2",label:"FRAME B",center:{x:.6461,y:.4232},scale:.8549,active:!0,tangent:{in:{x:-.077,y:.0809},out:{x:.077,y:-.0809}}}];function Ae(e,t){return{x:Ie+q*e,y:Ee+Q*t}}function Xs(e){const{widthPct:t,heightPct:o}=V(e.scale);return{id:e.id,label:e.label,active:e.active,left:e.center.x*100-t/2,top:e.center.y*100-o/2,width:t,height:o}}const Ks=S.map(Xs),x=Ae(S[0].center.x,S[0].center.y),w=Ae(S[1].center.x,S[1].center.y);function W(e,t){return{x:e.x+t.x*q,y:e.y+t.y*Q}}const L=W(x,S[0].tangent.in),E=W(x,S[0].tangent.out),T=W(w,S[1].tangent.in),M=W(w,S[1].tangent.out);function Zs(e){return{id:e.id,label:e.label,active:e.active,left:`${e.left}%`,top:`${e.top}%`,width:`${e.width}%`,height:`${e.height}%`}}const qs={id:"trajectory-spline",type:"viewport",title:"Camera mode with spline trajectory (cf-test2 Camera 3)",mount:()=>{const e=k("cf-test2-default");return l`
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
							d=${`M ${x.x} ${x.y} C ${E.x} ${E.y}, ${T.x} ${T.y}, ${w.x} ${w.y}`}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${L.x}
							y1=${L.y}
							x2=${x.x}
							y2=${x.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${x.x}
							y1=${x.y}
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
						style=${{left:`${x.x}px`,top:`${x.y}px`}}
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
		`}},Qs=800,Js=560,y=400,$=310,z=70,R=90,ei=`
.docs-viewport-host {
	position: relative;
	width: ${Qs}px;
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
`,ti={id:"transform-gizmo",type:"viewport",title:"Transform gizmo over selected asset",mount:()=>{const e=k("cf-test2-default"),t={x:y+z*.95,y:$+z*.15},o={x:y-z*.1,y:$-z*.98},s={x:y+z*.5,y:$+z*.75};return l`
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
							cy=${$}
							rx=${R}
							ry=${R*.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${y}
							cy=${$}
							rx=${R*.32}
							ry=${R}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${y}
							cy=${$}
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
							y1=${$}
							x2=${t.x}
							y2=${t.y}
							stroke="#ff5f74"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${y}
							y1=${$}
							x2=${o.x}
							y2=${o.y}
							stroke="#bddb35"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${y}
							y1=${$}
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
						style=${{left:`${y}px`,top:`${$}px`}}
					>
						S
					</span>
				</div>
			</div>
		`}};p(Ps);p(Ds);p(Ls);p(as);p(Do);p(Po);p(Lo);p(Oo);p(Go);p(yo);p(Ws);p(Eo);p(rs);p(As);p(ts);p(Ts);p(zs);p(zo);p(Ho);p(Vo);p(Ko);p(gs);p(bs);p(Is);p(Ns);p(Hs);p(Vs);p(Ys);p(qs);p(ti);p(bo);p(Os);p(qo);const oi="ja",si=`
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
`;function ii({fixtureId:e,available:t}){return l`
		<div class="docs-missing">
			<h1>Fixture not found</h1>
			<p>Requested id: <code>${e||"(none)"}</code></p>
			<p>Known fixtures:</p>
			<ul>
				${t.map(o=>l`
						<li key=${o}>
							<a href=${`?fixture=${encodeURIComponent(o)}`}>${o}</a>
						</li>
					`)}
			</ul>
		</div>
	`}const ri=15,ni=3,_=ri+ni;function ai(e,t,o){const s=e.left-t.left,n=e.top-t.top,c=e.right-t.left,i=e.bottom-t.top,b=s+e.width/2,g=n+e.height/2;switch(o){case"center":return{x:b,y:g};case"top-left":return{x:s-_,y:n-_};case"bottom-right":return{x:c+_,y:i+_};case"bottom-left":return{x:s-_,y:i+_};case"above":return{x:b,y:n-_};case"below":return{x:b,y:i+_};case"left":return{x:s-_,y:g};case"right":return{x:c+_,y:g};default:return{x:c+_,y:n-_}}}function li({annotations:e}){const[t,o]=eo([]);return to(()=>{if(!Array.isArray(e)||e.length===0){o([]);return}const s=document.querySelector(".docs-stage");if(!s){o([]);return}const n=s.getBoundingClientRect(),c=e.map(i=>{const b=i.selector?s.querySelector(i.selector):null;if(!b)return{n:i.n,label:i.label??"",selector:i.selector??"",x:8,y:8,missing:!0};const g=b.getBoundingClientRect(),F=i.placement??"top-right",{x:G,y:A}=ai(g,n,F);return{n:i.n,label:i.label??"",selector:i.selector,x:G,y:A,missing:!1}});o(c)},[e]),t.length===0?null:l`
		<div class="docs-annotation-overlay" aria-hidden="true">
			${t.map(s=>l`
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
	`}function ci({fixtureId:e,lang:t}){const o=ro(e);if(!o)return l`<${ii}
			fixtureId=${e}
			available=${ke()}
		/>`;const s=Array.isArray(o.annotations)?o.annotations:[];return l`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${e}
			data-fixture-type=${o.type}
			data-lang=${t}
		>
			<style>${si}</style>
			${o.mount({lang:t})}
			${s.length>0&&l`<${li} annotations=${s}/>`}
		</div>
	`}function me(e,t){try{const o=new URL(globalThis.location.href).searchParams.get(e);return o===null?t:o}catch{return t}}function di(e){let t=!1;const o=()=>{t||(t=!0,globalThis.__DOCS_FIXTURE_READY=!0,globalThis.__DOCS_FIXTURE_ID=e)};requestAnimationFrame(()=>{requestAnimationFrame(o)}),setTimeout(o,100)}function pi(){const e=document.getElementById("docs-root");if(!e)return;const t=me("fixture",""),o=me("lang",oi);globalThis.__DOCS_FIXTURE_READY=!1,globalThis.__DOCS_FIXTURE_ID=t,globalThis.__DOCS_FIXTURE_IDS=ke(),Jt(l`<${ci} fixtureId=${t} lang=${o} />`,e),di(t)}pi();
