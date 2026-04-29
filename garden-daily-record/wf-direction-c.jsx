/* global React */
// Direction C: Retro-future / 80s PC / Pixel
// Chunky pixel borders, scanlines, neon-on-black aesthetic

function WfC_Today() {
  return (
    <div className="wf" style={{ background: '#1a1232', color: '#e0c8ff', fontFamily: 'monospace' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #6a4aaa', paddingBottom: 6 }}>
          <div className="wf-mono" style={{ color: '#ff6a8a', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>★ DAILY LOG ★</div>
          <div className="wf-mono" style={{ color: '#8a7aaa', fontSize: 9 }}>2026.04.29 · WED · DAY 142</div>
        </div>

        {/* pixel-bordered fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {[
            { l: 'SLEEP', v: '07.5H', filled: true },
            { l: 'WORKOUT', v: '──Y/N', filled: false },
            { l: 'STUDY', v: '___MIN', filled: false },
            { l: 'TOPIC', v: '____________', filled: false },
            { l: 'NOTES', v: '____________', filled: false, multi: true },
          ].map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div className="wf-mono" style={{ color: '#ffaa4a', fontSize: 9, marginBottom: 2 }}>► {f.l}</div>
              <div style={{
                border: '2px solid #6a4aaa',
                background: f.filled ? '#2a1842' : 'transparent',
                padding: '5px 8px',
                minHeight: f.multi ? 36 : 'auto',
                boxShadow: '3px 3px 0 #6a4aaa',
                color: f.filled ? '#e0c8ff' : '#6a5a8a',
              }}>
                <span className="wf-mono" style={{ fontSize: 11 }}>{f.v}</span>
                {f.filled && <span className="wf-mono" style={{ fontSize: 9, color: '#4ade80', marginLeft: 6 }}>OK</span>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="wf-mono" style={{ color: '#8a7aaa', fontSize: 9 }}>F1:HELP F2:SAVE</div>
          <div className="wf-mono" style={{ color: '#ff6a8a', fontSize: 11, fontWeight: 700, padding: '2px 10px', border: '2px solid #ff6a8a', boxShadow: '2px 2px 0 #ff6a8a' }}>
            [ SAVE ]
          </div>
        </div>
      </div>
    </div>
  );
}

function WfC_Dashboard() {
  return (
    <div className="wf" style={{ background: '#1a1232', color: '#e0c8ff' }}>
      <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="wf-mono" style={{ color: '#ff6a8a', fontSize: 13, fontWeight: 700, textAlign: 'center', letterSpacing: 2 }}>
          ★ STATUS ★
        </div>

        {/* big pixel level */}
        <div style={{ border: '2px solid #6a4aaa', boxShadow: '3px 3px 0 #6a4aaa', padding: 10, textAlign: 'center' }}>
          <div className="wf-mono" style={{ color: '#ffaa4a', fontSize: 9 }}>► LEVEL</div>
          <div className="wf-mono" style={{ fontSize: 36, fontWeight: 700, color: '#4ade80', lineHeight: 1 }}>07</div>
          <div style={{ display: 'flex', gap: 2, marginTop: 6, justifyContent: 'center' }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, background: i < 12 ? '#4ade80' : '#3a2a5a' }}></div>
            ))}
          </div>
        </div>

        {/* mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { l: 'STREAK', v: '14d' },
            { l: 'BOOKS', v: '23' },
            { l: 'STUDY', v: '184h' },
            { l: 'BADGES', v: '08/24' },
          ].map((s, i) => (
            <div key={i} style={{ border: '2px solid #6a4aaa', padding: '4px 8px' }}>
              <div className="wf-mono" style={{ color: '#8a7aaa', fontSize: 8 }}>► {s.l}</div>
              <div className="wf-mono" style={{ color: '#ffaa4a', fontSize: 14, fontWeight: 700 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* pixel histogram */}
        <div>
          <div className="wf-mono" style={{ color: '#ffaa4a', fontSize: 9, marginBottom: 4 }}>► WEEKLY ACTIVITY</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 50, padding: 4, border: '2px solid #6a4aaa' }}>
            {[6, 4, 3, 7, 5, 1, 0].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 1 }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} style={{ height: 4, background: j < h ? '#ff6a8a' : 'transparent' }}></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.WfC_Today = WfC_Today;
window.WfC_Dashboard = WfC_Dashboard;
