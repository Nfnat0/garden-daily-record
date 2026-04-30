# 進捗トラッカー

## 現在の状態

Status: in progress

2026-04-30 follow-up: implemented remembered save-folder restore.

- Garden now stores the selected `FileSystemDirectoryHandle` in IndexedDB after a successful folder connection.
- On the next launch, Garden checks the remembered handle with `queryPermission({ mode: "readwrite" })`.
- If permission is already `granted`, Garden auto-loads the remembered folder without opening the picker.
- If permission is `prompt` or not already granted, the storage gate shows a one-click "previous folder" restore action that calls `requestPermission()` from the user click.
- The storage gate also includes a "forget folder" action that clears the remembered handle while keeping manual folder selection available.
- Unit coverage was added for remembered-handle persistence, missing IndexedDB fallback, and query-vs-request permission separation.
- Browser QA for the remembered-folder flow was prepared in `output/playwright/remembered-folder-qa.cjs`, but could not be executed in this session because the required browser-launch escalation was rejected by the environment usage limit.

Evidence:

```powershell
node garden-store.test.cjs
node tools/build-garden-bundle.cjs
```

2026-04-30 にUXレビューとAI資料分割を開始しました。この作業で、ベースラインのUX改善計画と `docs/ai/` 配下のAI向け作業資料を作成しました。

2026-04-30 の実装パス1で、優先ロードマップのうち Phase 1 から Phase 4 の中核改善と、Phase 6 の一部品質改善を実装しました。

## ベースライン検証

完了:

- リポジトリ構成を確認。
- `AGENTS.md` を確認し、詳細を分割。
- 既存スクリーンショットを確認。
  - `garden-daily-record/garden-screen.png`
  - `garden-daily-record/garden-mobile.png`
- テスト通過。

```powershell
node garden-store.test.cjs
```

- 本番バンドル生成成功。

```powershell
node tools/build-garden-bundle.cjs
```

- 既存Chromeとメモリ上のfake folder handleを使ってブラウザsmoke testを完了。

Evidence:

- `output/playwright/ux-observation.json`
- `output/playwright/desktop-dashboard.png`
- `output/playwright/mobile-dashboard.png`

## 決定事項

- `AGENTS.md` は短い入口資料として維持する。
- 継続的に参照する詳細は `docs/ai/` に配置する。
- UX・プロダクト優先度は `ux-improvement-plan.md` で管理する。
- 進捗と次アクションはこのファイルで管理する。
- 初回保存フォルダゲートとモバイル日次記録体験を最優先UX領域として扱う。
- デモ・サンプルモードは、フォルダ選択前の一時的なメモリ内プレビューとして扱う。永続保存したい場合はフォルダ選択へ進ませる。
- Todayは1つのグローバル保存を維持し、sticky save/progress導線で保存状態を常時見えるようにする。

## 実装パス1

完了:

- 保存ゲートに local-first の説明、実際に作成・読み込みする `garden.*.json` ファイル一覧、セットアップ手順、未対応ブラウザ向け案内を追加。
- フォルダ選択前にDashboardとTodayを確認できるメモリ内サンプルプレビューを追加。
- 接続済みバーに、接続先フォルダ、再読み込みの意味、プレビュー状態の説明を追加。
- Dashboardに状態連動の次アクション導線を追加。
- Todayに予定リマインダー、sticky save/progress、dirty状態、未完了必須項目数を追加。
- 390px mobile viewport でDashboard/Studyの横overflowを解消。
- focus-visible の見える輪郭とインラインfaviconを追加。
- `GardenSchema.storageFileNames()` と `GardenCalc.missingRequiredFields()` を追加し、テストで保護。

Evidence:

- `output/playwright/ux-plan-final-verification.json`
- `output/playwright/ux-plan-storage-gate.png`
- `output/playwright/ux-plan-storage-gate-final.png`
- `output/playwright/ux-plan-preview-dashboard.png`
- `output/playwright/ux-plan-preview-today.png`
- `output/playwright/ux-plan-preview-today-final.png`
- `output/playwright/ux-plan-mobile-dashboard.png`
- `output/playwright/ux-plan-mobile-study.png`
- `output/playwright/ux-plan-mobile-study-final.png`
- `output/playwright/ux-plan-connected-dashboard.png`

## 未解決質問

- モバイルナビゲーションは現在の折り返しサイドバーを維持するべきか、上部タブまたは下部ナビへ寄せるべきか。
- セクション単位の保存状態は今回見送り。実利用でsticky保存だけでは不安が残るか観察する。

## 推奨される次アクション

- [x] Phase 1 にデモ・サンプルモードを含めるか決める。
- [x] DashboardのStudyチャートカードによる390pxモバイルoverflowを修正する。
- [x] local-firstの安心感、作成ファイル、未対応ブラウザ復旧を説明する保存ゲート文言を作る。
- [x] Todayのsticky save/progress導線を試作する。
- [x] 最初のUX実装後にブラウザQAメモを更新する。
- [ ] モバイルナビゲーションを上部タブまたは下部ナビへ寄せるか判断する。
- [ ] Library empty state と Settings の危険操作階層を改善する。
- [ ] ライト・ダーク両テーマで全主要ルートのcontrastとfocus stateを確認する。
- [ ] 6つの主要ルートに対する再現可能なbrowser smoke testを追加または文書化する。

## バックログ

- [x] Dashboardのnext action階層を改善する。
- [x] PlanとTodayを軽いリマインダーでつなぐ。
- [ ] Libraryのempty stateを改善する。
- [ ] Settingsの植物操作を安全で読みやすくする。
- [ ] 両テーマでfocus stateとcontrastを監査する。
- [ ] 6つの主要ルートに対する再現可能なbrowser smoke testを追加または文書化する。
