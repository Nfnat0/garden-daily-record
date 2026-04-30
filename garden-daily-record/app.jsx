/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, GardenSchema, GardenStore, GardenCalc, GardenI18n, DashboardScreen, PlanScreen, TodayScreen, StudyScreen, LibraryScreen, SettingsScreen, window, document */
// Main Garden app shell.

const { useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA, useState: useStateA } = React;

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

function StorageGate({
  supported,
  busy,
  error,
  fileNames,
  summary,
  rememberedName,
  restoreBusy,
  onConnect,
  onRestore,
  onForgetRemembered,
  onPreview,
  t,
}) {
  return (
    <div className="storage-card card col gap-4">
      <div className="col gap-2">
        <div className="t-eyebrow">{t('storage.status')}</div>
        <h1 className="t-hero" style={{ margin: 0 }}>{t('storage.connectTitle')}</h1>
        <div className="t-body">{t('storage.connectBody')}</div>
      </div>

      <div className="notice col gap-2">
        <div className="t-body-strong">{t('storage.localFirstTitle')}</div>
        <div className="t-body">{t('storage.localFirstBody')}</div>
      </div>

      {supported && rememberedName && (
        <div className="notice col gap-3">
          <div>
            <div className="t-body-strong">{t('storage.rememberedTitle')}</div>
            <div className="t-body" style={{ marginTop: 4 }}>
              {t('storage.rememberedBody', { name: rememberedName })}
            </div>
          </div>
          <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={busy || restoreBusy} onClick={onRestore}>
              {restoreBusy ? t('storage.restoring') : t('storage.restoreFolder')}
            </button>
            <button className="btn btn-ghost" disabled={busy || restoreBusy} onClick={onForgetRemembered}>
              {t('storage.forgetFolder')}
            </button>
          </div>
        </div>
      )}

      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <div className="card-sunk col gap-2" style={{ flex: '1 1 220px', padding: 16, minWidth: 0 }}>
          <div className="t-eyebrow">{t('storage.filesTitle')}</div>
          <div className="col gap-2">
            {fileNames.map((name) => (
              <div key={name} className="row items-center gap-2" style={{ minWidth: 0 }}>
                <span className="chip chip-leaf" style={{ flex: 'none' }}>JSON</span>
                <span className="t-tiny mono" style={{ overflowWrap: 'anywhere' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-sunk col gap-2" style={{ flex: '1 1 220px', padding: 16, minWidth: 0 }}>
          <div className="t-eyebrow">{t('storage.setupTitle')}</div>
          {[t('storage.setupStep1'), t('storage.setupStep2'), t('storage.setupStep3')].map((step, i) => (
            <div key={step} className="row gap-2">
              <span className="chip">{i + 1}</span>
              <span className="t-body">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-sunk col gap-3" style={{ padding: 16 }}>
        <div>
          <div className="t-eyebrow">{t('storage.previewTitle')}</div>
          <div className="t-body" style={{ marginTop: 4 }}>{t('storage.previewBody')}</div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <span className="chip chip-leaf">{t('dashboard.todayCare')}: {summary.today.careTotal}</span>
          <span className="chip">{t('dashboard.badges')}: {summary.plants.length}</span>
        </div>
        <button className="btn" disabled={busy} onClick={onPreview} style={{ alignSelf: 'flex-start' }}>{t('storage.previewButton')}</button>
      </div>

      {!supported && (
        <div className="notice col gap-2">
          <div className="t-body-strong">{t('storage.unsupportedTitle')}</div>
          <div className="t-body">{t('storage.unsupportedAction')}</div>
        </div>
      )}
      {error && <div className="notice t-body" style={{ color: 'var(--bloom)' }}>{error}</div>}
      <button className="btn btn-primary btn-lg" disabled={!supported || busy} onClick={onConnect} style={{ alignSelf: 'flex-start' }}>
        {busy ? t('storage.connecting') : t('storage.pickFolder')}
      </button>
    </div>
  );
}

function StorageBar({ connectedName, busy, warnings, savedAt, error, previewMode, onConnect, onReload, t }) {
  return (
    <div className="storage-bar">
      <div className="col gap-2" style={{ minWidth: 0 }}>
        <div className="row items-center gap-2" style={{ minWidth: 0, flexWrap: 'wrap' }}>
          <span className="chip chip-leaf">{connectedName || t('storage.unconnected')}</span>
          {savedAt && <span className="t-tiny mono">{previewMode ? savedAt : t('storage.saved', { time: savedAt })}</span>}
        </div>
        <div className="t-tiny">
          {previewMode
            ? t('storage.previewHelp')
            : t('storage.connectedHelp', { name: connectedName || t('storage.unconnected') })}
        </div>
        {warnings.length > 0 && <span className="chip chip-bloom">{t('storage.warnings', { count: warnings.length })}</span>}
        {error && <span className="t-tiny" style={{ color: 'var(--bloom)' }}>{error}</span>}
      </div>
      <div className="row gap-2">
        {!previewMode && <button className="btn btn-ghost" disabled={busy} onClick={onReload}>{t('storage.reload')}</button>}
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
  const [previewMode, setPreviewMode] = useStateA(false);
  const [rememberedHandle, setRememberedHandle] = useStateA(null);
  const [rememberedName, setRememberedName] = useStateA('');
  const [restoreBusy, setRestoreBusy] = useStateA(false);
  const [connectedName, setConnectedName] = useStateA('');
  const [gardenData, setGardenData] = useStateA(() => GardenSchema.createInitialData());
  const [selectedDate, setSelectedDate] = useStateA(() => GardenSchema.todayKey());
  const [warnings, setWarnings] = useStateA([]);
  const [storageError, setStorageError] = useStateA('');
  const [storageBusy, setStorageBusy] = useStateA(false);
  const [savedAt, setSavedAt] = useStateA('');
  const storageOperationRef = useRefA(0);
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

  const folderName = (handle) => handle?.name || 'garden folder';

  const finishDirectoryConnection = (handle, result, savedLabel = '') => {
    setDirectoryHandle(handle);
    setPreviewMode(false);
    setConnectedName(folderName(handle));
    setGardenData(result.data);
    setWarnings(result.warnings || []);
    setSavedAt(savedLabel);
    setRememberedHandle(handle);
    setRememberedName(folderName(handle));
  };

  useEffectA(() => {
    if (!storageSupported || !GardenStore.supportsRememberedDirectory()) return undefined;
    let cancelled = false;
    const operationId = ++storageOperationRef.current;

    const restoreIfAlreadyAllowed = async () => {
      setRestoreBusy(true);
      try {
        const handle = await GardenStore.loadRememberedDirectory();
        if (cancelled || operationId !== storageOperationRef.current || !handle) return;
        setRememberedHandle(handle);
        setRememberedName(folderName(handle));
        const permission = await GardenStore.queryPermission(handle);
        if (cancelled || operationId !== storageOperationRef.current) return;
        if (permission !== 'granted') return;
        setStorageBusy(true);
        const result = await GardenStore.loadFromDirectory(handle);
        if (cancelled || operationId !== storageOperationRef.current) return;
        finishDirectoryConnection(handle, result, result.created?.length ? t('storage.initialized') : '');
      } catch (err) {
        if (!cancelled && operationId === storageOperationRef.current) {
          setStorageError(t('storage.restoreFailed'));
        }
      } finally {
        if (!cancelled && operationId === storageOperationRef.current) {
          setRestoreBusy(false);
          setStorageBusy(false);
        }
      }
    };

    restoreIfAlreadyAllowed();
    return () => {
      cancelled = true;
    };
  }, [storageSupported]);

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
    const operationId = ++storageOperationRef.current;
    setStorageBusy(true);
    setRestoreBusy(false);
    setStorageError('');
    try {
      const handle = await GardenStore.pickDirectory();
      const result = await GardenStore.loadFromDirectory(handle);
      if (operationId !== storageOperationRef.current) return;
      finishDirectoryConnection(handle, result, result.created?.length ? t('storage.initialized') : '');
      try {
        await GardenStore.rememberDirectory(handle);
      } catch (rememberErr) {
        if (operationId === storageOperationRef.current) setStorageError(t('storage.rememberFailed'));
      }
    } catch (err) {
      if (operationId === storageOperationRef.current && err?.name !== 'AbortError') setStorageError(err?.message || String(err));
    } finally {
      if (operationId === storageOperationRef.current) setStorageBusy(false);
    }
  };

  const restoreRememberedFolder = async () => {
    if (!rememberedHandle) return;
    const operationId = ++storageOperationRef.current;
    setStorageBusy(true);
    setRestoreBusy(true);
    setStorageError('');
    try {
      if (!await GardenStore.ensurePermission(rememberedHandle)) {
        throw new Error(t('storage.restoreFailed'));
      }
      const result = await GardenStore.loadFromDirectory(rememberedHandle);
      if (operationId !== storageOperationRef.current) return;
      finishDirectoryConnection(rememberedHandle, result, result.created?.length ? t('storage.initialized') : '');
      try {
        await GardenStore.rememberDirectory(rememberedHandle);
      } catch (rememberErr) {
        if (operationId === storageOperationRef.current) setStorageError(t('storage.rememberFailed'));
      }
    } catch (err) {
      if (operationId === storageOperationRef.current && err?.name !== 'AbortError') {
        setStorageError(err?.message || t('storage.restoreFailed'));
      }
    } finally {
      if (operationId === storageOperationRef.current) {
        setStorageBusy(false);
        setRestoreBusy(false);
      }
    }
  };

  const forgetRememberedFolder = async () => {
    const operationId = ++storageOperationRef.current;
    setStorageBusy(true);
    setRestoreBusy(true);
    setStorageError('');
    try {
      await GardenStore.forgetRememberedDirectory();
      if (operationId !== storageOperationRef.current) return;
      setRememberedHandle(null);
      setRememberedName('');
    } catch (err) {
      if (operationId === storageOperationRef.current) setStorageError(err?.message || String(err));
    } finally {
      if (operationId === storageOperationRef.current) {
        setStorageBusy(false);
        setRestoreBusy(false);
      }
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
    if (!directoryHandle && !previewMode) throw new Error('Save folder is not connected.');
    setStorageBusy(true);
    setStorageError('');
    try {
      const normalized = GardenSchema.normalizeData({ ...gardenData, [key]: nextFile });
      if (previewMode) {
        setGardenData(normalized);
        setSavedAt(t('storage.previewSaved'));
        return normalized;
      }
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
  const startPreview = () => {
    storageOperationRef.current += 1;
    setStorageError('');
    setWarnings([]);
    setStorageBusy(false);
    setRestoreBusy(false);
    setDirectoryHandle(null);
    setPreviewMode(true);
    setConnectedName(t('storage.previewName'));
    setRoute('dashboard');
  };

  const sharedProps = { language, t };
  const screens = {
    dashboard: <DashboardScreen tweaks={tweaks} data={gardenData} summary={summary} onNav={setRoute} {...sharedProps} />,
    plan: <PlanScreen data={gardenData} summary={summary} selectedDate={selectedDate} onDateChange={setSelectedDate} onSaveEntry={saveEntry} storageBusy={storageBusy} {...sharedProps} />,
    today: <TodayScreen tweaks={tweaks} data={gardenData} summary={summary} selectedDate={selectedDate} onDateChange={setSelectedDate} onSaveEntry={saveEntry} onNav={setRoute} storageBusy={storageBusy} {...sharedProps} />,
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
        {(directoryHandle || previewMode) && (
          <StorageBar
            connectedName={previewMode ? t('storage.previewName') : connectedName}
            busy={storageBusy}
            warnings={warnings}
            savedAt={savedAt}
            error={storageError}
            previewMode={previewMode}
            onConnect={connectFolder}
            onReload={reloadFolder}
            t={t}
          />
        )}
        {directoryHandle || previewMode
          ? screens[route]
          : (
            <StorageGate
              supported={storageSupported}
              busy={storageBusy}
              error={storageError}
              fileNames={GardenSchema.storageFileNames()}
              summary={summary}
              rememberedName={rememberedName}
              restoreBusy={restoreBusy}
              onConnect={connectFolder}
              onRestore={restoreRememberedFolder}
              onForgetRemembered={forgetRememberedFolder}
              onPreview={startPreview}
              t={t}
            />
          )}
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
