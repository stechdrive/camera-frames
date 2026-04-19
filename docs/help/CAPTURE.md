# ヘルプスクリーンショット撮影

`docs/help/ja/*.md` の frontmatter に定義された `screenshots[].id` ごとに、fixture システムが静的な PNG を生成して `docs/help/assets/screenshots/ja/<id>.png` に配置します。撮影は dev サーバと Claude Preview MCP 経由で駆動します（完全自動化された CI は無し）。

## アーキテクチャ概要

- **fixture** = スクショ 1 枚ぶんの UI 状態を宣言的に記述した単位。`src/docs/fixtures/<id>.js` の 1 ファイルに 1 件載るのが典型
- fixture id == chapter frontmatter の `screenshots[].id` == ファイル名 `<id>.png`
- 撮影ランタイムは `/docs.html?fixture=<id>` に fixture を単体マウント → DOM を `modern-screenshot` で PNG 化 → POST `/__screenshot` で保存
- 実シーン (splat) は事前に `docs/help/assets/fixture-backdrops/` の静的 PNG として保存してあり、それを fixture が `<img>` で敷く。その上に real な gizmo / overlay / UI コンポーネントが乗る

仕組みの詳細は [FIXTURE_ROADMAP.md](FIXTURE_ROADMAP.md)、型は [`src/docs/types.d.ts`](../../src/docs/types.d.ts)。

## ブリッジ API（`__CF_DOCS__`、dev のみ）

| API | 役割 |
|---|---|
| `captureFixture(id, options?)` | `/docs.html?fixture=<id>` を iframe で開き、`__DOCS_FIXTURE_READY` を待って `.docs-stage` を PNG 化、POST 保存 |
| `captureAllFixtures(options?)` | `listFixtureIds()` を舐めて一括実行 |
| `listFixtureIds()` | fixture 一覧を iframe 経由で取得 |
| `loadProject(path)` | 本物の `.ssproj` を dev サーバに読み込ませる（mock scene backdrop 再撮影のみ用途） |
| `postScreenshotDataUrl(name, dataUrl)` | 任意の data URL を指定名で `/__screenshot` に保存（backdrop 撮影時に直接 POST するのに使う） |

`options` は全 API 共通で `{ lang = "ja", pixelRatio = 1, settleMs = 0, timeoutMs = 15000 }`。

## 撮影フロー（Claude 向け手順）

### 1. preview を起動

```
preview_start("camera-frames-dev")
```

### 2. fixture 一覧を確認（必要なら）

```js
preview_eval: await __CF_DOCS__.listFixtureIds()
```

### 3. 1 枚だけ撮る

```js
preview_eval: await __CF_DOCS__.captureFixture("shot-camera-properties", { lang: "ja", settleMs: 200 })
// → { ok: true, path: "docs/help/assets/screenshots/ja/shot-camera-properties.png", bytes: 33396 }
```

### 4. 全部撮る（章の大幅改訂時）

```js
preview_eval: await __CF_DOCS__.captureAllFixtures({ lang: "ja", settleMs: 200 })
// → [{ id, ok, path, bytes }, ...]
```

## fixture を追加 / 変更するとき

1. `src/docs/fixtures/<id>.js` を作る（panel / overlay / viewport / composite / reference のいずれか）
2. `src/docs/fixtures/index-browser.js`（browser-only、real UI 系）または `src/docs/fixtures/index.js`（node-safe、hello と icons-all だけ）で `registerFixture(...)` を呼ぶ
3. `/docs.html?fixture=<id>` を開いて描画を確認
4. main app で `__CF_DOCS__.captureFixture("<id>")` を叩いて PNG を生成
5. アプリ内 Help モーダル（`F1`）で実際の表示を確認
6. `npm test` が通ることを確認（`test/docs-fixture-registry.test.ts` が fixture id 重複 / chapter frontmatter 整合 / アイコン参照を検証）

### fixture 書き方の要点

- **mock store 経由で signal.value を読むと、preact-signals の auto-tracking で再レンダーが連鎖する**ことがある。静的データを渡したいときは mock store を経由せず直接値を渡す（`shot-camera-manager.js` のコメント参照）
- overlay 系（AppOverlay, tool menu 等）は `position: fixed` のものが多い。fixture-scoped CSS で `position: absolute` に上書きしないと `.docs-stage` の bounding box 外に描画されてキャプチャから外れる
- checkbox / select は preact が `.checked` / `.value` プロパティしか更新しないことがある。docs-bridge の `syncFormStateToAttributes` が capture 直前に HTML 属性へ同期するのでフォームは勝手に動く
- annotation を付けたいときは fixture 定義に `annotations: [{ n, selector, label }]` を生やす。selector は `.docs-stage` 配下で `querySelector` 解決される

## mock scene backdrop を撮り直すとき

`docs/help/assets/fixture-backdrops/cf-test2-default.png` 等の静的な splat-render 画像は、cf-test2 シーンを実機で開いて canvas を撮り出す必要がある。

```js
// 1. main app でプロジェクトをロード
await __CF_DOCS__.loadProject("/.local/cf-test/cf-test2.ssproj");
await __CF_DOCS__.waitForReady({ frames: 30, delayMs: 1500 });

// 2. viewport canvas を PNG 化して /__backdrop に送る
const canvas = Array.from(document.querySelectorAll("canvas")).find(c => c.id === "viewport");
const dataUrl = canvas.toDataURL("image/png");
await fetch("/__backdrop?name=cf-test2-default", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ dataUrl }),
});
```

`/__backdrop` エンドポイントの実装は `vite.config.js` の `screenshotServePlugin`。保存先は `docs/help/assets/fixture-backdrops/<name>.png`。

## 画像保存エンドポイント（dev のみ）

`vite.config.js` の `screenshotServePlugin` が 2 つ口を開けている:

- `POST /__screenshot?name=<id>&lang=<ja|en>` → `docs/help/assets/screenshots/<lang>/<id>.png`
- `POST /__backdrop?name=<id>` → `docs/help/assets/fixture-backdrops/<id>.png`

body は `{ "dataUrl": "data:image/png;base64,..." }`。name は `[A-Za-z0-9_\-.]`、lang は 2〜5 文字の ASCII letters のみ受け付ける。

## 英語版の撮影（将来）

fixture 定義は lang を気にしない作りなので、`captureAllFixtures({ lang: "en" })` を走らせるだけで `docs/help/assets/screenshots/en/*.png` 群が生成される。前提として i18n バンドルに en 訳が用意されていること（`src/i18n.js`）と、`docs/help/en/*.md` の章が存在していること（[FIXTURE_ROADMAP.md](FIXTURE_ROADMAP.md) Phase VIII）。
