/* global React, WfChrome, Lorem, Annot, ScribbleArrow */
// Direction A: Terminal / Developer
// CLI-style log management with monospace, prompt-driven input

function WfA_Today() {
  return (
    <div className="wf" style={{ background: '#0e0e0c', color: '#d4d0c8' }}>
      <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* prompt header */}
        <div className="wf-mono" style={{ color: '#7a7a72', fontSize: 10 }}>
          ~/life-log/2026-04-29.md  ·  Wed
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="wf-mono" style={{ color: '#d4501e', fontWeight: 700, fontSize: 13 }}>$</span>
          <span className="wf-mono" style={{ color: '#e8e4dc', fontSize: 13 }}>log today</span>
          <span style={{ background: '#e8e4dc', width: 6, height: 13, animation: 'none' }}></span>
        </div>

        {/* input fields styled as command output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            { k: 'sleep', v: '7.5h', f: '_' },
            { k: 'workout', v: 'yes', f: 'run 5km' },
            { k: 'study', v: '90m', f: 'system design' },
            { k: 'reading', v: '_', f: '_' },
            { k: 'memo', v: '_', f: '_' },
            { k: 'tomorrow', v: '_', f: '_' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span className="wf-mono" style={{ color: '#7a7a72', fontSize: 10, width: 76 }}>{row.k} ::</span>
              <span className="wf-mono" style={{ color: '#e8c64a', fontSize: 11, minWidth: 40 }}>{row.v}</span>
              <span className="wf-mono" style={{ color: '#7a7a72', fontSize: 10 }}>{row.f}</span>
              <span style={{ flex: 1, borderBottom: '1px dashed #3a3a35' }}></span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="wf-mono" style={{ color: '#7a7a72', fontSize: 9 }}>tab to next · ⌘↵ to save</span>
          <span className="wf-mono" style={{ color: '#4a7a3a', fontSize: 10 }}>[ commit ]</span>
        </div>
      </div>
    </div>
  );
}

function WfA_Dashboard() {
  return (
    <div className="wf" style={{ background: '#0e0e0c', color: '#d4d0c8' }}>
      <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="wf-mono" style={{ color: '#7a7a72', fontSize: 10 }}>
          ~/life-log/dashboard  ·  status report
        </div>

        {/* ASCII-ish stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'streak', v: '14', unit: 'days' },
            { label: 'level', v: '7', unit: 'scholar' },
            { label: 'xp', v: '2,340', unit: '/ 3,000' },
            { label: 'sleep avg', v: '7.2', unit: 'h' },
          ].map((s, i) => (
            <div key={i} style={{ border: '1px solid #2a2a25', padding: '8px 10px', borderRadius: 2 }}>
              <div className="wf-mono" style={{ color: '#7a7a72', fontSize: 9 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="wf-mono" style={{ color: '#e8c64a', fontSize: 18, fontWeight: 700 }}>{s.v}</span>
                <span className="wf-mono" style={{ color: '#7a7a72', fontSize: 10 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ASCII contribution graph */}
        <div>
          <div className="wf-mono" style={{ color: '#7a7a72', fontSize: 9, marginBottom: 4 }}>// activity ─ last 8 weeks</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', gap: 2, gridAutoFlow: 'column' }}>
            {Array.from({ length: 56 }).map((_, i) => {
              const intensity = [0, 0.15, 0.3, 0.5, 0.8][Math.floor(Math.random() * 5)];
              return <div key={i} style={{ background: intensity ? `rgba(74, 122, 58, ${intensity})` : '#1a1a17', height: 10, borderRadius: 1 }}></div>;
            })}
          </div>
        </div>

        <div className="wf-mono" style={{ color: '#7a7a72', fontSize: 9 }}>// tags</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['#system-design', '#books', '#go', '#math', '#habits'].map((t, i) => (
            <span key={i} className="wf-mono" style={{ color: '#3a8a8a', fontSize: 9, border: '1px solid #2a2a25', padding: '1px 5px', borderRadius: 2 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

window.WfA_Today = WfA_Today;
window.WfA_Dashboard = WfA_Dashboard;
