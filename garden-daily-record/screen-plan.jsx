/* global React, GardenCalc, GardenSchema, GardenI18n */
// Dedicated daily plan screen backed by the plan plant.

const { useEffect: useEffectP, useMemo: useMemoP, useState: useStateP } = React;

function PlanScreen({ data, summary, selectedDate, onDateChange, onSaveEntry, storageBusy, language, t }) {
  const planPlant = useMemoP(() => summary.plants.find((plant) => plant.id === 'plan'), [summary.plants]);
  const entry = data.entries.entries[selectedDate] || { values: {} };
  const initialPlan = entry.values?.plan || {};
  const field = planPlant ? GardenCalc.getActiveFields(planPlant).find((item) => item.id === 'today_plan') : null;
  const [draft, setDraft] = useStateP(() => ({ ...initialPlan }));
  const [savedAt, setSavedAt] = useStateP('');
  const [error, setError] = useStateP('');

  useEffectP(() => {
    const nextEntry = data.entries.entries[selectedDate] || { values: {} };
    setDraft({ ...(nextEntry.values?.plan || {}) });
    setSavedAt('');
    setError('');
  }, [data.entries, selectedDate]);

  const save = async () => {
    setError('');
    try {
      const currentEntry = data.entries.entries[selectedDate] || { values: {} };
      const values = GardenSchema.mergePlanEntryValues(currentEntry.values, draft);
      await onSaveEntry(selectedDate, values);
      const n = new Date();
      setSavedAt(`${n.getHours()}:${String(n.getMinutes()).padStart(2, '0')}`);
    } catch (err) {
      setError(err?.message || String(err));
    }
  };

  if (!planPlant || !field) {
    return (
      <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 760, margin: '0 auto' }}>
        <div className="card t-body">{t('plan.empty')}</div>
      </div>
    );
  }

  const done = GardenCalc.isPlantDone(planPlant, draft);
  const label = GardenI18n.displayFieldLabel(field, language);

  return (
    <div className="col gap-4" style={{ padding: '32px clamp(16px, 4vw, 40px) 80px', maxWidth: 760, margin: '0 auto' }}>
      <div className="col gap-2">
        <div className="t-eyebrow">{t('plan.eyebrow', { date: selectedDate })}</div>
        <div className="row justify-between items-end gap-3" style={{ flexWrap: 'wrap' }}>
          <h1 className="t-hero" style={{ margin: 0 }}>{t('plan.title')}</h1>
          <input className="input" type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
            style={{ width: 168 }} />
        </div>
        <div className="t-body">{t('plan.body')}</div>
      </div>

      <div className="card col gap-3" style={{
        padding: 22,
        borderColor: done ? 'var(--leaf-100)' : 'var(--line)',
        background: done ? 'color-mix(in oklab, var(--leaf-50) 42%, var(--bg-card))' : 'var(--bg-card)',
      }}>
        <div className="row justify-between items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <div>
            <div className="t-eyebrow">{GardenI18n.displayPlantName(planPlant, language)}</div>
            <label className="t-h2 serif" htmlFor="today-plan-input" style={{ display: 'block', marginTop: 2 }}>{label}</label>
          </div>
          <span className={`chip ${done ? 'chip-leaf' : ''}`}>{done ? t('actions.done') : t('actions.pending')}</span>
        </div>
        <textarea
          id="today-plan-input"
          className="input"
          value={draft.today_plan || ''}
          onChange={(e) => setDraft((prev) => ({ ...prev, today_plan: e.target.value }))}
          placeholder={t('plan.placeholder')}
          style={{ minHeight: 180 }}
        />
      </div>

      <div className="row items-center justify-between" style={{ marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
        <div className="t-tiny">
          {error && <span style={{ color: 'var(--bloom)' }}>{error}</span>}
          {!error && savedAt && <>{t('plan.saved', { time: savedAt })}</>}
          {!error && !savedAt && <>{t('today.unsaved')}</>}
        </div>
        <button className="btn btn-primary btn-lg" disabled={storageBusy} onClick={save}>
          {storageBusy ? t('today.saving') : t('actions.save')}
        </button>
      </div>
    </div>
  );
}

window.PlanScreen = PlanScreen;
