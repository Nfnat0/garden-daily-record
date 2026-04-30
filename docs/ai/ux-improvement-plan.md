# UX改善計画書

## 目的

Garden Daily Record を、見た目の完成度が高い静的プロトタイプから、日々の記録を迷わず続けられる体験へ進めます。ユーザーが保存フォルダを選ぶ前に価値を理解でき、今日の記録を短時間で完了でき、JSONベースのローカル保存に安心感を持てる状態を目指します。

## 現状UX評価

2026-04-30 に、コード、生成バンドル、テスト、既存スクリーンショット、fake in-memory folder handle を使ったブラウザsmoke testで確認しました。

良い点:

- 庭のメタファーが記憶に残り、ビジュアルの一貫性があります。
- Dashboard、Plan、Today、Study、Library、Settings が、予定、記録、振り返りまでのループを構成しています。
- ローカルJSON保存は透明性があり、ユーザー所有のデータモデルと相性が良いです。
- 日本語・英語、ライト・ダークテーマ、スキーマバリデーションの土台があります。
- Planを専用ルートに分けたことで、Todayの入力体験が過密になりにくくなっています。

主なUXリスク:

- 初回ユーザーは、価値を体験する前に保存フォルダ選択を求められます。
- 「4つのJSONファイル」を読み書きする説明はありますが、セットアップ手順、サンプル体験、復旧方法、プライバシー上の安心材料が不足しています。
- Todayは7つの植物カードと最下部の保存ボタンで構成され、特にモバイルでは長く、保存状態が不安になりやすいです。
- Dashboardは美しい一方、ゼロ状態で次の有用な行動が少し見えにくいです。
- 390pxモバイルviewportで、Studyチャートカードの最小幅により横overflowが発生しています。
- Settingsは強力な植物編集と削除操作を提供していますが、情報階層と危険操作の扱いはまだプロトタイプ的です。
- StudyとLibraryのempty stateは正確ですが、次の行動を促す力が弱いです。

## 優先ロードマップ

### Phase 1: 初回体験と保存への安心感

目的: フォルダ選択の前に、プロダクトの価値と保存モデルへの信頼を作る。

推奨変更:

- 保存ゲートに、メモリ上のサンプルデータで動くプレビューまたはデモ導線を追加する。
- 「フォルダを選ぶ」「4つのJSONファイルを作成または読み込み」「変更はローカルに残る」という短いセットアップ説明を追加する。
- 作成されるファイルとして `settings.json`、`plants.json`、`entries.json`、`library.json` を明示する。
- 接続済み状態の再読み込み・フォルダ変更の意味を補足する。
- 未対応ブラウザ向けの案内を、ChromeまたはEdgeで開く次アクションまで具体化する。

成功条件:

- 新規ユーザーが、ファイル作成前にDashboardとTodayの価値を確認できる。
- ユーザーが、自分のデータがどこに保存されるか説明できる。
- ストレージエラーに次の行動が含まれる。

### Phase 2: 日次記録の高速化

目的: 毎日の記録にかかる認知負荷と保存不安を減らす。

推奨変更:

- Todayの長いページに、sticky save bar またはセクション単位の保存導線を追加する。
- progress付近に「どの必須項目が未完了か」を示す手がかりを置く。
- required、saved、changed の状態をより明確にする。
- 保存済みまたは任意項目のカードは、必要に応じて折りたためるように検討する。
- Planは分離したまま、Today内に今日の予定を読み取り専用リマインダーとして表示し、編集リンクを置く。

成功条件:

- どのスクロール位置でも保存状態と保存アクションを理解できる。
- progressが完了しない理由が分かる。
- PlanとTodayが、画面を統合しなくてもつながって感じられる。

### Phase 3: Dashboardを次アクションの拠点にする

目的: 没入感のある庭を残しつつ、次に何をすればよいかを明確にする。

推奨変更:

- Dashboardのhero領域に、状態に応じて「今日の記録へ」または「今日の予定を書く」を主導線として出す。
- ゼロ状態の庭が空に見えすぎないよう、初期メッセージを改善する。
- 「次に育てる植物」または「小さな一歩」の提案を表示する。
- 初回ゼロ状態ではbadgesの優先度を下げ、直近行動を優先する。

成功条件:

- 初回Dashboardが「次に何をするか」に答える。
- 再訪Dashboardが「前回から何が変わったか」に答える。

### Phase 4: モバイル情報設計

目的: モバイルでも日常的に使いやすい構成にする。

推奨変更:

- 大きな `minWidth` をresponsive grid制約に置き換え、390px横overflowを解消する。
- モバイル上部ナビの縦コストを下げる。コンパクトタブや下部アクションクラスターも検討する。
- 狭い幅でも庭の植物とラベルが見切れないよう、庭ビジュアルのフレーミングを調整する。
- nav、segmented control、date input、Settings内アクションのタッチターゲットを確認する。

成功条件:

- 390pxで `document.body.scrollWidth <= window.innerWidth` になる。
- 初期表示後、ナビゲーションが最初の画面を占有しすぎない。
- 日次記録の主要行動に少ないスクロールで到達できる。

### Phase 5: SettingsとLibraryの安全性

目的: CRUD操作を、意図的で回復可能な体験にする。

推奨変更:

- Settingsの植物アクションを、より明確なアクションメニューまたはコンパクトなツールバーにまとめる。
- 破壊的操作を編集・並び替え操作と視覚的に区別する。
- 削除がsoft-deleteである場合は、その説明を短く追加する。
- Libraryのempty stateに、タブごとの直接追加ボタンを置く。
- ユーザーに表示されるraw status値をローカライズする。

成功条件:

- 破壊的操作を誤って押しにくい。
- 初回の本・メモ・記事をempty stateから追加できる。
- Settingsが生のテーブル編集ではなく、設定画面として感じられる。

### Phase 6: アクセシビリティ、磨き込み、QA

目的: 大きな機能追加前に、基礎品質を引き上げる。

推奨変更:

- ブラウザ標準だけでは不足する箇所に、見えるfocus stateを追加する。
- ライト・ダークテーマのcontrastを確認する。
- 意味が伝わりにくい記号ボタンにaccessible nameを補う。
- 6つの主要ルートを確認するbrowser smoke手順を追加または文書化する。
- 対象ブラウザでmissing resourceのconsole noiseが出る場合はfavicon追加を検討する。

成功条件:

- キーボードでも主要フローを移動できる。
- ブラウザ検証のチェックリストが再現可能である。
- 通常利用で避けられるconsole errorが出ない。

## 推奨実装順

1. モバイルoverflow修正と保存ゲートの信頼形成コピーを入れる。低リスクで初回印象に効くため。
2. demo/sample modeを追加する。状態フローが変わるため、ストレージとルート挙動を丁寧にテストする。
3. Todayの保存・progress体験を改善する。ここが習慣化の中心です。
4. Dashboardをnext action中心に調整する。
5. SettingsとLibraryのCRUD安全性を改善する。
6. アクセシビリティとresponsiveの最終確認を行う。

## 測定案

- First successful action: 保存ゲートからPlanまたはTodayに到達したセッション割合。
- Daily completion speed: Todayを開いてからentry保存までの時間。
- Recovery confidence: ストレージエラーのうち、次アクションが明示された割合。
- Mobile fit: 390px、430px、768pxで横overflowがないこと。
- Completion clarity: どの植物が未完了で、なぜ未完了か説明できること。

## レビュー根拠

実行コマンド:

```powershell
node garden-store.test.cjs
node tools/build-garden-bundle.cjs
```

既存Chromeで確認したルート:

- 保存フォルダゲート
- fake folder接続後Dashboard
- Plan
- Today
- Study
- Library
- Settings

観測された課題:

- 390pxモバイルviewportの接続後画面で、`document.body.scrollWidth` が400、`window.innerWidth` が390でした。overflowしていたのはStudyチャートカードです。

生成された検証アーティファクト:

- `output/playwright/desktop-storage.png`
- `output/playwright/desktop-dashboard.png`
- `output/playwright/desktop-today.png`
- `output/playwright/desktop-settings.png`
- `output/playwright/mobile-storage.png`
- `output/playwright/mobile-dashboard.png`
- `output/playwright/ux-observation.json`
