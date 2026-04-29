/* global React */
// Direction D: Organic / Garden — RPG growth as a living plant collection
// Each habit/study area is a plant; logging waters them; streaks grow them

function WfD_Today() {
  return (
    <div className="wf" style={{ background: '#f4f0e4' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="wf-text-sm" style={{ color: '#7a8a5a' }}>~ wednesday, april 29 ~</div>
          <div className="wf-h1" style={{ color: '#3a4a2a' }}>today's tending</div>
        </div>

        {/* watering can metaphor — each row is a plant to water */}
        <div className="wf-stack-sm" style={{ gap: 8, flex: 1 }}>
          {[
            { l: 'rest', plant: '🌙', sub: '7.5h', state: 'watered', desc: 'sleep · last night' },
            { l: 'body', plant: '🌿', sub: 'today?', state: 'wilting', desc: 'workout · tap if done' },
            { l: 'mind', plant: '🌳', sub: '__min', state: 'thirsty', desc: 'study · time + topic' },
            { l: 'words', plant: '🌸', sub: '__', state: 'thirsty', desc: 'reading · pages or notes' },
            { l: 'seed', plant: '✦', sub: '__', state: 'thirsty', desc: 'reflection · what bloomed today' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', borderBottom: '1px dotted #c0b8a0' }}>
              <div style={{ fontSize: 22, width: 32, textAlign: 'center', filter: r.state === 'thirsty' ? 'grayscale(.6) opacity(.5)' : 'none' }}>{r.plant}</div>
              <div style={{ flex: 1 }}>
                <div className="wf-h3" style={{ color: '#3a4a2a' }}>{r.l}</div>
                <div className="wf-text-sm">{r.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="wf-mono" style={{ fontSize: 11, color: r.state === 'watered' ? '#4a7a3a' : '#a08a5a' }}>{r.sub}</div>
                <div className="wf-text-sm" style={{ fontSize: 9, color: r.state === 'watered' ? '#4a7a3a' : '#a08a5a' }}>{r.state}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="wf-text-sm">+ plant a new seed</div>
          <div className="wf-btn" style={{ background: '#3a4a2a', color: '#f4f0e4', borderColor: '#3a4a2a' }}>
            water all 🜄
          </div>
        </div>
      </div>
    </div>
  );
}

function WfD_Dashboard() {
  return (
    <div className="wf" style={{ background: '#f4f0e4' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="wf-text-sm" style={{ color: '#7a8a5a' }}>~ your garden ~</div>
          <div className="wf-h1" style={{ color: '#3a4a2a' }}>day 142 · 8 plants growing</div>
        </div>

        {/* big garden view — plants at various sizes based on streak */}
        <div className="wf-box" style={{ background: '#e8e2d0', borderColor: '#7a8a5a', padding: 12, position: 'relative', flex: 1, minHeight: 130 }}>
          {/* ground line */}
          <div style={{ position: 'absolute', left: 8, right: 8, bottom: 18, borderTop: '1.5px solid #7a8a5a' }}></div>
          {/* plants */}
          {[
            { x: '8%', y: 'auto', size: 38, emoji: '🌳', label: 'study · 184h' },
            { x: '28%', y: 'auto', size: 28, emoji: '🌿', label: 'body · 14d' },
            { x: '46%', y: 'auto', size: 32, emoji: '🌸', label: 'reading · 23' },
            { x: '64%', y: 'auto', size: 22, emoji: '🌱', label: 'sleep · 7.2h' },
            { x: '80%', y: 'auto', size: 16, emoji: '🌱', label: 'new seed' },
          ].map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: p.x, bottom: 18, transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: p.size, lineHeight: 1 }}>{p.emoji}</div>
              <div className="wf-text-sm" style={{ fontSize: 8, marginTop: 2, whiteSpace: 'nowrap' }}>{p.label}</div>
            </div>
          ))}
          <div className="wf-text-sm" style={{ position: 'absolute', top: 6, right: 8, fontSize: 9 }}>weather: ☀ 14d streak</div>
        </div>

        {/* mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { l: 'streak', v: '14', u: 'days', i: '☀' },
            { l: 'tended', v: '8', u: 'plants', i: '🌿' },
            { l: 'season', v: 'spring', u: 'wk 17', i: '✿' },
          ].map((s, i) => (
            <div key={i} className="wf-box" style={{ padding: '6px 8px', borderColor: '#c0b8a0' }}>
              <div className="wf-text-sm" style={{ fontSize: 9 }}>{s.i} {s.l}</div>
              <div className="wf-h2" style={{ color: '#3a4a2a' }}>{s.v}</div>
              <div className="wf-text-sm" style={{ fontSize: 9 }}>{s.u}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.WfD_Today = WfD_Today;
window.WfD_Dashboard = WfD_Dashboard;
