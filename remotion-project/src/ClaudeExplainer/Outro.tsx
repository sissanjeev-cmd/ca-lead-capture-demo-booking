import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT } from './shared';
import { Particles, Vignette, DotGrid, GlowRings } from './Effects';

const ICONS = [
  { label: 'Chat',   color: COLORS.chatBlue,    sym: '◈', tx: -340, ty: 200  },
  { label: 'Cowork', color: COLORS.coworkPurple, sym: '⬡', tx: 340,  ty: 200  },
  { label: 'Code',   color: COLORS.codeGreen,    sym: '</>', tx: 0,    ty: -220 },
];

const startPositions = [
  { sx: -800, sy: 600 },
  { sx: 800,  sy: 600 },
  { sx: 0,    sy: -600 },
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const fadeFinal = interpolate(frame, [520, 600], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeFinal);

  // Zoom out on fade
  const exitZoom = interpolate(frame, [520, 600], [1, 0.92], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const converge = interpolate(frame, [0, 100], [0, 1], { extrapolateRight: 'clamp' });

  const logoScale = spring({ fps, frame: frame - 85, config: { damping: 100, stiffness: 160 } });
  const logoOpacity = interpolate(frame, [85, 120], [0, 1], { extrapolateRight: 'clamp' });
  const logoGlow = 0.4 + Math.sin(frame * 0.06) * 0.2;

  // Staggered letter reveal for tagline
  const tagline = 'Chat. Cowork. Code.';
  const taglineStart = 200;
  const lettersVisible = Math.max(0, Math.floor((frame - taglineStart) * 1.2));
  const taglineText = tagline.slice(0, Math.min(lettersVisible, tagline.length));
  const taglineOpacity = interpolate(frame, [taglineStart, taglineStart + 20], [0, 1], { extrapolateRight: 'clamp' });

  const subOpacity = interpolate(frame, [280, 330], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [280, 330], [25, 0], { extrapolateRight: 'clamp' });

  // Animated background
  const hue = interpolate(frame, [0, 600], [240, 260], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#06061a', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          transform: `scale(${exitZoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, hsl(${hue}, 45%, 12%) 0%, ${COLORS.bg} 65%)`,
          }}
        />

        <DotGrid color="rgba(160,140,255,0.5)" opacity={0.06} />
        <Particles count={50} color="rgba(180,160,255,0.4)" speed={0.2} glowSize={10} drift={18} />

        {/* Triangle connector lines with traveling dots */}
        {frame > 90 && (
          <svg
            width="1920"
            height="1080"
            viewBox="0 0 1920 1080"
            style={{ position: 'absolute', pointerEvents: 'none' }}
          >
            <defs>
              <filter id="line-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {ICONS.map((icon, i) => {
              const next = ICONS[(i + 1) % 3];
              const cx = 960, cy = 465;
              const lineOpacity = interpolate(frame, [95, 130], [0, 0.4], { extrapolateRight: 'clamp' });
              const x1 = cx + icon.tx, y1 = cy + icon.ty;
              const x2 = cx + next.tx, y2 = cy + next.ty;
              // Traveling dot
              const dotProgress = ((frame - 100) * 0.008 + i * 0.33) % 1;
              const dotX = x1 + (x2 - x1) * dotProgress;
              const dotY = y1 + (y2 - y1) * dotProgress;
              return (
                <g key={i}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={`url(#line-grad-${i})`}
                    strokeWidth={2}
                    opacity={lineOpacity}
                    strokeDasharray="10 6"
                    filter="url(#line-glow)"
                  />
                  <defs>
                    <linearGradient id={`line-grad-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={icon.color} />
                      <stop offset="100%" stopColor={next.color} />
                    </linearGradient>
                  </defs>
                  {frame > 130 && (
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r={5}
                      fill="white"
                      opacity={lineOpacity * 0.8}
                      filter="url(#line-glow)"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Icons converge to triangle */}
        {ICONS.map(({ label, color, sym, tx, ty }, i) => {
          const { sx, sy } = startPositions[i];
          const cx = interpolate(converge, [0, 1], [sx, tx]);
          const cy = interpolate(converge, [0, 1], [sy, ty]);
          const iconScale = spring({ fps, frame: frame - i * 10, config: { damping: 110, stiffness: 180 } });
          const pulse = 1 + Math.sin(frame * 0.05 + i * 2) * 0.03;
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: '50%',
                top: '46%',
                transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px)) scale(${iconScale * pulse})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 115,
                  height: 115,
                  background: color + '18',
                  border: `2px solid ${color}55`,
                  borderRadius: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  color,
                  boxShadow: `0 0 50px ${color}35, inset 0 0 25px ${color}10`,
                  fontFamily: FONT,
                  fontWeight: 700,
                }}
              >
                {sym}
              </div>
              <span style={{ fontSize: 26, fontFamily: FONT, fontWeight: 600, color: COLORS.whiteMid, letterSpacing: 3, textShadow: `0 0 15px ${color}44` }}>
                {label}
              </span>
            </div>
          );
        })}

        {/* Center Claude logo with glow rings */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            transform: `translate(-50%, -50%) scale(${logoScale})`,
            opacity: logoOpacity,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlowRings startFrame={95} count={5} interval={20} color="rgba(139,92,246,0.45)" maxRadius={250} />
          <div
            style={{
              width: 105,
              height: 105,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 800,
              color: 'white',
              fontFamily: FONT,
              boxShadow: `0 0 100px rgba(139,92,246,${logoGlow}), 0 0 50px rgba(59,130,246,0.3)`,
            }}
          >
            C
          </div>
        </div>

        {/* Staggered tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 200,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: taglineOpacity,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              fontFamily: FONT,
              color: COLORS.white,
              letterSpacing: -1,
              textShadow: '0 0 30px rgba(139,92,246,0.3)',
            }}
          >
            {taglineText}
            {lettersVisible < tagline.length && (
              <span style={{ opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0, color: COLORS.coworkPurple }}>|</span>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            position: 'absolute',
            bottom: 125,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontSize: 36,
            fontFamily: FONT,
            color: COLORS.whiteMid,
            letterSpacing: 2,
            textShadow: '0 0 20px rgba(100,130,255,0.25)',
          }}
        >
          Claude — AI for how you actually work
        </div>

        <Vignette intensity={0.75} />
      </div>
    </AbsoluteFill>
  );
};
