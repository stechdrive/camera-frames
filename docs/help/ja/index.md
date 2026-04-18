---
id: index
title: CAMERA_FRAMES ヘルプ
section: 0
lang: ja
last-updated: 2026-04-18
---

# CAMERA_FRAMES ヘルプ

shot layout と export のための専用ツール `CAMERA_FRAMES` の使い方をまとめています。

## このドキュメントについて

- アプリから `F1` または HUD の `?` ボタンで開けます（Phase 2 実装後）
- 各パネルのタイトルバーの `?` を押すと、該当章に直接ジャンプします
- 本文中の `{{icon:...}}` 記法はアプリ内では実際のアイコンとして表示されます

## 目次

1. [はじめに](01-getting-started.md) — 最初の 5 分：起動から PNG 出力まで
2. [画面構成](02-ui-layout.md) — Viewport、サイドパネル、HUD、pie menu の名称と役割
3. [ファイルを開く・保存する](03-open-save.md) — Open、Import、working save、`.ssproj`
4. [シーンアセット](04-scene-assets.md) — splat / model の追加・表示・順序・transform
5. [Shot Camera](05-shot-camera.md) — 複数 camera 管理、pose / lens / clipping、export name
6. [Output Frame と FRAME](06-output-frame-and-frames.md) — paper size、anchor、FRAME 配置・編集、frame mask、trajectory
7. [リファレンス画像](07-reference-images.md) — preset、binding、per-shot override、編集
8. [Viewport とツール](08-viewport-tools.md) — navigate、zoom、select、transform、pivot、reference edit、measurement、pie menu
9. [Per-splat edit](09-per-splat-edit.md) — Shift+E からのツール全般
10. [Export](10-export.md) — target、format、PNG / PSD、layer options
11. [キーボードショートカット一覧](11-shortcuts.md)
12. [用語集とトラブルシューティング](12-glossary-troubleshooting.md)

## 関連ドキュメント（開発者向け）

- [仕様の正本](../../camera_frames_requirements.md)
- [機能一覧と回帰観点](../../CameraFramesFeatures.md)
- [legacy `.ssproj` 互換契約](../../legacy-ssproj-compatibility.md)
