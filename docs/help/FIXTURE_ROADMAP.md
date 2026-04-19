# Fixture-based Help Capture System — ロードマップ

**状態**: Phase I〜VI 実装完了（2026-04-19）
**現在地**: 30 枚の chapter 画像すべてが fixture 駆動。旧 scenario パイプライン（`test/docs-capture.js`）と runtime annotation overlay は撤去済み。`npm test` に fixture registry 整合性チェックが組み込まれている
**ゴール**: ヘルプ用スクリーンショットを**アプリのコード変更に耐える**形で生成できる、documentation / regression / design review まで守備範囲に入れた「Fixture」システム
**次段**: Phase VIII（英語版撮影、`en/` 章追加 + `__CF_DOCS__.captureAllFixtures({ lang: "en" })`）。視覚リグレッション（pixelmatch ベースの PNG diff）は roadmap §6 に挙げてあるがまだ未着手

---

## 1. なぜ作るか

### 1.1 現状の限界

v0.13.0 の capture pipeline（`test/docs-capture.js` の scenario）は以下の根源的な弱点を持つ。

| 弱点 | 具体 |
|---|---|
| **命令的 & DOM selector ベース** | シナリオ内で `controller.setMode(...)`、`.workbench-menu__trigger?.click()` など。UI の selector や tool ID が変わると黙って壊れる |
| **state の実機依存** | 実機の controller / store / real scene を共有。プロジェクトロードなど重い副作用が連鎖する（68 MB の `cf-test2.ssproj` を毎回解く）|
| **state 汚染 / 順序依存** | scenario A の副産物が B に残る。現行は「replace confirm を auto-dismiss」等の hack で誤魔化している |
| **撮影対象が全画面固定** | Gizmo やツールバー単体の説明でも `.app-shell` 丸ごと。ユーザーがどこを見ればよいか伝わらない |
| **Gizmo / overlay が写らない** | 対象アセット選択など前提状態の作り込みが scenario に入っていないと、UI 要素が単に出ない |
| **品質バグに気付かない** | スクロールバー、overflow、empty gizmo が commit まで検出されない |
| **実機以外の用途に転用不可** | 同じ資産を視覚リグレッションや QA、デザインレビューに使いまわせない |

### 1.2 目指す姿

- アプリが**自分自身を documentation fixture として描画する機能**を一等市民で持つ
- fixture は**宣言的**で、**型によって UI 変更と結びつく**
- render は毎回**隔離**で、state 汚染がそもそも発生しない
- 撮影の**単位**が fixture 側で決まるので、ツールアイコン単体からフルレイアウトまでピンポイントで出せる
- 二次利用（視覚リグレ / QA / デザインレビュー / i18n）で**ROI が伸びる**

---

## 2. 中心概念：Fixture

> **fixture** = スクショで使いたい UI 状態 1 件を宣言的に記述した単位。
> 何を（どのコンポーネント / どの overlay / どの viewport）、どんな状態で（mock store / mock scene）、どのサイズで撮るかを 1 object で表す。

fixture id == chapter frontmatter の `screenshots[].id` == 画像ファイル名（`<id>.png`）。この 1:1 対応を保つ。

### 2.1 fixture 種別

| type | 中身 | 用途例 |
|---|---|---|
| `icon` | 撮影しない。`{{icon:<name>}}` で SVG 直接埋め込み | ツール一覧、pie menu 一覧 |
| `panel` | 単一の Inspector セクション / パネルのみをマウント | 下絵プロパティ、カメラプロパティ、シーンマネージャー |
| `overlay` | Help モーダル、Pie menu、確認ダイアログなど前景要素だけ | Pie menu、Help モーダルの外観、Progress overlay |
| `viewport` | 3D viewport（mock scene 必須） | Transform gizmo、軌道編集、Brush preview、Render box |
| `composite` | 複数 panel / overlay + viewport を合成 | 全体レイアウト、画面構成章の図解 |
| `reference` | 動的抽出（撮影でなく自動生成） | 全アイコン一覧、全ショートカット表 |

### 2.2 fixture 定義の形

```js
// src/docs/fixtures/panels.js（例）
import { SidePanel } from "../../ui/side-panel.js";
import { createMockStore } from "../mock/store.js";
import { createMockController } from "../mock/controller.js";

export const panelFixtures = {
  "inspector-camera-tab": {
    type: "panel",
    title: "インスペクター（カメラタブ）",
    mount: () => {
      const store = createMockStore({
        inspector: { activeTab: "camera" },
        workspace: { shotCameras: mockShotCameras.default },
      });
      const controller = createMockController(store);
      return <SidePanel store={store} controller={() => controller} />;
    },
    size: { width: 360, height: "auto" },
    background: "var(--panel, #161a1f)",
    annotations: [],
  },

  "shot-camera-properties": {
    type: "panel",
    title: "カメラプロパティセクション",
    mount: () => {
      const store = createMockStore({ shotCamera: mockShotCamera.standard });
      return <ShotCameraPropertiesSection store={store} open={true} />;
    },
    size: { width: 360 },
  },
};
```

### 2.3 fixture の形式的な契約

- **pure**: mount が同じ状態からは同じ VNode を返す（ランダム要素なし）
- **self-contained**: 外部 state（実機 store, 実機 controller）には一切触らない
- **type-checked**: mock store / mock controller は TypeScript 型で本物の signature に固定される
- **時間決定論**: アニメーション / 遅延レンダリングは fixture 側で ready シグナルまで待つ

---

## 3. システム構成（6 層）

```
┌──────────────────────────────────────────────────┐
│ 6. Validation / Linter                           │ ← build-time checks
├──────────────────────────────────────────────────┤
│ 5. Capture Pipeline                              │ ← __CF_DOCS__.captureFixture(id)
├──────────────────────────────────────────────────┤
│ 4. Docs Render Mode  (/__docs/<id>)              │ ← dev-only route
├──────────────────────────────────────────────────┤
│ 3. Mock Layers (store / controller / scene)      │
├──────────────────────────────────────────────────┤
│ 2. Fixture Registry                              │ ← src/docs/fixtures/*.js
├──────────────────────────────────────────────────┤
│ 1. Live Reference Primitives (icons / labels)    │ ← {{icon:…}} / {{ui-label:…}}
└──────────────────────────────────────────────────┘
```

### 3.1 Live Reference Primitives（層 1）

撮影しない情報は撮らない。Markdown レンダラが実 SVG / 実 i18n 文字列を展開する記法を持つ。

- `{{icon:<name>}}` — `src/ui/workbench-icons.js` の sprite から実 SVG を展開（既存）
- `{{ui-label:<i18n-key>}}` — i18n JSON から現在 locale のラベルを展開（新規）
- `{{shortcut:<action>}}` — 入力ルーティングからキーバインドを逆引き（新規）
- `{{asset-count}}` など計算値も同様に拡張可能

**効果**: アイコンや UI ラベルは再撮影不要で自動追随。アイコンが増えたら Markdown は無修正で新しいアイコン参照が可能。

### 3.2 Fixture Registry（層 2）

- `src/docs/fixtures/` 配下に種別ごとにファイル分割
  - `icons.js`, `panels.js`, `overlays.js`, `viewport.js`, `composite.js`, `reference.js`
- 全部を `src/docs/fixtures/index.js` で集約
- id はグローバル unique。重複すると build-time エラー
- fixture 定義は実コンポーネントを直接 import するので**コンポーネントを消すと fixture がコンパイルエラー**

### 3.3 Mock Layers（層 3）

- `src/docs/mock/store.js` — `createMockStore(partial)`。`@preact/signals` の signal を使った軽量 store builder
  - 本物の `createCameraFramesStore()` と同じ shape を持つ（型で縛る）
  - deep-merge で partial 指定
- `src/docs/mock/controller.js` — UI が呼ぶ controller メソッドを no-op / log-only で埋める stub
- `src/docs/mock/scenes.js` — viewport 用の programmatic シーンビルダ
  - `makeScene("single-cube-centered")` / `makeScene("two-frames-on-paper")` / `makeScene("figure-with-gizmo-target")` 等の named preset
  - `.ssproj` ファイルに依存しない（in-memory で作る）
  - 将来、軽量な fixture 専用 scene pack を `test/` 配下に置いてもよい

### 3.4 Docs Render Mode（層 4）

- URL: `/__docs/<fixture-id>?lang=ja`
- dev build のみ有効（`import.meta.env.DEV` でガード、production bundle から完全に tree-shake）
- エントリポイント `src/docs/docs-app.js`:
  1. URL から fixture id 取得
  2. Fixture Registry から定義を引く
  3. type に応じて最小マウントツリーを組む:
     - `panel` → `<DocsStage>` + `<BackgroundFill>` + `<FixtureMount />`
     - `overlay` → `<DocsStage>` + `<MockSceneCanvas>` + `<FixtureMount />`
     - `viewport` → `<DocsStage>` + `<ViewportShell>` with mock scene + `<FixtureMount />`
     - `composite` → 複数要素を layout
  4. mount 完了後 `window.__DOCS_FIXTURE_READY = true` をセット
- docs app は実機アプリとは**別 HTML ページ**（`/docs.html`）で立ち上がる設計が安全（vite の multi-page エントリ）

### 3.5 Capture Pipeline（層 5）

- `__CF_DOCS__.captureFixture(id, options?)` の API:
  1. 新しい iframe or 同 tab で `/__docs/<id>` に navigate（iframe だと state 分離がより強い）
  2. `__DOCS_FIXTURE_READY` を待つ（タイムアウト付き）
  3. fixture 定義に基づく target 要素で `modern-screenshot.domToPng`
  4. POST `/__screenshot?name=<id>&lang=<lang>` で保存（既存 plugin 流用）
  5. iframe 破棄 / スクロール位置 reset
- `__CF_DOCS__.captureAll()` は registry を舐めてバッチ実行
- ja / en 切替は `?lang=` で変える

### 3.6 Validation / Linter（層 6）

`npm test` に組み込まれる build-time checks:

- fixture registry の id が unique
- 各 chapter frontmatter の `screenshots[].id` に対応する fixture が存在する
- 各 fixture に対応する chapter 参照が 1 件以上ある（orphan 検出、warning）
- `docs/help/assets/screenshots/<lang>/<id>.png` が全 fixture に揃っている
- `related-files` に列挙された src ファイルが存在する
- `{{icon:<name>}}` で参照された icon が `workbench-icons.js` に存在する
- `{{ui-label:<key>}}` で参照された key が i18n JSON に存在する

CI が無いリポジトリなので、`npm test` で落ちるようにする。

---

## 4. 移行計画

### Phase I — Foundation（1〜2 day 相当）
1. `src/docs/` ディレクトリ作成、スケルトン配置
2. `src/docs/types.ts`（or `types.js` with JSDoc）で Fixture の型を確定
3. `src/docs/mock/store.js` — mock store builder
4. `src/docs/mock/controller.js` — mock controller stub
5. `src/docs/docs-app.js` 最小版 + `docs.html` エントリ
6. vite.config.js で `/docs.html` を second input に追加

### Phase II — Primitives & registry 骨組み
7. `{{ui-label:...}}` `{{shortcut:...}}` の markdown-renderer 拡張
8. `src/docs/fixtures/icons.js` — icon reference 自動生成（全アイコン一覧）
9. `src/docs/fixtures/index.js` で registry export + validation utility
10. `npm test` に fixture registry 整合性チェック追加

### Phase III — Panel fixtures 移行
11. panel fixtures（Inspector 各タブ、Tool Rail、Help モーダル自身）を 1 件ずつ実装
12. 対応する旧 scenario を `test/docs-capture.js` から削除
13. capture pipeline に `captureFixture(id)` を追加、旧 `captureScenario(id)` と併存

### Phase IV — Mock scene & viewport fixtures
14. `src/docs/mock/scenes.js` — programmatic scene builder
15. viewport fixtures（transform-gizmo-on-cube、render-box-camera-mode、two-frames-trajectory など）
16. per-splat edit brush preview / box tool placement

### Phase V — Composite fixtures & annotation
17. annotation を fixture 定義に含める（宣言的に）
18. annotation レンダリングを強化（番号 + 引出し線 + リング）
19. 全体レイアウト章など composite fixtures を整備

### Phase VI — Migration cleanup
20. 全 chapter の `screenshots[].scenario` を fixture id に統一（既に一致済み）
21. 旧 `test/docs-capture.js` を削除
22. 旧 `__CF_DOCS__.captureScenario` を deprecated 化、いずれ削除
23. `docs/help/CAPTURE.md` を v2 手順に差し替え
24. `CLAUDE.md` / `docs/CameraFramesFeatures.md` の記述を更新

### Phase VII — Validation を CI 相当に
25. Pre-commit / pre-push で orphan fixture / 壊れた参照の検出
26. 視覚リグレッション: ベースライン PNG と diff（pixelmatch など）。変更ありの場合だけ人が目視

### Phase VIII — 英語化準備
27. `en` 用の Help chapters を追加するときに、同一 fixture を `?lang=en` で撮り直すだけで済むことを確認
28. `{{ui-label:...}}` が locale 切替に追随することを検証

---

## 5. 既存資産の扱い

| 既存 | v2 での扱い |
|---|---|
| `docs/help/ja/*.md` 12 章 | そのまま継続。frontmatter の `scenario` フィールドは fixture id として流用 |
| `docs/help/assets/screenshots/ja/*.png` 30 枚 | 新 fixture で再撮影した PNG で上書き。ファイル名は維持する（互換） |
| `src/ui/help/` モーダル / パーサ / 検索 / deep link | 変更なし。継続運用 |
| `src/ui/help/docs-bridge.js` | `captureFixture` を追加。旧 API は deprecated として併存後削除 |
| `test/docs-capture.js` | 段階的に空になり、最終的に削除 |
| vite plugin `screenshotServePlugin` | そのまま流用（エンドポイントは POST `/__screenshot`） |
| `modern-screenshot` devDep | そのまま。fixture でも使う |
| `.local/cf-test/cf-test2.ssproj` | `composite` type や「リアル感が必要な章」の予備として残す。viewport fixture は mock scene を優先 |

---

## 6. 将来の拡張領域

一度 fixture システムが入れば、副次効果として以下が有効に:

- **視覚リグレッションテスト** — ベースライン PNG vs 現行 PNG の diff レポート
- **Stakeholder デモ用プレイグラウンド** — `/docs.html` をそのまま「UI カタログ」として公開
- **デザインレビュー** — fixture id を PR に書けば `/docs.html?fixture=<id>` で完全再現
- **i18n QA** — 全 fixture を全 locale で撮って一覧表示、訳抜け / overflow 検出
- **アクセシビリティ監査** — 各 fixture に axe-core を走らせて report
- **コンポーネント追加 / 削除 の影響範囲**: fixture の破綻 → 影響 chapter が一目瞭然
- **Spec ↔ docs の bidirectional trace**: `src/ui/workbench-*.js` を触ったら影響 fixture と chapter が機械的に割り出せる

---

## 7. 意思決定ログ

| 決定 | 根拠 |
|---|---|
| fixture は実コンポーネントを直接 import | UI 変更がコンパイル時に検出されることが最優先 |
| `/docs.html` の multi-page を使う | 実機アプリと**別 HTML**で起動することで state 汚染リスクをゼロにする |
| icon / ui-label / shortcut は撮影しない | ソースコードから派生できる情報は派生させる原則 |
| fixture id = PNG ファイル名 = chapter frontmatter の `screenshots[].id` = `screenshots[].scenario` | 全部一致させて認知負荷を下げる |
| mock scene は programmatic | `.ssproj` の維持コストを避ける。変更に強い |
| 旧 API は deprecated 経由で段階的に削除 | chapter / PNG の整合を保ったまま移行するため |
| ja / en は URL param で切替 | fixture 定義を共有、translation 成果物のみ分離 |

---

## 8. 未解決 / 要議論

- **vite multi-page の HMR 挙動**: `/docs.html` の HMR が `/index.html` と混線しないか要検証
- **iframe 撮影 vs 同 tab**: state 分離で iframe が有利だが、cross-origin / sandbox 制約あり。最初は同 tab で始めて、問題出たら iframe 化を検討
- **fixture の typesafety を JSDoc / TS どちらで入れるか**: repo は JS + ts-node。既存スタイルに合わせて JSDoc が無難
- **mock scene の形式**: minimal な JS builder（推奨）vs tiny `.ssproj`（既存パーサ再利用）。前者が変更耐性高い
- **composite fixtures の合成方法**: 実機アプリを起動して撮ったものと差別化するか、fixture 組合せで再構築するか
- **annotation DSL**: 番号 / selector / label / arrow_to / ring のどこまで宣言的に持つか

---

## 9. この計画の更新履歴

| 日付 | 変更 |
|---|---|
| 2026-04-18 | 初版。v0.13.0 直後、現行 capture 機構の limitation を踏まえた fixture システムの設計提案 |
| 2026-04-19 | Phase I〜VI 実装完了。30 枚の chapter 画像すべてが fixture 駆動に移行、旧 `test/docs-capture.js` + runtime annotation overlay は撤去、registry validation（chapter frontmatter ↔ fixture id 整合）を `npm test` に組込み。未解決事項（§8）の方針決定: typesafety = JSDoc + `.d.ts`, capture isolation = iframe multi-page, mock scene = backdrop PNG + real component overlay の hybrid、annotation DSL = `{ n, selector, label }` 最小形式 |

---

## 10. 関連

- 現行 capture: [CAPTURE.md](CAPTURE.md)
- 保守ワークフロー: [UPDATING.md](UPDATING.md)
- スキーマ: [SCHEMA.md](SCHEMA.md)
- チャプター本文: [ja/](./ja/)
