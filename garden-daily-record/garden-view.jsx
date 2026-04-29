/* global React, Plant */
// Garden visualization — plants laid out on a horizon line
// Hover to see name, click to focus a plant for logging

const { useState } = React;

function Garden({ plants, onSelect, season = 'spring', streak = 0 }) {
  const [hover, setHover] = useState(null);
  const skyTop = season === 'spring' ? '#cfe2ea' : season === 'summer' ? '#a8c8d8' : season === 'autumn' ? '#e8c8a0' : '#c8d4e0';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 320,
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      background: `linear-gradient(180deg, var(--bg-warm) 0%, var(--bg-warm) 55%, color-mix(in oklab, var(--earth-300) 25%, var(--bg-warm)) 75%, color-mix(in oklab, var(--earth-500) 30%, var(--bg-warm)) 100%)`,
      border: '1px solid var(--line)',
    }}>
      {/* sun */}
      <div style={{
        position: 'absolute', top: 24, right: 32,
        width: 56, height: 56, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--pollen) 0%, color-mix(in oklab, var(--pollen) 50%, transparent) 60%, transparent 100%)',
      }}></div>

      {/* distant hills */}
      <svg viewBox="0 0 800 200" style={{ position: 'absolute', bottom: 80, left: 0, width: '100%', height: 80, opacity: .35 }} preserveAspectRatio="none">
        <path d="M0,200 Q150,80 300,140 T 600,120 T 800,160 L 800,200 Z" fill="var(--leaf-700)" />
      </svg>
      <svg viewBox="0 0 800 200" style={{ position: 'absolute', bottom: 60, left: 0, width: '100%', height: 70, opacity: .55 }} preserveAspectRatio="none">
        <path d="M0,200 Q200,100 400,150 T 800,130 L 800,200 Z" fill="var(--leaf-500)" />
      </svg>

      {/* ground line */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, height: 1, background: 'color-mix(in oklab, var(--earth-700) 50%, transparent)' }}></div>

      {/* plants */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0 32px' }}>
        {plants.length === 0 && (
          <div className="card" style={{ padding: 14, marginBottom: 38 }}>
            <div className="t-body">設定画面で植物を追加してください。</div>
          </div>
        )}
        {plants.map((p) => {
          const sizes = [38, 56, 76, 96, 110];
          const sz = sizes[p.stage];
          const isHover = hover === p.id;
          return (
            <button
              key={p.id}
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect && onSelect(p)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: 0,
                transform: isHover ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'transform .25s cubic-bezier(.2,.7,.3,1)',
              }}>
              <div style={{
                opacity: isHover ? 1 : 0,
                transform: isHover ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all .2s',
                background: 'var(--bg-card)',
                color: 'var(--ink)',
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                border: '1px solid var(--line)',
                fontSize: 11, fontWeight: 500,
                whiteSpace: 'nowrap',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {p.jp} · {p.streak}d · {p.total}{p.unit}
              </div>
              <Plant stage={p.stage} size={sz} color={`var(--${p.color})`} />
              <div style={{ fontSize: 10, color: 'var(--ink-soft)', fontFamily: 'var(--mono)', marginTop: -4 }}>{p.name}</div>
            </button>
          );
        })}
      </div>

      {/* weather chip */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'color-mix(in oklab, var(--bg-card) 70%, transparent)', borderRadius: 'var(--r-pill)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontSize: 14 }}>☀</span>
        <span className="t-tiny" style={{ color: 'var(--ink)' }}>晴れ · {streak}日連続</span>
      </div>
    </div>
  );
}

window.Garden = Garden;
