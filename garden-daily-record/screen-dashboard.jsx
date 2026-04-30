/* global React, Plant, Garden, GardenI18n */
// Dashboard: derived garden overview from JSON entries.

function DashboardScreen({ summary, onNav, language, t }) {
  const studyHours = Math.round(summary.study.totalMinutes / 60 * 10) / 10;
  const sleepValues = summary.entries.map((d) => d.sleep).filter(Boolean);
  const sleepAvg = sleepValues.length
    ? Math.round((sleepValues.reduce((s, d) => s + d, 0) / sleepValues.length) * 10) / 10
    : 0;

  return (
    <div className="col gap-4" style={{ padding: '32px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="row items-end justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div className="col gap-2">
          <div className="t-eyebrow">{t('dashboard.eyebrow', { day: summary.dayNum })}</div>
          <h1 className="t-display" style={{ margin: 0 }}>{t('dashboard.title', { count: summary.plants.length })}</h1>
        </div>
        <div className="col gap-2 items-end">
          <div className="t-eyebrow">{t('dashboard.level', { level: summary.level.level })}</div>
          <div className="row items-baseline gap-2">
            <span className="t-num" style={{ fontSize: 36 }}>{summary.level.totalXp.toLocaleString()}</span>
            <span className="t-body">/ {summary.level.nextLevel.toLocaleString()} xp</span>
          </div>
          <div className="bar-track" style={{ width: 200 }}>
            <div className="bar-fill" style={{ width: `${Math.min(100, summary.level.totalXp / summary.level.nextLevel * 100)}%` }}></div>
          </div>
        </div>
      </div>

      <Garden plants={summary.plants} streak={summary.streak} onSelect={() => onNav && onNav('today')} season="spring" />

      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <StatCard icon="⋯" label={t('dashboard.streak')} value={summary.streak} unit={t('units.days')} accent="bloom" />
        <StatCard icon="✦" label={t('dashboard.studyTotal')} value={studyHours} unit={t('units.hours')} sub={t('dashboard.studyTotalSub')} />
        <StatCard icon="☾" label={t('dashboard.sleepAverage')} value={sleepAvg || t('values.empty')} unit={sleepAvg ? t('units.hours') : ''} sub={t('dashboard.sleepAverageSub')} />
        <StatCard icon="✿" label={t('dashboard.todayCare')} value={summary.today.careDone} unit={`/ ${summary.today.careTotal}`} sub={t('dashboard.todayCareSub')} />
      </div>

      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <TodaySnapshot summary={summary} onNav={onNav} language={language} t={t} />
        <WeekChart summary={summary} t={t} />
      </div>

      <BadgesRow summary={summary} studyHours={studyHours} t={t} />
    </div>
  );
}

function StatCard({ icon, label, value, unit, sub, accent }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 180, padding: 18 }}>
      <div className="row items-center gap-2" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div className="t-eyebrow">{label}</div>
      </div>
      <div className="row items-baseline gap-2">
        <span className="t-num" style={{ fontSize: 32, color: accent === 'bloom' ? 'var(--bloom)' : 'var(--ink)' }}>{value}</span>
        <span className="t-body">{unit}</span>
      </div>
      {sub && <div className="t-tiny" style={{ marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function TodaySnapshot({ summary, onNav, language, t }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 320, padding: 22 }}>
      <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
        <div>
          <div className="t-eyebrow">{t('dashboard.today')}</div>
          <div className="t-h2 serif" style={{ marginTop: 2 }}>{summary.todayKey}</div>
        </div>
        <button className="btn btn-primary" onClick={() => onNav && onNav('today')}>{t('dashboard.goToday')}</button>
      </div>
      <div className="t-body" style={{ marginBottom: 12 }}>
        <span className="t-num" style={{ fontSize: 22, color: 'var(--ink)' }}>{summary.today.careDone}</span> / {summary.today.careTotal} {t('dashboard.todayCareSub')}
      </div>
      <div className="col gap-2">
        {summary.today.careStatus.map((s, i) => (
          <div key={s.plant.id} className="row items-center gap-3" style={{ padding: '6px 0', borderBottom: i < summary.today.careStatus.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div style={{ width: 24, opacity: s.state === 'done' ? 1 : .35 }}>
              <Plant stage={s.state === 'done' ? Math.min(s.plant.stage, 3) : 1} size={24} color={`var(--${s.plant.color})`} />
            </div>
            <div className="t-body-strong" style={{ flex: 1 }}>{GardenI18n.displayPlantName(s.plant, language)}</div>
            <div className="t-body" style={{ color: s.state === 'done' ? 'var(--leaf-700)' : 'var(--ink-faint)' }}>
              {s.value}
            </div>
            {s.state === 'done' ? <span className="chip chip-leaf">{t('actions.done')}</span> : <span className="chip">{t('actions.pending')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekChart({ summary, t }) {
  const days = summary.entries.slice(-28);
  const max = Math.max(...days.map(d => d.study || 0), 60);
  return (
    <div className="card" style={{ flex: 1.4, minWidth: 360, padding: 22 }}>
      <div className="row justify-between items-center" style={{ marginBottom: 4 }}>
        <div className="t-eyebrow">{t('dashboard.studyWeeks')}</div>
        <div className="t-tiny mono">{t('dashboard.perDay')}</div>
      </div>
      <div className="t-h2 serif" style={{ marginTop: 2, marginBottom: 16 }}>
        <span className="t-num">{days.reduce((s,d) => s + (d.study || 0), 0)}</span>
        <span className="t-body" style={{ fontFamily: 'var(--sans)', marginLeft: 4 }}>min</span>
      </div>
      {days.length === 0 ? (
        <div className="card-sunk t-body" style={{ padding: 18, textAlign: 'center' }}>{t('dashboard.noEntries')}</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
            {days.map((d, i) => {
              const h = (d.study || 0) / max;
              const isToday = d.date === summary.todayKey;
              const dim = d.day.getDay() === 0 || d.day.getDay() === 6;
              return (
                <div key={i} title={`${d.date} ・ ${d.study}m`} style={{
                  flex: 1, height: `${Math.max(h * 100, d.logged ? 4 : 0)}%`, minHeight: d.logged ? 3 : 0,
                  background: isToday ? 'var(--bloom)' : (d.logged ? (dim ? 'var(--leaf-300)' : 'var(--leaf-500)') : 'var(--line)'),
                  borderRadius: 2,
                  opacity: d.logged ? 1 : 0.4,
                }}></div>
              );
            })}
          </div>
          <div className="row justify-between" style={{ marginTop: 8 }}>
            <span className="t-tiny mono">{t('dashboard.past')}</span>
            <span className="t-tiny mono">{t('dashboard.now')}</span>
          </div>
        </>
      )}
    </div>
  );
}

function BadgesRow({ summary, studyHours, t }) {
  const badges = [
    { icon: '✿', name: 'first sprout', earned: summary.entries.some((d) => d.logged), sub: 'first log' },
    { icon: '☀', name: '7-day streak', earned: summary.streak >= 7, sub: '7 days' },
    { icon: '⌘', name: 'deep roots', earned: studyHours >= 100, sub: '100h study' },
    { icon: '▣', name: 'book stack', earned: summary.library.books.length >= 5, sub: '5 books' },
    { icon: '✺', name: 'first bloom', earned: summary.plants.some((p) => p.stage >= 4), sub: 'stage 4' },
    { icon: '✦', name: 'reflective', earned: summary.plants.some((p) => p.id === 'reflect' && p.total >= 10), sub: '10 entries' },
  ];
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
        <div>
          <div className="t-eyebrow">{t('dashboard.badges')}</div>
          <div className="t-h2 serif" style={{ marginTop: 2 }}>
            <span className="t-num">{badges.filter(b => b.earned).length}</span>
            <span style={{ color: 'var(--ink-faint)' }}> / {badges.length}</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        {badges.map((b) => (
          <div key={b.name} className="row items-center gap-2" style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: b.earned ? 'var(--leaf-50)' : 'var(--bg-sunk)',
            border: '1px solid ' + (b.earned ? 'var(--leaf-100)' : 'var(--line)'),
            opacity: b.earned ? 1 : 0.55,
          }}>
            <div style={{ fontSize: 20, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.icon}</div>
            <div className="col" style={{ gap: 0, minWidth: 0 }}>
              <div className="t-body-strong" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
              <div className="t-tiny mono" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
