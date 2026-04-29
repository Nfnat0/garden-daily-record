/* global React, Lorem */
// Direction B: Gamified RPG / Status sheet
// "Character sheet" feel — stats, level, equipped habits, badges

function WfB_Today() {
  return (
    <div className="wf" style={{ background: '#f4f1ea' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* header — like RPG character header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="wf-text-sm">─ DAY 142 ─</div>
            <div className="wf-h1">today's quest</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="wf-text-sm">LV.7 · scholar</div>
            <div style={{ width: 80, height: 6, background: '#e0d8c8', borderRadius: 3, marginTop: 3 }}>
              <div style={{ width: '62%', height: '100%', background: '#d4501e', borderRadius: 3 }}></div>
            </div>
          </div>
        </div>

        {/* quest list — checklist style */}
        <div className="wf-stack-sm" style={{ gap: 6 }}>
          {[
            { l: 'sleep', v: '7.5h', d: 'log it', done: true },
            { l: 'workout', v: '?', d: 'tap if done', done: false },
            { l: 'study', v: '__min', d: 'tag + duration', done: false },
            { l: 'reading', v: '__', d: 'book + pages', done: false },
            { l: 'reflection', v: '__', d: '3 lines', done: false },
          ].map((q, i) => (
            <div key={i} className="wf-box" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, background: q.done ? '#e8e8df' : '#fff' }}>
              <div className="wf-icon" style={{ background: q.done ? '#1a1a1a' : '#fff', color: '#fff' }}>{q.done ? '✓' : ''}</div>
              <div style={{ flex: 1 }}>
                <div className="wf-h3">{q.l}</div>
                <div className="wf-text-sm">{q.d}</div>
              </div>
              <div className="wf-mono" style={{ color: '#d4501e', fontWeight: 700 }}>{q.v}</div>
              <div className="wf-mono-sm">+10xp</div>
            </div>
          ))}
        </div>

        {/* footer commit */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 6 }}>
          <div className="wf-btn" style={{ flex: 1, justifyContent: 'center' }}>+ add field</div>
          <div className="wf-btn wf-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>commit day</div>
        </div>
      </div>
    </div>
  );
}

function WfB_Dashboard() {
  return (
    <div className="wf" style={{ background: '#f4f1ea' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* hero — character */}
        <div className="wf-box-thick" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="wf-box wf-scribble" style={{ width: 54, height: 54, flex: 'none' }}></div>
          <div style={{ flex: 1 }}>
            <div className="wf-h2">scholar · lv.7</div>
            <div className="wf-text-sm">2,340 / 3,000 xp</div>
            <div style={{ width: '100%', height: 5, background: '#e0d8c8', borderRadius: 3, marginTop: 3 }}>
              <div style={{ width: '78%', height: '100%', background: '#1a1a1a', borderRadius: 3 }}></div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="wf-h1" style={{ color: '#d4501e' }}>14</div>
            <div className="wf-text-sm">streak</div>
          </div>
        </div>

        {/* stats — like D&D ability scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { l: 'INT', v: '24', sub: 'study' },
            { l: 'CON', v: '18', sub: 'sleep' },
            { l: 'STR', v: '12', sub: 'body' },
            { l: 'WIS', v: '21', sub: 'reflect' },
          ].map((s, i) => (
            <div key={i} className="wf-box" style={{ padding: '6px', textAlign: 'center' }}>
              <div className="wf-mono-sm">{s.l}</div>
              <div className="wf-h1" style={{ fontSize: 20 }}>{s.v}</div>
              <div className="wf-text-sm" style={{ fontSize: 9 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* badges */}
        <div>
          <div className="wf-h3" style={{ marginBottom: 4 }}>badges · 8 / 24</div>
          <div className="wf-cluster">
            {[1, 1, 1, 1, 0, 0, 0, 0].map((b, i) => (
              <div key={i} className="wf-icon" style={{ width: 26, height: 26, background: b ? '#e8c64a' : '#f0ece0', borderStyle: b ? 'solid' : 'dashed', fontSize: 13 }}>
                {b ? '★' : '?'}
              </div>
            ))}
          </div>
        </div>

        {/* week chart */}
        <div className="wf-box" style={{ padding: 8, flex: 1 }}>
          <div className="wf-h3" style={{ marginBottom: 6 }}>this week · study minutes</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
            {[40, 70, 30, 90, 55, 0, 0].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div className="wf-bar" style={{ width: '100%', height: h, background: i >= 5 ? '#d0d0c8' : '#1a1a1a' }}></div>
                <div className="wf-mono-sm">{['M','T','W','T','F','S','S'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.WfB_Today = WfB_Today;
window.WfB_Dashboard = WfB_Dashboard;
