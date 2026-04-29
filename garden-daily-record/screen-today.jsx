/* global React, Plant, GardenCalc */
// Today screen — dynamic daily input form backed by JSON entries.

const { useEffect: useEffectT, useMemo: useMemoT, useState: useStateT } = React;

function TodayScreen({ data, summary, selectedDate, onDateChange, onSaveEntry, storageBusy }) {
  const plants = useMemoT(() => summary.plants, [summary.plants]);
  const entry = data.entries.entries[selectedDate] || { values: {} };
  const [draft, setDraft] = useStateT(() => cloneEntryValues(entry.values));
  const [savedAt, setSavedAt] = useStateT('');
  const [error, setError] = useStateT('');

  useEffectT(() => {
    setDraft(cloneEntryValues((data.entries.entries[selectedDate] || { values: {} }).values));
    setSavedAt('');
    setError('');
  }, [data.entries, selectedDate]);

  const done = plants.filter((plant) => GardenCalc.isPlantDone(plant, draft[plant.id])).length;
  const pct = plants.length ? Math.round((done / plants.length) * 100) : 0;
  const dateObj = parseLocalDateT(selectedDate);

  const updateField = (plantId, fieldId, value) => {
    setDraft((prev) => ({
      ...prev,
      [plantId]: {
        ...(prev[plantId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const save = async () => {
    setError('');
    try {
      await onSaveEntry(selectedDate, draft);
      const n = new Date();
      setSavedAt(`${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`);
    } catch (err) {
      setError(err?.message || String(err));
    }
  };

  return (
    <div className="col gap-4" style={{ padding: '32px 40px 80px', maxWidth: 760, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">water · {selectedDate} · {['日','月','火','水','木','金','土'][dateObj.getDay()]}</div>
        <div className="row justify-between items-end gap-3" style={{ flexWrap: 'wrap' }}>
          <h1 className="t-hero" style={{ margin: 0 }}>
            今日の<span style={{ fontStyle: 'italic', color: 'var(--leaf-700)' }}>手入れ</span>
          </h1>
          <input className="input" type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
            style={{ width: 168 }} />
        </div>
        <div className="t-body">
          {plants.length}つの植物のうち <b style={{ color: 'var(--ink)' }}>{done}つ</b> 完了。
        </div>
        <div className="bar-track" style={{ marginTop: 4 }}>
          <div className="bar-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      {plants.length === 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div className="t-body">設定画面で植物を追加してください。</div>
        </div>
      )}

      {plants.map((plant) => (
        <FieldCard key={plant.id} plant={plant} values={draft[plant.id]}>
          <div className="col gap-3">
            {GardenCalc.getActiveFields(plant).map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={(draft[plant.id] || {})[field.id]}
                onChange={(value) => updateField(plant.id, field.id, value)}
              />
            ))}
          </div>
        </FieldCard>
      ))}

      <div className="row items-center justify-between" style={{ marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
        <div className="t-tiny">
          {error && <span style={{ color: 'var(--bloom)' }}>{error}</span>}
          {!error && savedAt && <>保存済み <span className="mono">{savedAt}</span></>}
          {!error && !savedAt && <>未保存</>}
        </div>
        <div className="row gap-2">
          <button className="btn" onClick={() => setDraft(cloneEntryValues(entry.values))}>元に戻す</button>
          <button className="btn btn-primary btn-lg" disabled={storageBusy} onClick={save}>
            {storageBusy ? '保存中…' : '水をやる →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldCard({ children, plant, values }) {
  const done = GardenCalc.isPlantDone(plant, values);
  return (
    <div className="card" style={{ padding: 18, position: 'relative' }}>
      <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
        <Plant stage={Math.min(plant.stage || 1, 3)} size={34} color={`var(--${plant.color})`} />
        <div className="col" style={{ gap: 0, flex: 1 }}>
          <div className="t-body-strong">{plant.jp}</div>
          <div className="t-tiny mono">{plant.name} · {plant.streak || 0}d streak</div>
        </div>
        {done ? <span className="chip chip-leaf">完了</span> : <span className="chip">未記録</span>}
      </div>
      {children}
    </div>
  );
}

function DynamicField({ field, value, onChange }) {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  if (field.type === 'boolean') {
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <div className="row gap-2">
          {[{ v: true, label: 'はい' }, { v: false, label: 'いいえ' }].map((o) => (
            <button key={String(o.v)} className="btn" onClick={() => onChange(o.v)}
              style={{
                flex: 1,
                justifyContent: 'center',
                borderColor: value === o.v ? 'var(--leaf-700)' : 'var(--line)',
                background: value === o.v ? 'var(--leaf-50)' : 'var(--bg-card)',
                color: value === o.v ? 'var(--leaf-700)' : 'var(--ink)',
                fontWeight: value === o.v ? 600 : 500,
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">未選択</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <textarea className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder={`${field.label}を書く`} />
      </div>
    );
  }
  const isNumeric = field.type === 'number' || field.type === 'duration';
  return (
    <div>
      <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <div className="row items-center gap-2">
        <input className="input" type={isNumeric ? 'number' : 'text'} value={value ?? ''}
          min={isNumeric ? 0 : undefined}
          step={field.type === 'number' ? 0.25 : 1}
          onChange={(e) => onChange(isNumeric ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          style={isNumeric ? { maxWidth: 140 } : undefined} />
        {field.unit && <span className="t-body">{field.unit}</span>}
      </div>
    </div>
  );
}

function cloneEntryValues(values) {
  return JSON.parse(JSON.stringify(values || {}));
}

function parseLocalDateT(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

window.TodayScreen = TodayScreen;
