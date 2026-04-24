import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, T } from './shared';
import {
  AIParticles, VolumetricLight, LensFlare, Vignette,
  GlowOrb, GridBG, NeuralNet, Grain,
} from './CinematicFX';

const TOTAL = T.OUTRO_FRAMES; // 233

// ── Product card (rectangle) ─────────────────────────────────────────
const ProductIcon: React.FC<{
  label: string;
  tagline: string;
  color: string;
  glow: string;
  startFrame: number;
  x: number;
}> = ({ label, tagline, color, glow, startFrame, x }) => {
  const f = useCurrentFrame();
  const op  = interpolate(f, [startFrame, startFrame + 22], [0, 1], { extrapolateRight: 'clamp' });
  const scl = interpolate(f, [startFrame, startFrame + 22], [0.7, 1], { extrapolateRight: 'clamp' });
  const pulse = 1 + Math.sin(f * 0.06 + startFrame) * 0.04;

  return (
    <div style={{
      position: 'absolute', left: x - 150, top: 420, width: 300,
      opacity: op, transform: `scale(${scl * pulse})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Rectangle card */}
      <div style={{
        width: '100%',
        padding: '28px 32px',
        borderRadius: 20,
        background: `linear-gradient(145deg, ${color}30, ${color}12)`,
        border: `1.5px solid ${color}55`,
        boxShadow: `0 0 50px ${glow}, 0 0 100px ${glow}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 16px ${glow}`,
        }} />
        {/* Label */}
        <div style={{
          fontFamily: FONT, fontSize: 32, fontWeight: 800,
          color: C.white, letterSpacing: '0.10em', textTransform: 'uppercase',
          textShadow: `0 0 24px ${glow}`,
        }}>{label}</div>
        {/* Tagline */}
        <div style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 300,
          color: C.w60, letterSpacing: '0.14em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>{tagline}</div>
        {/* Bottom accent dot */}
        <div style={{
          width: 6, height: 6, borderRadius: '50%', marginTop: 4,
          background: color, boxShadow: `0 0 12px ${glow}`,
        }} />
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
export const Outro: React.FC = () => {
  const f = useCurrentFrame();

  const fadeIn  = interpolate(f, [0, 32],            [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(f, [TOTAL - 32, TOTAL], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;

  // Wordmark
  const wordOp  = interpolate(f, [16, 50],  [0, 1], { extrapolateRight: 'clamp' });
  const wordY   = interpolate(f, [16, 50],  [20, 0], { extrapolateRight: 'clamp' });

  // Sub line
  const subOp   = interpolate(f, [50, 78],  [0, 1], { extrapolateRight: 'clamp' });
  const subY    = interpolate(f, [50, 78],  [14, 0], { extrapolateRight: 'clamp' });

  // Divider
  const divW    = interpolate(f, [44, 88],  [0, 600], { extrapolateRight: 'clamp' });

  // CTA
  const ctaOp   = interpolate(f, [140, 170], [0, 1], { extrapolateRight: 'clamp' });
  const ctaScl  = interpolate(f, [140, 170], [0.92, 1], { extrapolateRight: 'clamp' });

  // Anthropic byline
  const bylineOp = interpolate(f, [180, 205], [0, 1], { extrapolateRight: 'clamp' });

  // Zoom
  const zoom = 1 + interpolate(f, [0, TOTAL], [0, 0.025], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      {/* Background */}
      <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0 }}>
        <GlowOrb x={960} y={540} r={700} color={C.blue}   opacity={0.07} />
        <GlowOrb x={200} y={900} r={350} color={C.purple} opacity={0.05} />
        <GlowOrb x={1700} y={200} r={300} color={C.cyan}  opacity={0.05} />
      </div>
      <GridBG color={C.blue} opacity={0.035} />
      <NeuralNet opacity={0.07} color={C.blue} nodeCount={22} />
      <AIParticles count={50} color={C.blue}   speed={0.16} />
      <AIParticles count={25} color={C.cyan}   speed={0.10} />
      <AIParticles count={18} color={C.purple} speed={0.09} />
      <VolumetricLight x={960} y={540} color={C.blue} intensity={0.10} rayCount={14} />

      {/* ── Centre wordmark ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        paddingTop: 120,
      }}>
        <div style={{
          fontFamily: FONT, fontSize: 116, fontWeight: 800,
          letterSpacing: '0.10em', color: C.white,
          textShadow: `0 0 60px ${C.blueGlow}, 0 0 120px ${C.blueDim}`,
          opacity: wordOp, transform: `translateY(${wordY}px)`,
          lineHeight: 1,
        }}>
          CLAUDE
        </div>

        <div style={{
          width: divW, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
          boxShadow: `0 0 14px ${C.cyanGlow}`,
          margin: '24px 0',
        }} />

        <div style={{
          fontFamily: FONT, fontSize: 24, fontWeight: 300,
          letterSpacing: '0.30em', color: C.w70 ?? C.w80,
          textTransform: 'uppercase',
          opacity: subOp, transform: `translateY(${subY}px)`,
          marginBottom: 40,
        }}>
          AI FOR EVERY HUMAN
        </div>
      </div>

      {/* ── Product trio ── */}
      <ProductIcon
        label="Chat"
        tagline="Converse · Explore · Learn"
        color={C.chatColor}
        glow={C.cyanGlow}
        startFrame={80}
        x={400}
      />
      <ProductIcon
        label="Cowork"
        tagline="Create · Collaborate · Build"
        color={C.coworkColor}
        glow={C.purpleGlow}
        startFrame={104}
        x={960}
      />
      <ProductIcon
        label="Code"
        tagline="Write · Debug · Ship"
        color={C.codeColor}
        glow={C.blueGlow}
        startFrame={128}
        x={1520}
      />

      {/* Connector lines between icons */}
      {f > 140 && (
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
          {[
            { x1: 520, x2: 840 },
            { x1: 1080, x2: 1400 },
          ].map(({ x1, x2 }, i) => {
            const lineOp = interpolate(f, [140 + i * 12, 162 + i * 12], [0, 1], { extrapolateRight: 'clamp' });
            return (
              <line key={i}
                x1={x1} y1={480} x2={x2} y2={480}
                stroke={C.cyan} strokeWidth="1" opacity={lineOp * 0.3}
                strokeDasharray="4 8"
              />
            );
          })}
        </svg>
      )}

      {/* ── CTA button ── */}
      <div style={{
        position: 'absolute', bottom: 130, left: '50%',
        transform: `translateX(-50%) scale(${ctaScl})`,
        opacity: ctaOp,
      }}>
        <div style={{
          padding: '18px 56px',
          background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
          borderRadius: 60,
          boxShadow: `0 0 40px ${C.blueGlow}, 0 0 80px ${C.blueDim}`,
          fontFamily: FONT, fontSize: 22, fontWeight: 700,
          color: C.white, letterSpacing: '0.18em', textTransform: 'uppercase',
          border: `1px solid rgba(255,255,255,0.18)`,
        }}>
          Try Claude Free
        </div>
      </div>

      {/* ── Anthropic byline ── */}
      <div style={{
        position: 'absolute', bottom: 56, left: '50%',
        transform: 'translateX(-50%)',
        opacity: bylineOp,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 40, height: 1, background: `rgba(255,255,255,0.20)` }} />
        <div style={{
          fontFamily: FONT, fontSize: 16, letterSpacing: '0.28em',
          color: C.w40 ?? C.w60, textTransform: 'uppercase',
        }}>
          ANTHROPIC  ·  2025
        </div>
        <div style={{ width: 40, height: 1, background: `rgba(255,255,255,0.20)` }} />
      </div>

      <LensFlare x={960} y={180} color={C.cyan} />
      <Grain opacity={0.015} />
      <Vignette intensity={0.70} />
    </AbsoluteFill>
  );
};
