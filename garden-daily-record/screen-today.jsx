/* global React, Plant, GardenCalc, GardenI18n */
// Today screen: dynamic daily care input form backed by JSON entries.

const { useEffect: useEffectT, useMemo: useMemoT, useState: useStateT } = React;

function TodayScreen({ data, summary, selectedDate, onDateChange, onSaveEntry, onNav, storageBusy, language, t }) {
  const plants = useMemoT(() => summary.plants.filter((plant) => plant.id !== 'plan'), [summary.plants]);
  const entry = data.entries.entries[selectedDate] || { values: {} };
  const [draft, setDraft] = useStateT(() => cloneEntryValues(entry.values));
  const [savedAt, setSavedAt] = useStateT('');
  const [error, setError] = useStateT('');
  const savedValues = useMemoT(() => cloneEntryValues(entry.values), [entry.values]);

  useEffectT(() => {
    setDraft(cloneEntryValues((data.entries.entries[selectedDate] || { values: {} }).values));
    setError('');
  }, [data.entries, selectedDate]);

  useEffectT(() => {
    setSavedAt('');
    setError('');
  }, [selectedDate]);

  const done = plants.filter((plant) => GardenCalc.isPlantDone(plant, draft[plant.id])).length;
  const pct = plants.length ? Math.round((done / plants.length) * 100) : 0;
  const dateObj = parseLocalDateT(selectedDate);
  const missingRequired = plants.flatMap((plant) => (
    GardenCalc.missingRequiredFields(plant, draft[plant.id]).map((field) => ({ plant, field }))
  ));
  const missingLabels = missingRequired.slice(0, 3).map(({ plant, field }) => (
    `${GardenI18n.displayPlantName(plant, language)}: ${GardenI18n.displayFieldLabel(field, language)}`
  ));
  if (missingRequired.length > missingLabels.length) {
    missingLabels.push(t('today.moreMissing', { count: missingRequired.length - missingLabels.length }));
  }
  const isDirty = serializeEntryValues(draft) !== serializeEntryValues(savedValues);
  const hasSavedEntry = Boolean(data.entries.entries[selectedDate]);
  const statusText = error
    ? error
    : savedAt && !isDirty
      ? t('today.saved', { time: savedAt })
      : isDirty
        ? t('today.changed')
        : hasSavedEntry
          ? t('actions.saved')
          : t('today.unsaved');

  const updateField = (plantId, fieldId, value) => {
    setSavedAt('');
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
    <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 760, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">{t('today.eyebrow', { date: selectedDate, day: summary.dayName(dateObj) })}</div>
        <div className="row justify-between items-end gap-3" style={{ flexWrap: 'wrap' }}>
          <h1 className="t-hero" style={{ margin: 0 }}>{t('today.title')}</h1>
          <input className="input" type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
            style={{ width: 168 }} />
        </div>
        <div className="t-body">{t('today.progress', { total: plants.length, done })}</div>
        <div className="bar-track" style={{ marginTop: 4 }}>
          <div className="bar-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      <div className="notice row justify-between items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div className="t-body" style={{ flex: '1 1 260px' }}>
          {summary.plan?.state === 'done'
            ? t('today.planDone', { plan: summary.plan.value })
            : t('today.planEmpty')}
        </div>
        <button className="btn btn-ghost" onClick={() => onNav && onNav('plan')}>{t('today.editPlan')}</button>
      </div>

      <div className="card row items-center justify-between gap-3" style={{
        position: 'sticky',
        top: 64,
        zIndex: 5,
        padding: 14,
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div className="col gap-2" style={{ flex: '1 1 240px', minWidth: 0 }}>
          <div className="row items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <span className={`chip ${missingRequired.length === 0 ? 'chip-leaf' : 'chip-pollen'}`}>
              {missingRequired.length === 0
                ? t('today.completeReady')
                : t('today.missingRequired', { count: missingRequired.length })}
            </span>
            <span className="t-tiny" style={{ color: error ? 'var(--bloom)' : 'var(--ink-soft)' }}>{statusText}</span>
          </div>
          {missingLabels.length > 0 && (
            <div className="t-tiny" style={{ color: 'var(--ink-soft)' }}>
              {t('today.missingRequiredList', { items: missingLabels.join('、') })}
            </div>
          )}
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => { setDraft(cloneEntryValues(entry.values)); setSavedAt(''); }}>{t('today.reset')}</button>
          <button className="btn btn-primary" disabled={storageBusy || !isDirty} onClick={save}>
            {storageBusy ? t('today.saving') : t('today.save')}
          </button>
        </div>
      </div>

      {plants.length === 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div className="t-body">{t('today.noPlants')}</div>
        </div>
      )}

      {plants.map((plant) => (
        <FieldCard key={plant.id} plant={plant} values={draft[plant.id]} language={language} t={t}>
          <div className="col gap-3">
            {GardenCalc.getActiveFields(plant).map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={(draft[plant.id] || {})[field.id]}
                onChange={(value) => updateField(plant.id, field.id, value)}
                language={language}
                t={t}
              />
            ))}
          </div>
        </FieldCard>
      ))}

    </div>
  );
}

function FieldCard({ children, plant, values, language, t }) {
  const done = GardenCalc.isPlantDone(plant, values);
  return (
    <div className="card" style={{ padding: 18, position: 'relative' }}>
      <div className="row items-center gap-2" style={{ marginBottom: 12 }}>
        <Plant stage={Math.min(plant.stage || 1, 3)} size={34} color={`var(--${plant.color})`} />
        <div className="col" style={{ gap: 0, flex: 1 }}>
          <div className="t-body-strong">{GardenI18n.displayPlantName(plant, language)}</div>
          <div className="t-tiny mono">{plant.name} ・ {plant.streak || 0}d streak</div>
        </div>
        {done ? <span className="chip chip-leaf">{t('today.done')}</span> : <span className="chip">{t('today.pending')}</span>}
      </div>
      {children}
    </div>
  );
}

function DynamicField({ field, value, onChange, language, t }) {
  const label = `${GardenI18n.displayFieldLabel(field, language)}${field.required ? ' *' : ''}`;
  if (field.type === 'boolean') {
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <div className="row gap-2">
          {[{ v: true, label: t('today.yes') }, { v: false, label: t('today.no') }].map((o) => (
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
          <option value="">{t('today.unselected')}</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === 'avoidance_count') {
    const hasValue = value !== '' && value != null;
    const count = hasValue ? Math.max(0, Math.floor(Number(value))) : 0;
    const xp = hasValue ? Math.max(0, 12 - count * 3) : 0;
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <div className="row items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <input className="input" type="number" value={value ?? ''}
            min={0}
            step={1}
            onChange={(e) => onChange(e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value))))}
            style={{ maxWidth: 140 }} />
          {field.unit && <span className="t-body">{language === 'en' && field.unit === '回' ? t('units.count') : field.unit}</span>}
          <span className="chip chip-pollen">{t('today.avoidanceHelp')}</span>
          {hasValue && <span className="t-tiny mono">+{xp}xp</span>}
        </div>
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="t-tiny" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
        <textarea className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}
          placeholder={t('today.writePlaceholder', { label: GardenI18n.displayFieldLabel(field, language) })} />
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

function serializeEntryValues(values) {
  const stable = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = stable(value[key]);
      return acc;
    }, {});
  };
  return JSON.stringify(stable(values || {}));
}

function parseLocalDateT(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

window.TodayScreen = TodayScreen;
