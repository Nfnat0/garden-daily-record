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
  const FIELD_TYPES = ['number', 'duration', 'boolean', 'select', 'text', 'textarea'];
  const DEFAULT_TOPICS = ['system-design', 'go', 'database', 'distributed-systems', 'algorithms', 'product', 'writing', 'kubernetes'];

  const dayName = (d) => ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const todayKey = () => fmtDate(new Date());
  const nowIso = () => new Date().toISOString();
  const clone = (value) => JSON.parse(JSON.stringify(value));

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
    const plants = Array.isArray(src.plants) && src.plants.length
      ? src.plants.map(normalizePlant)
      : fallback.plants;
    return {
      ...fallback,
      ...src,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: src.updatedAt || fallback.updatedAt,
      plants,
    };
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

  function isFilled(field, value) {
    if (field.type === 'boolean') return value === true || value === false;
    if (field.type === 'number' || field.type === 'duration') return Number.isFinite(Number(value)) && Number(value) > 0;
    return String(value || '').trim().length > 0;
  }

  function isPlantDone(plant, plantValues) {
    const fields = getActiveFields(plant);
    const required = fields.filter((f) => f.required);
    if (required.length) {
      return required.every((f) => isFilled(f, plantValues?.[f.id]));
    }
    return fields.some((f) => isFilled(f, plantValues?.[f.id]));
  }

  function fieldXp(field, value) {
    if (!isFilled(field, value)) return 0;
    if (field.type === 'boolean') return value === true ? 5 : 0;
    if (field.type === 'duration') return Math.min(12, Math.floor(Number(value) / 15));
    if (field.type === 'number') return Math.min(10, Math.ceil(Number(value)));
    return 3;
  }

  function plantEntryXp(plant, plantValues) {
    if (!isPlantDone(plant, plantValues)) return 0;
    return 10 + getActiveFields(plant).reduce((sum, field) => sum + fieldXp(field, plantValues?.[field.id]), 0);
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
      },
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
      return normalize(JSON.parse(text));
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
    const data = {
      settings: await readJsonFile(directoryHandle, FILES.settings, createSettings, normalizeSettings, warnings, created),
      plants: await readJsonFile(directoryHandle, FILES.plants, createPlantsFile, normalizePlantsFile, warnings, created),
      entries: await readJsonFile(directoryHandle, FILES.entries, createEntriesFile, normalizeEntriesFile, warnings, created),
      library: await readJsonFile(directoryHandle, FILES.library, createLibraryFile, normalizeLibraryFile, warnings, created),
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

  async function ensurePermission(directoryHandle) {
    if (!directoryHandle?.queryPermission || !directoryHandle?.requestPermission) return true;
    const opts = { mode: 'readwrite' };
    if (await directoryHandle.queryPermission(opts) === 'granted') return true;
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
    isFilled,
    isPlantDone,
    plantEntryXp,
    formatValue,
  };

  const GardenStore = {
    supportsFileSystemAccess: () => typeof window.showDirectoryPicker === 'function',
    pickDirectory,
    ensurePermission,
    loadFromDirectory,
    saveFile,
    saveAll,
    writeJsonFile,
    activeLibraryItems,
  };

  const initial = createInitialData();
  const initialSummary = derive(initial, todayKey());
  window.GardenSchema = GardenSchema;
  window.GardenCalc = GardenCalc;
  window.GardenStore = GardenStore;
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
