/* global React */
// Wireframe building blocks — sketchy, low-fi components for exploration

const { useState } = React;

// ── Browser/window chrome ────────────────────────────────────
function WfChrome({ title = 'log://today', dark = false }) {
  return (
    <div className="wf-chrome" style={dark ? { background: '#1a1a1a', color: '#aaa', borderBottomColor: '#1a1a1a' } : {}}>
      <div className="wf-dot" style={dark ? { borderColor: '#aaa' } : {}}></div>
      <div className="wf-dot" style={dark ? { borderColor: '#aaa' } : {}}></div>
      <div className="wf-dot" style={dark ? { borderColor: '#aaa' } : {}}></div>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>{title}</div>
      <div style={{ width: 27 }}></div>
    </div>
  );
}

// ── Lorem placeholder lines ─────────────────────────────────
function Lorem({ lines = 3, widths = ['100%', '85%', '60%'] }) {
  return (
    <div className="wf-stack-sm">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="wf-lorem" style={{ width: widths[i % widths.length] }}></div>
      ))}
    </div>
  );
}

// ── Annotation with arrow ──────────────────────────────────
function Annot({ children, x, y, color = '#d4501e' }) {
  return (
    <div className="wf-annot" style={{ left: x, top: y, color }}>
      ↳ {children}
    </div>
  );
}

// ── Sketchy hand-drawn arrow as SVG ────────────────────────
function ScribbleArrow({ x1, y1, x2, y2, color = '#d4501e' }) {
  const minX = Math.min(x1, x2) - 10;
  const minY = Math.min(y1, y2) - 10;
  const w = Math.abs(x2 - x1) + 20;
  const h = Math.abs(y2 - y1) + 20;
  return (
    <svg style={{ position: 'absolute', left: minX, top: minY, pointerEvents: 'none', zIndex: 4 }} width={w} height={h}>
      <path
        d={`M ${x1 - minX} ${y1 - minY} Q ${(x1 + x2) / 2 - minX + 8} ${(y1 + y2) / 2 - minY - 6} ${x2 - minX} ${y2 - minY}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${x2 - minX} ${y2 - minY} l -6 -2 m 6 2 l -3 -6`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

window.WfChrome = WfChrome;
window.Lorem = Lorem;
window.Annot = Annot;
window.ScribbleArrow = ScribbleArrow;
