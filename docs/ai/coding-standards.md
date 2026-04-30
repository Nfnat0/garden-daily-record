# コーディング標準

## JavaScript構成

- `import` / `export` を追加しません。モジュールバンドラはありません。
- 既存のスクリプト読み込み順に従い、共有要素は `window.*` に公開します。
- 各ファイルの `/* global ... */` ヘッダーは、参照するブラウザグローバルと同期します。
- 既存スタイルに合わせて関数コンポーネントとhooksを使います。
- 大きな抽象化より、小さなローカルヘルパーを優先します。
- `data.jsx` のデータ形状を変えたら、そのデータを読む全画面を確認します。

## バンドルと読み込み順

- `Garden.dev.html` のscript順と `tools/build-garden-bundle.cjs` のsource順を揃えます。
- アプリソースを変更したら `garden-app.bundle.js` を再生成します。
- `garden-app.bundle.js` は手で編集しません。

## i18nとテキスト

- メインアプリのUI文字列は `GardenI18n` を通します。
- 新しいユーザー向けラベルは日本語・英語の両方に追加します。
- 既存の日本語テキストと絵文字を尊重します。明示依頼がない限り、広範囲の再エンコード、全体フォーマット、一括置換は避けます。

## Edit Mode

`Garden.html` と `Garden.dev.html` の `/*EDITMODE-BEGIN*/` / `/*EDITMODE-END*/` ブロックを維持します。

`tweaks-panel.jsx` が使う `postMessage` プロトコルを維持します。

- `__activate_edit_mode`
- `__deactivate_edit_mode`
- `__edit_mode_available`
- `__edit_mode_set_keys`

## デザイン指針

- プロダクトメタファーは「生活・学習ログが育つ庭」です。
- 苔、土、テラコッタのパレット、セリフ体見出し、静かなカードUIを尊重します。
- `.t-*`、`.card`、`.btn`、`.chip`、`.seg`、`.row`、`.col` などの既存CSS変数・ユーティリティを再利用します。
- ライト・ダークテーマの可読性を保ちます。
- 色を増やす場合は、可能な限りデザイントークンとして定義します。
- `Wireframes.html` は探索用、`Garden.html` は磨き込む本番プロトタイプとして扱います。

## UX品質基準

UI変更時は次を確認します。

- ナビゲーションの明瞭さ
- 入力状態
- disabled、hover、focus、selected 状態
- タッチターゲットの大きさ
- responsive wrapping
- テキストのはみ出し
- empty state
- 破壊的操作の確認
- 説明文に頼らなくても次の有用な行動が見えるか

ページセクション全体を過度にカード化せず、カードは反復アイテム、モーダル、明確に枠づけるべきツールに使います。
