import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT } from './shared';
import { Particles, Vignette, DotGrid, ZoomTransition, SweepLight } from './Effects';

const PURPLE = COLORS.coworkPurple;

const FileItem: React.FC<{ icon: string; name: string; opacity: number; x?: number }> = ({
  icon, name, opacity, x = 0,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
      opacity,
      transform: `translateX(${x}px)`,
      fontSize: 25,
      fontFamily: FONT,
      color: COLORS.whiteMid,
    }}
  >
    <span>{icon}</span>
    <span>{name}</span>
  </div>
);

const FolderItem: React.FC<{ icon: string; name: string; count: string; color: string; opacity: number; scale: number }> = ({
  icon, name, count, color, opacity, scale,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 18px',
      background: color + '12',
      borderRadius: 12,
      border: `1px solid ${color}28`,
      opacity,
      transform: `scale(${scale})`,
      fontSize: 25,
      fontFamily: FONT,
      boxShadow: `0 0 20px ${color}15`,
    }}
  >
    <span>{icon}</span>
    <span style={{ color: COLORS.white, flex: 1 }}>{name}</span>
    <span style={{ color, fontSize: 20 }}>{count}</span>
  </div>
);

export const CoworkSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelX = interpolate(frame, [0, 30], [-200, 0], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const hue = interpolate(frame, [0, 750], [268, 280], { extrapolateRight: 'clamp' });

  const panelsOpacity = interpolate(frame, [30, 75], [0, 1], { extrapolateRight: 'clamp' });

  const reorganizeProgress = interpolate(frame, [100, 350], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scatteredFiles = [
    { icon: '📄', name: 'Q3_report_FINAL.pdf' },
    { icon: '📊', name: 'sales_data_v3.xlsx' },
    { icon: '📝', name: 'meeting_notes.txt' },
    { icon: '🖼️', name: 'logo_draft_2.png' },
    { icon: '📧', name: 'email_thread.eml' },
    { icon: '📄', name: 'contract_v2.docx' },
  ];

  const organizedFolders = [
    { icon: '📁', name: 'Reports/',  count: '3 files', color: '#3b82f6' },
    { icon: '📁', name: 'Data/',     count: '2 files', color: '#22c55e' },
    { icon: '📁', name: 'Notes/',    count: '1 file',  color: '#f59e0b' },
    { icon: '📁', name: 'Assets/',   count: '1 file',  color: '#ec4899' },
    { icon: '📁', name: 'Comms/',    count: '1 file',  color: PURPLE },
  ];

  const progressBarWidth = interpolate(frame, [420, 600], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progressOpacity = interpolate(frame, [420, 450], [0, 1], { extrapolateRight: 'clamp' });
  const doneFlash = interpolate(frame, [600, 615], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const doneFlashFade = interpolate(frame, [615, 660], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const summaryOpacity = interpolate(frame, [600, 640], [0, 1], { extrapolateRight: 'clamp' });

  // Divider glow
  const dividerGlow = 0.3 + Math.sin(frame * 0.05) * 0.15;

  return (
    <AbsoluteFill style={{ background: '#06061a', overflow: 'hidden' }}>
      <ZoomTransition totalFrames={750}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 65% 50%, hsl(${hue}, 50%, 12%) 0%, ${COLORS.bg} 60%)`,
          }}
        />

        <DotGrid color={PURPLE} opacity={0.05} />
        <Particles count={35} color="rgba(139,92,246,0.4)" speed={0.25} glowSize={6} />

        {/* section label */}
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 100,
            opacity: labelOpacity,
            transform: `translateX(${labelX}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: PURPLE, boxShadow: `0 0 20px ${PURPLE}` }} />
          <span style={{ fontSize: 26, fontFamily: FONT, fontWeight: 600, color: PURPLE, letterSpacing: 4, textTransform: 'uppercase' as const, textShadow: `0 0 15px ${PURPLE}44` }}>
            Claude Cowork
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 130,
            left: 100,
            opacity: labelOpacity,
            transform: `translateX(${labelX}px)`,
            fontSize: 66,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily: FONT,
            lineHeight: 1.2,
            maxWidth: 680,
            textShadow: `0 0 30px ${PURPLE}22`,
          }}
        >
          AI that acts on
          <br />
          your behalf
        </div>

        {/* Split panels */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: panelsOpacity,
            display: 'flex',
            gap: 0,
            width: 860,
          }}
        >
          {/* Left — before */}
          <div style={{ flex: 1, background: 'rgba(8,8,28,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 0 0 18px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 21, fontFamily: FONT, color: COLORS.whiteLow }}>Desktop — Before</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {scatteredFiles.map((f, i) => (
                <FileItem
                  key={f.name}
                  icon={f.icon}
                  name={f.name}
                  opacity={interpolate(reorganizeProgress, [i * 0.08, i * 0.08 + 0.25], [1, 0.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                  x={interpolate(reorganizeProgress, [i * 0.08, i * 0.08 + 0.25], [0, -50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                />
              ))}
            </div>
          </div>

          {/* Glowing divider */}
          <div
            style={{
              width: 2,
              background: `linear-gradient(180deg, transparent 5%, ${PURPLE} 50%, transparent 95%)`,
              opacity: dividerGlow,
              boxShadow: `0 0 20px ${PURPLE}88`,
            }}
          />

          {/* Right — after */}
          <div style={{ flex: 1, background: 'rgba(8,8,28,0.92)', border: `1px solid ${PURPLE}22`, borderRadius: '0 18px 18px 0', overflow: 'hidden', boxShadow: `0 0 50px ${PURPLE}15` }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${PURPLE}18`, background: PURPLE + '0d' }}>
              <div style={{ fontSize: 21, fontFamily: FONT, color: PURPLE, textShadow: `0 0 10px ${PURPLE}44` }}>✦ Claude organized</div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {organizedFolders.map((f, i) => {
                const s = spring({ fps, frame: Math.max(0, frame - (100 + i * 45)), config: { damping: 120, stiffness: 200 } });
                return (
                  <FolderItem
                    key={f.name}
                    {...f}
                    opacity={interpolate(reorganizeProgress, [i * 0.12 + 0.2, i * 0.12 + 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                    scale={s}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress + done */}
        <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: 800, opacity: progressOpacity }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 24, fontFamily: FONT, color: COLORS.whiteMid }}>Processing files & drafting summary...</span>
            <span style={{ fontSize: 24, fontFamily: FONT, color: PURPLE, textShadow: `0 0 10px ${PURPLE}66` }}>{Math.round(progressBarWidth)}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${progressBarWidth}%`, background: `linear-gradient(90deg, ${PURPLE}, #ec4899)`, borderRadius: 3, boxShadow: `0 0 16px ${PURPLE}88, 0 0 4px #ec489988` }} />
          </div>
          {progressBarWidth >= 100 && (
            <>
              {/* Flash effect on completion */}
              <div style={{ position: 'fixed', inset: 0, background: PURPLE, opacity: doneFlash * doneFlashFade * 0.08, pointerEvents: 'none' }} />
              <div style={{ marginTop: 18, textAlign: 'center', fontSize: 28, fontFamily: FONT, color: PURPLE, opacity: summaryOpacity, fontWeight: 600, textShadow: `0 0 20px ${PURPLE}88` }}>
                ✓ Task Complete — Weekly summary drafted
              </div>
            </>
          )}
        </div>

        <SweepLight startFrame={30} duration={55} color="rgba(139,92,246,0.05)" />
        <Vignette intensity={0.7} />
      </ZoomTransition>
    </AbsoluteFill>
  );
};
