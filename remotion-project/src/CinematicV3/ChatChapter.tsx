import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, MONO, rand } from './shared';
import { AIParticles, NeuralOverlay, LightStreak, LensFlare, Vignette, DotGrid,
  Scanlines, CinematicBars, DepthFade } from './CinematicFX';

const BLUE = C.chatColor;

// Glassmorphism chat bubble
const ChatBubble: React.FC<{
  text: string; isUser: boolean; op: number; y: number; typing?: boolean;
}> = ({ text, isUser, op, y, typing = false }) => {
  const cursorVisible = Math.floor(Date.now() / 500) % 2 === 0;
  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: 580,
      background: isUser
        ? `linear-gradient(135deg, ${BLUE}cc, #0055aacc)`
        : 'rgba(8,18,45,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: isUser ? `1px solid ${BLUE}66` : '1px solid rgba(0,200,255,0.15)',
      borderRadius: isUser ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
      padding: '20px 28px',
      fontSize: 28,
      fontFamily: FONT, lineHeight: 1.6, color: 'white',
      opacity: op, transform: `translateY(${y}px)`,
      boxShadow: isUser
        ? `0 12px 40px rgba(0,200,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`
        : `0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}>
      {text}{typing ? <span style={{ opacity: 0.7, color: BLUE }}>|</span> : null}
    </div>
  );
};

// Typing indicator
const TypingDots: React.FC<{ op: number }> = ({ op }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'center', opacity: op,
      padding: '16px 24px',
      background: 'rgba(8,18,45,0.75)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,200,255,0.12)',
      borderRadius: '24px 24px 24px 6px',
      alignSelf: 'flex-start', width: 90,
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: '50%',
          background: BLUE,
          transform: `translateY(${Math.sin(frame * 0.2 + i * 1.1) * 5}px)`,
          boxShadow: `0 0 8px ${BLUE}`,
          opacity: 0.7 + Math.sin(frame * 0.2 + i * 1.1) * 0.3,
        }} />
      ))}
    </div>
  );
};

export const ChatChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = 480;

  // Background parallax shift
  const bgX = interpolate(frame, [0, TOTAL], [0, -30], { extrapolateRight: 'clamp' });
  const hue = interpolate(frame, [0, TOTAL], [215, 225], { extrapolateRight: 'clamp' });

  // Window slides in
  const winX = interpolate(frame, [10, 50], [350, 0], {
    extrapolateRight: 'clamp', easing: t => 1 - Math.pow(1 - t, 3),
  });
  const winOp = interpolate(frame, [10, 50], [0, 1], { extrapolateRight: 'clamp' });
  const winScale = spring({ fps, frame: frame - 10, config: { damping: 120, stiffness: 180 } });

  // Headline
  const headOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const headX = interpolate(frame, [0, 30], [-80, 0], { extrapolateRight: 'clamp' });

  // Message timings
  const msg1Typing = frame > 60 && frame < 95;
  const msg1Text = (() => {
    const full = 'Summarize this 50-page investor report';
    const chars = Math.max(0, Math.floor((frame - 55) * 2.5));
    return full.slice(0, Math.min(chars, full.length));
  })();
  const msg1Op = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' });
  const msg1Y = interpolate(frame, [55, 75], [18, 0], { extrapolateRight: 'clamp' });

  const dotOp = interpolate(frame, [95, 105, 140, 155], [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Claude response bullets
  const bullets = [
    '📈  Revenue up 23% QoQ — strongest quarter since IPO',
    '💹  Gross margin improved to 68%, up from 61%',
    '⚠️   Key risk: customer concentration at 34%',
    '🌍  EU expansion planned for Q3',
    '🔬  Board recommends continued R&D investment',
  ];
  const resp1Op = interpolate(frame, [150, 168], [0, 1], { extrapolateRight: 'clamp' });
  const resp1Y = interpolate(frame, [150, 168], [18, 0], { extrapolateRight: 'clamp' });
  const bulletsVisible = Math.max(0, Math.floor((frame - 168) / 22));

  // Message 2
  const msg2Full = 'Write a cold email to a CFO';
  const msg2Chars = Math.max(0, Math.floor((frame - 300) * 2.5));
  const msg2Text = msg2Full.slice(0, Math.min(msg2Chars, msg2Full.length));
  const msg2Op = interpolate(frame, [295, 315], [0, 1], { extrapolateRight: 'clamp' });
  const msg2Y = interpolate(frame, [295, 315], [18, 0], { extrapolateRight: 'clamp' });
  const msg2Typing = frame > 295 && frame < 345;

  const dot2Op = interpolate(frame, [345, 355, 385, 400], [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const emailLines = [
    { text: 'Subject: Helping you see around the corners', bold: true },
    { text: '', bold: false },
    { text: 'Hi [Name],', bold: false },
    { text: 'I noticed your team just closed a Series B. Scaling fast', bold: false },
    { text: 'often means data blind spots appear exactly when you', bold: false },
    { text: 'need clarity most.', bold: false },
    { text: '', bold: false },
    { text: 'Worth a 15-minute call this week?', bold: false },
    { text: '', bold: false },
    { text: 'Best, Sanjeev', bold: false },
  ];
  const emailVisible = Math.max(0, Math.floor((frame - 400) / 14));
  const emailOp = interpolate(frame, [398, 415], [0, 1], { extrapolateRight: 'clamp' });
  const emailY = interpolate(frame, [398, 415], [18, 0], { extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [TOTAL - 25, TOTAL], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at ${30 + bgX * 0.1}% 50%, hsl(${hue},50%,9%) 0%, ${C.bg} 62%)`,
      overflow: 'hidden', opacity: fadeOut,
    }}>
      <DotGrid color={BLUE} opacity={0.04} />
      <AIParticles count={30} color={BLUE} speed={0.18} />
      <NeuralOverlay opacity={0.05} color={BLUE} />

      {/* Left panel — headline */}
      <div style={{
        position: 'absolute', left: 90, top: '50%',
        transform: `translate(${headX}px, -50%)`,
        opacity: headOp, maxWidth: 560,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          marginBottom: 24, padding: '8px 18px',
          background: `${BLUE}18`,
          border: `1px solid ${BLUE}33`,
          borderRadius: 100,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE,
            boxShadow: `0 0 10px ${BLUE}` }} />
          <span style={{ fontSize: 20, color: BLUE, fontFamily: FONT,
            letterSpacing: 4, textTransform: 'uppercase' }}>Claude Chat</span>
        </div>
        <div style={{
          fontSize: 68, fontWeight: 800, color: C.white, fontFamily: FONT,
          lineHeight: 1.1, letterSpacing: -2,
          textShadow: `0 0 40px ${BLUE}33, 0 3px 6px rgba(0,0,0,0.4)`,
        }}>
          Your brilliant<br />thinking<br />partner
        </div>
        <div style={{
          marginTop: 24, fontSize: 26, color: C.w70, fontFamily: FONT,
          lineHeight: 1.6, maxWidth: 480,
        }}>
          Draft, summarize, brainstorm — available 24/7, ready in seconds.
        </div>
      </div>

      {/* Glassmorphism chat window */}
      <div style={{
        position: 'absolute', right: 70, top: '50%',
        transform: `translate(${winX}px, -50%) scale(${winScale})`,
        opacity: winOp, width: 680,
        background: 'rgba(5,12,35,0.82)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${BLUE}28`,
        borderRadius: 24,
        boxShadow: `0 50px 120px rgba(0,0,0,0.65), 0 0 80px ${BLUE}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
        overflow: 'hidden',
      }}>
        {/* Title bar */}
        <div style={{
          background: `linear-gradient(180deg, ${BLUE}18 0%, ${BLUE}06 100%)`,
          borderBottom: `1px solid ${BLUE}18`,
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: '50%',
              background: c, boxShadow: `0 0 6px ${c}88` }} />
          ))}
          <span style={{ marginLeft: 18, fontSize: 22, fontFamily: FONT,
            color: C.w70, fontWeight: 600 }}>Claude</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 10px #22c55e' }} />
            <span style={{ fontSize: 18, color: '#22c55e', fontFamily: FONT }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          padding: '24px 24px', minHeight: 520,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <ChatBubble text={msg1Text} isUser op={msg1Op} y={msg1Y}
            typing={msg2Typing === false && frame > 55 && frame < 100} />
          {frame > 90 && <TypingDots op={dotOp} />}
          {frame >= 150 && (
            <div style={{ opacity: resp1Op, transform: `translateY(${resp1Y}px)` }}>
              <div style={{ fontSize: 19, color: BLUE, fontFamily: FONT,
                marginBottom: 10, textShadow: `0 0 10px ${BLUE}55` }}>✦ Claude</div>
              <div style={{
                background: 'rgba(8,18,45,0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,200,255,0.12)',
                borderRadius: '24px 24px 24px 6px',
                padding: '18px 24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              }}>
                {bullets.slice(0, bulletsVisible).map((b, i) => (
                  <div key={i} style={{
                    fontSize: 24, fontFamily: FONT, color: C.w90,
                    lineHeight: 1.7, padding: '2px 0',
                  }}>{b}</div>
                ))}
              </div>
            </div>
          )}
          {frame >= 295 && (
            <ChatBubble text={msg2Text} isUser op={msg2Op} y={msg2Y}
              typing={frame > 295 && frame < 345} />
          )}
          {frame >= 345 && <TypingDots op={dot2Op} />}
          {frame >= 398 && (
            <div style={{ opacity: emailOp, transform: `translateY(${emailY}px)` }}>
              <div style={{ fontSize: 19, color: BLUE, fontFamily: FONT,
                marginBottom: 10, textShadow: `0 0 10px ${BLUE}55` }}>✦ Claude</div>
              <div style={{
                background: 'rgba(8,18,45,0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,200,255,0.12)',
                borderRadius: '24px 24px 24px 6px',
                padding: '18px 24px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              }}>
                {emailLines.slice(0, emailVisible).map((l, i) => (
                  <div key={i} style={{
                    fontSize: l.bold ? 23 : 21, fontFamily: FONT,
                    color: l.bold ? C.white : C.w70,
                    fontWeight: l.bold ? 700 : 400,
                    lineHeight: 1.7,
                    minHeight: l.text === '' ? 10 : undefined,
                  }}>{l.text}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <LightStreak startFrame={8} duration={22} color={BLUE} />
      <Vignette intensity={0.72} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
