const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadDataModule() {
  const source = fs.readFileSync(path.join(__dirname, 'data.jsx'), 'utf8');
  const context = {
    window: {},
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
  assert.equal(result.data.plants.plants.length, 6);
  assert.equal(result.data.entries.entries && typeof result.data.entries.entries, 'object');
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
  assert.equal(summary.today.total, 6);
  assert.equal(summary.streak, 1);
  assert.equal(summary.plants.find((p) => p.id === 'mind').stage >= 1, true);
  assert.equal(summary.study.totalMinutes, 45);
  assert.equal(summary.level.totalXp > 0, true);
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
  assert.equal(result.data.plants.plants.length, 6);
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
  await testCalculatesDerivedGardenState();
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
