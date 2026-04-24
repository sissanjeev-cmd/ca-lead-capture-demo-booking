import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT } from './shared';
import { AIParticles, NeuralOverlay, LensFlare, Vignette, CinematicBars } from './CinematicFX';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const op = interpolate(frame, [0, 20, 150, 180], [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const logoScale = spring({ fps, frame: frame - 10, config: { damping: 90, stiffness: 140 } });
  const logoOp = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' });
  const glowPulse = 0.4 + Math.sin(frame * 0.1) * 0.2;

  const tag1Op = interpolate(frame, [45, 75], [0, 1], { extrapolateRight: 'clamp' });
  const tag1Y = interpolate(frame, [45, 75], [20, 0], { extrapolateRight: 'clamp' });
  const tag2Op = interpolate(frame, [75, 105], [0, 1], { extrapolateRight: 'clamp' });
  const tag2Y = interpolate(frame, [75, 105], [20, 0], { extrapolateRight: 'clamp' });

  const chapters = [
    { label: 'Chat',   color: C.chatColor,   sym: '◈' },
    { label: 'Code',   color: C.codeColor,   sym: '</>' },
    { label: 'Cowork', color: C.coworkColor, sym: '⬡' },
  ];

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 45%, #080b2a 0%, ${C.bg} 65%)`,
      overflow: 'hidden', opacity: op,
    }}>
      <AIParticles count={55} color={C.blue} speed={0.18} />
      <NeuralOverlay opacity={0.07} color={C.purple} />

      {/* Chapter icons row */}
      <div style={{
        position: 'absolute', left: '50%', top: '35%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', gap: 60, alignItems: 'center',
      }}>
        {chapters.map(({ label, color, sym }, i) => {
          const itemOp = interpolate(frame, [i * 12 + 5, i * 12 + 30], [0, 1], { extrapolateRight: 'clamp' });
          const itemScale = spring({ fps, frame: frame - i * 12 - 5, config: { damping: 100, stiffness: 180 } });
          const pulse = 1 + Math.sin(frame * 0.07 + i * 2) * 0.04;
          return (
            <div key={label} style={{
              opacity: itemOp, transform: `scale(${itemScale * pulse})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 110, height: 110,
                background: `${color}18`,
                border: `2px solid ${color}55`,
                borderRadius: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, color, fontFamily: FONT, fontWeight: 700,
                boxShadow: `0 0 50px ${color}35`,
              }}>{sym}</div>
              <span style={{ fontSize: 26, color: C.w70, fontFamily: FONT,
                fontWeight: 600, letterSpacing: 3,
                textShadow: `0 0 15px ${color}44` }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Claude logo */}
      <div style={{
        position: 'absolute', left: '50%', top: '52%',
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: logoOp,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Glow rings */}
        {[0,1,2,3].map(i => {
          const rStart = 12 + i * 18;
          const radius = interpolate(frame, [rStart, rStart + 70], [40, 200],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const rOp = interpolate(frame, [rStart, rStart + 70], [0.5, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              position: 'absolute', width: radius * 2, height: radius * 2,
              borderRadius: '50%', border: '2px solid rgba(139,92,246,0.5)',
              opacity: rOp, transform: 'translate(-50%, -50%)',
              left: '50%', top: '50%', pointerEvents: 'none',
            }} />
          );
        })}
        <div style={{
          width: 120, height: 120,
          background: `linear-gradient(135deg, ${C.blueDeep}, ${C.blue} 50%, ${C.cyan})`,
          borderRadius: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64, fontWeight: 900, color: 'white', fontFamily: FONT,
          boxShadow: `0 0 100px rgba(0,200,255,${glowPulse}), 0 0 50px rgba(0,245,212,0.2)`,
          letterSpacing: -2,
        }}>C</div>
      </div>

      {/* Taglines */}
      <div style={{
        position: 'absolute', bottom: 160, left: 0, right: 0, textAlign: 'center',
        opacity: tag1Op, transform: `translateY(${tag1Y}px)`,
        fontSize: 62, fontWeight: 800, color: C.white, fontFamily: FONT,
        letterSpacing: -2, textShadow: `0 0 40px rgba(0,200,255,0.3)`,
      }}>
        Chat. Code. Cowork.
      </div>
      <div style={{
        position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center',
        opacity: tag2Op, transform: `translateY(${tag2Y}px)`,
        fontSize: 30, color: C.w70, fontFamily: FONT, letterSpacing: 2,
        textShadow: `0 0 20px rgba(100,130,255,0.25)`,
      }}>
        Claude — AI for how you actually work
      </div>

      <LensFlare x={960} y={200} startFrame={20} duration={50} color={C.blue} />
      <Vignette intensity={0.8} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
