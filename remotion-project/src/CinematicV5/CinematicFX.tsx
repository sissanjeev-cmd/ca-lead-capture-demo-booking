import React from 'react';
import { useCurrentFrame } from 'remotion';
import { rand, C, remap } from './shared';

// ── Vignette ──────────────────────────────────────────────────────────
export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.85 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 90,
    background: `radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(0,0,0,${intensity}) 100%)`,
  }} />
);

// ── Film grain noise ──────────────────────────────────────────────────
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.025 }) => {
  const f = useCurrentFrame();
  const seed = f % 8;
  const rows = 20;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 89, opacity }}>
      {Array.from({ length: rows * 30 }, (_, i) => (
        <rect key={i}
          x={rand(i + seed * 600, 1) * 1920}
          y={rand(i + seed * 600, 2) * 1080}
          width={1 + rand(i, 3) * 2}
          height={1 + rand(i, 4) * 2}
          fill="white"
          opacity={rand(i + seed * 600, 5) * 0.6}
        />
      ))}
    </svg>
  );
};

// ── Grid background ───────────────────────────────────────────────────
export const GridBG: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.blue, opacity = 0.04,
}) => (
  <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke={color} strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill={`url(#grid)`} opacity={opacity} />
  </svg>
);

// ── AI Particles ──────────────────────────────────────────────────────
export const AIParticles: React.FC<{
  count?: number; color?: string; speed?: number;
  layer?: 'back' | 'front'; glow?: boolean;
}> = ({ count = 70, color = C.blue, speed = 0.22, layer = 'back', glow = true }) => {
  const frame = useCurrentFrame();
  const filterId = `pglow_${color.replace('#', '')}`;
  return (
    <svg width="1920" height="1080" style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      zIndex: layer === 'front' ? 30 : 2,
    }}>
      <defs>
        {glow && (
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const bx = rand(i, 1) * 1920;
        const by = rand(i, 2) * 1080;
        const sz = 0.8 + rand(i, 3) * 3.2;
        const sp = speed * (0.25 + rand(i, 4) * 0.75);
        const op = 0.05 + rand(i, 5) * 0.22;
        const drift = rand(i, 6) * 30;
        const y = ((by - frame * sp * 30) % 1080 + 1080) % 1080;
        const x = bx + Math.sin(frame * 0.02 + i * 2.1) * drift;
        const pulse = 1 + Math.sin(frame * 0.055 + i * 2.7) * 0.4;
        return (
          <circle key={i} cx={x} cy={y} r={sz * pulse} fill={color} opacity={op}
            filter={glow ? `url(#${filterId})` : undefined} />
        );
      })}
    </svg>
  );
};

// ── Neural Network ────────────────────────────────────────────────────
export const NeuralNet: React.FC<{
  opacity?: number; color?: string; nodeCount?: number;
}> = ({ opacity = 0.10, color = C.blue, nodeCount = 26 }) => {
  const frame = useCurrentFrame();
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    x: rand(i, 10) * 1920,
    y: rand(i, 11) * 1080,
    r: 2.5 + rand(i, 12) * 5,
    pulse: Math.sin(frame * 0.038 + i * 1.6) * 0.5 + 0.5,
  }));
  const edges: [number, number][] = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x;
      const dy = nodes[a].y - nodes[b].y;
      if (Math.sqrt(dx * dx + dy * dy) < 340) edges.push([a, b]);
    }
  }
  const travel = (frame * 0.008) % 1;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 3 }}>
      <defs>
        <filter id="nn_glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {edges.map(([a, b], idx) => {
        const tx = nodes[a].x + (nodes[b].x - nodes[a].x) * travel;
        const ty = nodes[a].y + (nodes[b].y - nodes[a].y) * travel;
        return (
          <g key={idx}>
            <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke={color} strokeWidth="0.6" opacity="0.4" />
            {idx % 4 === 0 && (
              <circle cx={tx} cy={ty} r="3" fill={color} opacity="0.9" filter="url(#nn_glow)" />
            )}
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y}
          r={n.r * (0.7 + n.pulse * 0.6)}
          fill={color} opacity={0.15 + n.pulse * 0.35}
          filter="url(#nn_glow)" />
      ))}
    </svg>
  );
};

// ── Volumetric light rays ─────────────────────────────────────────────
export const VolumetricLight: React.FC<{
  x?: number; y?: number; color?: string; intensity?: number; rayCount?: number;
}> = ({ x = 960, y = 540, color = C.blue, intensity = 0.18, rayCount = 12 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        <radialGradient id={`vl_${x}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={intensity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: rayCount }, (_, i) => {
        const angle = (i / rayCount) * Math.PI * 2 + frame * 0.004;
        const len = 900 + rand(i, 20) * 400;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        const op = (0.03 + rand(i, 21) * 0.06) * (0.7 + Math.sin(frame * 0.05 + i) * 0.3);
        return (
          <line key={i} x1={x} y1={y} x2={ex} y2={ey}
            stroke={color} strokeWidth={1.5 + rand(i, 22) * 3}
            opacity={op} />
        );
      })}
      <ellipse cx={x} cy={y} rx="180" ry="180" fill={`url(#vl_${x})`} />
    </svg>
  );
};

// ── Anamorphic lens flare ─────────────────────────────────────────────
export const LensFlare: React.FC<{
  x?: number; y?: number; color?: string; width?: number;
}> = ({ x = 960, y = 200, color = C.cyan, width = 1920 }) => {
  const frame = useCurrentFrame();
  const flicker = 0.7 + Math.sin(frame * 0.13) * 0.15 + Math.sin(frame * 0.37) * 0.1;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      <defs>
        <linearGradient id="lf_h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="35%" stopColor={color} stopOpacity={0.06 * flicker} />
          <stop offset="50%" stopColor={color} stopOpacity={0.18 * flicker} />
          <stop offset="65%" stopColor={color} stopOpacity={0.06 * flicker} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="lf_blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect x="0" y={y - 1.5} width={width} height="3" fill={`url(#lf_h)`} />
      <rect x="0" y={y - 8} width={width} height="16" fill={`url(#lf_h)`} opacity="0.3" filter="url(#lf_blur)" />
      <ellipse cx={x} cy={y} rx="14" ry="14" fill={color} opacity={0.55 * flicker} filter="url(#lf_blur)" />
      <ellipse cx={x} cy={y} rx="5" ry="5" fill="white" opacity={0.9 * flicker} />
    </svg>
  );
};

// ── Light sweep transition ────────────────────────────────────────────
export const LightSweep: React.FC<{
  progress: number; color?: string; direction?: 'ltr' | 'rtl';
}> = ({ progress, color = C.cyan, direction = 'ltr' }) => {
  const x = direction === 'ltr' ? progress * 2400 - 240 : (1 - progress) * 2400 - 240;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 80 }}>
      <defs>
        <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="40%" stopColor={color} stopOpacity="0.06" />
          <stop offset="50%" stopColor="white" stopOpacity="0.4" />
          <stop offset="60%" stopColor={color} stopOpacity="0.06" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={x} y="0" width="240" height="1080" fill="url(#sweep)" />
    </svg>
  );
};

// ── Glowing orb ───────────────────────────────────────────────────────
export const GlowOrb: React.FC<{
  x: number; y: number; r?: number; color?: string; opacity?: number;
}> = ({ x, y, r = 300, color = C.blue, opacity = 0.15 }) => (
  <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
    <defs>
      <radialGradient id={`orb_${x}_${y}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity={opacity * 3} />
        <stop offset="60%" stopColor={color} stopOpacity={opacity} />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.7} fill={`url(#orb_${x}_${y})`} />
  </svg>
);

// ── Horizontal scan line ──────────────────────────────────────────────
export const ScanLine: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  const frame = useCurrentFrame();
  const y = (frame * 4) % 1080;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 88,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0,
        top: y, height: 2,
        background: 'rgba(255,255,255,0.08)',
      }} />
    </div>
  );
};

// ── Glass panel ───────────────────────────────────────────────────────
export const GlassPanel: React.FC<{
  x: number; y: number; w: number; h: number;
  color?: string; opacity?: number; children?: React.ReactNode;
  borderColor?: string; radius?: number;
}> = ({ x, y, w, h, color = C.glass, borderColor = C.glassBorder, radius = 16, opacity = 1, children }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h,
    background: color,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${borderColor}`,
    borderRadius: radius,
    boxShadow: `0 0 40px ${borderColor}, inset 0 1px 0 rgba(255,255,255,0.08)`,
    opacity,
    overflow: 'hidden',
  }}>
    {children}
  </div>
);
