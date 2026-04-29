/* global React */
// SVG plant illustrations — 5 stages of growth
// Each stage represents log streak: seed → sprout → sapling → mature → flowering

const Plant = ({ stage = 3, kind = 'tree', size = 64, color }) => {
  const leaf = color || 'var(--leaf-500)';
  const leafDark = `color-mix(in oklab, ${leaf} 70%, black)`;
  const stem = 'var(--leaf-700)';
  const soil = 'var(--earth-500)';
  const bloom = 'var(--bloom)';

  const renderPlant = () => {
    if (stage === 0) {
      // seed in soil
      return (
        <g>
          <ellipse cx="32" cy="56" rx="20" ry="3" fill={soil} opacity=".5" />
          <ellipse cx="32" cy="54" rx="3" ry="2" fill="var(--earth-700)" />
        </g>
      );
    }
    if (stage === 1) {
      // sprout — 2 tiny leaves
      return (
        <g>
          <ellipse cx="32" cy="56" rx="20" ry="3" fill={soil} opacity=".5" />
          <path d="M32 54 Q 32 46 32 42" stroke={stem} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="28" cy="44" rx="4" ry="2.5" fill={leaf} transform="rotate(-25 28 44)" />
          <ellipse cx="36" cy="44" rx="4" ry="2.5" fill={leaf} transform="rotate(25 36 44)" />
        </g>
      );
    }
    if (stage === 2) {
      // sapling — small with a few leaves
      return (
        <g>
          <ellipse cx="32" cy="56" rx="20" ry="3" fill={soil} opacity=".5" />
          <path d="M32 54 Q 30 36 32 24" stroke={stem} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="24" cy="38" rx="6" ry="3.5" fill={leaf} transform="rotate(-30 24 38)" />
          <ellipse cx="40" cy="32" rx="6" ry="3.5" fill={leaf} transform="rotate(30 40 32)" />
          <ellipse cx="26" cy="26" rx="5" ry="3" fill={leaf} transform="rotate(-15 26 26)" />
          <ellipse cx="32" cy="22" rx="4" ry="2.5" fill={leaf} />
        </g>
      );
    }
    if (stage === 3) {
      // mature tree
      return (
        <g>
          <ellipse cx="32" cy="56" rx="22" ry="3" fill={soil} opacity=".5" />
          <rect x="30" y="38" width="4" height="18" rx="1.5" fill="var(--earth-700)" />
          <circle cx="32" cy="28" r="16" fill={leaf} />
          <circle cx="22" cy="32" r="9" fill={leafDark} opacity=".6" />
          <circle cx="42" cy="30" r="8" fill={leafDark} opacity=".5" />
          <circle cx="30" cy="20" r="7" fill={leaf} opacity=".9" />
        </g>
      );
    }
    // stage 4 — flowering / mature with blooms
    return (
      <g>
        <ellipse cx="32" cy="56" rx="22" ry="3" fill={soil} opacity=".5" />
        <rect x="30" y="38" width="4" height="18" rx="1.5" fill="var(--earth-700)" />
        <circle cx="32" cy="26" r="18" fill={leaf} />
        <circle cx="20" cy="30" r="10" fill={leafDark} opacity=".6" />
        <circle cx="44" cy="28" r="9" fill={leafDark} opacity=".5" />
        {[
          [22, 22], [38, 18], [30, 14], [44, 32], [18, 36], [34, 32]
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2.5" fill={bloom} />
            <circle cx={x} cy={y} r="1" fill="var(--pollen)" />
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
      {renderPlant()}
    </svg>
  );
};

window.Plant = Plant;
