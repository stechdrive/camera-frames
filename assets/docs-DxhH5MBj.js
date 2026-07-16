import{$ as e,$t as t,At as n,Bs as r,Bt as i,Ct as a,Dr as o,Dt as s,Et as c,Ft as ee,Gt as te,Hs as ne,Ht as re,It as ie,J as ae,Jt as oe,Kt as se,Lt as ce,Mt as le,Nt as ue,Ot as de,Pt as fe,Q as pe,Qt as me,Rs as he,Rt as ge,S as l,St as _e,Tt as ve,Ut as ye,V as be,Vs as u,Vt as xe,Wt as Se,X as Ce,Xt as we,Y as Te,Yt as Ee,Z as De,Zt as Oe,_t as ke,a as Ae,an as je,at as Me,br as d,bt as Ne,c as Pe,cn as Fe,ct as Ie,dt as Le,en as Re,et as ze,ft as Be,gt as Ve,hn as He,ht as Ue,i as We,in as Ge,it as Ke,jt as qe,kt as Je,l as f,lt as Ye,m as Xe,mt as Ze,nn as Qe,nt as $e,o as et,on as tt,ot as nt,p as rt,pt as it,q as p,qt as at,r as ot,rn as st,rt as ct,s as lt,sn as m,st as ut,t as dt,tn as ft,tt as pt,u as h,ut as mt,vt as ht,wt as gt,x as g,xr as _,xt as _t,yt as vt,zt as yt}from"./viewport-shell-vhT5vIv5.js";var v={id:`hello`,type:`panel`,title:`Hello docs fixture`,mount:({lang:e})=>u`
		<div class="docs-hello">
			<h1>Hello, docs fixture.</h1>
			<p>
				Phase I skeleton. Fixture id: <code>hello</code>, lang: <code>${e}</code>.
			</p>
			<p>
				This placeholder exists to verify that the docs.html multi-page
				entry boots independently of the main app shell.
			</p>
		</div>
	`},bt=`
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
`;function xt(){let r=Object.entries(Object.assign({"../../ui/svg/apply-transform.svg":tt,"../../ui/svg/camera-dslr.svg":je,"../../ui/svg/camera-frames.svg":Ge,"../../ui/svg/camera-property.svg":st,"../../ui/svg/camera.svg":Qe,"../../ui/svg/chevron-down.svg":ft,"../../ui/svg/chevron-left.svg":Re,"../../ui/svg/chevron-right.svg":t,"../../ui/svg/clock.svg":me,"../../ui/svg/close.svg":Oe,"../../ui/svg/copy-to-camera.svg":we,"../../ui/svg/copy-to-viewport.svg":Ee,"../../ui/svg/cursor.svg":oe,"../../ui/svg/duplicate.svg":at,"../../ui/svg/export-tab.svg":se,"../../ui/svg/export.svg":te,"../../ui/svg/eye-off.svg":Se,"../../ui/svg/eye.svg":ye,"../../ui/svg/folder-open.svg":re,"../../ui/svg/frame-plus.svg":xe,"../../ui/svg/frame.svg":i,"../../ui/svg/grip.svg":yt,"../../ui/svg/help.svg":ge,"../../ui/svg/image.svg":ce,"../../ui/svg/keyframe.svg":ie,"../../ui/svg/lens.svg":ee,"../../ui/svg/light.svg":fe,"../../ui/svg/link.svg":ue,"../../ui/svg/lock-open.svg":le,"../../ui/svg/lock.svg":qe,"../../ui/svg/mask-all.svg":n,"../../ui/svg/mask-selected.svg":Je,"../../ui/svg/mask.svg":de,"../../ui/svg/menu.svg":s,"../../ui/svg/move.svg":c,"../../ui/svg/package-open.svg":ve,"../../ui/svg/package.svg":gt,"../../ui/svg/paste.svg":a,"../../ui/svg/pause.svg":_e,"../../ui/svg/pie-menu.svg":_t,"../../ui/svg/pin.svg":Ne,"../../ui/svg/pivot.svg":vt,"../../ui/svg/play.svg":ht,"../../ui/svg/plus.svg":ke,"../../ui/svg/redo.svg":Ve,"../../ui/svg/reference-preview-off.svg":Ue,"../../ui/svg/reference-preview-on.svg":Ze,"../../ui/svg/reference-tool.svg":it,"../../ui/svg/reference.svg":Be,"../../ui/svg/render-box.svg":Le,"../../ui/svg/reset.svg":mt,"../../ui/svg/ruler.svg":Ye,"../../ui/svg/save.svg":Ie,"../../ui/svg/scene.svg":ut,"../../ui/svg/scrub.svg":nt,"../../ui/svg/selection-clear.svg":Me,"../../ui/svg/settings.svg":Ke,"../../ui/svg/skip-back.svg":ct,"../../ui/svg/skip-forward.svg":$e,"../../ui/svg/slash-circle.svg":pt,"../../ui/svg/splat-edit.svg":ze,"../../ui/svg/trash.svg":e,"../../ui/svg/undo.svg":pe,"../../ui/svg/view.svg":De,"../../ui/svg/viewport.svg":Ce,"../../ui/svg/zoom-out.svg":Te,"../../ui/svg/zoom.svg":ae})).map(([e,t])=>{let n=e.match(/\/([^/]+)\.svg$/i),r=n?n[1]:null;return r&&typeof t==`string`?{name:r,rawSvg:t}:null}).filter(Boolean);return r.sort((e,t)=>e.name.localeCompare(t.name)),r}var y={id:`icons-all`,type:`reference`,title:`All workbench icons`,mount:({lang:e})=>{let t=xt();return u`
			<div class="docs-icons-all">
				<style>${bt}</style>
				<h1>All workbench icons (${t.length})</h1>
				<p>
					Auto-generated from <code>src/ui/svg/*.svg</code>. Language:
					<code>${e}</code>.
				</p>
				<ul class="docs-icons-all__grid">
					${t.map(e=>u`
							<li
								key=${e.name}
								class="docs-icons-all__item"
								data-icon-name=${e.name}
							>
								<div
									class="docs-icons-all__svg"
									dangerouslySetInnerHTML=${{__html:e.rawSvg}}
								></div>
								<code>${e.name}</code>
							</li>
						`)}
				</ul>
			</div>
		`}},b={[v.id]:v,[y.id]:y};function x(e){if(!e||typeof e.id!=`string`||e.id.length===0)throw Error(`registerFixture: fixture.id must be a non-empty string`);if(Object.hasOwn(b,e.id))throw Error(`registerFixture: duplicate id "${e.id}"`);b[e.id]=e}function St(e){return typeof e!=`string`||e===``?null:b[e]??null}function S(){return Object.keys(b)}var C=`__calls`,w=`__methods`;function T(e={}){let t=e.log===!0,n=e.methods??null,r=[];return new Proxy({[C]:r,[w]:n},{get(e,i){if(typeof i!=`string`)return Reflect.get(e,i);if(i===C)return r;if(i===w)return n;let a=n&&Object.hasOwn(n,i)?n[i]:null;return(...e)=>{if(r.push({method:i,args:e}),t&&console.debug(`[mock-controller] ${i}`,e),a)return a(...e)}}})}var Ct={"cf-test2-default":{id:`cf-test2-default`,backdropUrl:`/camera-frames/docs/help/assets/fixture-backdrops/cf-test2-default.png`,width:1073,height:1264,description:`cf-test2 の仮のシーン（権利クリア済みの motorbike スプラット）`}};function E(e){let t=Ct[e];if(!t)throw Error(`makeScene: unknown scene "${e}"`);return t}function D(e={}){let t=Fe(null);return O(t,e,[]),t}function O(e,t,n){for(let[r,i]of Object.entries(t)){let t=n.concat(r),a=e?.[r];if(a==null)throw Error(`createMockStore: unknown path "${t.join(`.`)}"`);if(wt(a)){Tt(a,i,t);continue}if(k(a)&&k(i)){O(a,i,t);continue}throw Error(`createMockStore: cannot assign "${t.join(`.`)}" — target is neither a signal nor a namespace`)}}function wt(e){return typeof e==`object`&&!!e&&`value`in e&&typeof e.peek==`function`}function k(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function Tt(e,t,n){try{e.value=t}catch(e){let t=e instanceof Error?e.message:String(e);throw Error(`createMockStore: cannot assign to "${n.join(`.`)}" (computed or read-only): ${t}`)}}var Et=`
.docs-layout-host {
	position: relative;
	width: 960px;
	height: 600px;
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
`,Dt={id:`app-layout-overview`,type:`composite`,title:`Full app layout overview`,annotations:[{n:1,selector:`.docs-layout-host__viewport`,label:`ビューポート`,placement:`center`},{n:2,selector:`.workbench-card--tool-rail`,label:`ツールレール`,placement:`center`},{n:3,selector:`.workbench-card--inspector`,label:`インスペクター`,placement:`center`},{n:4,selector:`.viewport-project-status`,label:`プロジェクト状態 HUD`,placement:`right`}],mount:({lang:e})=>{let t=E(`cf-test2-default`),n=D({locale:e,project:{name:`cf-test2`,dirty:!1,packageDirty:!0},history:{canUndo:!0,canRedo:!0},shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),r=T({methods:{canFitOutputFrameToSafeArea:()=>!0}}),i=(t,n)=>_(e,t,n),a=[{id:`new-project`,icon:`plus`,label:i(`menu.newProjectAction`),shortcut:`Ctrl+N`},{id:`open-files`,icon:`folder-open`,label:i(`action.openFiles`),shortcut:`Ctrl+O`},{id:`save-project`,icon:`save`,label:i(`menu.saveWorkingStateAction`),shortcut:`Ctrl+S`},{id:`export-project`,icon:`package`,label:i(`menu.savePackageAction`),shortcut:`Ctrl+Shift+S`}],o=d(e);return u`
			<div class="docs-layout-host">
				<style>${Et}</style>
				<div class="docs-layout-host__rail-wrap">
					<section class="workbench-card workbench-card--tool-rail">
						<${l}
							controller=${()=>r}
							mode="camera"
							projectMenuItems=${a}
							showQuickMenu=${!0}
							store=${n}
							t=${i}
						/>
					</section>
				</div>
				<main class="docs-layout-host__viewport">
					<img
						class="docs-layout-host__backdrop"
						src=${t.backdropUrl}
						alt=${t.description??``}
					/>
					<${ot}
						store=${n}
						controller=${()=>r}
						t=${i}
					/>
				</main>
				<aside class="docs-layout-host__inspector workbench-card workbench-card--inspector">
					<div class="workbench-inspector-header">
						<${g}
							activeTab="camera"
							setActiveTab=${()=>{}}
							t=${i}
						/>
					</div>
					<div class="workbench-inspector-tab-title">
						<strong>${i(`section.shotCamera`)}</strong>
					</div>
					<div class="workbench-inspector-stack workbench-inspector-stack--split">
						<${h}
							store=${n}
							controller=${()=>r}
							t=${i}
							equivalentMmValue=${n.equivalentMmValue.value}
							fovLabel=${n.fovLabel.value}
							shotCameraClipMode="auto"
							open=${!0}
						/>
						<${f}
							anchorOptions=${o}
							controller=${()=>r}
							exportSizeLabel=${n.exportSizeLabel.value}
							heightLabel=${n.heightLabel.value}
							store=${n}
							t=${i}
							widthLabel=${n.widthLabel.value}
							open=${!0}
						/>
					</div>
				</aside>
			</div>
		`}},Ot=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,A={x:{x2:`92`,y2:`50`},y:{x2:`50`,y2:`8`},z:{x2:`50`,y2:`50`}},kt=[{key:`pos-x`,cls:`positive--x`,label:`X`,left:`92%`,top:`50%`},{key:`pos-y`,cls:`positive--y`,label:`Y`,left:`50%`,top:`8%`},{key:`pos-z`,cls:`positive--z`,label:`Z`,left:`50%`,top:`50%`},{key:`neg-x`,cls:`negative--x`,label:``,left:`8%`,top:`50%`},{key:`neg-y`,cls:`negative--y`,label:``,left:`50%`,top:`92%`},{key:`neg-z`,cls:`negative--z`,label:``,left:`50%`,top:`50%`}];function At(){return u`
		<div class="viewport-axis-gizmo" aria-label="Viewport Axis Gizmo">
			<svg
				class="viewport-axis-gizmo__axes"
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				${[`x`,`y`,`z`].map(e=>u`
						<line
							key=${e}
							data-axis-gizmo-line=${e}
							class=${`viewport-axis-gizmo__line viewport-axis-gizmo__line--${e}`}
							x1="50"
							y1="50"
							x2=${A[e].x2}
							y2=${A[e].y2}
						/>
					`)}
			</svg>
			${kt.map(e=>u`
					<button
						key=${e.key}
						type="button"
						class=${`viewport-axis-gizmo__button viewport-axis-gizmo__button--${e.cls.split(`--`)[0]} viewport-axis-gizmo__button--${e.cls.split(`--`)[1]}`}
						data-axis-gizmo-node=${e.key}
						aria-label=${e.label||e.key}
						style=${{left:e.left,top:e.top}}
					>
						<span>${e.label}</span>
					</button>
				`)}
		</div>
	`}var jt={id:`axis-gizmo`,type:`viewport`,title:`Viewport axis gizmo (orthographic posZ)`,mount:()=>{let e=E(`cf-test2-default`);return u`
			<div class="docs-viewport-host">
				<style>${Ot}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				${At()}
			</div>
		`}},Mt=`rgba(255, 87, 72, 0.92)`,Nt=`rgba(255, 182, 170, 0.98)`,Pt=`rgba(255, 87, 72, 0.18)`,Ft=`#ffd8d1`;function j(e){return{widthPct:1536/1754*e*100,heightPct:864/1240*e*100}}var It=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,Lt=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],Rt=[`top`,`right`,`bottom`,`left`];function M({frames:e=[],anchorOffset:t={left:`50%`,top:`50%`}}={}){return u`
		<div
			id="render-box"
			class="render-box is-selected"
			data-anchor-handle="center"
			style=${{left:`110px`,top:`70px`,width:`580px`,height:`420px`}}
		>
			${e.map(e=>u`
					<div
						key=${e.id}
						class=${`frame-item${e.active?` frame-item--active frame-item--selected`:``}`}
						style=${{left:e.left,top:e.top,width:e.width,height:e.height,border:`2px solid ${Mt}`,boxSizing:`border-box`,background:`transparent`,boxShadow:e.active?`inset 0 0 0 1px ${Nt}`:`none`}}
					>
						${e.active&&u`
							<span
								aria-hidden="true"
								style=${{position:`absolute`,inset:`-1px`,border:`1px dashed rgba(255, 182, 170, 0.98)`,borderRadius:`1px`,pointerEvents:`none`}}
							></span>
						`}
						<span
							style=${{position:`absolute`,top:`-22px`,left:`0`,padding:`2px 9px`,borderRadius:`999px`,background:Pt,color:Ft,fontFamily:`"Consolas", "Andale Mono", monospace`,fontSize:`11px`,fontWeight:600,letterSpacing:`0.05em`,textTransform:`uppercase`,whiteSpace:`nowrap`}}
						>
							${e.label}
						</span>
					</div>
				`)}
			${Lt.map(e=>u`
					<button
						key=${`resize-${e}`}
						type="button"
						class=${`render-box__resize-handle render-box__resize-handle--${e}`}
						aria-label="resize"
					></button>
				`)}
			${Rt.map(e=>u`
					<button
						key=${`pan-${e}`}
						type="button"
						class=${`render-box__pan-edge render-box__pan-edge--${e}`}
						aria-label="pan"
					></button>
				`)}
			<div
				id="render-box-meta"
				class="render-box__meta"
				style=${{position:`absolute`,top:`-32px`,right:`0`,padding:`4px 12px`,borderRadius:`999px`,background:`rgba(10, 18, 28, 0.9)`,color:`rgba(198, 216, 236, 0.95)`,fontSize:`12px`,fontWeight:600,letterSpacing:`0.04em`,pointerEvents:`auto`}}
			>
				1754 × 1240 · center
			</div>
			<div
				id="anchor-dot"
				class="render-box__anchor"
				style=${{position:`absolute`,left:t.left,top:t.top,transform:`translate(-50%, -50%)`,width:`10px`,height:`10px`,borderRadius:`50%`,background:`rgba(114, 227, 157, 0.94)`,boxShadow:`0 0 0 2px rgba(10, 18, 28, 0.6)`,pointerEvents:`none`}}
			></div>
		</div>
	`}var zt={id:`camera-mode-render-box`,type:`viewport`,title:`Camera mode with render-box overlay`,mount:()=>{let e=E(`cf-test2-default`),{widthPct:t,heightPct:n}=j(1);return u`
			<div class="docs-viewport-host">
				<style>${It}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				${M({frames:[{id:`frame-1`,label:`A`,active:!0,left:`${(100-t)/2}%`,top:`${(100-n)/2}%`,width:`${t}%`,height:`${n}%`}]})}
			</div>
		`}},Bt=`
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
`,Vt={id:`confirm-new-project`,type:`overlay`,title:`Confirm: New Project`,mount:()=>u`
			<div class="docs-overlay-host">
				<style>${Bt}</style>
				<${m} overlay=${{kind:`confirm`,title:`新規プロジェクトを作成しますか？`,message:`現在の作業は未保存の変更を含みます。新規プロジェクトを作成すると現在の作業は破棄されます。`,actions:[{label:`キャンセル`,onClick:()=>{}},{label:`破棄して新規作成`,primary:!0,onClick:()=>{}}]}} />
			</div>
		`},Ht=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,Ut={id:`drop-hint`,type:`viewport`,title:`Viewport drop hint (empty project)`,mount:({lang:e})=>{let t=(t,n)=>_(e,t,n);return u`
			<div class="docs-viewport-host">
				<style>${Ht}</style>
				<div class="drop-hint">
					<span class="drop-hint__meta">
						CAMERA_FRAMES docs-fixture
					</span>
					<strong>${t(`drop.title`)}</strong>
					<span>${t(`drop.body`)}</span>
					<div class="drop-hint__controls">
						<strong class="drop-hint__controls-title">
							${t(`drop.controlsTitle`)}
						</strong>
						<div class="drop-hint__controls-grid">
							<span>${t(`drop.controlOrbit`)}</span>
							<span>${t(`drop.controlPan`)}</span>
							<span>${t(`drop.controlDolly`)}</span>
							<span>${t(`drop.controlAnchorOrbit`)}</span>
						</div>
					</div>
				</div>
			</div>
		`}},Wt=`
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
`,Gt={id:`export-output-section`,type:`panel`,title:`Export Output section`,size:{width:360},mount:({lang:e})=>{let t=D(),n=T();return u`
			<div class="docs-section-host">
				<style>${Wt}</style>
				<div class="docs-section-host__card">
					<${lt}
						store=${t}
						controller=${()=>n}
						t=${(t,n)=>_(e,t,n)}
						exportBusy=${!1}
						exportPresetIds=${[]}
						exportSelectionMissing=${!1}
						exportTarget="current"
						open=${!0}
					/>
				</div>
			</div>
		`}},Kt=`
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
`,qt={id:`export-progress`,type:`overlay`,title:`Export progress overlay`,mount:()=>u`
			<div class="docs-overlay-host">
				<style>${Kt}</style>
				<${m} overlay=${{kind:`progress`,title:`書き出し中`,message:`すべての shot をレンダリングしています。`,startedAt:Date.now()-47*1e3,phaseLabel:`shot 2 / 4 をレンダリング`,phaseDetail:`Camera 2 — PSD 書き出し`,phases:[{label:`Camera 1`,status:`done`},{label:`Camera 2`,status:`active`},{label:`Camera 3`,status:`pending`},{label:`Camera 4`,status:`pending`}],steps:[{label:`projectをスナップショット`,status:`done`},{label:`各ショットをレンダリング`,status:`active`},{label:`zip アーカイブを生成`,status:`pending`}]}} />
			</div>
		`},Jt=`
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
`,Yt={id:`export-settings-section`,type:`panel`,title:`Export Settings section`,size:{width:360},mount:({lang:e})=>{let t=D(),n=T();return u`
			<div class="docs-section-host">
				<style>${Jt}</style>
				<div class="docs-section-host__card">
					<${Pe}
						store=${t}
						controller=${()=>n}
						t=${t=>_(e,t)}
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
		`}},Xt=`
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
`,Zt=[{icon:`plus`,labelKey:`menu.newProjectAction`,shortcut:`Ctrl+N`},{icon:`folder-open`,labelKey:`action.openFiles`,shortcut:`Ctrl+O`},{icon:`save`,labelKey:`menu.saveWorkingStateAction`,shortcut:`Ctrl+S`},{icon:`package`,labelKey:`menu.savePackageAction`,shortcut:`Ctrl+Shift+S`}];function N({lang:e,urlValue:t=``,focusRing:n=!1}){let r=t=>_(e,t);return u`
		<div class=${`docs-menu-host${n?` docs-menu-host__focus-ring`:``}`}>
			<style>${Xt}</style>
			<div class="workbench-menu is-open">
				<div class="workbench-menu__panel" role="menu">
					<div class="workbench-menu__group">
						<div class="workbench-menu__field">
							<label for="header-url-input">${r(`field.remoteUrl`)}</label>
							<input
								id="header-url-input"
								type="text"
								placeholder="https://.../scene.spz or model.fbx"
								value=${t}
							/>
						</div>
						<button type="button" class="workbench-menu__item">
							<span class="workbench-menu__item-icon">
								<${p} name="link" size=${14} />
							</span>
							<span>${r(`action.loadUrl`)}</span>
						</button>
					</div>
					${Zt.map(e=>u`
							<button
								key=${e.labelKey}
								type="button"
								role="menuitem"
								class="workbench-menu__item"
							>
								<span class="workbench-menu__item-icon">
									<${p} name=${e.icon} size=${14} />
								</span>
								<span class="workbench-menu__item-label">
									${r(e.labelKey)}
								</span>
								<span
									class="workbench-menu__item-shortcut"
									aria-hidden="true"
								>
									<kbd>${e.shortcut}</kbd>
								</span>
							</button>
						`)}
				</div>
			</div>
		</div>
	`}var Qt={id:`open-menu`,type:`overlay`,title:`Tool Rail File menu (open)`,mount:({lang:e})=>N({lang:e})},$t={id:`remote-url-input`,type:`overlay`,title:`Remote URL input (focused)`,mount:({lang:e})=>N({lang:e,urlValue:`https://example.com/scene.spz`,focusRing:!0})},en=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,tn={id:`first-scene-loaded`,type:`viewport`,title:`Viewport after first scene load`,mount:()=>{let e=E(`cf-test2-default`);return u`
			<div class="docs-viewport-host">
				<style>${en}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??`viewport backdrop`}
				/>
			</div>
		`}},nn=`
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
`,rn={id:`inspector-tabs`,type:`panel`,title:`Inspector tabs (Camera active)`,mount:({lang:e})=>u`
			<div class="docs-tabs-host">
				<style>${nn}</style>
				<div class="docs-tabs-host__card">
					<${g}
						activeTab="camera"
						setActiveTab=${()=>{}}
						t=${(t,n)=>_(e,t,n)}
					/>
				</div>
			</div>
		`},an=`
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
`,on={id:`lighting-widget`,type:`panel`,title:`Lighting Direction widget`,mount:()=>{let e=T();return u`
			<div class="docs-widget-host">
				<style>${an}</style>
				<div class="docs-widget-host__card">
					<${be}
						controller=${()=>e}
						azimuthDeg=${36.87}
						elevationDeg=${45}
						viewAzimuthDeg=${0}
						onLiveChange=${()=>{}}
					/>
				</div>
			</div>
		`}},sn=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,cn={id:`measurement-overlay`,type:`viewport`,title:`Measurement overlay (line + chip)`,mount:({lang:e})=>{let t=E(`cf-test2-default`),n=D({measurement:{active:!0,startPointWorld:{x:0,y:0,z:0},endPointWorld:{x:1,y:0,z:0},selectedPointKey:`end`,lengthInputText:``,overlay:{contextKind:`viewport`,start:{visible:!0,x:260,y:360},end:{visible:!0,x:540,y:300},draftEnd:{visible:!1,x:0,y:0},lineVisible:!0,lineUsesDraft:!1,chip:{visible:!0,x:400,y:310,label:`53.42 cm`,placement:`above`},gizmo:{visible:!1,pointKey:null,x:0,y:0,handles:{x:{visible:!1,x:0,y:0},y:{visible:!1,x:0,y:0},z:{visible:!1,x:0,y:0}}}}}}),r=T();return u`
			<div class="docs-viewport-host">
				<style>${sn}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${t.backdropUrl}
					alt=${t.description??``}
				/>
				<${We}
					store=${n}
					controller=${()=>r}
					t=${(t,n)=>_(e,t,n)}
				/>
			</div>
		`}},ln=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,un=[{id:`frame-1`,label:`FRAME A`,center:{x:.5,y:.5},scale:1,active:!1},{id:`frame-2`,label:`FRAME B`,center:{x:.5755,y:.5169},scale:.5537,active:!0}];function dn(e){let{widthPct:t,heightPct:n}=j(e.scale);return{id:e.id,label:e.label,active:e.active,left:`${e.center.x*100-t/2}%`,top:`${e.center.y*100-n/2}%`,width:`${t}%`,height:`${n}%`}}var fn={id:`multiple-frames`,type:`viewport`,title:`Camera mode with multiple frames (zoom-in / TU)`,mount:()=>{let e=E(`cf-test2-default`);return u`
			<div class="docs-viewport-host">
				<style>${ln}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				${M({frames:un.map(dn)})}
			</div>
		`}},pn=`
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
`,mn={id:`output-frame-section`,type:`panel`,title:`Output Frame section`,size:{width:360},mount:({lang:e})=>{let t=D(),n=T();return u`
			<div class="docs-section-host">
				<style>${pn}</style>
				<div class="docs-section-host__card">
					<${f}
						store=${t}
						controller=${()=>n}
						t=${t=>_(e,t)}
						anchorOptions=${d(e)}
						exportSizeLabel=${t.exportSizeLabel.value}
						widthLabel=${t.widthLabel.value}
						heightLabel=${t.heightLabel.value}
						open=${!0}
					/>
				</div>
			</div>
		`}},hn=240,gn=200,_n=`
.docs-pie-host {
	position: relative;
	width: 480px;
	height: 400px;
	background: radial-gradient(circle at 50% 50%, #0d1826 0%, #050a12 100%);
	display: inline-block;
	box-sizing: border-box;
	overflow: hidden;
}
`;function P({lang:e,coarse:t=!1}){let n=(t,n)=>_(e,t,n),r=He({mode:`camera`,t:n,viewportToolMode:`select`,viewportOrthographic:!1,referencePreviewSessionVisible:!0,hasReferenceImages:!1,frameMaskMode:`off`}),i=r.find(e=>e.id===`tool-select`)??null;return u`
		<div class="docs-pie-host">
			<style>${_n}</style>
			<div
				class=${t?`viewport-pie viewport-pie--coarse`:`viewport-pie`}
				style=${{left:`${hn}px`,top:`${gn}px`}}
			>
				<button type="button" class="viewport-pie__center">
					<span class="viewport-pie__center-label">
						${i?.label??n(`action.quickMenu`)}
					</span>
				</button>
				${r.map(e=>{let t=Math.cos(e.angle)*88,n=Math.sin(e.angle)*88,r=[`viewport-pie__item`,e.id===i?.id||e.active?`viewport-pie__item--active`:``,e.disabled?`viewport-pie__item--disabled`:``].filter(Boolean).join(` `);return u`
						<button
							key=${e.id}
							type="button"
							class=${r}
							style=${{left:`${t}px`,top:`${n}px`}}
							disabled=${!!e.disabled}
						>
							<span class="viewport-pie__item-icon">
								<${p} name=${e.icon} size=${18} />
							</span>
						</button>
					`})}
			</div>
		</div>
	`}var vn={id:`pie-menu`,type:`overlay`,title:`Viewport pie menu (open)`,mount:({lang:e})=>P({lang:e,coarse:!1})},yn={id:`pie-menu-expanded`,type:`overlay`,title:`Viewport pie menu (coarse / expanded)`,mount:({lang:e})=>P({lang:e,coarse:!0})},bn=800,xn=560,Sn=200,Cn=110,wn=400,Tn=300,En=-4,Dn=`
.docs-viewport-host {
	position: relative;
	width: ${bn}px;
	height: ${xn}px;
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
`,On=[`top`,`right`,`bottom`,`left`],kn=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],An=[`top-left`,`top`,`top-right`,`right`,`bottom-right`,`bottom`,`bottom-left`,`left`],jn={id:`reference-edit-mode`,type:`viewport`,title:`Reference image edit mode`,mount:()=>{let e=E(`cf-test2-default`),t={left:`${Sn}px`,top:`${Cn}px`,width:`${wn}px`,height:`${Tn}px`,transform:`rotate(${En}deg)`,transformOrigin:`50% 50%`};return u`
			<div class="docs-viewport-host">
				<style>${Dn}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
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
						${On.map(e=>u`
								<button
									key=${`edge-${e}`}
									type="button"
									class=${`frame-item__edge frame-item__edge--${e}`}
									aria-label=${e}
								></button>
							`)}
						${kn.map(e=>u`
								<button
									key=${`resize-${e}`}
									type="button"
									class=${`frame-item__resize-handle frame-item__resize-handle--${e}`}
									aria-label="resize"
								></button>
							`)}
						${An.map(e=>u`
								<button
									key=${`rotate-${e}`}
									type="button"
									class=${`frame-item__rotation-zone frame-item__rotation-zone--${e}`}
									aria-label="rotate"
								></button>
							`)}
						<button
							type="button"
							class="frame-item__anchor"
							style=${{left:`50%`,top:`50%`}}
							aria-label="anchor"
						></button>
					</div>
				</div>
			</div>
		`}},Mn=`
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
`;function F(e,t){return{id:e,name:t,itemRefs:[]}}function I({id:e,name:t,fileName:n,group:r,order:i}){return{id:e,assetId:`asset-${e}`,name:t,fileName:n,group:r,order:i,previewVisible:!0,exportEnabled:!0,opacity:1,scalePct:100,rotationDeg:0,offsetPx:{x:0,y:0},anchor:{ax:.5,ay:.5}}}function L(e,t){let n=T();return u`
		<div class="docs-section-host">
			<style>${Mn}</style>
			<div class="docs-section-host__card">
				<${Ae}
					store=${e}
					controller=${()=>n}
					t=${(e,n)=>_(t,e,n)}
					open=${!0}
				/>
			</div>
		</div>
	`}var Nn={id:`reference-presets`,type:`panel`,title:`Reference Presets row`,size:{width:360},mount:({lang:e})=>L(D({referenceImages:{presets:[F(`reference-preset-blank`,`(blank)`),F(`reference-preset-outdoor`,`屋外ロケハン`),F(`reference-preset-storyboard`,`コンテ A`)],panelPresetId:`reference-preset-outdoor`,items:[]}}),e)},Pn={id:`reference-manager`,type:`panel`,title:`Reference Manager list`,size:{width:360},mount:({lang:e})=>L(D({referenceImages:{presets:[F(`reference-preset-blank`,`(blank)`)],panelPresetId:`reference-preset-blank`,items:[I({id:`ref-1`,name:`Layout`,fileName:`layout.png`,group:`front`,order:0}),I({id:`ref-2`,name:`Rough Sketch`,fileName:`rough.png`,group:`back`,order:1}),I({id:`ref-3`,name:`Pose Reference`,fileName:`pose-reference.jpg`,group:`front`,order:2})]}}),e)},Fn=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,In={id:`render-box-camera-mode`,type:`viewport`,title:`Render-box in camera mode (annotated)`,annotations:[{n:1,selector:`.render-box__resize-handle--top-right`,label:`リサイズハンドル（8 方向）`,placement:`top-right`},{n:2,selector:`.render-box__pan-edge--top`,label:`パンエッジ（4 辺）`,placement:`above`},{n:3,selector:`#anchor-dot`,label:`anchor dot`,placement:`right`},{n:4,selector:`#render-box-meta`,label:`meta ラベル`,placement:`left`}],mount:()=>{let e=E(`cf-test2-default`),{widthPct:t,heightPct:n}=j(1);return u`
			<div class="docs-viewport-host">
				<style>${Fn}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				${M({frames:[{id:`frame-1`,label:`A`,active:!0,left:`${(100-t)/2}%`,top:`${(100-n)/2}%`,width:`${t}%`,height:`${n}%`}]})}
			</div>
		`}},Ln=`
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
`;function R({id:e,kind:t,label:n,visible:r=!0}){return{id:e,kind:t,label:n,visible:r}}var Rn={id:`scene-manager`,type:`panel`,title:`Scene Manager (kind-grouped asset list)`,size:{width:360},mount:({lang:e})=>{let t=[R({id:1,kind:`model`,label:`Environment.glb`}),R({id:2,kind:`model`,label:`Figure.glb`}),R({id:3,kind:`splat`,label:`MainScan.ply`}),R({id:4,kind:`splat`,label:`Foreground.spz`,visible:!1}),R({id:5,kind:`splat`,label:`Background.ply`})],n=t[2],r=D({selectedSceneAssetIds:[n.id],selectedSceneAssetId:n.id}),i=T();return u`
			<div class="docs-section-host">
				<style>${Ln}</style>
				<div class="docs-section-host__card">
					<${rt}
						controller=${()=>i}
						draggedAssetId=${null}
						dragHoverState=${null}
						sceneAssets=${t}
						selectedSceneAsset=${n}
						setDraggedAssetId=${()=>{}}
						setDragHoverState=${()=>{}}
						store=${r}
						t=${(t,n)=>_(e,t,n)}
					/>
				</div>
			</div>
		`}},zn=`
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
`,Bn={id:`section-display-zoom`,type:`panel`,title:`Display Zoom section`,size:{width:360},mount:({lang:e})=>{let t=D(),n=T();return u`
			<div class="docs-section-host">
				<style>${zn}</style>
				<div class="docs-section-host__card">
					<${et}
						store=${t}
						controller=${()=>n}
						t=${t=>_(e,t)}
					/>
				</div>
			</div>
		`}},Vn=`
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
`,Hn={id:`shot-camera-manager`,type:`panel`,title:`Shot Camera Manager list`,size:{width:360},annotations:[{n:1,selector:`#new-shot-camera`,label:`追加`,placement:`above`},{n:2,selector:`#duplicate-shot-camera`,label:`複製`,placement:`above`},{n:3,selector:`#delete-shot-camera`,label:`削除`,placement:`above`},{n:4,selector:`.shot-camera-manager__list`,label:`shot 一覧`,placement:`right`}],mount:({lang:e})=>{let t=o({id:`shot-camera-1`,name:`Camera 1`}),n=[t,o({id:`shot-camera-2`,name:`Camera 2`,source:t}),o({id:`shot-camera-3`,name:`Camera 3`,source:t})],r=n[1],i=T();return u`
			<div class="docs-section-host">
				<style>${Vn}</style>
				<div class="docs-section-host__card">
					<${Xe}
						activeShotCamera=${r}
						controller=${()=>i}
						shotCameras=${n}
						t=${(t,n)=>_(e,t,n)}
					/>
				</div>
			</div>
		`}},Un=`
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
`,Wn={id:`shot-camera-properties`,type:`panel`,title:`Shot Camera Properties section`,size:{width:360},mount:({lang:e})=>{let t=D({shotCamera:{positionX:1.23,positionY:2.45,positionZ:-.5,yawDeg:45,pitchDeg:-15,rollDeg:0}}),n=T();return u`
			<div class="docs-section-host">
				<style>${Un}</style>
				<div class="docs-section-host__card">
					<${h}
						store=${t}
						controller=${()=>n}
						t=${t=>_(e,t)}
						equivalentMmValue=${t.equivalentMmValue.value}
						fovLabel=${t.fovLabel.value}
						shotCameraClipMode="auto"
						open=${!0}
					/>
				</div>
			</div>
		`}},Gn=`
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
	align-self: center;
}
`;function z(e,t){let n=T();return u`
		<div class="docs-splat-toolbar-host">
			<style>${Gn}</style>
			<${dt}
				store=${e}
				controller=${()=>n}
				t=${(e,n)=>_(t,e,n)}
			/>
		</div>
	`}var Kn={id:`splat-edit-toolbar`,type:`overlay`,title:`Splat edit toolbar (box tool, unplaced)`,mount:({lang:e})=>z(D({viewportToolMode:`splat-edit`}),e)},qn={id:`per-splat-brush-preview`,type:`overlay`,title:`Splat edit toolbar (brush tool)`,mount:({lang:e})=>z(D({viewportToolMode:`splat-edit`,splatEdit:{tool:`brush`,brushSize:30,brushDepthMode:`depth`,brushDepth:.2}}),e)},Jn={id:`per-splat-box-tool`,type:`overlay`,title:`Splat edit toolbar (box tool, placed)`,mount:({lang:e})=>z(D({viewportToolMode:`splat-edit`,splatEdit:{tool:`box`,boxPlaced:!0,boxCenter:{x:.5,y:1.2,z:-.3},boxSize:{x:1,y:.6,z:1.4},boxRotation:{x:0,y:0,z:0,w:1},selectionCount:12345}}),e)},Yn={id:`per-splat-edit-toolbar`,type:`overlay`,title:`Splat edit toolbar (annotated)`,annotations:[{n:1,selector:`.viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(1)`,label:`Tool 選択`},{n:2,selector:`.viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(3)`,label:`選択操作`},{n:3,selector:`.viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__group:nth-of-type(5)`,label:`編集アクション`},{n:4,selector:`.viewport-splat-edit-toolbar__bar > .viewport-splat-edit-toolbar__info`,label:`選択数`}],mount:({lang:e})=>z(D({viewportToolMode:`splat-edit`,splatEdit:{tool:`box`,selectionCount:42}}),e)},Xn=`
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
`,Zn={id:`tool-rail`,type:`panel`,title:`Viewport tool rail`,mount:({lang:e})=>{let t=D(),n=T(),r=(t,n)=>_(e,t,n);return u`
			<div class="docs-rail-host">
				<style>${Xn}</style>
				<div class="docs-rail-host__card">
					<${l}
						store=${t}
						controller=${()=>n}
						t=${r}
						mode="camera"
						projectMenuItems=${[{id:`new-project`,icon:`plus`,label:r(`menu.newProjectAction`),shortcut:`Ctrl+N`},{id:`open-files`,icon:`folder-open`,label:r(`action.openFiles`),shortcut:`Ctrl+O`},{id:`save-project`,icon:`save`,label:r(`menu.saveWorkingStateAction`),shortcut:`Ctrl+S`},{id:`export-project`,icon:`package`,label:r(`menu.savePackageAction`),shortcut:`Ctrl+Shift+S`}]}
						showQuickMenu=${!0}
					/>
				</div>
			</div>
		`}},Qn=`
.docs-viewport-host {
	position: relative;
	width: 800px;
	height: 560px;
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
`,B=[{id:`frame-1`,label:`FRAME A`,center:{x:.3933,y:.5404},scale:1,active:!1,tangent:{in:{x:-.0874,y:.0026},out:{x:.0874,y:-.0026}}},{id:`frame-2`,label:`FRAME B`,center:{x:.6461,y:.4232},scale:.8549,active:!0,tangent:{in:{x:-.077,y:.0809},out:{x:.077,y:-.0809}}}];function V(e,t){return{x:110+580*e,y:70+420*t}}function $n(e){let{widthPct:t,heightPct:n}=j(e.scale);return{id:e.id,label:e.label,active:e.active,left:e.center.x*100-t/2,top:e.center.y*100-n/2,width:t,height:n}}var er=B.map($n),H=V(B[0].center.x,B[0].center.y),U=V(B[1].center.x,B[1].center.y);function W(e,t){return{x:e.x+t.x*580,y:e.y+t.y*420}}var G=W(H,B[0].tangent.in),K=W(H,B[0].tangent.out),q=W(U,B[1].tangent.in),J=W(U,B[1].tangent.out);function tr(e){return{id:e.id,label:e.label,active:e.active,left:`${e.left}%`,top:`${e.top}%`,width:`${e.width}%`,height:`${e.height}%`}}var nr={id:`trajectory-spline`,type:`viewport`,title:`Camera mode with spline trajectory (cf-test2 Camera 3)`,mount:()=>{let e=E(`cf-test2-default`);return u`
			<div class="docs-viewport-host">
				<style>${Qn}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				${M({frames:er.map(tr)})}
				<div class="docs-trajectory-layer">
					<svg>
						<path
							class="docs-trajectory-path"
							d=${`M ${H.x} ${H.y} C ${K.x} ${K.y}, ${q.x} ${q.y}, ${U.x} ${U.y}`}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${G.x}
							y1=${G.y}
							x2=${H.x}
							y2=${H.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${H.x}
							y1=${H.y}
							x2=${K.x}
							y2=${K.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--in"
							x1=${q.x}
							y1=${q.y}
							x2=${U.x}
							y2=${U.y}
						/>
						<line
							class="docs-trajectory-handle-line docs-trajectory-handle-line--out"
							x1=${U.x}
							y1=${U.y}
							x2=${J.x}
							y2=${J.y}
						/>
					</svg>
					<span
						class="docs-trajectory-node"
						style=${{left:`${H.x}px`,top:`${H.y}px`}}
					></span>
					<span
						class="docs-trajectory-node docs-trajectory-node--active"
						style=${{left:`${U.x}px`,top:`${U.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${G.x}px`,top:`${G.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${K.x}px`,top:`${K.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--in"
						style=${{left:`${q.x}px`,top:`${q.y}px`}}
					></span>
					<span
						class="docs-trajectory-tangent docs-trajectory-tangent--out"
						style=${{left:`${J.x}px`,top:`${J.y}px`}}
					></span>
				</div>
			</div>
		`}},rr=800,ir=560,Y=400,X=310,Z=70,Q=90,ar=`
.docs-viewport-host {
	position: relative;
	width: ${rr}px;
	height: ${ir}px;
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
`;x(Bn),x(Wn),x(Hn),x(mn),x(Yt),x(Gt),x(qt),x(Ut),x(tn),x(jt),x(Zn),x(zt),x(fn),x(In),x(cn),x(Nn),x(Pn),x(Vt),x(Qt),x($t),x(rn),x(vn),x(yn),x(jn),x(Kn),x(qn),x(Jn),x(Yn),x(nr),x({id:`transform-gizmo`,type:`viewport`,title:`Transform gizmo over selected asset`,mount:()=>{let e=E(`cf-test2-default`),t={x:466.5,y:320.5},n={x:Y-Z*.1,y:X-Z*.98},r={x:435,y:362.5};return u`
			<div class="docs-viewport-host">
				<style>${ar}</style>
				<img
					class="docs-viewport-host__backdrop"
					src=${e.backdropUrl}
					alt=${e.description??``}
				/>
				<div class="docs-gizmo-layer">
					<svg>
						<!-- Rotate rings (ellipses approximating the projected rings) -->
						<ellipse
							cx=${Y}
							cy=${X}
							rx=${Q}
							ry=${Q*.32}
							fill="none"
							stroke="#bddb35"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${Y}
							cy=${X}
							rx=${Q*.32}
							ry=${Q}
							fill="none"
							stroke="#ff5f74"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<ellipse
							cx=${Y}
							cy=${X}
							rx=${Q*.78}
							ry=${Q*.78}
							fill="none"
							stroke="#5ba7ff"
							stroke-width="2.2"
							opacity="0.85"
						/>
						<!-- Move arrows -->
						<line
							x1=${Y}
							y1=${X}
							x2=${t.x}
							y2=${t.y}
							stroke="#ff5f74"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${Y}
							y1=${X}
							x2=${n.x}
							y2=${n.y}
							stroke="#bddb35"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<line
							x1=${Y}
							y1=${X}
							x2=${r.x}
							y2=${r.y}
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
						style=${{left:`${n.x}px`,top:`${n.y}px`}}
					>
						Y
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--axis viewport-gizmo__handle--z docs-gizmo-handle docs-gizmo-handle--z"
						style=${{left:`${r.x}px`,top:`${r.y}px`}}
					>
						Z
					</span>
					<span
						class="viewport-gizmo__handle viewport-gizmo__handle--scale docs-gizmo-handle docs-gizmo-handle--scale"
						style=${{left:`${Y}px`,top:`${X}px`}}
					>
						S
					</span>
				</div>
			</div>
		`}}),x(Dt),x(Rn),x(on);var or=`ja`,sr=`
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
`;function cr({fixtureId:e,available:t}){return u`
		<div class="docs-missing">
			<h1>Fixture not found</h1>
			<p>Requested id: <code>${e||`(none)`}</code></p>
			<p>Known fixtures:</p>
			<ul>
				${t.map(e=>u`
						<li key=${e}>
							<a href=${`?fixture=${encodeURIComponent(e)}`}>${e}</a>
						</li>
					`)}
			</ul>
		</div>
	`}var $=18;function lr(e,t,n){let r=e.left-t.left,i=e.top-t.top,a=e.right-t.left,o=e.bottom-t.top,s=r+e.width/2,c=i+e.height/2;switch(n){case`center`:return{x:s,y:c};case`top-left`:return{x:r-$,y:i-$};case`bottom-right`:return{x:a+$,y:o+$};case`bottom-left`:return{x:r-$,y:o+$};case`above`:return{x:s,y:i-$};case`below`:return{x:s,y:o+$};case`left`:return{x:r-$,y:c};case`right`:return{x:a+$,y:c};default:return{x:a+$,y:i-$}}}function ur({annotations:e}){let[t,n]=he([]);return r(()=>{if(!Array.isArray(e)||e.length===0){n([]);return}let t=document.querySelector(`.docs-stage`);if(!t){n([]);return}let r=t.getBoundingClientRect();n(e.map(e=>{let n=e.selector?t.querySelector(e.selector):null;if(!n)return{n:e.n,label:e.label??``,selector:e.selector??``,x:8,y:8,missing:!0};let{x:i,y:a}=lr(n.getBoundingClientRect(),r,e.placement??`top-right`);return{n:e.n,label:e.label??``,selector:e.selector,x:i,y:a,missing:!1}}))},[e]),t.length===0?null:u`
		<div class="docs-annotation-overlay" aria-hidden="true">
			${t.map(e=>u`
					<span
						key=${`${e.n}:${e.selector}`}
						class=${e.missing?`docs-annotation docs-annotation--missing`:`docs-annotation`}
						style=${{left:`${e.x}px`,top:`${e.y}px`}}
						title=${e.missing?`${e.label} (selector not found: ${e.selector})`:e.label}
					>
						${e.n}
					</span>
				`)}
		</div>
	`}function dr({fixtureId:e,lang:t}){let n=St(e);if(!n)return u`<${cr}
			fixtureId=${e}
			available=${S()}
		/>`;let r=Array.isArray(n.annotations)?n.annotations:[];return u`
		<div
			class="docs-stage"
			style="display: inline-block; vertical-align: top;"
			data-fixture-id=${e}
			data-fixture-type=${n.type}
			data-lang=${t}
		>
			<style>${sr}</style>
			${n.mount({lang:t})}
			${r.length>0&&u`<${ur} annotations=${r}/>`}
		</div>
	`}function fr(e,t){try{let n=new URL(globalThis.location.href).searchParams.get(e);return n===null?t:n}catch{return t}}function pr(e){let t=!1,n=()=>{t||(t=!0,globalThis.__DOCS_FIXTURE_READY=!0,globalThis.__DOCS_FIXTURE_ID=e)};requestAnimationFrame(()=>{requestAnimationFrame(n)}),setTimeout(n,100)}function mr(){let e=document.getElementById(`docs-root`);if(!e)return;let t=fr(`fixture`,``),n=fr(`lang`,or);globalThis.__DOCS_FIXTURE_READY=!1,globalThis.__DOCS_FIXTURE_ID=t,globalThis.__DOCS_FIXTURE_IDS=S(),ne(u`<${dr} fixtureId=${t} lang=${n} />`,e),pr(t)}mr();