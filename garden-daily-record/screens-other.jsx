/* global React, Plant, GardenSchema, GardenCalc */
// Library + Study log + Settings screens backed by JSON data.

const { useEffect: useEffectL, useMemo: useMemoL, useState: useStateL } = React;

function LibraryScreen({ data, summary, onSaveLibrary, storageBusy }) {
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
    const file = cloneJson(data.library);
    file[kind] = (file[kind] || []).map((item) => item.id === id
      ? { ...item, deletedAt: GardenSchema.nowIso(), updatedAt: GardenSchema.nowIso() }
      : item);
    await onSaveLibrary(file);
  };

  const currentItems = summary.library[tab] || [];

  return (
    <div className="col gap-4" style={{ padding: '32px 40px 80px', maxWidth: 980, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">library · words</div>
        <h1 className="t-hero" style={{ margin: 0 }}>
          <span style={{ fontStyle: 'italic', color: 'var(--petal)' }}>読んだ</span>こと、<span style={{ fontStyle: 'italic', color: 'var(--petal)' }}>気づいた</span>こと
        </h1>
      </div>

      <div className="row justify-between items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div className="seg" style={{ alignSelf: 'flex-start' }}>
          {[
            { v: 'books', label: `本 · ${counts.books}` },
            { v: 'notes', label: `メモ · ${counts.notes}` },
            { v: 'articles', label: `記事 · ${counts.articles}` },
          ].map(t => (
            <button key={t.v} className={`seg-btn ${tab === t.v ? 'active' : ''}`} onClick={() => { setTab(t.v); setEditing(null); }}>{t.label}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ kind: tab, item: createLibraryDraft(tab) })}>追加</button>
      </div>

      {editing && (
        <LibraryEditor
          kind={editing.kind}
          initial={editing.item}
          storageBusy={storageBusy}
          onCancel={() => setEditing(null)}
          onSave={(item) => saveItem(editing.kind, item)}
        />
      )}

      <LibraryList
        kind={tab}
        items={currentItems}
        onEdit={(item) => setEditing({ kind: tab, item: cloneJson(item) })}
        onDelete={(id) => deleteItem(tab, id)}
      />
    </div>
  );
}

function LibraryEditor({ kind, initial, storageBusy, onCancel, onSave }) {
  const [draft, setDraft] = useStateL(() => ({ ...initial, tagsText: (initial.tags || []).join(', ') }));
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const save = () => {
    const { tagsText, ...item } = draft;
    onSave({ ...item, tags: tagsText });
  };
  return (
    <div className="card col gap-3" style={{ padding: 18 }}>
      <div className="row justify-between items-center">
        <div className="t-eyebrow">{kind}</div>
        <button className="btn btn-ghost" onClick={onCancel}>閉じる</button>
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <InputBlock label="タイトル" value={draft.title} onChange={(v) => set('title', v)} flex={2} />
        {kind === 'books' && <InputBlock label="著者" value={draft.author} onChange={(v) => set('author', v)} flex={1} />}
        {kind === 'articles' && <InputBlock label="URL" value={draft.url} onChange={(v) => set('url', v)} flex={2} />}
        {kind === 'articles' && <InputBlock label="出典" value={draft.source} onChange={(v) => set('source', v)} flex={1} />}
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        {kind === 'books' && (
          <>
            <InputBlock label="進捗 %" type="number" value={Math.round((draft.progress || 0) * 100)} onChange={(v) => set('progress', Math.max(0, Math.min(100, Number(v))) / 100)} flex={1} />
            <SelectBlock label="状態" value={draft.status || 'reading'} options={['reading', 'done', 'wishlist']} onChange={(v) => set('status', v)} flex={1} />
          </>
        )}
        {kind === 'articles' && <SelectBlock label="状態" value={draft.status || 'unread'} options={['unread', 'reading', 'done']} onChange={(v) => set('status', v)} flex={1} />}
        <InputBlock label="タグ" value={draft.tagsText || ''} onChange={(v) => set('tagsText', v)} flex={2} />
      </div>
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>本文</label>
        <textarea className="input" value={draft.body || ''} onChange={(e) => set('body', e.target.value)} style={{ minHeight: 120 }} />
      </div>
      <div className="row justify-between items-center">
        <span className="t-tiny mono">{draft.id || 'new item'}</span>
        <button className="btn btn-primary" disabled={storageBusy || !String(draft.title || '').trim()} onClick={save}>保存</button>
      </div>
    </div>
  );
}

function LibraryList({ kind, items, onEdit, onDelete }) {
  if (!items.length) {
    return <div className="card" style={{ padding: 28, textAlign: 'center' }}><div className="t-body">まだ記録がありません</div></div>;
  }
  if (kind === 'books') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((b, i) => (
          <div key={b.id} className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: 110, marginLeft: -16, marginRight: -16, marginTop: -16, marginBottom: 12,
              background: `linear-gradient(135deg, ${['var(--leaf-700)', 'var(--bloom)', 'var(--earth-500)', 'var(--sky)', 'var(--petal)'][i % 5]} 0%, var(--ink) 100%)`,
            }}>
              <div style={{ padding: 14, color: 'rgba(255,255,255,.95)' }}>
                <div className="serif" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.2 }}>{b.title}</div>
                <div className="t-tiny mono" style={{ color: 'rgba(255,255,255,.75)', marginTop: 6 }}>{b.author}</div>
              </div>
            </div>
            <div className="row justify-between items-center" style={{ marginBottom: 6 }}>
              <span className="t-tiny mono">{b.status === 'done' ? '読了' : `${Math.round((b.progress || 0) * 100)}%`}</span>
              <span className="t-tiny">{(b.tags || []).map((t) => `#${t}`).join(' ')}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(b.progress || 0) * 100}%`, background: b.status === 'done' ? 'var(--leaf-700)' : 'var(--leaf-500)' }}></div>
            </div>
            <ItemActions onEdit={() => onEdit(b)} onDelete={() => onDelete(b.id)} />
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
            <ItemActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
          </div>
          <div className="t-h2 serif" style={{ marginBottom: 4 }}>{item.title}</div>
          {kind === 'articles' && item.url && <div className="t-tiny mono" style={{ marginBottom: 8 }}>{item.url}</div>}
          <div className="t-body" style={{ whiteSpace: 'pre-wrap' }}>{item.body}</div>
        </div>
      ))}
    </div>
  );
}

function ItemActions({ onEdit, onDelete }) {
  return (
    <div className="row gap-2" style={{ marginLeft: 'auto' }}>
      <button className="btn btn-ghost" onClick={onEdit}>編集</button>
      <button className="btn btn-ghost" onClick={onDelete}>削除</button>
    </div>
  );
}

function StudyScreen({ summary }) {
  const topics = Object.entries(summary.study.byTopic).sort((a,b) => b[1] - a[1]);
  const totalMin = topics.reduce((s, [,v]) => s + v, 0);

  return (
    <div className="col gap-4" style={{ padding: '32px 40px 80px', maxWidth: 980, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">study log · mind</div>
        <h1 className="t-hero" style={{ margin: 0 }}>
          <span style={{ fontStyle: 'italic', color: 'var(--leaf-700)' }}>{Math.round(totalMin/60*10)/10}</span> 時間、<br/>分け入った深さ
        </h1>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>by topic</div>
        {topics.length === 0 ? (
          <div className="t-body">学習記録がまだありません。</div>
        ) : (
          <div className="col gap-3">
            {topics.map(([t, m], i) => (
              <div key={t} className="col gap-1">
                <div className="row justify-between items-baseline">
                  <span className="t-body-strong">#{t}</span>
                  <span className="t-tiny mono"><span className="t-num" style={{ color: 'var(--ink)' }}>{Math.round(m/60*10)/10}</span>h · {Math.round(m/totalMin*100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{
                    width: `${(m/topics[0][1])*100}%`,
                    background: i === 0 ? 'var(--leaf-700)' : i < 3 ? 'var(--leaf-500)' : 'var(--leaf-300)',
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>recent sessions</div>
        <div className="col" style={{ gap: 0 }}>
          {summary.study.recentSessions.length === 0 && <div className="t-body">まだセッションがありません。</div>}
          {summary.study.recentSessions.map((d, i) => (
            <div key={d.date} className="row items-center gap-3" style={{ padding: '12px 0', borderBottom: i < summary.study.recentSessions.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span className="t-tiny mono" style={{ width: 78, color: 'var(--ink-faint)' }}>{d.date.slice(5)}</span>
              <span className="t-tiny" style={{ width: 20 }}>{summary.dayName(d.day)}</span>
              <span className="chip chip-leaf">#{d.topic}</span>
              <div style={{ flex: 1 }}></div>
              <span className="t-num" style={{ fontSize: 18 }}>{d.study}</span>
              <span className="t-tiny">分</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ data, onSavePlants, onSaveSettings, storageBusy, warnings }) {
  const plants = useMemoL(() => (data.plants.plants || []).filter((p) => !p.deletedAt).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)), [data.plants]);
  const [editingPlant, setEditingPlant] = useStateL(null);
  const [settingsDraft, setSettingsDraft] = useStateL(() => ({ ...data.settings }));

  useEffectL(() => {
    setSettingsDraft({ ...data.settings });
  }, [data.settings]);

  const savePlantFile = async (nextPlants) => {
    await onSavePlants({ ...data.plants, plants: nextPlants });
    setEditingPlant(null);
  };

  const upsertPlant = async (plant) => {
    const next = cloneJson(data.plants.plants || []);
    const now = GardenSchema.nowIso();
    const normalized = {
      ...plant,
      id: GardenSchema.safeId(plant.id || plant.name || plant.jp),
      name: plant.name || GardenSchema.safeId(plant.jp),
      jp: plant.jp || plant.name || '新しい植物',
      visible: plant.visible !== false,
      sort: Number.isFinite(Number(plant.sort)) ? Number(plant.sort) : (next.length + 1) * 10,
      fields: (plant.fields || []).map((field, i) => normalizeFieldDraft(field, i)),
      updatedAt: now,
    };
    const idx = next.findIndex((p) => p.id === normalized.id);
    await savePlantFile(idx >= 0 ? next.map((p) => p.id === normalized.id ? normalized : p) : [...next, normalized]);
  };

  const softDeletePlant = async (id) => {
    const next = (data.plants.plants || []).map((p) => p.id === id ? { ...p, deletedAt: GardenSchema.nowIso() } : p);
    await savePlantFile(next);
  };

  const toggleVisible = async (id) => {
    const next = (data.plants.plants || []).map((p) => p.id === id ? { ...p, visible: p.visible === false } : p);
    await savePlantFile(next);
  };

  const movePlant = async (id, dir) => {
    const next = plants.slice();
    const idx = next.findIndex((p) => p.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= next.length) return;
    const a = next[idx], b = next[swap];
    const all = (data.plants.plants || []).map((p) => {
      if (p.id === a.id) return { ...p, sort: b.sort };
      if (p.id === b.id) return { ...p, sort: a.sort };
      return p;
    });
    await savePlantFile(all);
  };

  const saveSettings = async () => {
    await onSaveSettings({ ...data.settings, ...settingsDraft });
  };

  return (
    <div className="col gap-4" style={{ padding: '32px 40px 80px', maxWidth: 860, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">settings</div>
        <h1 className="t-hero" style={{ margin: 0 }}>
          あなたの<span style={{ fontStyle: 'italic', color: 'var(--leaf-700)' }}>植物</span>を整える
        </h1>
      </div>

      {warnings.length > 0 && (
        <div className="card col gap-2" style={{ padding: 18 }}>
          <div className="t-eyebrow">warnings</div>
          {warnings.map((w) => <div key={w.file} className="t-body" style={{ color: 'var(--bloom)' }}>{w.file}: {w.message}</div>)}
        </div>
      )}

      <div className="card col gap-3" style={{ padding: 22 }}>
        <div className="t-eyebrow">storage</div>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <InputBlock label="アプリ名" value={settingsDraft.appName || ''} onChange={(v) => setSettingsDraft((s) => ({ ...s, appName: v }))} flex={1} />
          <InputBlock label="開始日" type="date" value={settingsDraft.startDate || ''} onChange={(v) => setSettingsDraft((s) => ({ ...s, startDate: v }))} flex={1} />
        </div>
        <button className="btn btn-primary" disabled={storageBusy} onClick={saveSettings} style={{ alignSelf: 'flex-start' }}>設定を保存</button>
      </div>

      {editingPlant && (
        <PlantEditor
          initial={editingPlant}
          storageBusy={storageBusy}
          onCancel={() => setEditingPlant(null)}
          onSave={upsertPlant}
        />
      )}

      <div className="card" style={{ padding: 22 }}>
        <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
          <div className="t-eyebrow">plants · 管理項目</div>
          <button className="btn btn-primary" onClick={() => setEditingPlant(createPlantDraft(plants.length))}>新しい植物</button>
        </div>
        <div className="col gap-2">
          {plants.map((p, i) => (
            <div key={p.id} className="row items-center gap-3" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-soft)', opacity: p.visible === false ? .55 : 1 }}>
              <Plant stage={2} size={36} color={`var(--${p.color})`} />
              <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <div className="row items-baseline gap-2">
                  <span className="t-body-strong">{p.jp}</span>
                  <span className="t-tiny mono">{p.name}</span>
                  {p.visible === false && <span className="chip">非表示</span>}
                </div>
                <div className="t-tiny">{p.desc}</div>
              </div>
              <div className="row gap-2" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" disabled={i === 0} onClick={() => movePlant(p.id, -1)}>↑</button>
                <button className="btn btn-ghost" disabled={i === plants.length - 1} onClick={() => movePlant(p.id, 1)}>↓</button>
                <button className="btn btn-ghost" onClick={() => toggleVisible(p.id)}>{p.visible === false ? '表示' : '非表示'}</button>
                <button className="btn btn-ghost" onClick={() => setEditingPlant(cloneJson(p))}>編集</button>
                <button className="btn btn-ghost" onClick={() => softDeletePlant(p.id)}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlantEditor({ initial, storageBusy, onCancel, onSave }) {
  const [draft, setDraft] = useStateL(() => cloneJson(initial));
  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateField = (idx, key, value) => {
    setDraft((prev) => ({
      ...prev,
      fields: (prev.fields || []).map((field, i) => i === idx ? { ...field, [key]: value } : field),
    }));
  };
  const addField = () => setDraft((prev) => ({ ...prev, fields: [...(prev.fields || []), createFieldDraft((prev.fields || []).length)] }));
  const deleteField = (idx) => setDraft((prev) => ({ ...prev, fields: (prev.fields || []).filter((_, i) => i !== idx) }));

  return (
    <div className="card col gap-3" style={{ padding: 22 }}>
      <div className="row justify-between items-center">
        <div className="t-eyebrow">plant editor</div>
        <button className="btn btn-ghost" onClick={onCancel}>閉じる</button>
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <InputBlock label="ID" value={draft.id || ''} onChange={(v) => set('id', v)} flex={1} />
        <InputBlock label="表示名" value={draft.jp || ''} onChange={(v) => set('jp', v)} flex={1} />
        <InputBlock label="英名" value={draft.name || ''} onChange={(v) => set('name', v)} flex={1} />
      </div>
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <SelectBlock label="色" value={draft.color || 'leaf-500'} options={['leaf-700', 'leaf-500', 'leaf-300', 'sky', 'petal', 'pollen', 'bloom', 'earth-500']} onChange={(v) => set('color', v)} flex={1} />
        <InputBlock label="説明" value={draft.desc || ''} onChange={(v) => set('desc', v)} flex={2} />
      </div>
      <div className="row items-center gap-2">
        <input type="checkbox" checked={draft.visible !== false} onChange={(e) => set('visible', e.target.checked)} />
        <span className="t-body">表示する</span>
      </div>

      <div className="row justify-between items-center">
        <div className="t-eyebrow">fields</div>
        <button className="btn" onClick={addField}>フィールド追加</button>
      </div>
      <div className="col gap-2">
        {(draft.fields || []).map((field, idx) => (
          <div key={idx} className="card-sunk col gap-2" style={{ padding: 12 }}>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <InputBlock label="ID" value={field.id || ''} onChange={(v) => updateField(idx, 'id', v)} flex={1} />
              <InputBlock label="ラベル" value={field.label || ''} onChange={(v) => updateField(idx, 'label', v)} flex={1} />
              <SelectBlock label="型" value={field.type || 'text'} options={GardenSchema.FIELD_TYPES} onChange={(v) => updateField(idx, 'type', v)} flex={1} />
            </div>
            <div className="row gap-2 items-center" style={{ flexWrap: 'wrap' }}>
              <InputBlock label="単位" value={field.unit || ''} onChange={(v) => updateField(idx, 'unit', v)} flex={1} />
              <InputBlock label="選択肢" value={field.optionsText != null ? field.optionsText : (field.options || []).join(', ')} onChange={(v) => updateField(idx, 'optionsText', v)} flex={2} />
              <label className="row items-center gap-2 t-body" style={{ paddingTop: 18 }}>
                <input type="checkbox" checked={!!field.required} onChange={(e) => updateField(idx, 'required', e.target.checked)} />
                必須
              </label>
              <button className="btn btn-ghost" onClick={() => deleteField(idx)} style={{ marginTop: 18 }}>削除</button>
            </div>
          </div>
        ))}
      </div>
      <div className="row justify-between">
        <span className="t-tiny mono">{draft.id || 'new plant'}</span>
        <button className="btn btn-primary" disabled={storageBusy || !String(draft.jp || draft.name || '').trim()} onClick={() => onSave(draft)}>保存</button>
      </div>
    </div>
  );
}

function InputBlock({ label, value, onChange, type = 'text', flex = 1 }) {
  return (
    <div style={{ flex, minWidth: 160 }}>
      <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <input className="input" type={type} value={value ?? ''} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} />
    </div>
  );
}

function SelectBlock({ label, value, options, onChange, flex = 1 }) {
  return (
    <div style={{ flex, minWidth: 150 }}>
      <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
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
  const options = field.optionsText != null ? normalizeTags(field.optionsText) : (field.options || []);
  if (type === 'select') out.options = options.length ? options : ['未分類'];
  return out;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(String).map((t) => t.trim()).filter(Boolean);
  return String(tags || '').split(',').map((t) => t.trim()).filter(Boolean);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

window.LibraryScreen = LibraryScreen;
window.StudyScreen = StudyScreen;
window.SettingsScreen = SettingsScreen;
