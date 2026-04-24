import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT } from './shared';
import { Particles, Vignette, DotGrid, GlowRings, ZoomTransition, SweepLight } from './Effects';

const ICONS = [
  { label: 'Chat',   color: COLORS.chatBlue,    offset: -Math.PI / 2 },
  { label: 'Cowork', color: COLORS.coworkPurple, offset: -Math.PI / 2 + (2 * Math.PI) / 3 },
  { label: 'Code',   color: COLORS.codeGreen,    offset: -Math.PI / 2 + (4 * Math.PI) / 3 },
];
const SYMBOLS = ['◈', '⬡', '</>'];

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame: frame - 8, config: { damping: 100, stiffness: 160 } });
  const logoOpacity = interpolate(frame, [8, 45], [0, 1], { extrapolateRight: 'clamp' });
  const tagOpacity = interpolate(frame, [60, 95], [0, 1], { extrapolateRight: 'clamp' });
  const tagY = interpolate(frame, [60, 95], [30, 0], { extrapolateRight: 'clamp' });

  // Animated background hue shift
  const hue = interpolate(frame, [0, 360], [220, 250], { extrapolateRight: 'clamp' });
  const orbitAngle = interpolate(frame, [60, 360], [0, Math.PI * 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo glow pulse
  const glowPulse = 0.35 + Math.sin(frame * 0.06) * 0.15;

  return (
    <AbsoluteFill style={{ background: '#06061a', overflow: 'hidden' }}>
      <ZoomTransition totalFrames={360}>
        {/* animated gradient bg */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 45%, hsl(${hue}, 60%, 15%) 0%, ${COLORS.bg} 65%)`,
          }}
        />

        <DotGrid color="rgba(100,140,255,0.6)" opacity={0.06} />
        <Particles count={50} color="rgba(140,170,255,0.5)" speed={0.3} glowSize={8} />

        {/* orbiting icons */}
        {ICONS.map(({ label, color, offset }, i) => {
          const appear = spring({ fps, frame: frame - 40 - i * 14, config: { damping: 120, stiffness: 180 } });
          const iconOpacity = interpolate(frame, [40 + i * 14, 68 + i * 14], [0, 1], { extrapolateRight: 'clamp' });
          const angle = orbitAngle + offset;
          const rx = Math.cos(angle) * 310;
          const ry = Math.sin(angle) * 240;
          const pulse = 1 + Math.sin(frame * 0.05 + i * 2) * 0.04;
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: '50%',
                top: '45%',
                transform: `translate(calc(-50% + ${rx}px), calc(-50% + ${ry}px)) scale(${appear * pulse})`,
                opacity: iconOpacity,
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
                  background: color + '15',
                  border: `2px solid ${color}55`,
                  borderRadius: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  color,
                  boxShadow: `0 0 50px ${color}40, inset 0 0 30px ${color}10`,
                  fontFamily: FONT,
                  fontWeight: 700,
                }}
              >
                {SYMBOLS[i]}
              </div>
              <span
                style={{
                  color: COLORS.whiteMid,
                  fontSize: 26,
                  fontFamily: FONT,
                  fontWeight: 600,
                  letterSpacing: 4,
                  textTransform: 'uppercase' as const,
                  textShadow: `0 0 20px ${color}66`,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}

        {/* central Claude logo */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '43%',
            transform: `translate(-50%, -50%) scale(${logoScale})`,
            opacity: logoOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <GlowRings startFrame={20} count={4} interval={25} color="rgba(120,100,255,0.4)" maxRadius={180} />
          <div
            style={{
              width: 135,
              height: 135,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              fontFamily: FONT,
              boxShadow: `0 0 100px rgba(139,92,246,${glowPulse}), 0 0 40px rgba(59,130,246,0.3)`,
              marginBottom: 28,
            }}
          >
            C
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: COLORS.white,
              fontFamily: FONT,
              letterSpacing: -2,
              textShadow: '0 0 40px rgba(139,92,246,0.35)',
            }}
          >
            Claude
          </div>
          <div
            style={{
              fontSize: 26,
              color: COLORS.whiteLow,
              fontFamily: FONT,
              marginTop: 12,
              letterSpacing: 6,
              textTransform: 'uppercase' as const,
            }}
          >
            by Anthropic
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 110,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontSize: 38,
            color: COLORS.whiteMid,
            fontFamily: FONT,
            letterSpacing: 2,
            textShadow: '0 0 20px rgba(100,140,255,0.3)',
          }}
        >
          Three ways to work with AI
        </div>

        <SweepLight startFrame={15} duration={60} color="rgba(139,92,246,0.06)" />
        <Vignette intensity={0.7} />
      </ZoomTransition>
    </AbsoluteFill>
  );
};
