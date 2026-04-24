import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

// Deterministic pseudo-random
const hash = (i: number, seed: number): number => {
  const s = Math.sin(i * seed) * 43758.5453;
  return s - Math.floor(s);
};

// ── Floating particles ──────────────────────────────────────────────
export const Particles: React.FC<{
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  drift?: number;
  glowSize?: number;
}> = ({ count = 40, color = 'white', maxSize = 3.5, speed = 0.4, drift = 14, glowSize = 6 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <defs>
        <filter id={`particle-glow-${color.replace(/[^a-z0-9]/gi, '')}`}>
          <feGaussianBlur stdDeviation={glowSize} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: count }, (_, i) => {
        const px = hash(i, 12.989) * 1920;
        const py = hash(i, 39.346) * 1080;
        const sz = 0.8 + hash(i, 73.156) * maxSize;
        const sp = speed * (0.3 + hash(i, 51.947) * 0.7);
        const op = 0.06 + hash(i, 23.461) * 0.22;
        const y = ((py - frame * sp) % 1080 + 1080) % 1080;
        const x = px + Math.sin(frame * 0.012 + i * 2.3) * drift;
        // Subtle pulse
        const pulse = 1 + Math.sin(frame * 0.04 + i * 1.7) * 0.3;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={sz * pulse}
            fill={color}
            opacity={op}
            filter={`url(#particle-glow-${color.replace(/[^a-z0-9]/gi, '')})`}
          />
        );
      })}
    </svg>
  );
};

// ── Vignette overlay ────────────────────────────────────────────────
export const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.65 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,${intensity}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

// ── Horizontal sweep light ──────────────────────────────────────────
export const SweepLight: React.FC<{
  startFrame: number;
  duration?: number;
  color?: string;
  angle?: number;
}> = ({ startFrame, duration = 50, color = 'rgba(255,255,255,0.06)', angle = 105 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [-0.2, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (progress <= -0.15 || progress >= 1.15) return null;
  const p = progress * 100;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(${angle}deg, transparent ${p - 18}%, ${color} ${p - 3}%, rgba(255,255,255,0.15) ${p}%, ${color} ${p + 3}%, transparent ${p + 18}%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

// ── CRT-style scanlines ─────────────────────────────────────────────
export const Scanlines: React.FC<{ opacity?: number; gap?: number }> = ({ opacity = 0.04, gap = 4 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${gap - 1}px, rgba(0,0,0,${opacity}) ${gap - 1}px, rgba(0,0,0,${opacity}) ${gap}px)`,
      pointerEvents: 'none',
    }}
  />
);

// ── Expanding glow rings ────────────────────────────────────────────
export const GlowRings: React.FC<{
  count?: number;
  startFrame: number;
  interval?: number;
  color?: string;
  maxRadius?: number;
}> = ({ count = 3, startFrame, interval = 30, color = 'rgba(139,92,246,0.5)', maxRadius = 220 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const ringStart = startFrame + i * interval;
        const radius = interpolate(frame, [ringStart, ringStart + 80], [40, maxRadius], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = interpolate(frame, [ringStart, ringStart + 80], [0.6, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '46%',
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
};

// ── Dot grid background ─────────────────────────────────────────────
export const DotGrid: React.FC<{ color?: string; opacity?: number; size?: number }> = ({
  color = 'white',
  opacity = 0.08,
  size = 50,
}) => {
  const frame = useCurrentFrame();
  const offsetY = (frame * 0.15) % size;
  return (
    <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      <defs>
        <pattern
          id={`grid-${color.replace(/[^a-z0-9]/gi, '')}`}
          x="0"
          y={offsetY}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={size / 2} cy={size / 2} r="1.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${color.replace(/[^a-z0-9]/gi, '')})`} />
    </svg>
  );
};

// ── Zoom wrapper for scene transitions ──────────────────────────────
export const ZoomTransition: React.FC<{
  totalFrames: number;
  entryFrames?: number;
  exitFrames?: number;
  children: React.ReactNode;
}> = ({ totalFrames, entryFrames = 25, exitFrames = 30, children }) => {
  const frame = useCurrentFrame();
  const entryScale = interpolate(frame, [0, entryFrames], [1.06, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [totalFrames - exitFrames, totalFrames], [1.0, 0.96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = frame < totalFrames - exitFrames ? entryScale : exitScale;
  const opacity = Math.min(
    interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [totalFrames - exitFrames, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};
