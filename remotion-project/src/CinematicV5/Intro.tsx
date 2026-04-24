import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, T, easeOutExpo, easeOut } from './shared';
import {
  AIParticles, VolumetricLight, LensFlare, Vignette,
  GlowOrb, GridBG, NeuralNet, Grain,
} from './CinematicFX';

const TOTAL = T.INTRO_FRAMES; // 283

// ── Small spark icon ──────────────────────────────────────────────────
const SparkIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill={color} />
  </svg>
);

// ── Product rectangle flying in from an angle ─────────────────────────
interface ProductCardProps {
  label:       string;
  tagline:     string;
  color:       string;
  glow:        string;
  startFrame:  number;
  fromX:       number;    // start x-offset (px)
  fromY:       number;    // start y-offset (px)
  fromRotateY: number;    // 3-D Y-rotation start (deg)
  finalLeft:   number;    // absolute left position in composition
}

const ProductCard: React.FC<ProductCardProps> = ({
  label, tagline, color, glow, startFrame, fromX, fromY, fromRotateY, finalLeft,
}) => {
  const f = useCurrentFrame();
  const t01  = Math.max(0, Math.min(1, (f - startFrame) / 22));
  const ease = easeOutExpo(t01);

  const tx   = fromX * (1 - ease);
  const ty   = fromY * (1 - ease);
  const rotY = fromRotateY * (1 - ease);
  const op   = easeOut(t01);
  const scl  = 0.70 + 0.30 * ease;

  // gentle pulse once settled
  const pulse = t01 >= 1 ? 1 + Math.sin((f - startFrame - 22) * 0.055) * 0.028 : 1;

  return (
    <div style={{
      position: 'absolute',
      left: finalLeft,
      top: 570,
      width: 280,
      opacity: op,
      transform: `translateX(${tx}px) translateY(${ty}px)
                  perspective(900px) rotateY(${rotY}deg)
                  scale(${scl * pulse})`,
      transformOrigin: '50% 50%',
    }}>
      <div style={{
        background: 'rgba(6,14,40,0.82)',
        border: `1.5px solid ${color}55`,
        borderRadius: 18,
        padding: '22px 26px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: `0 0 48px ${glow}28, inset 0 0 24px ${glow}05`,
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 12px ${glow}`,
        }} />

        {/* Icon + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `radial-gradient(circle at 35% 35%, ${color}28, ${color}0a)`,
            border: `1px solid ${color}45`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${glow}40`,
          }}>
            <SparkIcon color={color} size={18} />
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 32, fontWeight: 800,
            letterSpacing: '0.06em', color: C.white,
            textShadow: `0 0 20px ${glow}`,
          }}>
            {label}
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 300,
          color: C.w50, letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          {tagline}
        </div>

        {/* Bottom rule */}
        <div style={{
          height: 1, marginTop: 2,
          background: `linear-gradient(90deg, ${color}40, transparent)`,
        }} />
      </div>
    </div>
  );
};

// ── Main Intro ────────────────────────────────────────────────────────
export const Intro: React.FC = () => {
  const f = useCurrentFrame();

  // Global fade in / out
  const bgIn    = interpolate(f, [0, 20],           [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(f, [TOTAL - 22, TOTAL], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = bgIn * fadeOut;

  // Slow cinematic push in
  const zoom = 1 + interpolate(f, [0, TOTAL], [0, 0.05], { extrapolateRight: 'clamp' });

  // Claude icon
  const iconOp   = interpolate(f, [2,  42],  [0, 1],   { extrapolateRight: 'clamp' });
  const iconScl  = interpolate(f, [2,  42],  [0.55, 1], { extrapolateRight: 'clamp' });
  const iconPulse = 1 + Math.sin(f * 0.05) * 0.03;

  // CLAUDE wordmark blur-reveal
  const wordOp    = interpolate(f, [8,  62],  [0, 1],   { extrapolateRight: 'clamp' });
  const wordBlur  = interpolate(f, [8,  62],  [28, 0],  { extrapolateRight: 'clamp' });
  const wordScl   = interpolate(f, [8,  62],  [1.14, 1], { extrapolateRight: 'clamp' });

  // Divider line
  const divW     = interpolate(f, [35, 78],  [0, 500],  { extrapolateRight: 'clamp' });

  // BY ANTHROPIC
  const byOp     = interpolate(f, [45, 90],  [0, 1],   { extrapolateRight: 'clamp' });
  const byY      = interpolate(f, [45, 90],  [12, 0],  { extrapolateRight: 'clamp' });

  // "THREE POWERFUL WAYS" — aligns with "three powerful ways" at ~4.3s → frame 129
  const waysOp   = interpolate(f, [124, 152], [0, 1],  { extrapolateRight: 'clamp' });
  const waysY    = interpolate(f, [124, 152], [14, 0], { extrapolateRight: 'clamp' });

  // Background effects opacity
  const netOp   = interpolate(f, [10, 65], [0, 1], { extrapolateRight: 'clamp' });
  const partOp  = interpolate(f, [0,  45], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>

      {/* Depth backgrounds */}
      <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0 }}>
        <GlowOrb x={960} y={420} r={680} color={C.blue}   opacity={0.08} />
        <GlowOrb x={260} y={820} r={380} color={C.purple} opacity={0.05} />
        <GlowOrb x={1660} y={680} r={320} color={C.cyan}  opacity={0.05} />
      </div>

      <GridBG color={C.blue} opacity={0.032} />

      <div style={{ opacity: netOp }}>
        <NeuralNet opacity={0.065} color={C.blue} nodeCount={20} />
      </div>

      <VolumetricLight x={960} y={340} color={C.blue} intensity={0.13} rayCount={13} />

      <div style={{ opacity: partOp }}>
        <AIParticles count={60} color={C.blue}   speed={0.16} glow />
        <AIParticles count={28} color={C.cyan}   speed={0.11} glow />
        <AIParticles count={16} color={C.purple} speed={0.09} glow />
      </div>

      <LensFlare x={960} y={200} color={C.cyan} />

      {/* ── Centre wordmark block ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        paddingTop: 148,
        pointerEvents: 'none',
      }}>
        {/* Claude app-icon */}
        <div style={{
          width: 90, height: 90, borderRadius: 24,
          background: 'linear-gradient(135deg, #1a6fff, #003ecc)',
          border: '2px solid rgba(0,229,255,0.28)',
          boxShadow: `0 0 44px ${C.blueGlow}, 0 0 90px ${C.blueDim},
                      inset 0 1px 0 rgba(255,255,255,0.14)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${easeOutExpo(iconOp) * iconPulse})`,
          opacity: iconOp,
          marginBottom: 26,
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 44, fontWeight: 800,
            color: C.white, lineHeight: 1,
            textShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}>C</div>
        </div>

        {/* CLAUDE */}
        <div style={{
          fontFamily: FONT, fontSize: 120, fontWeight: 800,
          letterSpacing: '0.13em', color: C.white,
          filter: `blur(${wordBlur}px)`,
          transform: `scale(${wordScl})`,
          opacity: wordOp,
          textShadow: `0 0 60px ${C.blueGlow}, 0 0 120px ${C.blueDim}`,
          lineHeight: 1,
        }}>
          CLAUDE
        </div>

        {/* Divider */}
        <div style={{
          width: divW, height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
          boxShadow: `0 0 14px ${C.cyanGlow}`,
          margin: '16px 0',
        }} />

        {/* BY ANTHROPIC */}
        <div style={{
          fontFamily: FONT, fontSize: 18, fontWeight: 400,
          letterSpacing: '0.44em', color: C.w60,
          textTransform: 'uppercase',
          opacity: byOp,
          transform: `translateY(${byY}px)`,
        }}>
          BY ANTHROPIC
        </div>

        {/* THREE POWERFUL WAYS */}
        <div style={{
          fontFamily: FONT, fontSize: 16, fontWeight: 300,
          letterSpacing: '0.32em', color: C.w40,
          textTransform: 'uppercase',
          opacity: waysOp,
          transform: `translateY(${waysY}px)`,
          marginTop: 36,
        }}>
          THREE POWERFUL WAYS TO WORK WITH AI
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
           PRODUCT RECTANGLES — each flies in from its angle
           when the voice narrates the product name

           CHAT   (6.72s = frame 202) ← from LEFT,    rotateY  65°
           COWORK (7.52s = frame 226) ↑ from BOTTOM,  y +220px
           CODE   (8.48s = frame 254) → from RIGHT,   rotateY -65°
         ══════════════════════════════════════════════════ */}

      {/* Cards are positioned relative to composition (1920 wide)
          Centres: 960-430=530, 960-140=820, 960+170=1130 → gap ~300px each */}

      <ProductCard
        label="Chat"
        tagline="Think with Claude"
        color={C.chatColor}
        glow={C.cyanGlow}
        startFrame={T.WORD_CHAT - 10}
        fromX={-360}
        fromY={-50}
        fromRotateY={68}
        finalLeft={520}
      />

      <ProductCard
        label="Cowork"
        tagline="Create with Claude"
        color={C.coworkColor}
        glow={C.purpleGlow}
        startFrame={T.WORD_COWORK - 8}
        fromX={0}
        fromY={240}
        fromRotateY={0}
        finalLeft={820}
      />

      <ProductCard
        label="Code"
        tagline="Build with Claude"
        color={C.codeColor}
        glow={C.blueGlow}
        startFrame={T.WORD_CODE - 8}
        fromX={360}
        fromY={-50}
        fromRotateY={-68}
        finalLeft={1120}
      />

      <Grain opacity={0.018} />
      <Vignette intensity={0.68} />
    </AbsoluteFill>
  );
};
