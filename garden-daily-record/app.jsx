/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, GardenSchema, GardenStore, GardenCalc, GardenI18n, DashboardScreen, PlanScreen, TodayScreen, StudyScreen, LibraryScreen, SettingsScreen, window, document */
// Main Garden app shell.

const { useEffect: useEffectA, useMemo: useMemoA, useState: useStateA } = React;

const TWEAK_DEFAULTS = window.GARDEN_TWEAK_DEFAULTS || {
  theme: 'dark',
  metaphor: 'rpg',
  inputStyle: 'card',
  showXp: true,
};

function NavItem({ icon, label, sub, active, onClick }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {sub && <span className="t-tiny mono" style={{ color: 'var(--ink-faint)' }}>{sub}</span>}
    </button>
  );
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStoredLanguage() {
  try {
    return GardenI18n.supportedLanguage(window.localStorage.getItem(GardenI18n.LANGUAGE_STORAGE_KEY));
  } catch (err) {
    return 'ja';
  }
}

function StorageGate({ supported, busy, error, onConnect, t }) {
  return (
    <div className="storage-card card col gap-4">
      <div className="col gap-2">
        <div className="t-eyebrow">{t('storage.status')}</div>
        <h1 className="t-hero" style={{ margin: 0 }}>{t('storage.connectTitle')}</h1>
        <div className="t-body">{t('storage.connectBody')}</div>
      </div>
      {!supported && <div className="notice t-body">{t('storage.unsupported')}</div>}
      {error && <div className="notice t-body" style={{ color: 'var(--bloom)' }}>{error}</div>}
      <button className="btn btn-primary btn-lg" disabled={!supported || busy} onClick={onConnect} style={{ alignSelf: 'flex-start' }}>
        {busy ? t('storage.connecting') : t('storage.pickFolder')}
      </button>
    </div>
  );
}

function StorageBar({ connectedName, busy, warnings, savedAt, error, onConnect, onReload, t }) {
  return (
    <div className="storage-bar">
      <div className="row items-center gap-2" style={{ minWidth: 0, flexWrap: 'wrap' }}>
        <span className="chip chip-leaf">{connectedName || t('storage.unconnected')}</span>
        {savedAt && <span className="t-tiny mono">{t('storage.saved', { time: savedAt })}</span>}
        {warnings.length > 0 && <span className="chip chip-bloom">{t('storage.warnings', { count: warnings.length })}</span>}
        {error && <span className="t-tiny" style={{ color: 'var(--bloom)' }}>{error}</span>}
      </div>
      <div className="row gap-2">
        <button className="btn btn-ghost" disabled={busy} onClick={onReload}>{t('storage.reload')}</button>
        <button className="btn" disabled={busy} onClick={onConnect}>{t('storage.changeFolder')}</button>
      </div>
    </div>
  );
}

function LanguageToggle({ language, onChange, t }) {
  return (
    <div className="row gap-2" style={{ padding: '8px 12px', flexWrap: 'wrap' }}>
      <span className="t-tiny" style={{ width: '100%' }}>{t('language.label')}</span>
      <div className="seg" style={{ flex: 1 }}>
        {['ja', 'en'].map((lang) => (
          <button key={lang} className={`seg-btn ${language === lang ? 'active' : ''}`} onClick={() => onChange(lang)}>
            {t(`language.${lang}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [language, setLanguageState] = useStateA(readStoredLanguage);
  const [route, setRoute] = useStateA('dashboard');
  const [tweaksOpen, setTweaksOpen] = useStateA(false);
  const [directoryHandle, setDirectoryHandle] = useStateA(null);
  const [connectedName, setConnectedName] = useStateA('');
  const [gardenData, setGardenData] = useStateA(() => GardenSchema.createInitialData());
  const [selectedDate, setSelectedDate] = useStateA(() => GardenSchema.todayKey());
  const [warnings, setWarnings] = useStateA([]);
  const [storageError, setStorageError] = useStateA('');
  const [storageBusy, setStorageBusy] = useStateA(false);
  const [savedAt, setSavedAt] = useStateA('');
  const storageSupported = GardenStore.supportsFileSystemAccess();
  const summary = useMemoA(() => GardenCalc.derive(gardenData, selectedDate), [gardenData, selectedDate]);
  const t = useMemoA(() => (key, params) => GardenI18n.t(language, key, params), [language]);

  useEffectA(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  useEffectA(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(GardenI18n.LANGUAGE_STORAGE_KEY, language);
    } catch (err) {
      // Storage can be unavailable in private or embedded contexts.
    }
  }, [language]);

  useEffectA(() => {
    const onMsg = (event) => {
      if (event.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (event.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setLanguage = (nextLanguage) => {
    setLanguageState(GardenI18n.supportedLanguage(nextLanguage));
  };

  const connectFolder = async () => {
    setStorageBusy(true);
    setStorageError('');
    try {
      const handle = await GardenStore.pickDirectory();
      const result = await GardenStore.loadFromDirectory(handle);
      setDirectoryHandle(handle);
      setConnectedName(handle.name || 'garden folder');
      setGardenData(result.data);
      setWarnings(result.warnings || []);
      setSavedAt(result.created?.length ? t('storage.initialized') : '');
    } catch (err) {
      if (err?.name !== 'AbortError') setStorageError(err?.message || String(err));
    } finally {
      setStorageBusy(false);
    }
  };

  const reloadFolder = async () => {
    if (!directoryHandle) return;
    setStorageBusy(true);
    setStorageError('');
    try {
      const result = await GardenStore.loadFromDirectory(directoryHandle);
      setGardenData(result.data);
      setWarnings(result.warnings || []);
    } catch (err) {
      setStorageError(err?.message || String(err));
    } finally {
      setStorageBusy(false);
    }
  };

  const saveFile = async (key, nextFile) => {
    if (!directoryHandle) throw new Error('Save folder is not connected.');
    setStorageBusy(true);
    setStorageError('');
    try {
      const normalized = GardenSchema.normalizeData({ ...gardenData, [key]: nextFile });
      const saved = await GardenStore.saveFile(directoryHandle, key, normalized[key]);
      const nextData = GardenSchema.normalizeData({ ...gardenData, [key]: saved });
      setGardenData(nextData);
      const n = new Date();
      setSavedAt(`${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`);
      return nextData;
    } catch (err) {
      setStorageError(err?.message || String(err));
      throw err;
    } finally {
      setStorageBusy(false);
    }
  };

  const saveEntry = async (date, values) => {
    const nextEntries = cloneData(gardenData.entries);
    nextEntries.entries[date] = {
      date,
      values,
      updatedAt: GardenSchema.nowIso(),
    };
    await saveFile('entries', nextEntries);
  };

  const savePlants = async (plantsFile) => saveFile('plants', plantsFile);
  const saveLibrary = async (libraryFile) => saveFile('library', libraryFile);
  const saveSettings = async (settingsFile) => saveFile('settings', settingsFile);

  const sharedProps = { language, t };
  const screens = {
    dashboard: <DashboardScreen tweaks={tweaks} data={gardenData} summary={summary} onNav={setRoute} {...sharedProps} />,
    plan: <PlanScreen data={gardenData} summary={summary} selectedDate={selectedDate} onDateChange={setSelectedDate} onSaveEntry={saveEntry} storageBusy={storageBusy} {...sharedProps} />,
    today: <TodayScreen tweaks={tweaks} data={gardenData} summary={summary} selectedDate={selectedDate} onDateChange={setSelectedDate} onSaveEntry={saveEntry} storageBusy={storageBusy} {...sharedProps} />,
    study: <StudyScreen data={gardenData} summary={summary} {...sharedProps} />,
    library: <LibraryScreen data={gardenData} summary={summary} onSaveLibrary={saveLibrary} storageBusy={storageBusy} {...sharedProps} />,
    settings: <SettingsScreen data={gardenData} summary={summary} onSavePlants={savePlants} onSaveSettings={saveSettings} storageBusy={storageBusy} warnings={warnings} {...sharedProps} />,
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-brand-mark"></span>
          <span>{t('app.name')}</span>
        </div>

        <div className="nav-section">{t('nav.main')}</div>
        <NavItem icon="✿" label={t('nav.dashboard')} active={route === 'dashboard'} onClick={() => setRoute('dashboard')} />
        <NavItem icon="☼" label={t('nav.plan')} sub={summary.plan?.state === 'done' ? t('actions.done') : t('actions.pending')} active={route === 'plan'} onClick={() => setRoute('plan')} />
        <NavItem icon="✎" label={t('nav.today')} sub={`${summary.today.careDone}/${summary.today.careTotal}`} active={route === 'today'} onClick={() => setRoute('today')} />

        <div className="nav-section">{t('nav.plants')}</div>
        <NavItem icon="⌘" label={t('nav.study')} sub={`${Math.round(summary.study.totalMinutes / 60)}h`} active={route === 'study'} onClick={() => setRoute('study')} />
        <NavItem icon="▣" label={t('nav.library')} sub={`${summary.library.books.length + summary.library.notes.length + summary.library.articles.length}`} active={route === 'library'} onClick={() => setRoute('library')} />

        <div className="nav-section">{t('nav.other')}</div>
        <NavItem icon="⚙" label={t('nav.settings')} active={route === 'settings'} onClick={() => setRoute('settings')} />

        <LanguageToggle language={language} onChange={setLanguage} t={t} />

        <div className="nav-foot">
          <div className="avatar"></div>
          <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
            <div className="t-body-strong" style={{ fontSize: 12 }}>{t('nav.scholar')} ・ lv.{summary.level.level}</div>
            <div className="t-tiny mono">{t('nav.day', { day: summary.dayNum })}</div>
          </div>
        </div>
      </nav>

      <main className="main" data-screen-label={route}>
        {directoryHandle && (
          <StorageBar
            connectedName={connectedName}
            busy={storageBusy}
            warnings={warnings}
            savedAt={savedAt}
            error={storageError}
            onConnect={connectFolder}
            onReload={reloadFolder}
            t={t}
          />
        )}
        {directoryHandle
          ? screens[route]
          : <StorageGate supported={storageSupported} busy={storageBusy} error={storageError} onConnect={connectFolder} t={t} />}
      </main>

      {tweaksOpen && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Theme">
            <TweakRadio
              label="Mode"
              value={tweaks.theme}
              options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
              onChange={(value) => setTweak('theme', value)}
            />
          </TweakSection>
          <TweakSection label="Growth metaphor">
            <TweakRadio
              label="Style"
              value={tweaks.metaphor}
              options={[
                { value: 'garden', label: 'Garden' },
                { value: 'rpg', label: 'RPG' },
                { value: 'minimal', label: 'Min' },
              ]}
              onChange={(value) => setTweak('metaphor', value)}
            />
          </TweakSection>
          <TweakSection label="Input style">
            <TweakRadio
              label="Input UI"
              value={tweaks.inputStyle}
              options={[
                { value: 'form', label: 'Form' },
                { value: 'card', label: 'Card' },
                { value: 'chat', label: 'Chat' },
              ]}
              onChange={(value) => setTweak('inputStyle', value)}
            />
          </TweakSection>
          <TweakSection label="Display">
            <TweakToggle
              label="Show XP gauge"
              value={tweaks.showXp}
              onChange={(value) => setTweak('showXp', value)}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
