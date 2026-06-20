# Styles

`app.css` は cascade composition root として扱う。import 順序は表示 contract なので、見た目を変える意図がない整理では順序を変えない。

主な分担:

- `tokens.css`: 色、サイズ、shadow などの design token
- `base.css`: body / canvas / mode visibility などの app 全体の土台
- `layout.css`: workbench shell と responsive layout
- `workbench.css`: workbench primitive controls
- `panel-controls.css`: panel 内の汎用 form / button / disclosure / field 部品
- `app-overlays.css`: app overlay、進捗、modal 系の外枠
- `workbench-surface.css`: tabs、tooltip、inspector stack / rail など workbench surface
- `viewport-tools.css`: viewport 上の HUD、toolbars、gizmo、render box、reference overlay
- `inspector-sections.css`: inspector 内の feature section と asset/reference/export list
- `frame-overlays.css`: frame layer、composition guide、trajectory、frame item
- `help.css` / `docs-annotation.css`: help / docs fixture 専用

CSS を移動または追加した時は `npm run lint` と `npm test` を通し、UI 表示に影響しうる変更では `npm run test:local-scenarios -- --include-built-ins --scenario css-visual-baseline,css-visual-mobile-baseline` で実アプリ screenshot も確認する。
