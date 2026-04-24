import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, rand } from './shared';
import { AIParticles, NeuralOverlay, LensFlare, Vignette, DotGrid, CinematicBars } from './CinematicFX';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame: frame - 5, config: { damping: 90, stiffness: 140 } });
  const logoOp = interpolate(frame, [5, 35], [0, 1], { extrapolateRight: 'clamp' });
  const tagOp = interpolate(frame, [35, 65], [0, 1], { extrapolateRight: 'clamp' });
  const tagY = interpolate(frame, [35, 65], [24, 0], { extrapolateRight: 'clamp' });
  const ringPulse = 1 + Math.sin(frame * 0.07) * 0.06;
  const glowPulse = 0.4 + Math.sin(frame * 0.08) * 0.2;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 40%, #050d2a 0%, ${C.bg} 70%)`,
      overflow: 'hidden',
    }}>
      <DotGrid color={C.blue} opacity={0.04} />
      <NeuralOverlay opacity={0.07} color={C.blue} />
      <AIParticles count={60} color={C.blue} speed={0.2} />

      {/* Animated rings around logo */}
      {[140, 200, 270].map((r, i) => {
        const pulse = 1 + Math.sin(frame * 0.05 + i * 1.4) * 0.04;
        const op = interpolate(frame, [15 + i * 8, 45 + i * 8], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '45%',
            width: r * 2 * pulse, height: r * 2 * pulse,
            borderRadius: '50%',
            border: `1.5px solid ${i === 0 ? C.blue : i === 1 ? C.cyan : C.purple}`,
            opacity: op * 0.35,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px ${i === 0 ? C.blue : i === 1 ? C.cyan : C.purple}`,
            pointerEvents: 'none',
          }} />
        );
      })}

      {/* Central logo */}
      <div style={{
        position: 'absolute', left: '50%', top: '43%',
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: logoOp,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          width: 140, height: 140,
          background: `linear-gradient(135deg, ${C.blueDeep} 0%, ${C.blue} 50%, ${C.cyan} 100%)`,
          borderRadius: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 76, fontWeight: 900, color: 'white', fontFamily: FONT,
          boxShadow: `0 0 120px rgba(0,200,255,${glowPulse}), 0 0 50px rgba(0,245,212,0.25), inset 0 1px 0 rgba(255,255,255,0.2)`,
          transform: `scale(${ringPulse})`,
          letterSpacing: -2,
        }}>C</div>
        <div style={{
          fontSize: 92, fontWeight: 800, color: C.white, fontFamily: FONT,
          letterSpacing: -3, marginTop: 24,
          textShadow: `0 0 60px ${C.blueGlow}, 0 2px 4px rgba(0,0,0,0.5)`,
        }}>Claude</div>
        <div style={{
          fontSize: 22, color: C.w40, fontFamily: FONT,
          letterSpacing: 8, textTransform: 'uppercase', marginTop: 8,
        }}>by Anthropic</div>
      </div>

      {/* Tagline */}
      <div style={{
        position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center',
        opacity: tagOp, transform: `translateY(${tagY}px)`,
        fontSize: 34, color: C.w70, fontFamily: FONT, letterSpacing: 3,
        textShadow: `0 0 30px ${C.blueGlow}`,
      }}>
        Three powerful ways to work with AI
      </div>

      <LensFlare x={960} y={200} startFrame={10} duration={45} color={C.blue} />
      <Vignette intensity={0.75} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
