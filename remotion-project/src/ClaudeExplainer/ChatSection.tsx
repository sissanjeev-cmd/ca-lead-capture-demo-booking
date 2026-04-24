import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT, typeText } from './shared';
import { Particles, Vignette, DotGrid, ZoomTransition, SweepLight } from './Effects';

const BLUE = COLORS.chatBlue;

const Bubble: React.FC<{
  text: string;
  isUser: boolean;
  opacity: number;
  slideY: number;
}> = ({ text, isUser, opacity, slideY }) => (
  <div
    style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: 560,
      background: isUser ? `linear-gradient(135deg, ${BLUE}, #2563eb)` : 'rgba(255,255,255,0.06)',
      border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
      color: 'white',
      padding: '18px 26px',
      borderRadius: isUser ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
      fontSize: 29,
      fontFamily: FONT,
      lineHeight: 1.55,
      opacity,
      transform: `translateY(${slideY}px)`,
      boxShadow: isUser ? `0 8px 30px rgba(59,130,246,0.35)` : '0 4px 20px rgba(0,0,0,0.3)',
    }}
  >
    {text}
  </div>
);

export const ChatSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelX = interpolate(frame, [0, 30], [-200, 0], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const hue = interpolate(frame, [0, 840], [215, 230], { extrapolateRight: 'clamp' });

  // chat window
  const windowX = interpolate(frame, [20, 70], [300, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const windowOpacity = interpolate(frame, [20, 65], [0, 1], { extrapolateRight: 'clamp' });

  // Msg 1 - user
  const msg1Opacity = interpolate(frame, [75, 100], [0, 1], { extrapolateRight: 'clamp' });
  const msg1Y = interpolate(frame, [75, 100], [20, 0], { extrapolateRight: 'clamp' });
  const msg1Text = typeText('Summarize this investor report', frame, 85, 2.5);

  // Claude response
  const resp1Opacity = interpolate(frame, [155, 180], [0, 1], { extrapolateRight: 'clamp' });
  const resp1Y = interpolate(frame, [155, 180], [20, 0], { extrapolateRight: 'clamp' });
  const bulletLines = [
    '• Revenue up 23% QoQ — strongest quarter since IPO',
    '• Gross margin improved to 68%, up from 61%',
    '• Key risk: customer concentration at 34%',
    '• Expansion into EU market planned for Q3',
    '• Board recommends continued R&D investment',
  ];
  const bulletsToShow = Math.max(0, Math.floor((frame - 185) / 26));

  // Msg 2 - user
  const msg3Opacity = interpolate(frame, [400, 425], [0, 1], { extrapolateRight: 'clamp' });
  const msg3Y = interpolate(frame, [400, 425], [20, 0], { extrapolateRight: 'clamp' });
  const msg3Text = typeText('Write a cold email to a CFO', frame, 410, 2.5);

  // Email
  const emailLines = [
    'Subject: Quick question about your analytics stack',
    '',
    'Hi [Name],',
    '',
    'I noticed [Company] recently expanded into APAC.',
    'Teams scaling that fast often hit data blind spots',
    'right when they need clarity most.',
    '',
    'Would a 15-min call make sense this week?',
    '',
    'Best, Sanjeev',
  ];
  const emailLinesVisible = Math.max(0, Math.floor((frame - 510) / 16));

  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={{ background: '#06061a', overflow: 'hidden' }}>
      <ZoomTransition totalFrames={840}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 25% 50%, hsl(${hue}, 55%, 12%) 0%, ${COLORS.bg} 60%)`,
          }}
        />

        <DotGrid color={BLUE} opacity={0.05} />
        <Particles count={35} color="rgba(59,130,246,0.4)" speed={0.25} glowSize={6} />

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
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: BLUE, boxShadow: `0 0 20px ${BLUE}` }} />
          <span style={{ fontSize: 26, fontFamily: FONT, fontWeight: 600, color: BLUE, letterSpacing: 4, textTransform: 'uppercase' as const, textShadow: `0 0 15px ${BLUE}44` }}>
            Claude Chat
          </span>
        </div>

        {/* headline */}
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
            textShadow: '0 0 30px rgba(59,130,246,0.2)',
          }}
        >
          Your intelligent
          <br />
          thinking partner
        </div>

        {/* Chat window */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: '50%',
            transform: `translate(${windowX}px, -50%)`,
            opacity: windowOpacity,
            width: 720,
            background: 'rgba(8,14,35,0.95)',
            border: `1px solid ${BLUE}30`,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* chrome */}
          <div
            style={{
              background: `linear-gradient(180deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.06) 100%)`,
              borderBottom: `1px solid ${BLUE}18`,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.4)' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#febc2e', boxShadow: '0 0 6px rgba(254,188,46,0.4)' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 6px rgba(40,200,64,0.4)' }} />
            <span style={{ marginLeft: 16, fontSize: 24, fontFamily: FONT, color: COLORS.whiteMid, fontWeight: 600 }}>Claude</span>
            <div style={{ marginLeft: 'auto', width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' }} />
          </div>

          {/* messages */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: 500 }}>
            <Bubble text={msg1Text + (frame > 85 && frame < 135 && cursorBlink ? '|' : '')} isUser opacity={msg1Opacity} slideY={msg1Y} />

            {frame >= 155 && (
              <div style={{ opacity: resp1Opacity, transform: `translateY(${resp1Y}px)` }}>
                <div style={{ fontSize: 21, color: BLUE, fontFamily: FONT, marginBottom: 12, textShadow: `0 0 10px ${BLUE}44` }}>✦ Claude</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px 22px 22px 6px', padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {bulletLines.slice(0, bulletsToShow).map((line, i) => (
                    <div key={i} style={{ fontSize: 25, fontFamily: FONT, color: COLORS.whiteMid, lineHeight: 1.5 }}>{line}</div>
                  ))}
                </div>
              </div>
            )}

            {frame >= 400 && (
              <Bubble text={msg3Text + (frame > 410 && frame < 465 && cursorBlink ? '|' : '')} isUser opacity={msg3Opacity} slideY={msg3Y} />
            )}

            {frame >= 510 && (
              <div style={{ opacity: interpolate(frame, [510, 530], [0, 1], { extrapolateRight: 'clamp' }) }}>
                <div style={{ fontSize: 21, color: BLUE, fontFamily: FONT, marginBottom: 12, textShadow: `0 0 10px ${BLUE}44` }}>✦ Claude</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px 22px 22px 6px', padding: '18px 26px' }}>
                  {emailLines.slice(0, emailLinesVisible).map((line, i) => (
                    <div key={i} style={{ fontSize: line.startsWith('Subject') ? 25 : 23, fontFamily: FONT, color: line.startsWith('Subject') ? COLORS.white : COLORS.whiteMid, lineHeight: 1.6, fontWeight: line.startsWith('Subject') ? 600 : 400, minHeight: line === '' ? 8 : undefined }}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <SweepLight startFrame={25} duration={55} color="rgba(59,130,246,0.06)" />
        <Vignette intensity={0.7} />
      </ZoomTransition>
    </AbsoluteFill>
  );
};
