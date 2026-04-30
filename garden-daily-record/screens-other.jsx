/* global React, Plant, GardenSchema, GardenI18n, window */
// Library + Study log + Settings screens backed by JSON data.

const { useEffect: useEffectL, useMemo: useMemoL, useState: useStateL } = React;

function LibraryScreen({ data, summary, onSaveLibrary, storageBusy, language, t }) {
  const [tab, setTab] = useStateL('books');
  const [editing, setEditing] = useStateL(null);
  const counts = {
    books: summary.library.books.length,
    notes: summary.library.notes.length,
    articles: summary.library.articles.length,
  };

  const saveItem = async (kind, item) => {
    const file = cloneJson(data.library);
    const items = file[kind] || [];
    const now = GardenSchema.nowIso();
    const next = {
      ...item,
      id: item.id || GardenSchema.safeId(`${kind}_${Date.now()}`),
      tags: normalizeTags(item.tags),
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    const idx = items.findIndex((x) => x.id === next.id);
    file[kind] = idx >= 0 ? items.map((x) => x.id === next.id ? next : x) : [next, ...items];
    await onSaveLibrary(file);
    setEditing(null);
  };

  const deleteItem = async (kind, id) => {
    if (!confirmDanger(t('library.deleteConfirm'))) return;
    const file = cloneJson(data.library);
    file[kind] = (file[kind] || []).map((item) => item.id === id
      ? { ...item, deletedAt: GardenSchema.nowIso(), updatedAt: GardenSchema.nowIso() }
      : item);
    await onSaveLibrary(file);
  };

  const currentItems = summary.library[tab] || [];

  return (
    <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 980, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">{t('library.eyebrow')}</div>
        <h1 className="t-hero" style={{ margin: 0 }}>{t('library.title')}</h1>
      </div>

      <div className="row justify-between items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {[
            { v: 'books', label: `${t('library.books')} ・ ${counts.books}` },
            { v: 'notes', label: `${t('library.notes')} ・ ${counts.notes}` },
            { v: 'articles', label: `${t('library.articles')} ・ ${counts.articles}` },
          ].map((item) => (
            <button key={item.v} className={`seg-btn ${tab === item.v ? 'active' : ''}`} onClick={() => { setTab(item.v); setEditing(null); }}>{item.label}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ kind: tab, item: createLibraryDraft(tab) })}>{t('library.add')}</button>
      </div>

      {editing && (
        <LibraryEditor
          kind={editing.kind}
          initial={editing.item}
          storageBusy={storageBusy}
          language={language}
          t={t}
          onCancel={() => setEditing(null)}
          onSave={(item) => saveItem(editing.kind, item)}
        />
      )}

      <LibraryList
        kind={tab}
        items={currentItems}
        language={language}
        t={t}
        onEdit={(item) => setEditing({ kind: tab, item: cloneJson(item) })}
        onDelete={(id) => deleteItem(tab, id)}
      />
    </div>
  );
}

function LibraryEditor({ kind, initial, storageBusy, t, onCancel, onSave }) {
  const [draft, setDraft] = useStateL(() => ({ ...initial, tagsText: (initial.tags || []).join(', ') }));
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const issues = validateLibraryDraft(kind, draft, t);
  const save = () => {
    if (issues.length) return;
    const { tagsText, ...item } = draft;
    onSave({ ...item, tags: tagsText });
  };
  return (
    <div className="card col gap-3" style={{ padding: 18 }}>
      <div className="row justify-between items-center">
        <div className="t-eyebrow">{t(`library.${kind}`)}</div>
        <button className="btn btn-ghost" onClick={onCancel}>{t('settings.cancel')}</button>
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <InputBlock label={t('library.titleField')} value={draft.title} onChange={(v) => set('title', v)} flex={2} />
        {kind === 'books' && <InputBlock label={t('library.author')} value={draft.author} onChange={(v) => set('author', v)} flex={1} />}
        {kind === 'articles' && <InputBlock label="URL" value={draft.url} onChange={(v) => set('url', v)} flex={2} />}
        {kind === 'articles' && <InputBlock label={t('library.source')} value={draft.source} onChange={(v) => set('source', v)} flex={1} />}
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        {kind === 'books' && (
          <>
            <InputBlock label={t('library.progress')} type="number" value={Math.round((draft.progress || 0) * 100)} onChange={(v) => set('progress', Math.max(0, Math.min(100, Number(v))) / 100)} flex={1} />
            <SelectBlock label={t('library.status')} value={draft.status || 'reading'} options={['reading', 'done', 'wishlist']} onChange={(v) => set('status', v)} flex={1} />
          </>
        )}
        {kind === 'articles' && <SelectBlock label={t('library.status')} value={draft.status || 'unread'} options={['unread', 'reading', 'done']} onChange={(v) => set('status', v)} flex={1} />}
        <InputBlock label={t('library.tags')} value={draft.tagsText || ''} onChange={(v) => set('tagsText', v)} flex={2} />
      </div>
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{t('library.body')}</label>
        <textarea className="input" value={draft.body || ''} onChange={(e) => set('body', e.target.value)} style={{ minHeight: 120 }} />
      </div>
      <div className="row justify-between items-center">
        <span className="t-tiny mono">{draft.id || 'new item'}</span>
        <button className="btn btn-primary" disabled={storageBusy || issues.length > 0} onClick={save}>{t('actions.save')}</button>
      </div>
      {issues.length > 0 && <ValidationList issues={issues} />}
    </div>
  );
}

function LibraryList({ kind, items, t, onEdit, onDelete }) {
  if (!items.length) {
    return <div className="card" style={{ padding: 28, textAlign: 'center' }}><div className="t-body">{t('library.empty')}</div></div>;
  }
  if (kind === 'books') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((book, i) => (
          <div key={book.id} className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: 110, marginLeft: -16, marginRight: -16, marginTop: -16, marginBottom: 12,
              background: `linear-gradient(135deg, ${['var(--leaf-700)', 'var(--bloom)', 'var(--earth-500)', 'var(--sky)', 'var(--petal)'][i % 5]} 0%, var(--ink) 100%)`,
            }}>
              <div style={{ padding: 14, color: 'rgba(255,255,255,.95)' }}>
                <div className="serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.2 }}>{book.title}</div>
                <div className="t-tiny mono" style={{ color: 'rgba(255,255,255,.75)', marginTop: 6 }}>{book.author}</div>
              </div>
            </div>
            <div className="row justify-between items-center" style={{ marginBottom: 6 }}>
              <span className="t-tiny mono">{book.status === 'done' ? t('library.done') : `${Math.round((book.progress || 0) * 100)}%`}</span>
              <span className="t-tiny">{(book.tags || []).map((tag) => `#${tag}`).join(' ')}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(book.progress || 0) * 100}%`, background: book.status === 'done' ? 'var(--leaf-700)' : 'var(--leaf-500)' }}></div>
            </div>
            <ItemActions t={t} onEdit={() => onEdit(book)} onDelete={() => onDelete(book.id)} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="col gap-2">
      {items.map((item) => (
        <div key={item.id} className="card" style={{ padding: 18 }}>
          <div className="row items-center gap-3" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="t-tiny mono">{item.updatedAt ? item.updatedAt.slice(0, 10) : ''}</span>
            {(item.tags || []).map((tag) => <span key={tag} className="chip chip-leaf">#{tag}</span>)}
            {kind === 'articles' && item.status && <span className="chip">{item.status}</span>}
            <ItemActions t={t} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
          </div>
          <div className="t-h2 serif" style={{ marginBottom: 4 }}>{item.title}</div>
          {kind === 'articles' && item.url && <div className="t-tiny mono" style={{ marginBottom: 8 }}>{item.url}</div>}
          <div className="t-body" style={{ whiteSpace: 'pre-wrap' }}>{item.body}</div>
        </div>
      ))}
    </div>
  );
}

function ItemActions({ t, onEdit, onDelete }) {
  return (
    <div className="row gap-2" style={{ marginLeft: 'auto' }}>
      <button className="btn btn-ghost" onClick={onEdit}>{t('settings.edit')}</button>
      <button className="btn btn-ghost" onClick={onDelete}>{t('settings.delete')}</button>
    </div>
  );
}

function StudyScreen({ summary, t }) {
  const topics = Object.entries(summary.study.byTopic).sort((a, b) => b[1] - a[1]);
  const totalMin = topics.reduce((s, [, v]) => s + v, 0);
  const totalHours = Math.round(totalMin / 60 * 10) / 10;

  return (
    <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 980, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">{t('study.eyebrow')}</div>
        <h1 className="t-hero" style={{ margin: 0 }}>{t('study.title', { hours: totalHours })}</h1>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>{t('study.byTopic')}</div>
        {topics.length === 0 ? (
          <div className="t-body">{t('study.empty')}</div>
        ) : (
          <div className="col gap-3">
            {topics.map(([topic, minutes], i) => (
              <div key={topic} className="col gap-1">
                <div className="row justify-between items-baseline">
                  <span className="t-body-strong">#{topic}</span>
                  <span className="t-tiny mono"><span className="t-num" style={{ color: 'var(--ink)' }}>{Math.round(minutes / 60 * 10) / 10}</span>h ・ {Math.round(minutes / totalMin * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${(minutes / topics[0][1]) * 100}%`,
                    background: i === 0 ? 'var(--leaf-700)' : i < 3 ? 'var(--leaf-500)' : 'var(--leaf-300)',
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>{t('study.recent')}</div>
        <div className="col" style={{ gap: 0 }}>
          {summary.study.recentSessions.length === 0 && <div className="t-body">{t('study.noSessions')}</div>}
          {summary.study.recentSessions.map((entry, i) => (
            <div key={entry.date} className="row items-center gap-3" style={{ padding: '12px 0', borderBottom: i < summary.study.recentSessions.length - 1 ? '1px solid var(--line-soft)' : 'none', flexWrap: 'wrap' }}>
              <span className="t-tiny mono" style={{ width: 78, color: 'var(--ink-faint)' }}>{entry.date.slice(5)}</span>
              <span className="t-tiny" style={{ width: 20 }}>{summary.dayName(entry.day)}</span>
              <span className="chip chip-leaf" style={{ maxWidth: '100%', overflowWrap: 'anywhere' }}>#{entry.topic}</span>
              <div style={{ flex: 1 }}></div>
              <span className="t-num" style={{ fontSize: 18 }}>{entry.study}</span>
              <span className="t-tiny">{t('units.minutes')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ data, onSavePlants, onSaveSettings, storageBusy, warnings, language, t }) {
  const plants = useMemoL(() => (data.plants.plants || []).filter((plant) => !plant.deletedAt).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)), [data.plants]);
  const [editingPlant, setEditingPlant] = useStateL(null);
  const [plantError, setPlantError] = useStateL('');
  const [settingsDraft, setSettingsDraft] = useStateL(() => ({ ...data.settings }));

  useEffectL(() => {
    setSettingsDraft({ ...data.settings });
  }, [data.settings]);

  const savePlantFile = async (nextPlants) => {
    await onSavePlants({ ...data.plants, plants: nextPlants });
    setEditingPlant(null);
    setPlantError('');
  };

  const upsertPlant = async (plant) => {
    const rawIssues = validatePlantDraft(plant, t);
    if (rawIssues.length) {
      setPlantError(formatValidationIssues(rawIssues));
      return;
    }
    const next = cloneJson(data.plants.plants || []);
    const now = GardenSchema.nowIso();
    const originalId = plant.__originalId || plant.id;
    const { __originalId, ...plantData } = plant;
    const normalized = {
      ...plantData,
      id: GardenSchema.safeId(plant.id || plant.name || plant.jp),
      name: plant.name || GardenSchema.safeId(plant.jp),
      jp: plant.jp || plant.name || t('settings.newPlantName'),
      visible: plant.visible !== false,
      sort: Number.isFinite(Number(plant.sort)) ? Number(plant.sort) : (next.length + 1) * 10,
      fields: (plant.fields || []).map((field, i) => normalizeFieldDraft(field, i)),
      updatedAt: now,
    };
    const hasOriginal = originalId && next.some((plantItem) => plantItem.id === originalId);
    const nextPlants = hasOriginal ? next.map((plantItem) => plantItem.id === originalId ? normalized : plantItem) : [...next, normalized];
    const issues = GardenSchema.validatePlantsFile({ ...data.plants, plants: nextPlants });
    if (issues.length) {
      setPlantError(formatValidationIssues(issues));
      return;
    }
    await savePlantFile(nextPlants);
  };

  const softDeletePlant = async (id) => {
    if (!confirmDanger(t('settings.deletePlantConfirm'))) return;
    const next = (data.plants.plants || []).map((plant) => plant.id === id ? { ...plant, deletedAt: GardenSchema.nowIso() } : plant);
    await savePlantFile(next);
  };

  const toggleVisible = async (id) => {
    const next = (data.plants.plants || []).map((plant) => plant.id === id ? { ...plant, visible: plant.visible === false } : plant);
    await savePlantFile(next);
  };

  const movePlant = async (id, dir) => {
    const next = plants.slice();
    const idx = next.findIndex((plant) => plant.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= next.length) return;
    const a = next[idx], b = next[swap];
    const all = (data.plants.plants || []).map((plant) => {
      if (plant.id === a.id) return { ...plant, sort: b.sort };
      if (plant.id === b.id) return { ...plant, sort: a.sort };
      return plant;
    });
    await savePlantFile(all);
  };

  const saveSettings = async () => {
    await onSaveSettings({ ...data.settings, ...settingsDraft });
  };

  return (
    <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 860, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">{t('settings.eyebrow')}</div>
        <h1 className="t-hero" style={{ margin: 0 }}>{t('settings.title')}</h1>
      </div>

      {warnings.length > 0 && (
        <div className="card col gap-2" style={{ padding: 18 }}>
          <div className="t-eyebrow">warnings</div>
          {warnings.map((warning) => <div key={warning.file} className="t-body" style={{ color: 'var(--bloom)' }}>{warning.file}: {warning.message}</div>)}
        </div>
      )}

      <div className="card col gap-3" style={{ padding: 22 }}>
        <div className="t-eyebrow">storage</div>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <InputBlock label={t('settings.appName')} value={settingsDraft.appName || ''} onChange={(value) => setSettingsDraft((settings) => ({ ...settings, appName: value }))} flex={1} />
          <InputBlock label={t('settings.startDate')} type="date" value={settingsDraft.startDate || ''} onChange={(value) => setSettingsDraft((settings) => ({ ...settings, startDate: value }))} flex={1} />
        </div>
        <button className="btn btn-primary" disabled={storageBusy} onClick={saveSettings} style={{ alignSelf: 'flex-start' }}>{t('settings.saveSettings')}</button>
      </div>

      {editingPlant && (
        <PlantEditor
          initial={editingPlant}
          storageBusy={storageBusy}
          error={plantError}
          language={language}
          t={t}
          onCancel={() => { setEditingPlant(null); setPlantError(''); }}
          onSave={upsertPlant}
        />
      )}

      <div className="card" style={{ padding: 22 }}>
        <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
          <div className="t-eyebrow">{t('settings.plants')}</div>
          <button className="btn btn-primary" onClick={() => { setPlantError(''); setEditingPlant(createPlantDraft(plants.length)); }}>{t('settings.newPlant')}</button>
        </div>
        <div className="col gap-2">
          {plants.map((plant, i) => (
            <div key={plant.id} className="row items-center gap-3" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-soft)', opacity: plant.visible === false ? .55 : 1 }}>
              <Plant stage={2} size={36} color={`var(--${plant.color})`} />
              <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <div className="row items-baseline gap-2">
                  <span className="t-body-strong">{GardenI18n.displayPlantName(plant, language)}</span>
                  <span className="t-tiny mono">{plant.name}</span>
                  {plant.visible === false && <span className="chip">{t('settings.hidden')}</span>}
                </div>
                <div className="t-tiny">{plant.desc}</div>
              </div>
              <div className="row gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" disabled={i === 0} onClick={() => movePlant(plant.id, -1)}>{t('settings.up')}</button>
                <button className="btn btn-ghost" disabled={i === plants.length - 1} onClick={() => movePlant(plant.id, 1)}>{t('settings.down')}</button>
                <button className="btn btn-ghost" onClick={() => toggleVisible(plant.id)}>{plant.visible === false ? t('settings.show') : t('settings.hide')}</button>
                <button className="btn btn-ghost" onClick={() => { setPlantError(''); setEditingPlant({ ...cloneJson(plant), __originalId: plant.id }); }}>{t('settings.edit')}</button>
                <button className="btn btn-ghost" onClick={() => softDeletePlant(plant.id)}>{t('settings.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlantEditor({ initial, storageBusy, error, language, t, onCancel, onSave }) {
  const [draft, setDraft] = useStateL(() => cloneJson(initial));
  const issues = validatePlantDraft(draft, t);
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateField = (idx, key, value) => {
    setDraft((prev) => ({
      ...prev,
      fields: (prev.fields || []).map((field, i) => i === idx ? { ...field, [key]: value } : field),
    }));
  };
  const addField = () => setDraft((prev) => ({ ...prev, fields: [...(prev.fields || []), createFieldDraft((prev.fields || []).length)] }));
  const deleteField = (idx) => {
    if (!confirmDanger(t('settings.deleteFieldConfirm'))) return;
    setDraft((prev) => ({ ...prev, fields: (prev.fields || []).filter((_, i) => i !== idx) }));
  };

  return (
    <div className="card col gap-3" style={{ padding: 22 }}>
      <div className="row justify-between items-center">
        <div className="t-eyebrow">{t('settings.editor')}</div>
        <button className="btn btn-ghost" onClick={onCancel}>{t('settings.cancel')}</button>
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <InputBlock label={t('settings.plantId')} value={draft.id || ''} onChange={(value) => set('id', value)} flex={1} />
        <InputBlock label={t('settings.plantJp')} value={draft.jp || ''} onChange={(value) => set('jp', value)} flex={1} />
        <InputBlock label={t('settings.plantName')} value={draft.name || ''} onChange={(value) => set('name', value)} flex={1} />
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <SelectBlock label={t('settings.color')} value={draft.color || 'leaf-500'} options={['leaf-700', 'leaf-500', 'leaf-300', 'sky', 'petal', 'pollen', 'bloom', 'earth-500']} onChange={(value) => set('color', value)} flex={1} />
        <InputBlock label={t('settings.desc')} value={draft.desc || ''} onChange={(value) => set('desc', value)} flex={2} />
      </div>
      <label className="row items-center gap-2 t-body">
        <input type="checkbox" checked={draft.visible !== false} onChange={(event) => set('visible', event.target.checked)} />
        {t('settings.visible')}
      </label>

      <div className="row justify-between items-center">
        <div className="t-eyebrow">fields</div>
        <button className="btn" onClick={addField}>{t('settings.addField')}</button>
      </div>
      <div className="col gap-2">
        {(draft.fields || []).map((field, idx) => (
          <div key={idx} className="card-sunk col gap-2" style={{ padding: 12 }}>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <InputBlock label={t('settings.fieldId')} value={field.id || ''} onChange={(value) => updateField(idx, 'id', value)} flex={1} />
              <InputBlock label={t('settings.fieldLabel')} value={field.label || GardenI18n.displayFieldLabel(field, language)} onChange={(value) => updateField(idx, 'label', value)} flex={1} />
              <SelectBlock label={t('settings.fieldType')} value={field.type || 'text'} options={GardenSchema.FIELD_TYPES} onChange={(value) => updateField(idx, 'type', value)} flex={1} />
            </div>
            <div className="row gap-2 items-center" style={{ flexWrap: 'wrap' }}>
              <InputBlock label={t('settings.fieldUnit')} value={field.unit || ''} onChange={(value) => updateField(idx, 'unit', value)} flex={1} />
              <InputBlock label={t('settings.fieldOptions')} value={field.optionsText != null ? field.optionsText : (field.options || []).join(', ')} onChange={(value) => updateField(idx, 'optionsText', value)} flex={2} />
              <label className="row items-center gap-2 t-body" style={{ paddingTop: 18 }}>
                <input type="checkbox" checked={!!field.required} onChange={(event) => updateField(idx, 'required', event.target.checked)} />
                {t('settings.fieldRequired')}
              </label>
              <button className="btn btn-ghost" onClick={() => deleteField(idx)} style={{ marginTop: 18 }}>{t('settings.delete')}</button>
            </div>
          </div>
        ))}
      </div>
      <div className="row justify-between">
        <span className="t-tiny mono">{draft.id || 'new plant'}</span>
        <button className="btn btn-primary" disabled={storageBusy || issues.length > 0} onClick={() => onSave(draft)}>{t('settings.savePlant')}</button>
      </div>
      {(error || issues.length > 0) && <ValidationList issues={error ? [{ message: error }] : issues} />}
    </div>
  );
}

function ValidationList({ issues }) {
  return (
    <div className="notice col gap-1" style={{ color: 'var(--bloom)' }}>
      {issues.map((issue, idx) => <div key={issue.path || idx} className="t-small">{issue.message}</div>)}
    </div>
  );
}

function validateLibraryDraft(kind, draft, t) {
  const issues = [];
  if (!String(draft.title || '').trim()) {
    issues.push({ path: 'title', message: t('validation.titleRequired') });
  }
  if (kind === 'articles' && String(draft.url || '').trim() && !isValidHttpUrl(draft.url)) {
    issues.push({ path: 'url', message: t('validation.url') });
  }
  if (kind === 'books') {
    const progress = Number(draft.progress || 0);
    if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
      issues.push({ path: 'progress', message: t('validation.progress') });
    }
  }
  return issues;
}

function validatePlantDraft(draft, t) {
  const issues = [];
  if (!String(draft.jp || draft.name || '').trim()) {
    issues.push({ path: 'plant.name', message: t('validation.plantName') });
  }
  if (!String(draft.id || draft.name || draft.jp || '').trim()) {
    issues.push({ path: 'plant.id', message: t('validation.plantId') });
  }
  const fields = Array.isArray(draft.fields) ? draft.fields : [];
  if (fields.length === 0) {
    issues.push({ path: 'fields', message: t('validation.fieldRequired') });
  }
  const seen = new Set();
  fields.forEach((field, index) => {
    const id = String(field.id || '').trim();
    const normalizedId = GardenSchema.safeId(id);
    if (!id) {
      issues.push({ path: `fields[${index}].id`, message: t('validation.fieldId') });
    } else if (seen.has(normalizedId)) {
      issues.push({ path: `fields[${index}].id`, message: t('validation.duplicateField', { id: normalizedId }) });
    } else {
      seen.add(normalizedId);
    }
    if (!String(field.label || '').trim()) {
      issues.push({ path: `fields[${index}].label`, message: t('validation.fieldLabel') });
    }
    const options = field.optionsText != null ? normalizeTags(field.optionsText) : normalizeTags(field.options || []);
    if (field.type === 'select' && options.length === 0) {
      issues.push({ path: `fields[${index}].options`, message: t('validation.selectOptions') });
    }
  });
  return issues;
}

function formatValidationIssues(issues) {
  const messages = issues.map((issue) => issue.message).filter(Boolean);
  return messages.slice(0, 3).join(' ') + (messages.length > 3 ? ` (+${messages.length - 3} more)` : '');
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function confirmDanger(message) {
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') return true;
  return window.confirm(message);
}

function InputBlock({ label, value, onChange, type = 'text', flex = 1 }) {
  return (
    <div style={{ flex, minWidth: 160 }}>
      <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <input className="input" type={type} value={value ?? ''} onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} />
    </div>
  );
}

function SelectBlock({ label, value, options, onChange, flex = 1 }) {
  return (
    <div style={{ flex, minWidth: 150 }}>
      <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <select className="input" value={value || ''} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function createLibraryDraft(kind) {
  const base = { id: '', title: '', tags: [], body: '' };
  if (kind === 'books') return { ...base, author: '', progress: 0, status: 'reading' };
  if (kind === 'articles') return { ...base, url: '', source: '', status: 'unread' };
  return base;
}

function createPlantDraft(count) {
  return {
    id: '',
    name: '',
    jp: '',
    emoji: '🌱',
    color: 'leaf-500',
    desc: '',
    visible: true,
    sort: (count + 1) * 10,
    fields: [createFieldDraft(0)],
  };
}

function createFieldDraft(index) {
  return { id: `field_${index + 1}`, label: '新しい項目', type: 'text', required: false };
}

function normalizeFieldDraft(field, index) {
  const type = GardenSchema.FIELD_TYPES.includes(field.type) ? field.type : 'text';
  const out = {
    id: GardenSchema.safeId(field.id || `field_${index + 1}`),
    label: field.label || field.id || `項目${index + 1}`,
    type,
    required: !!field.required,
  };
  if (field.unit) out.unit = field.unit;
  if (type === 'avoidance_count' && !out.unit) out.unit = '回';
  const options = field.optionsText != null ? normalizeTags(field.optionsText) : (field.options || []);
  if (type === 'select') out.options = options.length ? options : ['未分類'];
  return out;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
  return String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

window.LibraryScreen = LibraryScreen;
window.StudyScreen = StudyScreen;
window.SettingsScreen = SettingsScreen;
