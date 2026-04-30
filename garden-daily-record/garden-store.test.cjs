const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadDataModule(windowOverrides = {}) {
  const source = fs.readFileSync(path.join(__dirname, 'data.jsx'), 'utf8');
  const context = {
    window: { ...windowOverrides },
    console,
    Date,
    JSON,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Set,
    Map,
    Promise,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'data.jsx' });
  return context.window;
}

class MemoryFileHandle {
  constructor(dir, name) {
    this.dir = dir;
    this.name = name;
  }

  async getFile() {
    const text = this.dir.files[this.name];
    return { text: async () => text };
  }

  async createWritable() {
    let buffer = '';
    return {
      write: async (content) => {
        buffer += content;
      },
      close: async () => {
        this.dir.files[this.name] = buffer;
      },
    };
  }
}

class MemoryDirectoryHandle {
  constructor(files = {}) {
    this.files = { ...files };
    this.name = 'memory-garden';
  }

  async getFileHandle(name, opts = {}) {
    if (!Object.prototype.hasOwnProperty.call(this.files, name)) {
      if (!opts.create) {
        const err = new Error(`Missing ${name}`);
        err.name = 'NotFoundError';
        throw err;
      }
      this.files[name] = '';
    }
    return new MemoryFileHandle(this, name);
  }
}

function asyncRequest(result, tx = null) {
  const request = { result: undefined, error: null, onsuccess: null, onerror: null };
  setTimeout(() => {
    request.result = result;
    if (request.onsuccess) request.onsuccess({ target: request });
    if (tx?.oncomplete) {
      setTimeout(() => tx.oncomplete({ target: tx }), 0);
    }
  }, 0);
  return request;
}

function createFakeIndexedDB() {
  const databases = new Map();
  return {
    open(name) {
      const request = { result: null, error: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      setTimeout(() => {
        let db = databases.get(name);
        const isNew = !db;
        if (!db) {
          const stores = new Map();
          db = {
            objectStoreNames: {
              contains: (storeName) => stores.has(storeName),
            },
            createObjectStore: (storeName) => {
              if (!stores.has(storeName)) stores.set(storeName, new Map());
            },
            transaction: (storeName) => {
              const store = stores.get(storeName);
              const tx = {
                oncomplete: null,
                onerror: null,
                onabort: null,
                error: null,
                objectStore: () => ({
                  put: (record) => {
                    store.set(record.id, record);
                    return asyncRequest(record.id, tx);
                  },
                  get: (key) => asyncRequest(store.get(key), tx),
                  delete: (key) => {
                    store.delete(key);
                    return asyncRequest(undefined, tx);
                  },
                }),
              };
              return tx;
            },
            close: () => {},
          };
          databases.set(name, db);
        }
        request.result = db;
        if (isNew && request.onupgradeneeded) request.onupgradeneeded({ target: request });
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    },
  };
}

async function testCreatesDefaultFiles() {
  const { GardenStore } = loadDataModule();
  const dir = new MemoryDirectoryHandle();

  const result = await GardenStore.loadFromDirectory(dir);

  assert.equal(result.warnings.length, 0);
  assert.deepEqual(Object.keys(dir.files).sort(), [
    'garden.entries.json',
    'garden.library.json',
    'garden.plants.json',
    'garden.settings.json',
  ]);
  assert.equal(result.data.plants.plants.length, 8);
  assert.equal(result.data.entries.entries && typeof result.data.entries.entries, 'object');
}

async function testAddsNewDefaultPlantsToExistingFiles() {
  const { GardenSchema, GardenStore } = loadDataModule();
  const plantsFile = GardenSchema.createPlantsFile();
  plantsFile.plants = plantsFile.plants.filter((plant) => !['plan', 'avoid'].includes(plant.id));
  const dir = new MemoryDirectoryHandle({
    'garden.plants.json': JSON.stringify(plantsFile),
  });

  const result = await GardenStore.loadFromDirectory(dir);
  const ids = result.data.plants.plants.map((plant) => plant.id);

  assert.equal(ids.includes('plan'), true);
  assert.equal(ids.includes('avoid'), true);
}

async function testCalculatesDerivedGardenState() {
  const { GardenSchema, GardenCalc } = loadDataModule();
  const data = GardenSchema.createInitialData();
  const today = '2026-04-29';
  data.entries.entries[today] = {
    date: today,
    values: {
      mind: { study_minutes: 45, study_topic: 'go' },
      body: { workout: true },
      reflect: { memo: 'よく進んだ', tomorrow: '続きをやる' },
    },
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  const summary = GardenCalc.derive(data, today);

  assert.equal(summary.today.done, 3);
  assert.equal(summary.today.total, 8);
  assert.equal(summary.streak, 1);
  assert.equal(summary.plants.find((p) => p.id === 'mind').stage >= 1, true);
  assert.equal(summary.study.totalMinutes, 45);
  assert.equal(summary.level.totalXp > 0, true);
}

function testPlanEntryAwardsXpAndCompletesPlanPlant() {
  const { GardenSchema, GardenCalc } = loadDataModule();
  const data = GardenSchema.createInitialData();
  const today = '2026-04-29';
  data.entries.entries[today] = {
    date: today,
    values: {
      plan: { today_plan: 'Write the plan before opening mail.' },
    },
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  const summary = GardenCalc.derive(data, today);
  const plan = summary.plants.find((plant) => plant.id === 'plan');

  assert.equal(summary.today.status.find((item) => item.plant.id === 'plan').state, 'done');
  assert.equal(plan.xp > 0, true);
  assert.equal(summary.level.totalXp >= plan.xp, true);
}

function testDeriveSeparatesPlanFromCareProgress() {
  const { GardenSchema, GardenCalc } = loadDataModule();
  const data = GardenSchema.createInitialData();
  const today = '2026-04-29';
  data.entries.entries[today] = {
    date: today,
    values: {
      plan: { today_plan: 'Write the plan before opening mail.' },
      avoid: { avoid_count: 0 },
    },
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  const summary = GardenCalc.derive(data, today);

  assert.equal(summary.plan.state, 'done');
  assert.equal(summary.plan.value, 'Write the plan before opening mail.');
  assert.equal(summary.today.done, 2);
  assert.equal(summary.today.total, 8);
  assert.equal(summary.today.careDone, 1);
  assert.equal(summary.today.careTotal, 7);
  assert.equal(summary.today.careStatus.some((item) => item.plant.id === 'plan'), false);
}

function testMergesPlanEntryWithoutDroppingCareValues() {
  const { GardenSchema } = loadDataModule();
  const data = GardenSchema.createInitialData();
  const today = '2026-04-29';
  data.entries.entries[today] = {
    date: today,
    values: {
      mind: { study_minutes: 45, study_topic: 'go' },
      avoid: { avoid_count: 0 },
    },
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  const values = GardenSchema.mergePlanEntryValues(data.entries.entries[today].values, {
    today_plan: 'Write the plan before opening mail.',
  });

  assert.equal(JSON.stringify(values.mind), JSON.stringify({ study_minutes: 45, study_topic: 'go' }));
  assert.equal(JSON.stringify(values.avoid), JSON.stringify({ avoid_count: 0 }));
  assert.equal(JSON.stringify(values.plan), JSON.stringify({ today_plan: 'Write the plan before opening mail.' }));
}

function testI18nHasRequiredJapaneseAndEnglishKeys() {
  const { GardenI18n } = loadDataModule();
  const keys = [
    'nav.dashboard',
    'nav.plan',
    'nav.today',
    'storage.connectTitle',
    'storage.localFirstTitle',
    'storage.rememberedTitle',
    'storage.rememberedBody',
    'storage.restoreFolder',
    'storage.restoring',
    'storage.forgetFolder',
    'storage.restoreFailed',
    'storage.rememberFailed',
    'storage.previewTitle',
    'storage.filesTitle',
    'storage.connectedHelp',
    'plan.title',
    'today.title',
    'today.changed',
    'today.missingRequired',
    'today.missingRequiredList',
    'settings.title',
    'actions.save',
    'plants.plan',
    'fields.today_plan',
  ];

  keys.forEach((key) => {
    assert.notEqual(GardenI18n.t('ja', key), key);
    assert.notEqual(GardenI18n.t('en', key), key);
  });
  assert.equal(GardenI18n.LANGUAGE_STORAGE_KEY, 'garden.language');
}

async function testRemembersDirectoryHandleInIndexedDb() {
  const dir = new MemoryDirectoryHandle();
  dir.name = 'Garden QA';
  const { GardenStore } = loadDataModule({ indexedDB: createFakeIndexedDB() });

  assert.equal(GardenStore.supportsRememberedDirectory(), true);
  assert.equal(await GardenStore.loadRememberedDirectory(), null);
  assert.equal(await GardenStore.rememberDirectory(dir), true);

  const loaded = await GardenStore.loadRememberedDirectory();
  assert.equal(loaded, dir);
  assert.equal(loaded.name, 'Garden QA');

  assert.equal(await GardenStore.forgetRememberedDirectory(), true);
  assert.equal(await GardenStore.loadRememberedDirectory(), null);
}

async function testSkipsRememberedDirectoryWhenIndexedDbUnavailable() {
  const { GardenStore } = loadDataModule();

  assert.equal(GardenStore.supportsRememberedDirectory(), false);
  assert.equal(await GardenStore.rememberDirectory(new MemoryDirectoryHandle()), false);
  assert.equal(await GardenStore.loadRememberedDirectory(), null);
  assert.equal(await GardenStore.forgetRememberedDirectory(), false);
}

async function testSeparatesPermissionQueryFromRequest() {
  const { GardenStore } = loadDataModule();
  const calls = [];
  const handle = {
    queryPermission: async (opts) => {
      calls.push(['query', opts.mode]);
      return 'prompt';
    },
    requestPermission: async (opts) => {
      calls.push(['request', opts.mode]);
      return 'granted';
    },
  };

  assert.equal(await GardenStore.queryPermission(handle), 'prompt');
  assert.deepEqual(calls, [['query', 'readwrite']]);
  assert.equal(await GardenStore.ensurePermission(handle), true);
  assert.deepEqual(calls, [['query', 'readwrite'], ['query', 'readwrite'], ['request', 'readwrite']]);
}

function testExposesStorageFileNamesForUserFacingCopy() {
  const { GardenSchema } = loadDataModule();

  assert.deepEqual(Array.from(GardenSchema.storageFileNames()), [
    'garden.settings.json',
    'garden.plants.json',
    'garden.entries.json',
    'garden.library.json',
  ]);
}

function testReportsMissingRequiredFieldsForDailyProgress() {
  const { GardenSchema, GardenCalc } = loadDataModule();
  const plant = GardenSchema.createDefaultPlants().find((item) => item.id === 'mind');

  const missing = GardenCalc.missingRequiredFields(plant, { study_minutes: 45 });
  const complete = GardenCalc.missingRequiredFields(plant, { study_minutes: 45, study_topic: 'go' });

  assert.deepEqual(Array.from(missing.map((field) => field.id)), ['study_topic']);
  assert.equal(complete.length, 0);
}

function testAvoidanceCountAwardsMoreXpWhenCloserToZero() {
  const { GardenSchema, GardenCalc } = loadDataModule();
  const data = GardenSchema.createInitialData();
  const today = '2026-04-29';
  const avoid = data.plants.plants.find((plant) => plant.id === 'avoid');

  assert.equal(GardenCalc.isPlantDone(avoid, { avoid_count: 0 }), true);
  assert.equal(GardenCalc.plantEntryXp(avoid, { avoid_count: 0 }), 12);
  assert.equal(GardenCalc.plantEntryXp(avoid, { avoid_count: 1 }), 9);
  assert.equal(GardenCalc.plantEntryXp(avoid, { avoid_count: 2 }), 6);
  assert.equal(GardenCalc.plantEntryXp(avoid, { avoid_count: 3 }), 3);
  assert.equal(GardenCalc.plantEntryXp(avoid, { avoid_count: 4 }), 0);

  data.entries.entries[today] = {
    date: today,
    values: {
      avoid: { avoid_count: 0 },
    },
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  const summary = GardenCalc.derive(data, today);

  assert.equal(summary.today.status.find((item) => item.plant.id === 'avoid').state, 'done');
  assert.equal(summary.plants.find((plant) => plant.id === 'avoid').xp, 12);
}

async function testReportsBrokenJson() {
  const { GardenStore } = loadDataModule();
  const dir = new MemoryDirectoryHandle({
    'garden.settings.json': '{bad json',
  });

  const result = await GardenStore.loadFromDirectory(dir);

  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].file, 'garden.settings.json');
  assert.equal(result.data.settings.schemaVersion, 1);
}

async function testReportsUnsupportedSchemaVersion() {
  const { GardenStore } = loadDataModule();
  const dir = new MemoryDirectoryHandle({
    'garden.plants.json': JSON.stringify({
      schemaVersion: 99,
      updatedAt: '2026-04-29T00:00:00.000Z',
      plants: [],
    }),
  });

  const result = await GardenStore.loadFromDirectory(dir);

  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].file, 'garden.plants.json');
  assert.match(result.warnings[0].message, /schemaVersion/);
  assert.equal(result.data.plants.schemaVersion, 1);
  assert.equal(result.data.plants.plants.length, 8);
}

function testValidatesDuplicatePlantAndFieldIds() {
  const { GardenSchema } = loadDataModule();
  const plantsFile = GardenSchema.createPlantsFile();
  plantsFile.plants = [
    {
      ...plantsFile.plants[0],
      id: 'mind',
      fields: [
        { id: 'same', label: 'One', type: 'text', required: false },
        { id: 'same', label: 'Two', type: 'text', required: false },
      ],
    },
    { ...plantsFile.plants[1], id: 'mind' },
  ];

  const issues = GardenSchema.validatePlantsFile(plantsFile);

  assert.equal(issues.some((issue) => issue.path === 'plants[1].id' && issue.code === 'duplicate_id'), true);
  assert.equal(issues.some((issue) => issue.path === 'plants[0].fields[1].id' && issue.code === 'duplicate_id'), true);
}

async function testRejectsInvalidPlantsFileOnSave() {
  const { GardenSchema, GardenStore } = loadDataModule();
  const dir = new MemoryDirectoryHandle();
  const plantsFile = GardenSchema.createPlantsFile();
  plantsFile.plants[1] = { ...plantsFile.plants[1], id: plantsFile.plants[0].id };

  await assert.rejects(
    () => GardenStore.saveFile(dir, 'plants', plantsFile),
    /duplicate/i,
  );
}

async function run() {
  await testCreatesDefaultFiles();
  await testAddsNewDefaultPlantsToExistingFiles();
  await testCalculatesDerivedGardenState();
  testPlanEntryAwardsXpAndCompletesPlanPlant();
  testDeriveSeparatesPlanFromCareProgress();
  testMergesPlanEntryWithoutDroppingCareValues();
  testI18nHasRequiredJapaneseAndEnglishKeys();
  await testRemembersDirectoryHandleInIndexedDb();
  await testSkipsRememberedDirectoryWhenIndexedDbUnavailable();
  await testSeparatesPermissionQueryFromRequest();
  testExposesStorageFileNamesForUserFacingCopy();
  testReportsMissingRequiredFieldsForDailyProgress();
  testAvoidanceCountAwardsMoreXpWhenCloserToZero();
  await testReportsBrokenJson();
  await testReportsUnsupportedSchemaVersion();
  testValidatesDuplicatePlantAndFieldIds();
  await testRejectsInvalidPlantsFileOnSave();
  console.log('garden-store tests passed');
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
