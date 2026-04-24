import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, T } from './shared';
import { AIParticles, VolumetricLight, LensFlare, Vignette, GlowOrb } from './CinematicFX';

interface ChapterCardProps {
  chapter: number;          // 1, 2, 3
  title: string;            // 'CHAT' | 'COWORK' | 'CODE'
  subtitle: string;
  accentColor: string;
  accentGlow: string;
  totalFrames?: number;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  title,
  subtitle,
  accentColor,
  accentGlow,
  totalFrames = 45,
}) => {
  const f = useCurrentFrame();

  const bgOp      = interpolate(f, [0, 12], [0, 1],             { extrapolateRight: 'clamp' });
  const exitOp    = interpolate(f, [totalFrames - 14, totalFrames], [1, 0], { extrapolateRight: 'clamp' });
  const combined  = bgOp * exitOp;

  // number reveal
  const numScale  = interpolate(f, [0, 20], [2.4, 1],           { extrapolateRight: 'clamp' });
  const numOp     = interpolate(f, [0, 16], [0, 1],             { extrapolateRight: 'clamp' });

  // title sweep in
  const titleX    = interpolate(f, [8, 28], [-80, 0],           { extrapolateRight: 'clamp' });
  const titleOp   = interpolate(f, [8, 28], [0, 1],             { extrapolateRight: 'clamp' });

  // subtitle
  const subOp     = interpolate(f, [18, 34], [0, 1],            { extrapolateRight: 'clamp' });
  const subY      = interpolate(f, [18, 34], [14, 0],           { extrapolateRight: 'clamp' });

  // divider line grow
  const lineW     = interpolate(f, [12, 36], [0, 520],          { extrapolateRight: 'clamp' });

  // particle burst
  const burstOp   = interpolate(f, [0, 6, 24], [0, 1, 0.6],    { extrapolateRight: 'clamp' });

  const chapterStr = String(chapter).padStart(2, '0');

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: combined }}>

      <GlowOrb x={960} y={540} r={600} color={accentColor} opacity={0.07} />
      <GlowOrb x={200} y={900} r={320} color={C.purple} opacity={0.05} />

      <VolumetricLight x={960} y={540} color={accentColor} intensity={0.14} rayCount={14} />

      <div style={{ opacity: burstOp }}>
        <AIParticles count={80} color={accentColor} speed={0.22} glow />
        <AIParticles count={30} color={C.cyan}      speed={0.14} glow />
      </div>

      {/* Centre layout */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Chapter number */}
        <div style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.45em',
          color: accentColor,
          textTransform: 'uppercase',
          opacity: numOp,
          transform: `scale(${numScale})`,
          transformOrigin: '50% 50%',
          marginBottom: 24,
          textShadow: `0 0 20px ${accentGlow}`,
        }}>
          CHAPTER {chapterStr}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT,
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: C.white,
          textTransform: 'uppercase',
          opacity: titleOp,
          transform: `translateX(${titleX}px)`,
          textShadow: `0 0 60px ${accentGlow}, 0 0 120px ${accentGlow}40`,
          lineHeight: 1,
        }}>
          {title}
        </div>

        {/* Divider */}
        <div style={{
          width: lineW,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          boxShadow: `0 0 16px ${accentGlow}`,
          margin: '28px 0',
        }} />

        {/* Subtitle */}
        <div style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: '0.28em',
          color: C.w70 ?? C.w80,
          textTransform: 'uppercase',
          opacity: subOp,
          transform: `translateY(${subY}px)`,
        }}>
          {subtitle}
        </div>
      </div>

      <LensFlare x={960} y={300} color={accentColor} />
      <Vignette intensity={0.72} />
    </AbsoluteFill>
  );
};
