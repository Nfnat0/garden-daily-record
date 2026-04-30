# 進捗トラッカー

## 現在の状態

Status: proposed

2026-04-30 にUXレビューとAI資料分割を開始しました。この作業で、ベースラインのUX改善計画と `docs/ai/` 配下のAI向け作業資料を作成しました。

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

## 未解決質問

- デモ・サンプルモードは永続的に持つべきか、フォルダ選択前の一時プレビューに留めるべきか。
- モバイルナビゲーションは現在の折り返しサイドバーを維持するべきか、上部タブまたは下部ナビへ寄せるべきか。
- Todayは1つのグローバル保存を維持するべきか、セクション単位の保存状態を導入するべきか。

## 推奨される次アクション

- [ ] Phase 1 にデモ・サンプルモードを含めるか決める。
- [ ] DashboardのStudyチャートカードによる390pxモバイルoverflowを修正する。
- [ ] local-firstの安心感、作成ファイル、未対応ブラウザ復旧を説明する保存ゲート文言を作る。
- [ ] Todayのsticky save/progress導線を試作する。
- [ ] 最初のUX実装後にブラウザQAメモを更新する。

## バックログ

- [ ] Dashboardのnext action階層を改善する。
- [ ] PlanとTodayを軽いリマインダーでつなぐ。
- [ ] Libraryのempty stateを改善する。
- [ ] Settingsの植物操作を安全で読みやすくする。
- [ ] 両テーマでfocus stateとcontrastを監査する。
- [ ] 6つの主要ルートに対する再現可能なbrowser smoke testを追加または文書化する。
