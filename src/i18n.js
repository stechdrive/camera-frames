export const DEFAULT_LOCALE = "ja";

export const LOCALE_OPTIONS = [
	{ value: "ja", labelKey: "localeName.ja" },
	{ value: "en", labelKey: "localeName.en" },
];

export function normalizeLocale(value) {
	const rawValue = String(value ?? "")
		.trim()
		.toLowerCase();
	if (!rawValue) {
		return null;
	}

	const baseLocale = rawValue.split(/[-_]/)[0];
	return LOCALE_OPTIONS.some((option) => option.value === baseLocale)
		? baseLocale
		: null;
}

export function resolveInitialLocale({
	search = globalThis.location?.search ?? "",
	navigatorLanguages = globalThis.navigator?.languages ?? [],
	navigatorLanguage = globalThis.navigator?.language ?? "",
} = {}) {
	const params = new URLSearchParams(search);
	const overrideLocale = normalizeLocale(
		params.get("lang") ?? params.get("locale"),
	);
	if (overrideLocale) {
		return overrideLocale;
	}

	for (const candidate of [...navigatorLanguages, navigatorLanguage]) {
		const normalizedLocale = normalizeLocale(candidate);
		if (normalizedLocale) {
			return normalizedLocale;
		}
	}

	return DEFAULT_LOCALE;
}

const MESSAGES = {
	ja: {
		app: {
			previewTag: "Spark 2.0 Preview",
			panelCopy:
				"Spark を基盤に CAMERA_FRAMES のワークフローを再構築するためのプロトタイプ。",
		},
		field: {
			language: "Language",
			remoteUrl: "リモート URL",
			activeShotCamera: "Camera",
			shotCameraFov: "標準FRAME水平FOV",
			shotCameraEquivalentMm: "35mm換算",
			viewportFov: "ビューポート水平FOV",
			viewportEquivalentMm: "ビューポート 35mm換算",
			shotCameraClipMode: "クリップ範囲",
			shotCameraNear: "Near",
			shotCameraFar: "Far",
			shotCameraExportName: "書き出し名",
			exportFormat: "書き出し形式",
			exportGridOverlay: "ガイドを含める",
			exportGridLayerMode: "グリッド重ね順",
			exportModelLayers: "GLB をレイヤー化",
			exportSplatLayers: "3DGS をレイヤー化",
			outputFrameWidth: "出力フレーム幅",
			outputFrameHeight: "出力フレーム高",
			cameraViewZoom: "カメラビューズーム",
			anchor: "アンカー",
			assetScale: "ワールドスケール",
			assetPosition: "位置",
			assetRotation: "回転",
			transformSpace: "変形空間",
			activeFrame: "FRAME",
			exportTarget: "書き出し対象",
		},
		section: {
			view: "ビュー",
			scene: "シーン",
			shotCamera: "Camera",
			frames: "FRAME",
			outputFrame: "出力フレーム",
			output: "出力",
			export: "書き出し",
			exportSettings: "書き出し設定",
		},
		mode: {
			viewport: "ビューポート",
			camera: "カメラビュー",
		},
		transformSpace: {
			world: "ワールド",
			local: "ローカル",
		},
		viewportTool: {
			moveCenter: "移動",
		},
		exportTarget: {
			current: "現在の Camera",
			all: "すべての Camera",
			selected: "選択した Camera",
		},
		exportFormat: {
			png: "PNG",
			psd: "PSD",
		},
		gridLayerMode: {
			bottom: "最下層",
			overlay: "アイレベルの下",
		},
		clipMode: {
			auto: "自動",
			manual: "手動",
		},
		action: {
			openFiles: "ファイルを開く",
			clear: "クリア",
			loadUrl: "URLを読み込む",
			collapseWorkbench: "UIを折りたたむ",
			expandWorkbench: "UIを開く",
			cancel: "キャンセル",
			close: "閉じる",
			continueLoad: "読み込む",
			showAsset: "表示",
			hideAsset: "非表示",
			moveAssetUp: "上へ",
			moveAssetDown: "下へ",
			newShotCamera: "Camera を追加",
			duplicateShotCamera: "複製",
			viewportToShot: "Viewport → Camera",
			shotToViewport: "Camera → Viewport",
			resetActive: "現在のビューをリセット",
			refreshPreview: "プレビューを更新",
			downloadOutput: "書き出す",
			downloadPng: "PNGを書き出す",
			downloadPsd: "PSDを書き出す",
			resetScale: "1xに戻す",
			newFrame: "FRAME を追加",
			duplicateFrame: "複製",
			deleteFrame: "削除",
		},
		hint: {
			viewMode:
				"カメラビューでは Camera と出力フレームを確認します。ビューポートでは作業用カメラでシーンを操作します。",
			shotCameraList:
				"Camera は document として保持します。追加は現在のビュー姿勢から、複製は現在の Camera 設定ごと作成します。",
			shotCameraClip:
				"自動では Camera ごとの Near を保持しつつ、Far をシーン境界から決めます。手動では Near/Far を Camera ごとに固定します。",
			shotCameraExport:
				"書き出し形式とガイド・レイヤー設定は Camera ごとに保持します。PSD の 3DGS レイヤー化は GLB レイヤー化が前提です。",
			outputFrame:
				"カメラビューでは off-axis projection を使い、出力フレーム内の構図を最終出力と一致させます。",
			sceneCalibration:
				"3DGS は raw 1x で入るので、必要に応じてワールドスケールを補正します。GLB も必要なら個別に調整できます。",
			sceneOrder:
				"一覧の順序は PSD のオブジェクトレイヤー順の基準です。表示の切替は viewport と export の両方に反映します。",
			frames:
				"FRAME は Camera View 上の 2D overlay として扱います。いまは直接選択で移動・拡縮・回転・anchor 編集まで行えます。",
			framesEmpty: "まだ FRAME がありません。最初の FRAME を追加してください。",
			exportTargetSelection:
				"選択書き出しでは {count} 件の Camera が対象です。",
		},
		drop: {
			title: "ここにファイルをドロップ",
			body: "3DGS / GLB / .ssproj を直接読み込めます。",
		},
		badge: {
			horizontalFov: "水平FOV",
			clipRange: "clip",
		},
		export: {
			idle: "待機",
			rendering: "レンダリング中",
			ready: "準備完了",
			exporting: "書き出し中",
		},
		overlay: {
			startupImportTitle: "共有データを読み込みますか？",
			startupImportMessage:
				"このリンクは外部の共有データを読み込みます。読み込みを続けると、下の URL へアクセスします。",
			importTitle: "3D データを読み込み中",
			importMessage: "読み込み中です。シーンに反映するまで少し待ってください。",
			importPhaseVerify: "読み込み対象を確認",
			importPhaseExpand: "パッケージを展開",
			importPhaseLoad: "3D アセットを読込",
			importPhaseApply: "シーンへ反映",
			importDetailExpandPackage: "{index}/{count} パッケージ: {name}",
			importDetailLoadAsset: "{index}/{count} アセット: {name}",
			importDetailApply: "Camera / FRAME / シーン状態を反映",
			blockedStartupTitle: "共有リンクを読み込めません",
			blockedStartupMessage: "このリンクはアプリから直接開けませんでした。",
			blockedStartupReasonHttps: "HTTPS ではないため拒否しました",
			blockedStartupReasonPrivate:
				"private address / localhost のため拒否しました",
			blockedStartupReasonInvalid: "URL として解釈できませんでした",
			importErrorTitle: "読み込みに失敗しました",
			importErrorMessageGeneric: "このデータは読み込めませんでした。",
			importErrorMessageRemote: "このリンクはアプリから直接開けませんでした。",
			errorDetails: "詳細",
		},
		exportSummary: {
			empty: "現在の Camera 設定で書き出します。",
			refreshed: "プレビューを {width} × {height} で更新しました。",
			exported: "PNG を {width} × {height} で書き出しました。",
			exportedBatch: "PNG を {count} 件書き出しました。",
			psdExported: "PSD を {count} 件書き出しました。",
			exportedMixed: "{count} 件を書き出しました。",
		},
		status: {
			ready: "準備完了。",
			viewportEnabled: "ビューポートに切り替えました。",
			cameraEnabled: "カメラビューに切り替えました。",
			loadingItems: "{count} 件を読み込み中...",
			loadedItems: "{count} 件を読み込みました。",
			expandingProjectPackage: "{name} から 3D asset を展開中...",
			expandedProjectPackage:
				"{name} から {count} 件の 3D asset を展開しました。",
			enterUrl: "http(s) URL を 1 つ以上入力してください。",
			copiedViewportToShot: "Viewport の姿勢を Camera にコピーしました。",
			copiedShotToViewport: "Camera の姿勢を Viewport にコピーしました。",
			resetViewport: "ビューポートをリセットしました。",
			resetCamera: "Camera をリセットしました。",
			sceneCleared: "シーンをクリアしました。",
			exportPreviewUpdated: "出力プレビューを更新しました。",
			pngExported: "PNG を書き出しました。",
			pngExportedBatch: "PNG を {count} 件書き出しました。",
			psdExported: "PSD を {count} 件書き出しました。",
			exportedMixed: "{count} 件を書き出しました。",
			navigationActive:
				"FPV ナビゲーション有効。WASD/RF で移動、ドラッグで視線、右ドラッグでスライド。基本速度 {speed} m/s。",
			zoomToolEnabled:
				"ズームツール有効。カメラビュー上でドラッグして拡縮、Z か Esc で解除。",
			zoomToolUnavailable: "ズームツールはカメラビューでのみ使えます。",
			localeChanged: "表示言語を {language} に切り替えました。",
			assetScaleUpdated: "{name} のワールドスケールを {scale} にしました。",
			assetTransformUpdated: "{name} のトランスフォームを更新しました。",
			assetVisibilityUpdated: "{name} を {visibility} にしました。",
			assetOrderUpdated: "{name} の順序を {index} にしました。",
			selectedShotCamera: "Camera を {name} に切り替えました。",
			createdShotCamera: "Camera {name} を追加しました。",
			duplicatedShotCamera: "Camera {name} を複製しました。",
			selectedFrame: "{name} を選択しました。",
			createdFrame: "{name} を追加しました。",
			duplicatedFrame: "{name} を複製しました。",
			deletedFrame: "{name} を削除しました。",
			shotCameraClipMode: "Camera のクリップ範囲を {mode} にしました。",
			shotCameraExportFormat: "Camera の書き出し形式を {format} にしました。",
			frameLimitReached: "FRAME は最大 {limit} 枚までです。",
			exportTargetChanged: "書き出し対象を {target} にしました。",
			exportPresetSelection: "選択書き出しの Camera を {count} 件にしました。",
		},
		scene: {
			badgeEmpty: "空",
			summaryEmpty:
				"`.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, `.ssproj` をドロップまたは読み込みできます。",
			scaleDefault:
				"シーン契約: 1 unit = 1 meter。GLB は meters 前提、3DGS は raw 1x で読み込みます。",
			loaded: "{count} 件を読込: {badge}。",
			bounds: "境界 {x} × {y} × {z} m。",
			worldContract: "ワールド契約 1u = 1m。",
			glbMeter: "GLB は meter-native として扱います。",
			splatRaw: "3DGS は raw 1x で入るため、校正までは暫定スケールです。",
			splatCount: "3DGS {count}件",
			modelCount: "モデル {count}件",
			scaleAdjusted: "校正済みスケール {count}件。",
		},
		assetKind: {
			splat: "3DGS",
			model: "GLB / モデル",
		},
		assetVisibility: {
			visible: "表示",
			hidden: "非表示",
		},
		unitMode: {
			raw: "raw 1x",
			meters: "meters",
		},
		shotCamera: {
			defaultName: "Camera {index}",
		},
		frame: {
			defaultName: "FRAME {index}",
		},
		cameraSummary: {
			view: "ビュー",
			shot: "カメラ",
			pos: "位置",
			fwd: "前方",
			clip: "clip",
			nearFar: "near/far",
			base: "基準",
			frame: "フレーム",
			nav: "移動",
		},
		outputFrame: {
			meta: "{size} · {anchor}",
		},
		anchor: {
			"top-left": "左上",
			"top-center": "上中央",
			"top-right": "右上",
			"middle-left": "左中央",
			center: "中央",
			"middle-right": "右中央",
			"bottom-left": "左下",
			"bottom-center": "下中央",
			"bottom-right": "右下",
		},
		error: {
			exportRequiresAsset:
				"出力プレビューの前に 3DGS かモデルを読み込んでください。",
			exportRequiresPreset:
				"書き出し対象の Camera を 1 つ以上選択してください。",
			previewContext: "プレビュー用の 2D context を取得できませんでした。",
			unsupportedFileType: "未対応のファイル形式です: {name}",
			emptyProjectPackage: "{name} に読み込める 3D asset がありません。",
			emptyGltf: "GLTF scene が空です。",
			missingRoot: "CAMERA_FRAMES の root 要素が見つかりませんでした。",
		},
		localeName: {
			ja: "日本語",
			en: "English",
		},
	},
	en: {
		app: {
			previewTag: "Spark 2.0 Preview",
			panelCopy:
				"Prototype for rebuilding the CAMERA_FRAMES workflow on top of Spark.",
		},
		field: {
			language: "Language",
			remoteUrl: "Remote URL",
			activeShotCamera: "Camera",
			shotCameraFov: "Standard FRAME H-FOV",
			shotCameraEquivalentMm: "35mm Equivalent",
			viewportFov: "Viewport H-FOV",
			viewportEquivalentMm: "Viewport 35mm Equivalent",
			shotCameraClipMode: "Clip Range",
			shotCameraNear: "Near",
			shotCameraFar: "Far",
			shotCameraExportName: "Export Name",
			exportFormat: "Export Format",
			exportGridOverlay: "Include Guides",
			exportGridLayerMode: "Grid Layering",
			exportModelLayers: "Layer GLB Models",
			exportSplatLayers: "Layer 3DGS Objects",
			outputFrameWidth: "Output Frame Width",
			outputFrameHeight: "Output Frame Height",
			cameraViewZoom: "Camera View Zoom",
			anchor: "Anchor",
			assetScale: "World Scale",
			assetPosition: "Position",
			assetRotation: "Rotation",
			transformSpace: "Transform Space",
			activeFrame: "FRAME",
			exportTarget: "Export Target",
		},
		section: {
			view: "View",
			scene: "Scene",
			shotCamera: "Camera",
			frames: "FRAME",
			outputFrame: "Output Frame",
			output: "Output",
			export: "Export",
			exportSettings: "Export Settings",
		},
		mode: {
			viewport: "Viewport",
			camera: "Camera View",
		},
		transformSpace: {
			world: "World",
			local: "Local",
		},
		viewportTool: {
			moveCenter: "Move",
		},
		exportTarget: {
			current: "Current Camera",
			all: "All Cameras",
			selected: "Selected Cameras",
		},
		exportFormat: {
			png: "PNG",
			psd: "PSD",
		},
		gridLayerMode: {
			bottom: "Bottom-most",
			overlay: "Below Eye Level",
		},
		clipMode: {
			auto: "Auto",
			manual: "Manual",
		},
		action: {
			openFiles: "Open Files",
			clear: "Clear",
			loadUrl: "Load URL",
			collapseWorkbench: "Collapse UI",
			expandWorkbench: "Expand UI",
			cancel: "Cancel",
			close: "Close",
			continueLoad: "Load",
			showAsset: "Show",
			hideAsset: "Hide",
			moveAssetUp: "Up",
			moveAssetDown: "Down",
			newShotCamera: "Add Camera",
			duplicateShotCamera: "Duplicate",
			viewportToShot: "Viewport → Camera",
			shotToViewport: "Camera → Viewport",
			resetActive: "Reset Active View",
			refreshPreview: "Refresh Preview",
			downloadOutput: "Export",
			downloadPng: "Download PNG",
			downloadPsd: "Download PSD",
			resetScale: "Reset 1x",
			newFrame: "Add FRAME",
			duplicateFrame: "Duplicate",
			deleteFrame: "Delete",
		},
		hint: {
			viewMode:
				"Camera View shows the Camera and Output Frame. Viewport uses a free working camera for scene editing.",
			shotCameraList:
				"Cameras are stored as document objects. New cameras start from the current view pose; duplicate copies the active camera settings.",
			shotCameraClip:
				"Auto keeps the per-Camera near clip and derives far from scene bounds. Manual stores both near and far per Camera.",
			shotCameraExport:
				"Export format, guide layering, and PSD layer settings are stored per Camera. 3DGS object layers in PSD require GLB layered export to be enabled.",
			outputFrame:
				"Camera View uses off-axis projection so framing inside the Output Frame matches final output.",
			sceneCalibration:
				"3DGS assets enter at raw 1x, so adjust world scale when needed. GLB assets can also be tuned per asset when necessary.",
			sceneOrder:
				"List order becomes the PSD object-layer order. Visibility affects both viewport and export.",
			frames:
				"FRAME is treated as a 2D overlay in Camera View. This slice supports direct move, resize, rotate, and anchor editing.",
			framesEmpty:
				"No FRAME yet. Add the first FRAME to start laying out the shot.",
			exportTargetSelection:
				"Selected export currently includes {count} Camera preset(s).",
		},
		drop: {
			title: "Drop files here",
			body: "3DGS, GLB, or .ssproj can be loaded directly.",
		},
		badge: {
			horizontalFov: "H-FOV",
			clipRange: "clip",
		},
		export: {
			idle: "Idle",
			rendering: "Rendering",
			ready: "Ready",
			exporting: "Exporting",
		},
		overlay: {
			startupImportTitle: "Load shared data?",
			startupImportMessage:
				"This link will load external shared data. Continuing will access the URLs below.",
			importTitle: "Loading 3D data",
			importMessage:
				"Loading is in progress. Please wait until the scene finishes updating.",
			importPhaseVerify: "Checking sources",
			importPhaseExpand: "Expanding packages",
			importPhaseLoad: "Loading 3D assets",
			importPhaseApply: "Applying scene state",
			importDetailExpandPackage: "Package {index}/{count}: {name}",
			importDetailLoadAsset: "Asset {index}/{count}: {name}",
			importDetailApply: "Applying Camera / FRAME / scene state",
			blockedStartupTitle: "Shared link cannot be loaded",
			blockedStartupMessage:
				"This link could not be opened directly from the app.",
			blockedStartupReasonHttps: "Blocked because the URL is not HTTPS",
			blockedStartupReasonPrivate:
				"Blocked because the URL points to a private address or localhost",
			blockedStartupReasonInvalid:
				"Blocked because the value is not a valid URL",
			importErrorTitle: "Failed to load data",
			importErrorMessageGeneric: "This data could not be loaded.",
			importErrorMessageRemote:
				"This link could not be opened directly from the app.",
			errorDetails: "Details",
		},
		exportSummary: {
			empty: "Exports use the current Camera settings.",
			refreshed: "Preview refreshed at {width} × {height}.",
			exported: "PNG exported at {width} × {height}.",
			exportedBatch: "Exported {count} PNG file(s).",
			psdExported: "Exported {count} PSD file(s).",
			exportedMixed: "Exported {count} file(s).",
		},
		status: {
			ready: "Ready.",
			viewportEnabled: "Switched to Viewport.",
			cameraEnabled: "Switched to Camera View.",
			loadingItems: "Loading {count} item(s)...",
			loadedItems: "Loaded {count} item(s).",
			expandingProjectPackage: "Extracting 3D assets from {name}...",
			expandedProjectPackage: "Extracted {count} 3D asset(s) from {name}.",
			enterUrl: "Enter at least one http(s) URL.",
			copiedViewportToShot: "Copied the Viewport pose into the Camera.",
			copiedShotToViewport: "Copied the Camera pose into the Viewport.",
			resetViewport: "Viewport reset.",
			resetCamera: "Camera reset.",
			sceneCleared: "Scene cleared.",
			exportPreviewUpdated: "Output preview updated.",
			pngExported: "PNG exported.",
			pngExportedBatch: "Exported {count} PNG file(s).",
			psdExported: "Exported {count} PSD file(s).",
			exportedMixed: "Exported {count} file(s).",
			navigationActive:
				"FPV navigation active. WASD/RF move, drag to look, right-drag to slide. Base speed {speed} m/s.",
			zoomToolEnabled:
				"Zoom tool active. Drag in Camera View to zoom, press Z or Esc to exit.",
			zoomToolUnavailable: "Zoom tool is only available in Camera View.",
			localeChanged: "Display language switched to {language}.",
			assetScaleUpdated: "Set {name} world scale to {scale}.",
			assetTransformUpdated: "Updated {name} transform.",
			assetVisibilityUpdated: "Set {name} to {visibility}.",
			assetOrderUpdated: "Moved {name} to order {index}.",
			selectedShotCamera: "Camera switched to {name}.",
			createdShotCamera: "Added Camera {name}.",
			duplicatedShotCamera: "Duplicated Camera {name}.",
			selectedFrame: "Selected {name}.",
			createdFrame: "Added {name}.",
			duplicatedFrame: "Duplicated {name}.",
			deletedFrame: "Deleted {name}.",
			shotCameraClipMode: "Camera clip range set to {mode}.",
			shotCameraExportFormat: "Camera export format set to {format}.",
			frameLimitReached: "FRAME limit reached ({limit}).",
			exportTargetChanged: "Export target set to {target}.",
			exportPresetSelection:
				"Selected export now includes {count} Camera preset(s).",
		},
		scene: {
			badgeEmpty: "Empty",
			summaryEmpty:
				"Drop or load `.ply`, `.spz`, `.splat`, `.ksplat`, `.zip`, `.sog`, `.rad`, `.glb`, `.gltf`, or `.ssproj` files.",
			scaleDefault:
				"Scene contract: 1 unit = 1 meter. GLB defaults to meters; 3DGS enters at raw 1x.",
			loaded: "Loaded {count} item(s): {badge}.",
			bounds: "Bounds {x} × {y} × {z} m.",
			worldContract: "World contract 1u = 1m.",
			glbMeter: "GLB assets are treated as meter-native.",
			splatRaw:
				"3DGS assets enter at raw 1x, so scale stays provisional until calibrated.",
			splatCount: "{count} splat{plural}",
			modelCount: "{count} model{plural}",
			scaleAdjusted: "{count} calibrated scale adjustment(s).",
		},
		assetKind: {
			splat: "3DGS",
			model: "GLB / Model",
		},
		assetVisibility: {
			visible: "Visible",
			hidden: "Hidden",
		},
		unitMode: {
			raw: "raw 1x",
			meters: "meters",
		},
		shotCamera: {
			defaultName: "Camera {index}",
		},
		frame: {
			defaultName: "FRAME {index}",
		},
		cameraSummary: {
			view: "view",
			shot: "shot",
			pos: "pos",
			fwd: "fwd",
			clip: "clip",
			nearFar: "near/far",
			base: "base",
			frame: "frame",
			nav: "nav",
		},
		outputFrame: {
			meta: "{size} · {anchor}",
		},
		anchor: {
			"top-left": "Top Left",
			"top-center": "Top Center",
			"top-right": "Top Right",
			"middle-left": "Middle Left",
			center: "Center",
			"middle-right": "Middle Right",
			"bottom-left": "Bottom Left",
			"bottom-center": "Bottom Center",
			"bottom-right": "Bottom Right",
		},
		error: {
			exportRequiresAsset:
				"Load a splat or model before rendering output preview.",
			exportRequiresPreset: "Select at least one Camera for export.",
			previewContext: "Could not get the 2D context for output preview.",
			unsupportedFileType: "Unsupported file type: {name}",
			emptyProjectPackage: "No supported 3D assets were found in {name}.",
			emptyGltf: "GLTF scene is empty.",
			missingRoot: "CAMERA_FRAMES root element was not found.",
		},
		localeName: {
			ja: "Japanese",
			en: "English",
		},
	},
};

function getByPath(messages, key) {
	return key.split(".").reduce((value, part) => value?.[part], messages);
}

export function translate(locale, key, params = {}) {
	const active = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
	const fallback = MESSAGES[DEFAULT_LOCALE];
	let template = getByPath(active, key);

	if (template == null) {
		template = getByPath(fallback, key);
	}

	if (typeof template !== "string") {
		return key;
	}

	return template.replace(
		/\{(.*?)\}/g,
		(_, name) => `${params[name] ?? `{${name}}`}`,
	);
}

export function getAnchorLabel(locale, anchorKey) {
	return translate(locale, `anchor.${anchorKey}`);
}

export function getAnchorOptions(locale) {
	return [
		{ value: "top-left", label: getAnchorLabel(locale, "top-left") },
		{ value: "top-center", label: getAnchorLabel(locale, "top-center") },
		{ value: "top-right", label: getAnchorLabel(locale, "top-right") },
		{
			value: "middle-left",
			label: getAnchorLabel(locale, "middle-left"),
		},
		{ value: "center", label: getAnchorLabel(locale, "center") },
		{
			value: "middle-right",
			label: getAnchorLabel(locale, "middle-right"),
		},
		{
			value: "bottom-left",
			label: getAnchorLabel(locale, "bottom-left"),
		},
		{
			value: "bottom-center",
			label: getAnchorLabel(locale, "bottom-center"),
		},
		{
			value: "bottom-right",
			label: getAnchorLabel(locale, "bottom-right"),
		},
	];
}
