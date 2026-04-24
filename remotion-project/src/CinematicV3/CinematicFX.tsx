import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { rand, C } from './shared';

// ── Vignette ──────────────────────────────────────────────────────────
export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.8 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${intensity}) 100%)`,
  }} />
);

// ── Floating AI particles ─────────────────────────────────────────────
export const AIParticles: React.FC<{
  count?: number; color?: string; speed?: number; spread?: number;
}> = ({ count = 55, color = C.blue, speed = 0.28, spread = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id={`pfx-${color.slice(1, 7)}`}>
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const bx = rand(i, 1) * 1920;
        const by = rand(i, 2) * 1080;
        const sz = 1.2 + rand(i, 3) * 3.5;
        const sp = speed * (0.3 + rand(i, 4) * 0.7);
        const op = 0.06 + rand(i, 5) * 0.2;
        const drift = rand(i, 6) * 25 * spread;
        const y = ((by - frame * sp * 30) % 1080 + 1080) % 1080;
        const x = bx + Math.sin(frame * 0.018 + i * 1.9) * drift;
        const pulse = 1 + Math.sin(frame * 0.05 + i * 2.3) * 0.35;
        return (
          <circle key={i} cx={x} cy={y} r={sz * pulse} fill={color} opacity={op}
            filter={`url(#pfx-${color.slice(1, 7)})`} />
        );
      })}
    </svg>
  );
};

// ── Neural network nodes overlay ──────────────────────────────────────
export const NeuralOverlay: React.FC<{ opacity?: number; color?: string }> = ({
  opacity = 0.08, color = C.blue,
}) => {
  const frame = useCurrentFrame();
  const nodes = Array.from({ length: 22 }, (_, i) => ({
    x: rand(i, 10) * 1920,
    y: rand(i, 11) * 1080,
    r: 3 + rand(i, 12) * 5,
    pulse: Math.sin(frame * 0.04 + i * 1.4) * 0.5 + 0.5,
  }));
  const edges: [number, number][] = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x;
      const dy = nodes[a].y - nodes[b].y;
      if (Math.sqrt(dx * dx + dy * dy) < 300) edges.push([a, b]);
    }
  }
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      <defs>
        <filter id="neural-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {edges.map(([a, b], i) => {
        const flowPos = (frame * 0.012 + i * 0.17) % 1;
        const ex = nodes[a].x + (nodes[b].x - nodes[a].x) * flowPos;
        const ey = nodes[a].y + (nodes[b].y - nodes[a].y) * flowPos;
        return (
          <g key={i}>
            <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke={color} strokeWidth={0.8} opacity={0.4} />
            <circle cx={ex} cy={ey} r={2.5} fill={color} opacity={0.7}
              filter="url(#neural-glow)" />
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r * (0.7 + n.pulse * 0.3)}
          fill="none" stroke={color} strokeWidth={1.2} opacity={0.5 + n.pulse * 0.4}
          filter="url(#neural-glow)" />
      ))}
    </svg>
  );
};

// ── Horizontal light streak transition ────────────────────────────────
export const LightStreak: React.FC<{
  startFrame: number; duration?: number; color?: string; vertical?: boolean;
}> = ({ startFrame, duration = 20, color = C.blue, vertical = false }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + duration], [-0.1, 1.1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  if (p <= -0.08 || p >= 1.08) return null;
  const pct = p * 100;
  const grad = vertical
    ? `linear-gradient(180deg, transparent ${pct - 15}%, ${color}22 ${pct - 5}%, ${color}66 ${pct}%, ${color}22 ${pct + 5}%, transparent ${pct + 15}%)`
    : `linear-gradient(90deg, transparent ${pct - 15}%, ${color}22 ${pct - 5}%, ${color}66 ${pct}%, ${color}22 ${pct + 5}%, transparent ${pct + 15}%)`;
  return (
    <div style={{ position: 'absolute', inset: 0, background: grad, pointerEvents: 'none',
      filter: 'blur(1px)' }} />
  );
};

// ── Lens flare ────────────────────────────────────────────────────────
export const LensFlare: React.FC<{
  x?: number; y?: number; startFrame: number; duration?: number; color?: string;
}> = ({ x = 960, y = 250, startFrame, duration = 40, color = C.blue }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const op = Math.sin(progress * Math.PI);
  if (op < 0.01) return null;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id="flare-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity={op * 0.9} />
          <stop offset="40%" stopColor={color} stopOpacity={op * 0.5} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flare-outer" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={op * 0.3} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* outer bloom */}
      <ellipse cx={x} cy={y} rx={200} ry={120} fill="url(#flare-outer)" />
      {/* core */}
      <circle cx={x} cy={y} r={60} fill="url(#flare-core)" />
      {/* anamorphic streak */}
      <line x1={x - 600} y1={y} x2={x + 600} y2={y}
        stroke={color} strokeWidth={1.5} opacity={op * 0.25}
        style={{ filter: 'blur(2px)' }} />
      {/* ghost blobs */}
      {[0.3, 0.55, 0.75, 0.9].map((t, i) => (
        <circle key={i}
          cx={x + (1920 / 2 - x) * t * 0.4}
          cy={y + (540 - y) * t * 0.3}
          r={8 + i * 6}
          fill={color}
          opacity={op * 0.12 * (1 - t)} />
      ))}
    </svg>
  );
};

// ── Animated scanlines ────────────────────────────────────────────────
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.035 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,${opacity}) 3px, rgba(0,0,0,${opacity}) 4px)`,
  }} />
);

// ── Animated dot grid (slow pan) ─────────────────────────────────────
export const DotGrid: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.blue, opacity = 0.05,
}) => {
  const frame = useCurrentFrame();
  const oy = (frame * 0.18) % 48;
  const ox = (frame * 0.08) % 48;
  return (
    <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      <defs>
        <pattern id={`dg-${color.slice(1, 5)}`} x={ox} y={oy} width={48} height={48}
          patternUnits="userSpaceOnUse">
          <circle cx={24} cy={24} r={1.5} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dg-${color.slice(1, 5)})`} />
    </svg>
  );
};

// ── Cinematic bars (top + bottom letterbox) ───────────────────────────
export const CinematicBars: React.FC<{ height?: number; opacity?: number }> = ({
  height = 40, opacity = 1,
}) => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height,
      background: `rgba(0,0,0,${opacity})`, pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height,
      background: `rgba(0,0,0,${opacity})`, pointerEvents: 'none' }} />
  </>
);

// ── Depth-of-field blur wrapper ───────────────────────────────────────
export const DepthFade: React.FC<{
  startFrame: number; endFrame: number; children: React.ReactNode;
}> = ({ startFrame, endFrame, children }) => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [startFrame, startFrame + 18, endFrame - 18, endFrame],
    [20, 0, 0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [startFrame, startFrame + 18], [1.04, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = interpolate(frame, [startFrame, startFrame + 18, endFrame - 18, endFrame],
    [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', inset: 0,
      filter: `blur(${blur}px)`,
      transform: `scale(${scale})`,
      opacity: op,
      transformOrigin: '50% 50%',
    }}>
      {children}
    </div>
  );
};
