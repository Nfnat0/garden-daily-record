/* global window */
// JSON-backed garden data model, file storage helpers, and derived summaries.

(function () {
  const SCHEMA_VERSION = 1;
  const FILES = {
    settings: 'garden.settings.json',
    plants: 'garden.plants.json',
    entries: 'garden.entries.json',
    library: 'garden.library.json',
  };
  const FILE_ORDER = ['settings', 'plants', 'entries', 'library'];
  const REMEMBERED_DIRECTORY_DB = 'garden.daily-record.storage';
  const REMEMBERED_DIRECTORY_DB_VERSION = 1;
  const REMEMBERED_DIRECTORY_STORE = 'handles';
  const REMEMBERED_DIRECTORY_KEY = 'save-directory';
  const FIELD_TYPES = ['number', 'duration', 'boolean', 'select', 'text', 'textarea', 'avoidance_count'];
  const DEFAULT_TOPICS = ['system-design', 'go', 'database', 'distributed-systems', 'algorithms', 'product', 'writing', 'kubernetes'];
  const LANGUAGE_STORAGE_KEY = 'garden.language';
  const TRANSLATIONS = {
    ja: {
      'app.name': 'Garden',
      'nav.main': 'メイン',
      'nav.dashboard': 'ダッシュボード',
      'nav.plan': '予定',
      'nav.today': '今日の記録',
      'nav.plants': '植物',
      'nav.study': '学習ログ',
      'nav.library': 'ライブラリ',
      'nav.other': 'その他',
      'nav.settings': '設定',
      'nav.scholar': 'scholar',
      'nav.day': 'day {day}',
      'language.label': '言語',
      'language.ja': '日本語',
      'language.en': 'English',
      'storage.status': 'storage',
      'storage.connectTitle': '保存フォルダを選択',
      'storage.connectBody': 'Garden は選択したフォルダ直下の4つのJSONファイルを読み書きします。',
      'storage.localFirstTitle': 'データはあなたのフォルダにだけ保存されます',
      'storage.localFirstBody': 'フォルダを選ぶと、Garden は既存ファイルを読み込み、ない場合だけ新しく作成します。クラウド送信はありません。',
      'storage.rememberedTitle': '前回のフォルダを使えます',
      'storage.rememberedBody': '前回選んだ「{name}」をもう一度開けます。権限確認が出る場合があります。',
      'storage.restoreFolder': '前回のフォルダを開く',
      'storage.restoring': '復元中...',
      'storage.forgetFolder': '記憶を解除',
      'storage.restoreFailed': '前回のフォルダを開けませんでした。フォルダを選び直してください。',
      'storage.rememberFailed': 'フォルダの記憶に失敗しました。次回はもう一度選択してください。',
      'storage.filesTitle': '作成・読み込みするファイル',
      'storage.setupTitle': 'セットアップの流れ',
      'storage.setupStep1': 'フォルダを選ぶ',
      'storage.setupStep2': '4つのJSONを読み込み、なければ作成',
      'storage.setupStep3': '以後の変更はそのフォルダに保存',
      'storage.previewTitle': 'まずはサンプルで触ってみる',
      'storage.previewBody': 'フォルダを選ぶ前に、ダッシュボードと今日の記録をメモリ上だけで試せます。',
      'storage.previewButton': 'サンプルを開く',
      'storage.previewName': 'サンプルプレビュー',
      'storage.previewHelp': 'メモリ上のプレビューです。保存したい場合はフォルダを選んでください。',
      'storage.previewSaved': 'プレビュー保存',
      'storage.connectedHelp': '{name} に接続中。再読み込みはフォルダ内のJSONを読み直します。',
      'storage.unsupportedTitle': 'Chrome または Edge で開いてください',
      'storage.unsupportedAction': 'この機能は File System Access API を使います。localhost の Garden.html を Chrome / Edge で開くとフォルダ保存を使えます。',
      'storage.unsupported': 'このブラウザはフォルダ保存に対応していません。Chrome または Edge で localhost から開いてください。',
      'storage.connecting': '接続中...',
      'storage.pickFolder': 'フォルダを選ぶ',
      'storage.unconnected': '未接続',
      'storage.saved': '保存 {time}',
      'storage.initialized': '初期化済み',
      'storage.warnings': '警告 {count}',
      'storage.reload': '再読み込み',
      'storage.changeFolder': 'フォルダ変更',
      'dashboard.eyebrow': 'your garden ・ day {day}',
      'dashboard.title': '{count}つの植物が育っています',
      'dashboard.level': 'scholar ・ level {level}',
      'dashboard.streak': '連続記録',
      'dashboard.studyTotal': '学習合計',
      'dashboard.studyTotalSub': 'すべての記録',
      'dashboard.sleepAverage': '睡眠平均',
      'dashboard.sleepAverageSub': '記録済みの日',
      'dashboard.todayCare': '今日の記録',
      'dashboard.todayCareSub': '完了した植物',
      'dashboard.today': 'today',
      'dashboard.goToday': '記録へ',
      'dashboard.goPlan': '予定を書く',
      'dashboard.nextAction': '次の一歩',
      'dashboard.planPrompt': 'まず今日の予定を1つ決めましょう。',
      'dashboard.todayPrompt': '今日の記録を進めると庭が育ちます。',
      'dashboard.donePrompt': '今日の手入れは完了しています。振り返りや読書メモを残せます。',
      'dashboard.todaySummary': '{done} / {total} の植物に水をあげました',
      'dashboard.studyWeeks': 'study ・ last 4 weeks',
      'dashboard.perDay': '分 / day',
      'dashboard.noEntries': '記録がまだありません',
      'dashboard.past': 'past',
      'dashboard.now': 'today',
      'dashboard.badges': 'badges',
      'plan.eyebrow': 'plan ・ {date}',
      'plan.title': '今日の予定',
      'plan.body': '今日やることを先に決めると「計画」の植物が育ちます。',
      'plan.placeholder': '今日やることを書く',
      'plan.saved': '予定を保存しました {time}',
      'plan.empty': '計画植物が見つかりません。設定画面で plan 植物を確認してください。',
      'today.eyebrow': 'water ・ {date} ・ {day}',
      'today.title': '今日の記録',
      'today.progress': '{total}つの植物のうち {done}つ 完了。',
      'today.noPlants': '設定画面で植物を追加してください。',
      'today.saved': '保存済み {time}',
      'today.unsaved': '未保存',
      'today.changed': '未保存の変更があります',
      'today.completeReady': '必須項目は入力済みです',
      'today.missingRequired': '必須項目 {count}件が未完了',
      'today.missingRequiredList': '未完了: {items}',
      'today.moreMissing': 'ほか {count}件',
      'today.planDone': '今日の予定: {plan}',
      'today.planEmpty': '今日の予定はまだありません。',
      'today.editPlan': '予定へ',
      'today.reset': '元に戻す',
      'today.save': '水をやる',
      'today.saving': '保存中...',
      'today.done': '完了',
      'today.pending': '未記録',
      'today.yes': 'はい',
      'today.no': 'いいえ',
      'today.unselected': '未選択',
      'today.writePlaceholder': '{label}を書く',
      'today.avoidanceHelp': '0に近いほどXP',
      'settings.title': '設定',
      'settings.eyebrow': 'settings',
      'settings.appName': 'アプリ名',
      'settings.startDate': '開始日',
      'settings.saveSettings': '設定を保存',
      'settings.plants': '植物',
      'settings.newPlant': '新しい植物',
      'settings.edit': '編集',
      'settings.delete': '削除',
      'settings.up': '↑',
      'settings.down': '↓',
      'settings.editor': 'plant editor',
      'settings.cancel': 'キャンセル',
      'settings.savePlant': '植物を保存',
      'settings.plantId': 'ID',
      'settings.plantName': '英名',
      'settings.plantJp': '表示名',
      'settings.emoji': '絵文字',
      'settings.color': '色',
      'settings.desc': '説明',
      'settings.visible': '表示する',
      'settings.fieldId': 'フィールドID',
      'settings.fieldLabel': 'ラベル',
      'settings.fieldType': '型',
      'settings.fieldUnit': '単位',
      'settings.fieldRequired': '必須',
      'settings.fieldOptions': '選択肢',
      'settings.addField': '項目を追加',
      'settings.hidden': '非表示',
      'settings.show': '表示',
      'settings.hide': '非表示',
      'settings.newPlantName': '新しい植物',
      'settings.deletePlantConfirm': 'この植物を削除しますか？既存の記録はJSONに残りますが、アプリには表示されません。',
      'settings.deleteFieldConfirm': 'この項目を削除しますか？既存の値はJSONに残りますが、表示されなくなります。',
      'library.eyebrow': 'library ・ words',
      'library.title': '読んだこと、気づいたこと',
      'library.books': '本',
      'library.notes': 'メモ',
      'library.articles': '記事',
      'library.add': '追加',
      'library.empty': 'まだ記録がありません',
      'library.deleteConfirm': 'このライブラリアイテムを削除しますか？',
      'library.titleField': 'タイトル',
      'library.author': '著者',
      'library.source': '出典',
      'library.progress': '進捗 %',
      'library.status': '状態',
      'library.tags': 'タグ',
      'library.body': '本文',
      'library.done': '読了',
      'study.eyebrow': 'study log ・ mind',
      'study.title': '{hours} 時間、分け入った深い森',
      'study.byTopic': 'by topic',
      'study.empty': '学習記録がまだありません。',
      'study.recent': 'recent sessions',
      'study.noSessions': 'まだセッションがありません。',
      'validation.titleRequired': 'タイトルは必須です。',
      'validation.url': 'URLは http:// または https:// で始めてください。',
      'validation.progress': '読書進捗は0から100%の間にしてください。',
      'validation.plantName': '植物の表示名は必須です。',
      'validation.plantId': '植物IDは必須です。',
      'validation.fieldRequired': '項目を1つ以上追加してください。',
      'validation.fieldId': 'フィールドIDは必須です。',
      'validation.duplicateField': 'フィールドIDが重複しています: {id}',
      'validation.fieldLabel': 'フィールドラベルは必須です。',
      'validation.selectOptions': '選択式フィールドには選択肢が1つ以上必要です。',
      'actions.save': '保存',
      'actions.saved': '保存済み',
      'actions.done': '完了',
      'actions.pending': '未記録',
      'units.days': '日',
      'units.hours': '時間',
      'units.minutes': '分',
      'units.sessions': 'sessions',
      'units.entries': 'entries',
      'units.entry': 'entry',
      'units.count': '回',
      'values.empty': '-',
      'values.good': 'よい',
      'values.normal': '普通',
      'values.light': '浅い',
      'plants.mind': '学び',
      'plants.plan': '計画',
      'plants.body': 'からだ',
      'plants.avoid': '控える',
      'plants.rest': 'やすみ',
      'plants.words': 'ことば',
      'plants.reflect': 'ふりかえり',
      'plants.craft': 'つくる',
      'fields.study_minutes': '学習時間',
      'fields.study_topic': 'トピック',
      'fields.study_note': '学びメモ',
      'fields.today_plan': '今日の予定',
      'fields.workout': '体を動かした',
      'fields.body_note': '運動メモ',
      'fields.avoid_count': 'やらなかったらよいことの回数',
      'fields.sleep': '睡眠時間',
      'fields.sleep_quality': '睡眠の質',
      'fields.reading_title': '読んだもの',
      'fields.reading_pages': 'ページ数',
      'fields.reading_note': '読書メモ',
      'fields.memo': '気づきのメモ',
      'fields.tomorrow': '明日やること',
      'fields.craft_minutes': '制作時間',
      'fields.craft_note': '作ったもの',
    },
    en: {
      'app.name': 'Garden',
      'nav.main': 'Main',
      'nav.dashboard': 'Dashboard',
      'nav.plan': 'Plan',
      'nav.today': 'Today',
      'nav.plants': 'Plants',
      'nav.study': 'Study Log',
      'nav.library': 'Library',
      'nav.other': 'Other',
      'nav.settings': 'Settings',
      'nav.scholar': 'scholar',
      'nav.day': 'day {day}',
      'language.label': 'Language',
      'language.ja': '日本語',
      'language.en': 'English',
      'storage.status': 'storage',
      'storage.connectTitle': 'Choose a save folder',
      'storage.connectBody': 'Garden reads and writes four JSON files in the folder you choose.',
      'storage.localFirstTitle': 'Your data stays in your folder',
      'storage.localFirstBody': 'After you choose a folder, Garden reads existing files and only creates missing ones. Nothing is uploaded.',
      'storage.rememberedTitle': 'Use your previous folder',
      'storage.rememberedBody': 'Garden can reopen the previous folder, "{name}". Your browser may ask you to confirm access.',
      'storage.restoreFolder': 'Open previous folder',
      'storage.restoring': 'Restoring...',
      'storage.forgetFolder': 'Forget folder',
      'storage.restoreFailed': 'Garden could not open the previous folder. Choose the folder again.',
      'storage.rememberFailed': 'Garden could not remember this folder. You may need to choose it again next time.',
      'storage.filesTitle': 'Files Garden reads or creates',
      'storage.setupTitle': 'Setup flow',
      'storage.setupStep1': 'Choose a folder',
      'storage.setupStep2': 'Read four JSON files, creating missing files',
      'storage.setupStep3': 'Save future changes in that folder',
      'storage.previewTitle': 'Try a sample first',
      'storage.previewBody': 'Before choosing a folder, you can explore the dashboard and today log in memory only.',
      'storage.previewButton': 'Open sample',
      'storage.previewName': 'Sample preview',
      'storage.previewHelp': 'This is an in-memory preview. Choose a folder when you want to keep your changes.',
      'storage.previewSaved': 'Preview saved',
      'storage.connectedHelp': 'Connected to {name}. Reload reads the JSON files in that folder again.',
      'storage.unsupportedTitle': 'Open in Chrome or Edge',
      'storage.unsupportedAction': 'Folder saving uses the File System Access API. Open localhost Garden.html in Chrome or Edge to use it.',
      'storage.unsupported': 'This browser does not support folder storage. Open from localhost in Chrome or Edge.',
      'storage.connecting': 'Connecting...',
      'storage.pickFolder': 'Choose folder',
      'storage.unconnected': 'Not connected',
      'storage.saved': 'saved {time}',
      'storage.initialized': 'initialized',
      'storage.warnings': '{count} warnings',
      'storage.reload': 'Reload',
      'storage.changeFolder': 'Change folder',
      'dashboard.eyebrow': 'your garden ・ day {day}',
      'dashboard.title': '{count} plants are growing',
      'dashboard.level': 'scholar ・ level {level}',
      'dashboard.streak': 'Streak',
      'dashboard.studyTotal': 'Study total',
      'dashboard.studyTotalSub': 'All entries',
      'dashboard.sleepAverage': 'Sleep avg',
      'dashboard.sleepAverageSub': 'Logged days',
      'dashboard.todayCare': "Today's care",
      'dashboard.todayCareSub': 'Completed plants',
      'dashboard.today': 'today',
      'dashboard.goToday': 'Go log',
      'dashboard.goPlan': 'Write plan',
      'dashboard.nextAction': 'Next step',
      'dashboard.planPrompt': 'Start by choosing one thing for today.',
      'dashboard.todayPrompt': 'Log today to keep the garden growing.',
      'dashboard.donePrompt': 'Today is cared for. You can reflect or add reading notes.',
      'dashboard.todaySummary': '{done} / {total} plants were watered',
      'dashboard.studyWeeks': 'study ・ last 4 weeks',
      'dashboard.perDay': 'min / day',
      'dashboard.noEntries': 'No entries yet',
      'dashboard.past': 'past',
      'dashboard.now': 'today',
      'dashboard.badges': 'badges',
      'plan.eyebrow': 'plan ・ {date}',
      'plan.title': "Today's plan",
      'plan.body': 'Write the plan first to grow the Plan plant.',
      'plan.placeholder': 'Write what you will do today',
      'plan.saved': 'Plan saved {time}',
      'plan.empty': 'The Plan plant is missing. Check the plan plant in Settings.',
      'today.eyebrow': 'water ・ {date} ・ {day}',
      'today.title': "Today's log",
      'today.progress': '{done} of {total} plants complete.',
      'today.noPlants': 'Add plants from Settings.',
      'today.saved': 'Saved {time}',
      'today.unsaved': 'Unsaved',
      'today.changed': 'Unsaved changes',
      'today.completeReady': 'Required fields are complete',
      'today.missingRequired': '{count} required fields missing',
      'today.missingRequiredList': 'Missing: {items}',
      'today.moreMissing': '{count} more',
      'today.planDone': "Today's plan: {plan}",
      'today.planEmpty': "Today's plan is empty.",
      'today.editPlan': 'Plan',
      'today.reset': 'Reset',
      'today.save': 'Water',
      'today.saving': 'Saving...',
      'today.done': 'Done',
      'today.pending': 'Pending',
      'today.yes': 'Yes',
      'today.no': 'No',
      'today.unselected': 'Unselected',
      'today.writePlaceholder': 'Write {label}',
      'today.avoidanceHelp': 'Closer to 0 gives more XP',
      'settings.title': 'Settings',
      'settings.eyebrow': 'settings',
      'settings.appName': 'App name',
      'settings.startDate': 'Start date',
      'settings.saveSettings': 'Save settings',
      'settings.plants': 'Plants',
      'settings.newPlant': 'New plant',
      'settings.edit': 'Edit',
      'settings.delete': 'Delete',
      'settings.up': '↑',
      'settings.down': '↓',
      'settings.editor': 'plant editor',
      'settings.cancel': 'Cancel',
      'settings.savePlant': 'Save plant',
      'settings.plantId': 'ID',
      'settings.plantName': 'English name',
      'settings.plantJp': 'Display name',
      'settings.emoji': 'Emoji',
      'settings.color': 'Color',
      'settings.desc': 'Description',
      'settings.visible': 'Visible',
      'settings.fieldId': 'Field ID',
      'settings.fieldLabel': 'Label',
      'settings.fieldType': 'Type',
      'settings.fieldUnit': 'Unit',
      'settings.fieldRequired': 'Required',
      'settings.fieldOptions': 'Options',
      'settings.addField': 'Add field',
      'settings.hidden': 'Hidden',
      'settings.show': 'Show',
      'settings.hide': 'Hide',
      'settings.newPlantName': 'New plant',
      'settings.deletePlantConfirm': 'Delete this plant? Existing daily entries will remain in JSON but the plant is hidden from the app.',
      'settings.deleteFieldConfirm': 'Delete this field? Existing daily values for this field remain in JSON but will no longer be shown.',
      'library.eyebrow': 'library ・ words',
      'library.title': 'Things you read and noticed',
      'library.books': 'Books',
      'library.notes': 'Notes',
      'library.articles': 'Articles',
      'library.add': 'Add',
      'library.empty': 'No items yet',
      'library.deleteConfirm': 'Delete this library item?',
      'library.titleField': 'Title',
      'library.author': 'Author',
      'library.source': 'Source',
      'library.progress': 'Progress %',
      'library.status': 'Status',
      'library.tags': 'Tags',
      'library.body': 'Body',
      'library.done': 'Done',
      'study.eyebrow': 'study log ・ mind',
      'study.title': '{hours} hours in the deep woods',
      'study.byTopic': 'by topic',
      'study.empty': 'No study logs yet.',
      'study.recent': 'recent sessions',
      'study.noSessions': 'No sessions yet.',
      'validation.titleRequired': 'Title is required.',
      'validation.url': 'URL must start with http:// or https://.',
      'validation.progress': 'Book progress must be between 0 and 100%.',
      'validation.plantName': 'Plant display name is required.',
      'validation.plantId': 'Plant ID is required.',
      'validation.fieldRequired': 'Add at least one field.',
      'validation.fieldId': 'Field ID is required.',
      'validation.duplicateField': 'Duplicate field ID: {id}',
      'validation.fieldLabel': 'Field label is required.',
      'validation.selectOptions': 'Select fields need at least one option.',
      'actions.save': 'Save',
      'actions.saved': 'Saved',
      'actions.done': 'Done',
      'actions.pending': 'Pending',
      'units.days': 'days',
      'units.hours': 'hours',
      'units.minutes': 'min',
      'units.sessions': 'sessions',
      'units.entries': 'entries',
      'units.entry': 'entry',
      'units.count': 'times',
      'values.empty': '-',
      'values.good': 'Good',
      'values.normal': 'Normal',
      'values.light': 'Light',
      'plants.mind': 'Learning',
      'plants.plan': 'Plan',
      'plants.body': 'Body',
      'plants.avoid': 'Avoid',
      'plants.rest': 'Rest',
      'plants.words': 'Words',
      'plants.reflect': 'Reflect',
      'plants.craft': 'Craft',
      'fields.study_minutes': 'Study time',
      'fields.study_topic': 'Topic',
      'fields.study_note': 'Study note',
      'fields.today_plan': "Today's plan",
      'fields.workout': 'Moved your body',
      'fields.body_note': 'Workout note',
      'fields.avoid_count': 'Count of things you wanted to avoid',
      'fields.sleep': 'Sleep hours',
      'fields.sleep_quality': 'Sleep quality',
      'fields.reading_title': 'What you read',
      'fields.reading_pages': 'Pages',
      'fields.reading_note': 'Reading note',
      'fields.memo': 'Reflection note',
      'fields.tomorrow': 'Tomorrow',
      'fields.craft_minutes': 'Making time',
      'fields.craft_note': 'What you made',
    },
  };

  const dayName = (d) => ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const todayKey = () => fmtDate(new Date());
  const nowIso = () => new Date().toISOString();
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const supportedLanguage = (lang) => (lang === 'en' ? 'en' : 'ja');

  function t(lang, key, params = {}) {
    const language = supportedLanguage(lang);
    const template = TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.ja[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, name) => (
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`
    ));
  }

  function displayPlantName(plant, lang = 'ja') {
    const translated = t(lang, `plants.${plant?.id || ''}`);
    if (translated !== `plants.${plant?.id || ''}`) return translated;
    return lang === 'en'
      ? String(plant?.name || plant?.jp || plant?.id || '')
      : String(plant?.jp || plant?.name || plant?.id || '');
  }

  function displayFieldLabel(field, lang = 'ja') {
    const translated = t(lang, `fields.${field?.id || ''}`);
    if (translated !== `fields.${field?.id || ''}`) return translated;
    return String(field?.label || field?.id || '');
  }

  function parseDateKey(key) {
    const [y, m, d] = String(key).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function diffDays(fromKey, toKey) {
    const from = parseDateKey(fromKey);
    const to = parseDateKey(toKey);
    return Math.max(0, Math.floor((to - from) / 86400000));
  }

  function makeFileBase() {
    return { schemaVersion: SCHEMA_VERSION, updatedAt: nowIso() };
  }

  function createDefaultPlants() {
    return [
      {
        id: 'mind',
        name: 'mind',
        jp: '学び',
        emoji: '🌳',
        color: 'leaf-700',
        desc: 'system design, books, deep work',
        visible: true,
        sort: 10,
        fields: [
          { id: 'study_minutes', label: '学習時間', type: 'duration', required: true, unit: '分' },
          { id: 'study_topic', label: 'トピック', type: 'select', required: true, options: DEFAULT_TOPICS },
          { id: 'study_note', label: '学びメモ', type: 'textarea', required: false },
        ],
      },
      {
        id: 'plan',
        name: 'plan',
        jp: '計画',
        emoji: '🗓️',
        color: 'pollen',
        desc: '今日やることを先に決める',
        visible: true,
        sort: 15,
        fields: [
          { id: 'today_plan', label: '今日の予定', type: 'textarea', required: true },
        ],
      },
      {
        id: 'body',
        name: 'body',
        jp: 'からだ',
        emoji: '🌿',
        color: 'leaf-500',
        desc: '走る、歩く、ストレッチ',
        visible: true,
        sort: 20,
        fields: [
          { id: 'workout', label: '体を動かした', type: 'boolean', required: true },
          { id: 'body_note', label: '運動メモ', type: 'text', required: false },
        ],
      },
      {
        id: 'avoid',
        name: 'avoid',
        jp: '控える',
        emoji: '🌿',
        color: 'bloom',
        desc: 'やらないほど育つ項目',
        visible: true,
        sort: 25,
        fields: [
          { id: 'avoid_count', label: 'やらなかったらよいことの回数', type: 'avoidance_count', required: true, unit: '回' },
        ],
      },
      {
        id: 'rest',
        name: 'rest',
        jp: 'やすみ',
        emoji: '🌙',
        color: 'sky',
        desc: '睡眠の量と質',
        visible: true,
        sort: 30,
        fields: [
          { id: 'sleep', label: '睡眠時間', type: 'number', required: true, unit: '時間' },
          { id: 'sleep_quality', label: '睡眠の質', type: 'select', required: false, options: ['よい', '普通', '浅い'] },
        ],
      },
      {
        id: 'words',
        name: 'words',
        jp: 'ことば',
        emoji: '🌸',
        color: 'petal',
        desc: '読書 · 記事 · 動画ノート',
        visible: true,
        sort: 40,
        fields: [
          { id: 'reading_title', label: '読んだもの', type: 'text', required: false },
          { id: 'reading_pages', label: 'ページ数', type: 'number', required: false, unit: 'ページ' },
          { id: 'reading_note', label: '読書メモ', type: 'textarea', required: false },
        ],
      },
      {
        id: 'reflect',
        name: 'reflect',
        jp: 'ふりかえり',
        emoji: '✦',
        color: 'pollen',
        desc: '気づき · 明日やること',
        visible: true,
        sort: 50,
        fields: [
          { id: 'memo', label: '気づき・メモ', type: 'textarea', required: true },
          { id: 'tomorrow', label: '明日やること', type: 'text', required: false },
        ],
      },
      {
        id: 'craft',
        name: 'craft',
        jp: 'つくる',
        emoji: '🌱',
        color: 'bloom',
        desc: '副業・サイドプロジェクト',
        visible: true,
        sort: 60,
        fields: [
          { id: 'craft_minutes', label: '制作時間', type: 'duration', required: false, unit: '分' },
          { id: 'craft_note', label: '作ったもの', type: 'textarea', required: false },
        ],
      },
    ];
  }

  function createSettings() {
    return {
      ...makeFileBase(),
      appName: 'Garden',
      startDate: todayKey(),
      lastOpenedDate: todayKey(),
    };
  }

  function createPlantsFile() {
    return { ...makeFileBase(), plants: createDefaultPlants() };
  }

  function createEntriesFile() {
    return { ...makeFileBase(), entries: {} };
  }

  function createLibraryFile() {
    return { ...makeFileBase(), books: [], notes: [], articles: [] };
  }

  function createInitialData() {
    return {
      settings: createSettings(),
      plants: createPlantsFile(),
      entries: createEntriesFile(),
      library: createLibraryFile(),
    };
  }

  function normalizeSettings(value) {
    const fallback = createSettings();
    const src = value && typeof value === 'object' ? value : {};
    return {
      ...fallback,
      ...src,
      schemaVersion: SCHEMA_VERSION,
      startDate: src.startDate || fallback.startDate,
      updatedAt: src.updatedAt || fallback.updatedAt,
    };
  }

  function normalizeField(field, index) {
    const type = FIELD_TYPES.includes(field?.type) ? field.type : 'text';
    const id = safeId(field?.id || `field_${index + 1}`);
    const out = {
      id,
      label: String(field?.label || id),
      type,
      required: !!field?.required,
    };
    if (field?.unit) out.unit = String(field.unit);
    if (type === 'select') {
      out.options = Array.isArray(field?.options) && field.options.length
        ? field.options.map(String)
        : ['未分類'];
    }
    if (field?.deletedAt) out.deletedAt = field.deletedAt;
    return out;
  }

  function normalizePlant(plant, index) {
    const fallback = createDefaultPlants()[index] || createDefaultPlants()[0];
    const id = safeId(plant?.id || fallback.id || `plant_${index + 1}`);
    return {
      id,
      name: String(plant?.name || id),
      jp: String(plant?.jp || plant?.name || id),
      emoji: String(plant?.emoji || fallback.emoji || '🌱'),
      color: String(plant?.color || fallback.color || 'leaf-500'),
      desc: String(plant?.desc || ''),
      visible: plant?.visible !== false,
      sort: Number.isFinite(Number(plant?.sort)) ? Number(plant.sort) : (index + 1) * 10,
      fields: Array.isArray(plant?.fields) ? plant.fields.map(normalizeField) : [],
      ...(plant?.deletedAt ? { deletedAt: plant.deletedAt } : {}),
    };
  }

  function normalizePlantsFile(value) {
    const fallback = createPlantsFile();
    const src = value && typeof value === 'object' ? value : {};
    const plants = ensureCurrentDefaultPlants(Array.isArray(src.plants) && src.plants.length
      ? src.plants.map(normalizePlant)
      : fallback.plants);
    return {
      ...fallback,
      ...src,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: src.updatedAt || fallback.updatedAt,
      plants,
    };
  }

  function ensureCurrentDefaultPlants(plants) {
    const next = Array.isArray(plants) ? plants.slice() : [];
    const ids = new Set(next.map((plant) => plant?.id));
    createDefaultPlants()
      .filter((plant) => ['plan', 'avoid'].includes(plant.id) && !ids.has(plant.id))
      .forEach((plant) => next.push(clone(plant)));
    return next;
  }

  function normalizeEntriesFile(value) {
    const fallback = createEntriesFile();
    const src = value && typeof value === 'object' ? value : {};
    const rawEntries = src.entries && typeof src.entries === 'object' ? src.entries : {};
    const entries = {};
    Object.keys(rawEntries).sort().forEach((date) => {
      const entry = rawEntries[date] || {};
      entries[date] = {
        date,
        values: entry.values && typeof entry.values === 'object' ? entry.values : {},
        updatedAt: entry.updatedAt || src.updatedAt || fallback.updatedAt,
      };
    });
    return {
      ...fallback,
      ...src,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: src.updatedAt || fallback.updatedAt,
      entries,
    };
  }

  function mergePlanEntryValues(currentValues, planValues) {
    return {
      ...clone(currentValues || {}),
      plan: {
        ...clone((currentValues || {}).plan || {}),
        ...clone(planValues || {}),
      },
    };
  }

  function normalizeLibraryItem(item, kind, index) {
    const id = safeId(item?.id || `${kind}_${Date.now()}_${index}`);
    const base = {
      id,
      title: String(item?.title || ''),
      tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
      createdAt: item?.createdAt || nowIso(),
      updatedAt: item?.updatedAt || item?.createdAt || nowIso(),
    };
    if (item?.deletedAt) base.deletedAt = item.deletedAt;
    if (kind === 'books') {
      return {
        ...base,
        author: String(item?.author || ''),
        progress: clamp(Number(item?.progress || 0), 0, 1),
        status: item?.status || 'reading',
        body: String(item?.body || ''),
      };
    }
    if (kind === 'articles') {
      return {
        ...base,
        url: String(item?.url || ''),
        source: String(item?.source || ''),
        status: item?.status || 'unread',
        body: String(item?.body || ''),
      };
    }
    return {
      ...base,
      body: String(item?.body || ''),
    };
  }

  function normalizeLibraryFile(value) {
    const fallback = createLibraryFile();
    const src = value && typeof value === 'object' ? value : {};
    return {
      ...fallback,
      ...src,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: src.updatedAt || fallback.updatedAt,
      books: Array.isArray(src.books) ? src.books.map((x, i) => normalizeLibraryItem(x, 'books', i)) : [],
      notes: Array.isArray(src.notes) ? src.notes.map((x, i) => normalizeLibraryItem(x, 'notes', i)) : [],
      articles: Array.isArray(src.articles) ? src.articles.map((x, i) => normalizeLibraryItem(x, 'articles', i)) : [],
    };
  }

  function unsupportedSchemaVersion(value) {
    if (!value || typeof value !== 'object' || value.schemaVersion == null) return null;
    const version = Number(value.schemaVersion);
    if (!Number.isFinite(version) || version > SCHEMA_VERSION) return value.schemaVersion;
    return null;
  }

  function makeIssue(path, code, message) {
    return { path, code, message };
  }

  function validateField(field, path, seenIds) {
    const issues = [];
    const rawId = String(field?.id || '').trim();
    const id = safeId(rawId);
    if (!rawId) {
      issues.push(makeIssue(`${path}.id`, 'required', 'Field ID is required.'));
    } else if (seenIds.has(id)) {
      issues.push(makeIssue(`${path}.id`, 'duplicate_id', `Duplicate field ID: ${id}`));
    } else {
      seenIds.add(id);
    }
    if (!String(field?.label || '').trim()) {
      issues.push(makeIssue(`${path}.label`, 'required', 'Field label is required.'));
    }
    if (!FIELD_TYPES.includes(field?.type)) {
      issues.push(makeIssue(`${path}.type`, 'invalid_type', `Field type must be one of: ${FIELD_TYPES.join(', ')}`));
    }
    const options = Array.isArray(field?.options)
      ? field.options.map(String).map((x) => x.trim()).filter(Boolean)
      : [];
    if (field?.type === 'select' && options.length === 0) {
      issues.push(makeIssue(`${path}.options`, 'required', 'Select fields need at least one option.'));
    }
    return issues;
  }

  function validatePlantsFile(value) {
    const issues = [];
    const plants = Array.isArray(value?.plants) ? value.plants : [];
    const seenPlantIds = new Set();
    plants.forEach((plant, plantIndex) => {
      if (plant?.deletedAt) return;
      const path = `plants[${plantIndex}]`;
      const rawId = String(plant?.id || '').trim();
      const id = safeId(rawId);
      if (!rawId) {
        issues.push(makeIssue(`${path}.id`, 'required', 'Plant ID is required.'));
      } else if (seenPlantIds.has(id)) {
        issues.push(makeIssue(`${path}.id`, 'duplicate_id', `Duplicate plant ID: ${id}`));
      } else {
        seenPlantIds.add(id);
      }
      if (!String(plant?.jp || plant?.name || '').trim()) {
        issues.push(makeIssue(`${path}.name`, 'required', 'Plant name is required.'));
      }
      const fields = Array.isArray(plant?.fields) ? plant.fields.filter((field) => !field?.deletedAt) : [];
      if (fields.length === 0) {
        issues.push(makeIssue(`${path}.fields`, 'required', 'Plant needs at least one field.'));
      }
      const seenFieldIds = new Set();
      fields.forEach((field, fieldIndex) => {
        issues.push(...validateField(field, `${path}.fields[${fieldIndex}]`, seenFieldIds));
      });
    });
    return issues;
  }

  function validationError(key, issues) {
    const fileName = FILES[key] || key;
    const message = issues.slice(0, 3).map((issue) => issue.message).join(' ');
    const suffix = issues.length > 3 ? ` (+${issues.length - 3} more)` : '';
    return new Error(`${fileName} validation failed: ${message}${suffix}`);
  }

  function normalizeData(data) {
    return {
      settings: normalizeSettings(data?.settings),
      plants: normalizePlantsFile(data?.plants),
      entries: normalizeEntriesFile(data?.entries),
      library: normalizeLibraryFile(data?.library),
    };
  }

  function safeId(value) {
    const id = String(value || '').trim().toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return id || `id_${Math.random().toString(36).slice(2, 8)}`;
  }

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function getActivePlants(plantsFile) {
    return (plantsFile?.plants || [])
      .filter((p) => !p.deletedAt && p.visible !== false)
      .slice()
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  function getActiveFields(plant) {
    return (plant?.fields || []).filter((f) => !f.deletedAt);
  }

  function missingRequiredFields(plant, plantValues) {
    return getActiveFields(plant).filter((field) => field.required && !isFilled(field, plantValues?.[field.id]));
  }

  function isFilled(field, value) {
    if (field.type === 'boolean') return value === true || value === false;
    if (field.type === 'avoidance_count') return Number.isFinite(Number(value)) && Number(value) >= 0;
    if (field.type === 'number' || field.type === 'duration') return Number.isFinite(Number(value)) && Number(value) > 0;
    return String(value || '').trim().length > 0;
  }

  function isPlantDone(plant, plantValues) {
    const fields = getActiveFields(plant);
    const required = missingRequiredFields(plant, plantValues);
    if (fields.some((f) => f.required)) return required.length === 0;
    return fields.some((f) => isFilled(f, plantValues?.[f.id]));
  }

  function fieldXp(field, value) {
    if (!isFilled(field, value)) return 0;
    if (field.type === 'boolean') return value === true ? 5 : 0;
    if (field.type === 'avoidance_count') return Math.max(0, 12 - Math.floor(Number(value)) * 3);
    if (field.type === 'duration') return Math.min(12, Math.floor(Number(value) / 15));
    if (field.type === 'number') return Math.min(10, Math.ceil(Number(value)));
    return 3;
  }

  function plantEntryXp(plant, plantValues) {
    if (!isPlantDone(plant, plantValues)) return 0;
    const fields = getActiveFields(plant);
    const fieldTotal = fields.reduce((sum, field) => sum + fieldXp(field, plantValues?.[field.id]), 0);
    if (fields.length > 0 && fields.every((field) => field.type === 'avoidance_count')) return fieldTotal;
    return 10 + fieldTotal;
  }

  function entryHasAnyDonePlant(entry, plants) {
    return plants.some((plant) => isPlantDone(plant, entry?.values?.[plant.id]));
  }

  function countStreak(entries, plants, today) {
    let streak = 0;
    const d = parseDateKey(today);
    while (true) {
      const key = fmtDate(d);
      const entry = entries[key];
      if (!entry || !entryHasAnyDonePlant(entry, plants)) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function countPlantStreak(entries, plant, today) {
    let streak = 0;
    const d = parseDateKey(today);
    while (true) {
      const key = fmtDate(d);
      const entry = entries[key];
      if (!entry || !isPlantDone(plant, entry.values?.[plant.id])) break;
      streak += 1;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function plantStage(xp, streak) {
    if (xp >= 400 || streak >= 21) return 4;
    if (xp >= 150 || streak >= 7) return 3;
    if (xp >= 50 || streak >= 3) return 2;
    if (xp > 0 || streak > 0) return 1;
    return 0;
  }

  function formatValue(field, value) {
    if (!isFilled(field, value)) return '—';
    if (field.type === 'boolean') return value ? 'はい' : 'いいえ';
    if (field.type === 'avoidance_count') return `${value}${field.unit || '回'}`;
    if (field.type === 'duration') return `${value}分`;
    if (field.unit) return `${value}${field.unit}`;
    return String(value);
  }

  function displayTotalForPlant(plant, entries) {
    const allValues = Object.values(entries).map((entry) => entry.values?.[plant.id] || {});
    if (plant.id === 'mind') {
      const minutes = allValues.reduce((sum, v) => sum + Number(v.study_minutes || 0), 0);
      return { total: Math.round(minutes / 60 * 10) / 10, unit: 'h' };
    }
    if (plant.id === 'body') {
      return { total: allValues.filter((v) => v.workout === true).length, unit: 'sessions' };
    }
    if (plant.id === 'rest') {
      const sleeps = allValues.map((v) => Number(v.sleep)).filter((n) => Number.isFinite(n) && n > 0);
      const avg = sleeps.length ? sleeps.reduce((s, n) => s + n, 0) / sleeps.length : 0;
      return { total: Math.round(avg * 10) / 10, unit: 'h avg' };
    }
    const done = Object.values(entries).filter((entry) => isPlantDone(plant, entry.values?.[plant.id])).length;
    return { total: done, unit: done === 1 ? 'entry' : 'entries' };
  }

  function derive(data, today = todayKey()) {
    const normalized = normalizeData(data);
    const entries = normalized.entries.entries || {};
    const plants = getActivePlants(normalized.plants);
    const todayEntry = entries[today] || { date: today, values: {} };
    const todayStatus = plants.map((plant) => {
      const plantValues = todayEntry.values?.[plant.id] || {};
      const done = isPlantDone(plant, plantValues);
      const firstFilled = getActiveFields(plant).find((field) => isFilled(field, plantValues[field.id]));
      return {
        plant,
        label: plant.jp,
        value: firstFilled ? formatValue(firstFilled, plantValues[firstFilled.id]) : '—',
        state: done ? 'done' : 'pending',
      };
    });
    const planStatus = todayStatus.find((status) => status.plant.id === 'plan') || null;
    const careStatus = todayStatus.filter((status) => status.plant.id !== 'plan');
    const plantSummaries = plants.map((plant) => {
      const xp = Object.values(entries).reduce((sum, entry) => sum + plantEntryXp(plant, entry.values?.[plant.id]), 0);
      const streak = countPlantStreak(entries, plant, today);
      const display = displayTotalForPlant(plant, entries);
      return {
        ...plant,
        stage: plantStage(xp, streak),
        streak,
        xp,
        total: display.total,
        unit: display.unit,
      };
    });
    const totalXp = plantSummaries.reduce((sum, plant) => sum + plant.xp, 0);
    const level = Math.floor(totalXp / 500) + 1;
    const nextLevel = level * 500;
    const entryList = Object.keys(entries).sort().map((date) => ({
      date,
      day: parseDateKey(date),
      logged: entryHasAnyDonePlant(entries[date], plants),
      values: entries[date].values,
      study: Number(entries[date].values?.mind?.study_minutes || 0),
      topic: entries[date].values?.mind?.study_topic || '',
      sleep: Number(entries[date].values?.rest?.sleep || 0) || null,
      workout: entries[date].values?.body?.workout === true,
    }));
    const byTopic = {};
    entryList.forEach((entry) => {
      if (!entry.topic || !entry.study) return;
      byTopic[entry.topic] = (byTopic[entry.topic] || 0) + entry.study;
    });
    const library = normalized.library;
    const visible = (items) => items.filter((item) => !item.deletedAt);
    return {
      todayKey: today,
      dayName,
      fmtDate,
      plants: plantSummaries,
      entries: entryList,
      today: {
        done: todayStatus.filter((s) => s.state === 'done').length,
        total: todayStatus.length,
        status: todayStatus,
        careDone: careStatus.filter((s) => s.state === 'done').length,
        careTotal: careStatus.length,
        careStatus,
      },
      plan: planStatus,
      streak: countStreak(entries, plants, today),
      dayNum: diffDays(normalized.settings.startDate, today) + 1,
      level: { level, totalXp, nextLevel },
      study: {
        totalMinutes: entryList.reduce((sum, entry) => sum + entry.study, 0),
        byTopic,
        recentSessions: entryList.filter((entry) => entry.topic && entry.study).slice(-12).reverse(),
      },
      library: {
        books: visible(library.books),
        notes: visible(library.notes),
        articles: visible(library.articles),
      },
      raw: normalized,
    };
  }

  async function writeJsonFile(directoryHandle, fileName, value) {
    const handle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    await writable.write(`${JSON.stringify(value, null, 2)}\n`);
    await writable.close();
  }

  async function readJsonFile(directoryHandle, fileName, fallbackFactory, normalize, warnings, created) {
    try {
      const handle = await directoryHandle.getFileHandle(fileName);
      const file = await handle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text);
      const unsupported = unsupportedSchemaVersion(parsed);
      if (unsupported != null) {
        warnings.push({ file: fileName, message: `Unsupported schemaVersion ${unsupported}; using defaults for this file.` });
        return fallbackFactory();
      }
      return normalize(parsed);
    } catch (err) {
      if (err?.name === 'NotFoundError') {
        const fallback = fallbackFactory();
        await writeJsonFile(directoryHandle, fileName, fallback);
        created.push(fileName);
        return fallback;
      }
      if (err?.name === 'SyntaxError') {
        warnings.push({ file: fileName, message: 'JSONを読み込めませんでした。初期値で表示しています。' });
        return fallbackFactory();
      }
      throw err;
    }
  }

  async function loadFromDirectory(directoryHandle) {
    const warnings = [];
    const created = [];
    const [settings, plants, entries, library] = await Promise.all([
      readJsonFile(directoryHandle, FILES.settings, createSettings, normalizeSettings, warnings, created),
      readJsonFile(directoryHandle, FILES.plants, createPlantsFile, normalizePlantsFile, warnings, created),
      readJsonFile(directoryHandle, FILES.entries, createEntriesFile, normalizeEntriesFile, warnings, created),
      readJsonFile(directoryHandle, FILES.library, createLibraryFile, normalizeLibraryFile, warnings, created),
    ]);
    const data = {
      settings,
      plants,
      entries,
      library,
    };
    return { data: normalizeData(data), warnings, created };
  }

  function touchFile(value) {
    return { ...clone(value), schemaVersion: SCHEMA_VERSION, updatedAt: nowIso() };
  }

  async function saveFile(directoryHandle, key, value) {
    const fileName = FILES[key];
    if (!fileName) throw new Error(`Unknown garden file key: ${key}`);
    const data = touchFile(value);
    if (key === 'plants') {
      const issues = validatePlantsFile(data);
      if (issues.length) throw validationError(key, issues);
    }
    await writeJsonFile(directoryHandle, fileName, data);
    return data;
  }

  async function saveAll(directoryHandle, data) {
    const normalized = normalizeData(data);
    const next = {
      settings: await saveFile(directoryHandle, 'settings', normalized.settings),
      plants: await saveFile(directoryHandle, 'plants', normalized.plants),
      entries: await saveFile(directoryHandle, 'entries', normalized.entries),
      library: await saveFile(directoryHandle, 'library', normalized.library),
    };
    return normalizeData(next);
  }

  function supportsRememberedDirectory() {
    return !!window.indexedDB;
  }

  function openRememberedDirectoryDb() {
    if (!supportsRememberedDirectory()) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(REMEMBERED_DIRECTORY_DB, REMEMBERED_DIRECTORY_DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(REMEMBERED_DIRECTORY_STORE)) {
          db.createObjectStore(REMEMBERED_DIRECTORY_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = () => reject(request.error || new Error('Could not open remembered folder storage.'));
    });
  }

  async function withRememberedDirectoryStore(mode, operation) {
    const db = await openRememberedDirectoryDb();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      let settled = false;
      const close = () => {
        if (typeof db.close === 'function') db.close();
      };
      const settle = (fn, value) => {
        if (settled) return;
        settled = true;
        close();
        fn(value);
      };
      const tx = db.transaction(REMEMBERED_DIRECTORY_STORE, mode);
      tx.onerror = () => settle(reject, tx.error || new Error('Remembered folder transaction failed.'));
      tx.onabort = () => settle(reject, tx.error || new Error('Remembered folder transaction was aborted.'));
      const request = operation(tx.objectStore(REMEMBERED_DIRECTORY_STORE));
      request.onsuccess = (event) => settle(resolve, event.target.result);
      request.onerror = () => settle(reject, request.error || new Error('Remembered folder request failed.'));
    });
  }

  async function rememberDirectory(directoryHandle) {
    if (!directoryHandle || !supportsRememberedDirectory()) return false;
    await withRememberedDirectoryStore('readwrite', (store) => store.put({
      id: REMEMBERED_DIRECTORY_KEY,
      name: directoryHandle.name || '',
      handle: directoryHandle,
      updatedAt: nowIso(),
    }));
    return true;
  }

  async function loadRememberedDirectory() {
    if (!supportsRememberedDirectory()) return null;
    const record = await withRememberedDirectoryStore('readonly', (store) => store.get(REMEMBERED_DIRECTORY_KEY));
    return record?.handle || null;
  }

  async function forgetRememberedDirectory() {
    if (!supportsRememberedDirectory()) return false;
    await withRememberedDirectoryStore('readwrite', (store) => store.delete(REMEMBERED_DIRECTORY_KEY));
    return true;
  }

  async function queryPermission(directoryHandle) {
    if (!directoryHandle?.queryPermission) return 'granted';
    const opts = { mode: 'readwrite' };
    return await directoryHandle.queryPermission(opts);
  }

  async function ensurePermission(directoryHandle) {
    const opts = { mode: 'readwrite' };
    if (await queryPermission(directoryHandle) === 'granted') return true;
    if (!directoryHandle?.requestPermission) return false;
    return await directoryHandle.requestPermission(opts) === 'granted';
  }

  async function pickDirectory() {
    if (typeof window.showDirectoryPicker !== 'function') {
      throw new Error('このブラウザはフォルダ保存に対応していません。Chrome または Edge で開いてください。');
    }
    const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (!await ensurePermission(directoryHandle)) {
      throw new Error('フォルダへの読み書き権限がありません。');
    }
    return directoryHandle;
  }

  function activeLibraryItems(library, kind) {
    return (library?.[kind] || []).filter((item) => !item.deletedAt);
  }

  const GardenSchema = {
    SCHEMA_VERSION,
    FILES,
    FILE_ORDER,
    FIELD_TYPES,
    DEFAULT_TOPICS,
    createInitialData,
    createSettings,
    createPlantsFile,
    createEntriesFile,
    createLibraryFile,
    createDefaultPlants,
    normalizeData,
    normalizeSettings,
    normalizePlantsFile,
    normalizeEntriesFile,
    normalizeLibraryFile,
    validatePlantsFile,
    mergePlanEntryValues,
    storageFileNames: () => FILE_ORDER.map((key) => FILES[key]),
    safeId,
    todayKey,
    fmtDate,
    dayName,
    nowIso,
  };

  const GardenCalc = {
    derive,
    getActivePlants,
    getActiveFields,
    missingRequiredFields,
    isFilled,
    isPlantDone,
    plantEntryXp,
    formatValue,
  };

  const GardenStore = {
    supportsFileSystemAccess: () => typeof window.showDirectoryPicker === 'function',
    supportsRememberedDirectory,
    pickDirectory,
    queryPermission,
    ensurePermission,
    rememberDirectory,
    loadRememberedDirectory,
    forgetRememberedDirectory,
    loadFromDirectory,
    saveFile,
    saveAll,
    writeJsonFile,
    activeLibraryItems,
  };

  const GardenI18n = {
    LANGUAGE_STORAGE_KEY,
    TRANSLATIONS,
    supportedLanguage,
    t,
    displayPlantName,
    displayFieldLabel,
  };

  const initial = createInitialData();
  const initialSummary = derive(initial, todayKey());
  window.GardenSchema = GardenSchema;
  window.GardenCalc = GardenCalc;
  window.GardenStore = GardenStore;
  window.GardenI18n = GardenI18n;
  window.MOCK = {
    PLANTS: initialSummary.plants,
    BOOKS: initialSummary.library.books,
    NOTES: initialSummary.library.notes,
    TOPICS: DEFAULT_TOPICS,
    DAYS: initialSummary.entries,
    TODAY_KEY: initialSummary.todayKey,
    STREAK: initialSummary.streak,
    DAY_NUM: initialSummary.dayNum,
    TOTAL_XP: initialSummary.level.totalXp,
    NEXT_LEVEL: initialSummary.level.nextLevel,
    LEVEL: initialSummary.level.level,
    fmtDate,
    dayName,
    lastNDays: (n) => initialSummary.entries.slice(-n),
  };
})();
