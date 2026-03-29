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
			activeShotCamera: "カメラ",
			shotCameraName: "カメラ名",
			shotCameraFov: "標準FRAME水平FOV",
			shotCameraEquivalentMm: "フルサイズ焦点距離",
			viewportFov: "ビューポート水平FOV",
			viewportEquivalentMm: "ビューポート フルサイズ焦点距離",
			shotCameraClipMode: "クリップ範囲",
			shotCameraNear: "Near",
			shotCameraFar: "Far",
			shotCameraYaw: "Yaw",
			shotCameraPitch: "Pitch",
			shotCameraRoll: "Roll",
			shotCameraRollLock: "ロールを固定",
			shotCameraMoveHorizontal: "左右",
			shotCameraMoveVertical: "上下",
			shotCameraMoveDepth: "前後",
			shotCameraExportName: "書き出し名",
			exportFormat: "書き出し形式",
			exportGridOverlay: "ガイドを含める",
			exportReferenceImages: "下絵を含める",
			exportGridLayerMode: "グリッド重ね順",
			exportModelLayers: "GLB をレイヤー化",
			exportSplatLayers: "3DGS をレイヤー化",
			outputFrameWidth: "出力フレーム幅",
			outputFrameHeight: "出力フレーム高",
			cameraViewZoom: "表示ズーム",
			anchor: "アンカー",
			assetScale: "ワールドスケール",
			assetPosition: "位置",
			assetRotation: "回転",
			transformSpace: "座標系",
			transformMode: "ツール",
			activeFrame: "FRAME",
			frameMaskOpacity: "マスク不透明度",
			exportTarget: "書き出し対象",
			referenceImageOpacity: "不透明度",
			referenceImageScale: "拡縮",
			referenceImageOffsetX: "位置 X",
			referenceImageOffsetY: "位置 Y",
			referenceImageRotation: "回転",
			referenceImageOrder: "順番",
			referenceImageGroup: "前後",
			lightIntensity: "ライト強度",
			lightAmbient: "アンビエント",
			lightDirection: "ライト方向",
			lightAzimuth: "方位",
			lightElevation: "仰角",
			positionX: "X",
			positionY: "Y",
			positionZ: "Z",
		},
		section: {
			file: "ファイル",
			view: "ビューポート画角",
			displayZoom: "表示ズーム",
			scene: "シーン",
			lighting: "照明",
			tools: "ツール",
			project: "プロジェクト",
			shotCamera: "カメラ",
			shotCameraManager: "ショットカメラ",
			shotCameraProperties: "カメラプロパティ",
			transformSpace: "座標系",
			pose: "Pose",
			referenceImages: "下絵",
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
		transformMode: {
			none: "なし",
			select: "選択",
			reference: "下絵",
			transform: "変形",
			pivot: "オブジェクト原点",
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
			openProject: "プロジェクトを開く",
			openWorkingProject: "作業フォルダを開く",
			saveProject: "作業状態を保存",
			exportProject: "パッケージ保存",
			savePackageAs: "別名で保存",
			overwritePackage: "上書き保存",
			openFiles: "ファイルを開く",
			openReferenceImages: "下絵を開く",
			duplicateReferencePreset: "プリセットを複製",
			clear: "クリア",
			loadUrl: "URLを読み込む",
			collapseWorkbench: "パネルを最小化",
			expandWorkbench: "パネルを開く",
			cancel: "キャンセル",
			close: "閉じる",
			continueLoad: "読み込む",
			showAsset: "表示",
			hideAsset: "非表示",
			showReferenceImages: "下絵を表示",
			hideReferenceImages: "下絵を非表示",
			showReferenceImage: "下絵を表示",
			hideReferenceImage: "下絵を非表示",
			clearSelection: "選択を解除",
			includeReferenceImageInExport: "書き出しに含める",
			excludeReferenceImageFromExport: "書き出しから外す",
			moveAssetUp: "上へ",
			moveAssetDown: "下へ",
			newShotCamera: "カメラを追加",
			duplicateShotCamera: "複製",
			nudgeLeft: "← 左",
			nudgeRight: "右 →",
			nudgeUp: "↑ 上",
			nudgeDown: "下 ↓",
			nudgeForward: "前へ",
			nudgeBack: "後へ",
			viewportToShot: "Viewportの姿勢をCameraへ",
			shotToViewport: "Cameraの姿勢をViewportへ",
			resetActive: "現在のビューをリセット",
			refreshPreview: "プレビューを更新",
			downloadOutput: "書き出す",
			downloadPng: "PNGを書き出す",
			downloadPsd: "PSDを書き出す",
			resetScale: "1xに戻す",
			resetPivot: "Pivotを戻す",
			resetLightDirection: "向きを戻す",
			adjustLens: "焦点距離調整",
			adjustRoll: "カメラロール",
			quickMenu: "クイックメニュー",
			pinQuickSection: "レールに追加",
			unpinQuickSection: "レールから外す",
			newFrame: "FRAME を追加",
			duplicateFrame: "複製",
			deleteFrame: "削除",
			toggleSelectedFrameMask: "選択中マスク",
			toggleAllFrameMask: "全体マスク",
		},
		unit: {
			millimeter: "millimeter",
			meter: "meter",
			percent: "percent",
			pixel: "pixel",
			degree: "degree",
		},
		tooltip: {
			fileMenu: "開く・保存・パッケージ保存などのプロジェクト操作です。",
			collapseWorkbench: "右パネルを最小化して、必要な時だけ呼び出します。",
			modeCamera: "ショットカメラで構図と下絵を確認します。",
			modeViewport: "作業用カメラでシーンを自由に見回します。",
			toolSelect: "3D オブジェクトの選択モードです。もう一度押すと解除します。",
			toolReference: "下絵の選択と変形モードです。もう一度押すと解除します。",
			toolTransform:
				"3D オブジェクトの変形モードです。もう一度押すと解除します。",
			toolPivot:
				"3Dオブジェクトの変形原点を編集します。もう一度押すと解除します。",
			quickMenu:
				"ツールのクイックメニューを開きます。モバイルではここから使うのが安全です。",
			clearSelection:
				"3Dオブジェクト、下絵、FRAME の選択を解除して、アクティブツールを外します。",
			tabScene: "シーン、アセット、ライティングを管理します。",
			tabCamera: "ショットカメラ、FRAME、下絵を編集します。",
			tabExport: "書き出し設定と出力を管理します。",
			copyViewportPoseToShot:
				"Viewport の位置、向き、焦点距離を Camera へコピーします。クリップ範囲は変えません。",
			copyShotPoseToViewport:
				"Camera の位置と視線方向を Viewport へコピーします。ロール、焦点距離、クリップ範囲は変えません。",
			resetActiveView:
				"現在の Camera / Viewport の位置と向きをホーム位置へ戻します。",
			frameMaskSelected:
				"選択中の FRAME 群を囲む範囲の外側を暗くします。もう一度押すと解除します。",
			frameMaskAll:
				"すべての FRAME を囲む範囲の外側を暗くします。もう一度押すと解除します。",
			openQuickSection:
				"この項目だけをクイックパネルで開きます。もう一度押すと閉じます。",
			pinQuickSection: "この項目を右レールのショートカットに追加します。",
			unpinQuickSection: "この項目を右レールのショートカットから外します。",
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
			lightDirection:
				"球体上のハンドルをドラッグして、いま見ているカメラ基準でライト方向を回します。",
			frames:
				"FRAME は Camera View 上の 2D overlay として扱います。いまは直接選択で移動・拡縮・回転・anchor 編集まで行えます。",
			framesEmpty: "まだ FRAME がありません。最初の FRAME を追加してください。",
			exportTargetSelection:
				"選択書き出しでは {count} 件の Camera が対象です。",
			referenceImagesEmpty:
				"まだ下絵がありません。PNG / JPG / WEBP / PSD を読み込んでください。",
		},
		drop: {
			title: "画面にファイルをドロップして開く",
			body: "3Dデータ（PLY / SPZ / SOG / SPLAT / GLB など）、プロジェクトパッケージ（.ssproj）、下絵（PNG / JPG / WEBP / PSD）を読み込めます。",
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
			importDetailInspectProjectArchive: "プロジェクトパッケージを確認中…",
			importDetailReadProjectManifest: "manifest を読込中… ({file})",
			importDetailReadProjectDocument: "プロジェクト設定を読込中… ({file})",
			importDetailExpandProjectAsset:
				"{index}/{count} プロジェクト asset を展開: {name}",
			importDetailExpandProjectAssetWithFile:
				"{index}/{count} プロジェクト asset を展開: {name} ({file})",
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
			packageSaveTitle: "パッケージ保存",
			packageSaveMessage: "共有・受け渡し用の .ssproj を保存します。",
			packageSaveMessageWithOverwrite:
				"共有・受け渡し用の .ssproj を保存します。現在のファイル {name} に上書き保存するか、別名で保存するかを選んでください。",
			packageSaveErrorTitle: "パッケージ保存に失敗しました",
			packageSaveErrorMessage:
				"パッケージ保存の途中でエラーが発生しました。詳細を確認してください。",
			packagePhaseCollect: "状態を収集",
			packagePhaseResolve: "asset を解決",
			packagePhaseCompress: "3DGS を圧縮",
			packagePhaseWrite: "パッケージを書き込み",
			packageDetailCollect: "保存対象を収集中…",
			packageDetailAsset: "{index}/{total} asset: {name}",
			packageDetailAssetWithFile: "{index}/{total} asset: {name} ({file})",
			packageDetailWrite: "ファイルを書き込み中…",
			packageWriteStage: {
				zipEntries: "ZIPアーカイブを書き込み中…",
			},
			packageResolveStage: {
				"copy-source": "元の asset を収集中…",
				"copy-packed-splat": "packed 3DGS を収集中…",
			},
			packageCompressStage: {
				"read-input": "入力データを読み込み中…",
				"start-worker": "圧縮ワーカーを起動中…",
				"retry-cpu-worker": "worker が停止したため CPU worker に切替…",
				"load-transform": "SplatTransform を読み込み中…",
				"decode-input": "3DGS を展開中…",
				"merge-tables": "複数テーブルを結合中…",
				"filter-bands": "SH バンドを調整中…",
				"write-sog": "SOG を書き出し中…",
				finalize: "出力を確定中…",
			},
			packageFieldCompressSplats: "3DGS を SOG 圧縮で保存",
			packageFieldCompressSplatsDisabled:
				"3DGS を SOG 圧縮で保存 (WebGPU 必須)",
			packageFieldSogShBands: "SOG の SH バンド",
			packageFieldSogIterations: "SOG 圧縮 iterations",
			packageSogShBands: {
				0: "0 bands",
				1: "1 band",
				2: "2 bands",
				3: "3 bands",
			},
			packageSogIterations: {
				4: "4 iterations",
				8: "8 iterations",
				10: "10 iterations",
				12: "12 iterations",
				16: "16 iterations",
			},
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
			projectSaving: "プロジェクトを保存中...",
			projectSavingToFolder: "{name} にプロジェクトを保存中...",
			projectLoaded: "プロジェクトを読み込みました。",
			projectLoadedFromFolder: "{name} からプロジェクトを読み込みました。",
			projectSaved: "プロジェクトを保存しました。",
			projectSavedToFolder: "{name} にプロジェクトを保存しました。",
			workingStateSaved: "{name} の作業状態を保存しました。",
			workingStateRestored: "{name} の作業状態を復元しました。",
			packageSaved: "{name} をパッケージ保存しました。",
			projectExporting: "プロジェクトを書き出し中...",
			projectExported: "プロジェクトを書き出しました。",
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
			lensToolEnabled:
				"焦点距離調整。ドラッグで 35mm横幅換算を変更、Esc で解除。",
			rollToolEnabled:
				"カメラロール調整。左右ドラッグで構図を回し、Esc で解除。",
			rollToolUnavailable: "カメラロールは Camera View でのみ使えます。",
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
			projectWorkingFolderUnsupported:
				"この環境では作業フォルダ保存を利用できません。",
			projectPackageSaveUnsupported:
				"この環境ではパッケージ保存ダイアログを利用できません。",
			projectPackageSaveUnavailable:
				"パッケージの保存先を取得できませんでした。",
			sogCompressionRequiresWebGpu:
				"この環境では WebGPU が使えないため、SOG 圧縮保存は利用できません。",
			projectPackageOverwriteUnavailable:
				"上書き保存できるパッケージファイルがありません。",
			previewContext: "プレビュー用の 2D context を取得できませんでした。",
			unsupportedFileType: "未対応のファイル形式です: {name}",
			emptyProjectPackage: "{name} に読み込める 3D asset がありません。",
			emptyGltf: "GLTF scene が空です。",
			missingRoot: "CAMERA_FRAMES の root 要素が見つかりませんでした。",
		},
		referenceImage: {
			activePreset: "現在のプリセット",
			activePresetItems: "{count} item",
			blankPreset: "(blank)",
			untitled: "名称未設定",
			sizeUnknown: "サイズ不明",
			currentPresetSection: "Current Preset",
			selectedSection: "Selected",
			selectedEmpty: "選択中の下絵がありません。",
			currentCameraEmpty:
				"このプリセットにはまだ下絵 item がありません。下絵を読み込んでください。",
			currentCameraUsage: "この Camera に {count} 件",
			orderLabel: "#{order}",
			group: {
				back: "背面",
				front: "前面",
			},
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
			shotCameraName: "Camera Name",
			shotCameraFov: "Standard FRAME H-FOV",
			shotCameraEquivalentMm: "Full-Frame Focal Length",
			viewportFov: "Viewport H-FOV",
			viewportEquivalentMm: "Viewport Full-Frame Focal Length",
			shotCameraClipMode: "Clip Range",
			shotCameraNear: "Near",
			shotCameraFar: "Far",
			shotCameraYaw: "Yaw",
			shotCameraPitch: "Pitch",
			shotCameraRoll: "Roll",
			shotCameraRollLock: "Lock Roll",
			shotCameraMoveHorizontal: "Left / Right",
			shotCameraMoveVertical: "Down / Up",
			shotCameraMoveDepth: "Back / Forward",
			shotCameraExportName: "Export Name",
			exportFormat: "Export Format",
			exportGridOverlay: "Include Guides",
			exportReferenceImages: "Include Reference Images",
			exportGridLayerMode: "Grid Layering",
			exportModelLayers: "Layer GLB Models",
			exportSplatLayers: "Layer 3DGS Objects",
			outputFrameWidth: "Output Frame Width",
			outputFrameHeight: "Output Frame Height",
			cameraViewZoom: "View Zoom",
			anchor: "Anchor",
			assetScale: "World Scale",
			assetPosition: "Position",
			assetRotation: "Rotation",
			transformSpace: "Coordinate Space",
			transformMode: "Tool",
			activeFrame: "FRAME",
			frameMaskOpacity: "Mask Opacity",
			exportTarget: "Export Target",
			referenceImageOpacity: "Opacity",
			referenceImageScale: "Scale",
			referenceImageOffsetX: "Offset X",
			referenceImageOffsetY: "Offset Y",
			referenceImageRotation: "Rotation",
			referenceImageOrder: "Order",
			referenceImageGroup: "Layer Side",
			lightIntensity: "Light Intensity",
			lightAmbient: "Ambient",
			lightDirection: "Light Direction",
			lightAzimuth: "Azimuth",
			lightElevation: "Elevation",
			positionX: "X",
			positionY: "Y",
			positionZ: "Z",
		},
		section: {
			file: "File",
			view: "Viewport FOV",
			displayZoom: "Display Zoom",
			scene: "Scene",
			lighting: "Lighting",
			tools: "Tools",
			project: "Project",
			shotCamera: "Camera",
			shotCameraManager: "Shot Camera",
			shotCameraProperties: "Camera Properties",
			transformSpace: "Coordinate Space",
			pose: "Pose",
			referenceImages: "Reference Images",
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
		transformMode: {
			none: "None",
			select: "Select",
			reference: "Reference",
			transform: "Transform",
			pivot: "Object Origin",
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
			openProject: "Open Project",
			openWorkingProject: "Open Working Folder",
			saveProject: "Save Working State",
			exportProject: "Save Package",
			savePackageAs: "Save As",
			overwritePackage: "Overwrite",
			openFiles: "Open Files",
			openReferenceImages: "Open Reference Images",
			duplicateReferencePreset: "Duplicate Preset",
			clear: "Clear",
			loadUrl: "Load URL",
			collapseWorkbench: "Minimize panel",
			expandWorkbench: "Open panel",
			cancel: "Cancel",
			close: "Close",
			continueLoad: "Load",
			showAsset: "Show",
			hideAsset: "Hide",
			showReferenceImages: "Show References",
			hideReferenceImages: "Hide References",
			showReferenceImage: "Show Reference",
			hideReferenceImage: "Hide Reference",
			clearSelection: "Clear Selection",
			includeReferenceImageInExport: "Include in Export",
			excludeReferenceImageFromExport: "Exclude from Export",
			moveAssetUp: "Up",
			moveAssetDown: "Down",
			newShotCamera: "Add Camera",
			duplicateShotCamera: "Duplicate",
			nudgeLeft: "← Left",
			nudgeRight: "Right →",
			nudgeUp: "↑ Up",
			nudgeDown: "Down ↓",
			nudgeForward: "Forward",
			nudgeBack: "Back",
			viewportToShot: "Copy Viewport Pose to Camera",
			shotToViewport: "Copy Camera Pose to Viewport",
			resetActive: "Reset Active View",
			refreshPreview: "Refresh Preview",
			downloadOutput: "Export",
			downloadPng: "Download PNG",
			downloadPsd: "Download PSD",
			resetScale: "Reset 1x",
			resetPivot: "Reset Pivot",
			resetLightDirection: "Reset Direction",
			adjustLens: "Adjust Lens",
			adjustRoll: "Camera Roll",
			quickMenu: "Quick Menu",
			pinQuickSection: "Add To Rail",
			unpinQuickSection: "Remove From Rail",
			newFrame: "Add FRAME",
			duplicateFrame: "Duplicate",
			deleteFrame: "Delete",
			toggleSelectedFrameMask: "Selected Mask",
			toggleAllFrameMask: "All Frames Mask",
		},
		unit: {
			millimeter: "ミリメートル",
			meter: "メートル",
			percent: "パーセント",
			pixel: "ピクセル",
			degree: "度",
		},
		tooltip: {
			fileMenu: "Open, save, and package-level project commands live here.",
			collapseWorkbench:
				"Minimize the right panel and bring it back only when needed.",
			modeCamera:
				"Use the shot camera to frame the scene and align references.",
			modeViewport:
				"Use the working camera to inspect and navigate the scene freely.",
			toolSelect: "Select 3D objects. Press again to return to no active tool.",
			toolReference:
				"Edit reference images. Press again to return to no active tool.",
			toolTransform:
				"Transform 3D objects. Press again to return to no active tool.",
			toolPivot:
				"Edit the transform origin of 3D objects. Press again to return to no active tool.",
			quickMenu:
				"Open the quick tool menu. On mobile, this is the safer way to use it.",
			clearSelection:
				"Clear selected 3D objects, reference images, and FRAMEs, then return to no active tool.",
			tabScene: "Manage scene assets and lighting.",
			tabCamera: "Edit the active Camera, FRAME, and reference setup.",
			tabExport: "Adjust export options and run output.",
			copyViewportPoseToShot:
				"Copy the Viewport position, orientation, and lens into the Camera. The clip range stays unchanged.",
			copyShotPoseToViewport:
				"Copy the Camera position and view direction into the Viewport. Roll, lens, and clip range stay unchanged.",
			resetActiveView:
				"Return the current Camera or Viewport position and orientation to the home pose.",
			frameMaskSelected:
				"Dim everything outside the bounding box of the selected FRAMEs. Press again to turn it off.",
			frameMaskAll:
				"Dim everything outside the bounding box covering all FRAMEs. Press again to turn it off.",
			openQuickSection:
				"Open only this section as a quick panel. Press again to close it.",
			pinQuickSection: "Add this section to the right rail shortcuts.",
			unpinQuickSection: "Remove this section from the right rail shortcuts.",
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
			lightDirection:
				"Drag the handle on the sphere to rotate the light direction relative to the camera you are currently viewing.",
			frames:
				"FRAME is treated as a 2D overlay in Camera View. This slice supports direct move, resize, rotate, and anchor editing.",
			framesEmpty:
				"No FRAME yet. Add the first FRAME to start laying out the shot.",
			exportTargetSelection:
				"Selected export currently includes {count} Camera preset(s).",
			referenceImagesEmpty:
				"No reference images yet. Load PNG, JPG, WEBP, or PSD files to begin.",
		},
		drop: {
			title: "Drop files here",
			body: "Load 3D data (PLY / SPZ / SOG / SPLAT / GLB and more), project packages (.ssproj), or reference images (PNG / JPG / WEBP / PSD).",
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
			importDetailInspectProjectArchive: "Inspecting project package…",
			importDetailReadProjectManifest: "Reading manifest… ({file})",
			importDetailReadProjectDocument: "Reading project document… ({file})",
			importDetailExpandProjectAsset:
				"Expanding project asset {index}/{count}: {name}",
			importDetailExpandProjectAssetWithFile:
				"Expanding project asset {index}/{count}: {name} ({file})",
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
			packageSaveTitle: "Save Package",
			packageSaveMessage:
				"Save a portable .ssproj package for sharing or handoff.",
			packageSaveMessageWithOverwrite:
				"Save a portable .ssproj package for sharing or handoff. Choose whether to overwrite {name} or save to a new file.",
			packageSaveErrorTitle: "Package save failed",
			packageSaveErrorMessage:
				"An error occurred while saving the package. Check the details below.",
			packagePhaseCollect: "Collecting state",
			packagePhaseResolve: "Resolving assets",
			packagePhaseCompress: "Compressing 3DGS",
			packagePhaseWrite: "Writing package",
			packageDetailCollect: "Collecting save data…",
			packageDetailAsset: "Asset {index}/{total}: {name}",
			packageDetailAssetWithFile: "Asset {index}/{total}: {name} ({file})",
			packageDetailWrite: "Writing package file…",
			packageWriteStage: {
				zipEntries: "Writing ZIP archive…",
			},
			packageResolveStage: {
				"copy-source": "Copying original asset data…",
				"copy-packed-splat": "Collecting packed 3DGS data…",
			},
			packageCompressStage: {
				"read-input": "Reading source data…",
				"start-worker": "Starting compression worker…",
				"retry-cpu-worker": "Worker stalled, retrying on CPU worker…",
				"load-transform": "Loading SplatTransform…",
				"decode-input": "Decoding 3DGS data…",
				"merge-tables": "Merging splat tables…",
				"filter-bands": "Filtering SH bands…",
				"write-sog": "Writing SOG output…",
				finalize: "Finalizing output…",
			},
			packageFieldCompressSplats: "Compress 3DGS to SOG",
			packageFieldCompressSplatsDisabled:
				"Compress 3DGS to SOG (WebGPU required)",
			packageFieldSogShBands: "SOG SH Bands",
			packageFieldSogIterations: "SOG Compression Iterations",
			packageSogShBands: {
				0: "0 bands",
				1: "1 band",
				2: "2 bands",
				3: "3 bands",
			},
			packageSogIterations: {
				4: "4 iterations",
				8: "8 iterations",
				10: "10 iterations",
				12: "12 iterations",
				16: "16 iterations",
			},
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
			projectSaving: "Saving project...",
			projectSavingToFolder: "Saving project to {name}...",
			projectLoaded: "Project loaded.",
			projectLoadedFromFolder: "Loaded project from {name}.",
			projectSaved: "Project saved.",
			projectSavedToFolder: "Saved project to {name}.",
			workingStateSaved: "Saved working state for {name}.",
			workingStateRestored: "Restored working state for {name}.",
			referenceImagesImported: "Loaded {count} reference image file(s).",
			packageSaved: "Saved package {name}.",
			projectExporting: "Exporting project...",
			projectExported: "Project exported.",
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
			lensToolEnabled:
				"Lens adjust active. Drag to change the 35mm horizontal equivalent, press Esc to exit.",
			rollToolEnabled:
				"Camera roll active. Drag left or right to rotate the shot, press Esc to exit.",
			rollToolUnavailable: "Camera roll is only available in Camera View.",
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
			projectWorkingFolderUnsupported:
				"Working project folders are not supported in this environment.",
			projectPackageSaveUnsupported:
				"Package save dialogs are not supported in this environment.",
			projectPackageSaveUnavailable:
				"Could not get a destination for package save.",
			sogCompressionRequiresWebGpu:
				"SOG compression save requires WebGPU in this environment.",
			projectPackageOverwriteUnavailable:
				"There is no project package available to overwrite.",
			previewContext: "Could not get the 2D context for output preview.",
			unsupportedFileType: "Unsupported file type: {name}",
			emptyProjectPackage: "No supported 3D assets were found in {name}.",
			emptyGltf: "GLTF scene is empty.",
			missingRoot: "CAMERA_FRAMES root element was not found.",
		},
		referenceImage: {
			activePreset: "Active Preset",
			activePresetItems: "{count} item(s)",
			blankPreset: "(blank)",
			untitled: "Untitled",
			sizeUnknown: "Unknown size",
			currentPresetSection: "Current Preset",
			selectedSection: "Selected",
			selectedEmpty: "No reference image is selected.",
			currentCameraEmpty:
				"There are no reference items in this preset yet. Load a reference image to begin.",
			currentCameraUsage: "{count} item(s) on this Camera",
			orderLabel: "#{order}",
			group: {
				back: "Back",
				front: "Front",
			},
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
