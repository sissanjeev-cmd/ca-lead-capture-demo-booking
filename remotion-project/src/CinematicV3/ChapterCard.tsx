import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, rand } from './shared';
import { LightStreak, LensFlare, AIParticles, Vignette, CinematicBars } from './CinematicFX';

interface ChapterCardProps {
  number: string;
  title: string;
  subtitle: string;
  color: string;
  totalFrames: number;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  number, title, subtitle, color, totalFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG reveal
  const bgOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp = interpolate(frame, [totalFrames - 20, totalFrames], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sectionOp = Math.min(bgOp, exitOp);

  // Chapter number shoots in from left
  const numX = interpolate(frame, [5, 28], [-400, 0], { extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3) });
  const numOp = interpolate(frame, [5, 28], [0, 1], { extrapolateRight: 'clamp' });

  // Title scales up
  const titleScale = spring({ fps, frame: frame - 12, config: { damping: 100, stiffness: 200 } });
  const titleOp = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: 'clamp' });

  // Subtitle fades
  const subOp = interpolate(frame, [22, 42], [0, 1], { extrapolateRight: 'clamp' });
  const subY = interpolate(frame, [22, 42], [20, 0], { extrapolateRight: 'clamp' });

  // Accent line expands
  const lineW = interpolate(frame, [18, 45], [0, 320], { extrapolateRight: 'clamp' });

  // Glowing icon
  const iconPulse = 1 + Math.sin(frame * 0.1) * 0.06;

  const icons: Record<string, string> = { '01': '◈', '02': '</>', '03': '⬡' };
  const iconSym = icons[number] || '✦';

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 40% 50%, ${color}18 0%, ${C.bg} 60%)`,
      overflow: 'hidden', opacity: sectionOp,
    }}>
      {/* Background particles */}
      <AIParticles count={40} color={color} speed={0.22} />

      {/* Horizontal accent lines */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${color}44 30%, ${color}88 50%, ${color}44 70%, transparent 100%)`,
        transform: 'translateY(-80px)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${color}22 30%, ${color}44 50%, ${color}22 70%, transparent 100%)`,
        transform: 'translateY(80px)',
      }} />

      {/* Large chapter number watermark */}
      <div style={{
        position: 'absolute', right: 120, top: '50%', transform: 'translateY(-50%)',
        fontSize: 380, fontWeight: 900, color: color,
        fontFamily: FONT, opacity: 0.04, lineHeight: 1,
        userSelect: 'none', letterSpacing: -20,
      }}>{number}</div>

      {/* Icon */}
      <div style={{
        position: 'absolute', left: 140, top: '50%',
        transform: `translate(0, calc(-50% - 60px)) scale(${iconPulse})`,
        opacity: titleOp,
        fontSize: 80, color, fontFamily: FONT,
        textShadow: `0 0 40px ${color}, 0 0 80px ${color}88`,
        lineHeight: 1,
      }}>{iconSym}</div>

      {/* Chapter label */}
      <div style={{
        position: 'absolute', left: 140, top: '50%',
        transform: `translate(${numX}px, calc(-50% + 30px))`,
        opacity: numOp,
        fontSize: 20, color, fontFamily: FONT,
        letterSpacing: 10, textTransform: 'uppercase',
        textShadow: `0 0 20px ${color}`,
      }}>Chapter {number}</div>

      {/* Main title */}
      <div style={{
        position: 'absolute', left: 140, top: '50%',
        transform: `translate(0, calc(-50% + 80px)) scale(${titleScale})`,
        transformOrigin: '0 50%',
        opacity: titleOp,
        fontSize: 110, fontWeight: 900, color: C.white, fontFamily: FONT,
        letterSpacing: -3, lineHeight: 0.95,
        textShadow: `0 0 60px ${color}66, 0 4px 8px rgba(0,0,0,0.5)`,
      }}>{title}</div>

      {/* Accent underline */}
      <div style={{
        position: 'absolute', left: 140, top: '50%',
        transform: 'translateY(calc(-50% + 170px))',
        width: lineW, height: 4, borderRadius: 2,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        boxShadow: `0 0 20px ${color}`,
      }} />

      {/* Subtitle */}
      <div style={{
        position: 'absolute', left: 140, top: '50%',
        transform: `translate(0, calc(-50% + 195px)) translateY(${subY}px)`,
        opacity: subOp,
        fontSize: 30, color: C.w70, fontFamily: FONT,
        letterSpacing: 1, maxWidth: 800,
      }}>{subtitle}</div>

      <LightStreak startFrame={0} duration={25} color={color} />
      <LensFlare x={200} y={540} startFrame={8} duration={35} color={color} />
      <Vignette intensity={0.8} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
