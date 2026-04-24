import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, MONO, T } from './shared';
import {
  AIParticles, VolumetricLight, LensFlare, Vignette,
  GlowOrb, GridBG, Grain,
} from './CinematicFX';

const TOTAL = T.CHAT_FRAMES; // 475

// ─────────────────────────────────────────────────────────────────────
// Chapter title banner — slides in from left, stays visible all chapter
// ─────────────────────────────────────────────────────────────────────
const ChapterBanner: React.FC<{
  title: string; color: string; glow: string;
}> = ({ title, color, glow }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 20], [0, 1],    { extrapolateRight: 'clamp' });
  const tx = interpolate(f, [0, 22], [-380, 0], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', top: 32, left: 60,
      transform: `translateX(${tx}px)`, opacity: op,
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '18px 40px',
      background: 'rgba(4,10,28,0.90)',
      border: `2.5px solid ${color}`,
      borderRadius: 20,
      boxShadow: `0 0 50px ${glow}, 0 0 100px ${glow}40, inset 0 0 24px ${glow}08`,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      zIndex: 200,
    }}>
      {/* Accent dot */}
      <div style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        background: color, boxShadow: `0 0 16px ${glow}`,
      }} />
      <div style={{
        fontFamily: FONT, fontSize: 56, fontWeight: 800,
        letterSpacing: '0.05em', color: C.white,
        textShadow: `0 0 30px ${glow}, 0 0 60px ${glow}60`,
        lineHeight: 1,
      }}>
        {title}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
const TypedText: React.FC<{
  text: string; startFrame: number; speed?: number;
  color?: string; style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 1.8, color = C.w95, style }) => {
  const f = useCurrentFrame();
  const progress = Math.max(0, (f - startFrame) * speed);
  const visible  = text.slice(0, Math.floor(progress));
  const cursor   = progress < text.length && Math.floor(f * 0.5) % 2 === 0;
  return (
    <span style={{ color, ...style }}>
      {visible}{cursor ? '▋' : ''}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────
const ChatBubble: React.FC<{
  text: string; role: 'user' | 'claude'; startFrame: number; speed?: number;
}> = ({ text, role, startFrame, speed = 1.6 }) => {
  const f = useCurrentFrame();
  const appear = interpolate(f, [startFrame, startFrame + 12], [0, 1], { extrapolateRight: 'clamp' });
  const slideX = interpolate(f, [startFrame, startFrame + 16], [role === 'user' ? 50 : -50, 0], { extrapolateRight: 'clamp' });
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 24, opacity: appear, transform: `translateX(${slideX}px)`,
    }}>
      {!isUser && (
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle, ${C.blue}, ${C.purple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 16, marginTop: 4,
          boxShadow: `0 0 22px ${C.blueGlow}`,
          fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.white,
        }}>C</div>
      )}
      <div style={{
        maxWidth: '72%',
        background: isUser ? 'rgba(0,102,255,0.18)' : 'rgba(6,14,40,0.72)',
        border: `1px solid ${isUser ? 'rgba(0,102,255,0.35)' : 'rgba(0,229,255,0.18)'}`,
        borderRadius: isUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
        padding: '18px 24px',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isUser ? '0 0 28px rgba(0,102,255,0.15)' : '0 0 28px rgba(0,229,255,0.08)',
      }}>
        <div style={{ fontFamily: FONT, fontSize: 26, lineHeight: 1.65, color: isUser ? C.w95 : C.w80 }}>
          {f >= startFrame + 4
            ? <TypedText text={text} startFrame={startFrame + 4} speed={speed} />
            : ''}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
const StreamingResponse: React.FC<{
  lines: string[]; startFrame: number; framesPerLine?: number;
}> = ({ lines, startFrame, framesPerLine = 50 }) => {
  const f = useCurrentFrame();
  const appear = interpolate(f, [startFrame, startFrame + 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity: appear, marginBottom: 24, display: 'flex', gap: 16 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        background: `radial-gradient(circle, ${C.blue}, ${C.purple})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 22px ${C.blueGlow}`,
        fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.white, marginTop: 4,
      }}>C</div>
      <div style={{
        maxWidth: '82%',
        background: 'rgba(6,14,40,0.72)',
        border: '1px solid rgba(0,229,255,0.18)',
        borderRadius: '24px 24px 24px 8px',
        padding: '18px 24px',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 0 28px rgba(0,229,255,0.08)',
      }}>
        {lines.map((line, i) => {
          const lineStart = startFrame + i * framesPerLine;
          if (f < lineStart) return null;
          return (
            <div key={i} style={{ marginBottom: i < lines.length - 1 ? 10 : 0 }}>
              <TypedText
                text={line}
                startFrame={lineStart}
                speed={line.length / (framesPerLine - 8)}
                color={C.w80}
                style={{ fontFamily: FONT, fontSize: 26, lineHeight: 1.65 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
export const ChatChapter: React.FC = () => {
  const f = useCurrentFrame();

  const fadeIn  = interpolate(f, [0, 30],            [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(f, [TOTAL - 30, TOTAL], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;
  const zoom    = 1 + interpolate(f, [0, TOTAL], [0, 0.035], { extrapolateRight: 'clamp' });

  const panelOp   = interpolate(f, [14, 44],  [0, 1], { extrapolateRight: 'clamp' });
  const panelY    = interpolate(f, [14, 44],  [30, 0], { extrapolateRight: 'clamp' });
  const sideOp    = interpolate(f, [22, 52],  [0, 1], { extrapolateRight: 'clamp' });
  const suggestOp = interpolate(f, [300, 330], [0, 1], { extrapolateRight: 'clamp' });
  const accentColor = C.chatColor;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0 }}>
        <GlowOrb x={1400} y={300} r={550} color={accentColor} opacity={0.06} />
        <GlowOrb x={200}  y={800} r={380} color={C.purple}    opacity={0.05} />
      </div>
      <GridBG color={accentColor} opacity={0.03} />
      <AIParticles count={40} color={accentColor} speed={0.14} />
      <VolumetricLight x={1600} y={200} color={accentColor} intensity={0.08} rayCount={10} />
      <LensFlare x={1700} y={120} color={accentColor} />

      {/* ── CHAPTER TITLE BANNER ── */}
      <ChapterBanner title="Claude Chat" color={accentColor} glow={C.cyanGlow} />

      {/* ── Left sidebar ── */}
      <div style={{
        position: 'absolute', left: 60, top: 148, width: 300,
        opacity: sideOp, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Claude logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${C.cyan}, ${C.blue}, ${C.purple})`,
            boxShadow: `0 0 32px ${C.blueGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontSize: 22, fontWeight: 800, color: C.white,
          }}>C</div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: C.white }}>Claude</div>
            <div style={{ fontFamily: FONT, fontSize: 18, color: C.w40, letterSpacing: '0.08em' }}>by Anthropic</div>
          </div>
        </div>

        {/* New Chat button */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderRadius: 14,
          background: 'rgba(0,102,255,0.18)', border: '1px solid rgba(0,102,255,0.35)',
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${C.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, background: C.cyan, borderRadius: 2 }} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 24, color: C.w80 }}>New conversation</span>
        </div>

        {/* Recent chats */}
        {[
          'Explain quantum entanglement',
          'Write a poem about monsoon',
          'Debug my React component',
          'Plan my weekend trip',
        ].map((label, i) => {
          const itemOp = interpolate(f, [30 + i * 10, 52 + i * 10], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              padding: '12px 16px', borderRadius: 12,
              background: i === 0 ? 'rgba(0,229,255,0.08)' : 'transparent',
              border: `1px solid ${i === 0 ? 'rgba(0,229,255,0.15)' : 'transparent'}`,
              opacity: itemOp,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 22, color: i === 0 ? C.w80 : C.w60,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main chat panel ── */}
      <div style={{
        position: 'absolute', left: 400, top: 130, right: 60, bottom: 60,
        opacity: panelOp, transform: `translateY(${panelY}px)`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header accent dots */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: 24, borderBottom: '1px solid rgba(0,229,255,0.12)', marginBottom: 28,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[C.cyan, C.blue, C.purple].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatBubble
            text="Can you help me understand how neural networks learn?"
            role="user" startFrame={22} speed={1.4}
          />
          <StreamingResponse
            lines={[
              "Great question! Neural networks learn through backpropagation.",
              "Each training step adjusts millions of weights — tiny numbers that",
              "determine how strongly neurons connect. The network predicts, measures",
              "how wrong it was, then nudges every weight to reduce the error.",
            ]}
            startFrame={65} framesPerLine={38}
          />
          <ChatBubble
            text="That's fascinating. Can you give me a simple analogy?"
            role="user" startFrame={230} speed={1.6}
          />
          <StreamingResponse
            lines={[
              "Think of it like tuning a radio — slowly turning the dial,",
              "listening for the clearest signal. That's gradient descent",
              "finding the minimum loss. Each small nudge brings clarity.",
            ]}
            startFrame={272} framesPerLine={42}
          />
        </div>

        {/* Suggested prompts */}
        <div style={{ marginTop: 18, opacity: suggestOp, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Explain it mathematically', 'What are activation functions?', 'Show me code'].map((s, i) => (
            <div key={i} style={{
              padding: '10px 20px', borderRadius: 24,
              background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.22)',
              fontFamily: FONT, fontSize: 22, color: C.w60,
            }}>{s}</div>
          ))}
        </div>

        {/* Input bar */}
        <div style={{
          marginTop: 20,
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 24px',
          background: 'rgba(6,14,40,0.72)', border: '1px solid rgba(0,229,255,0.22)',
          borderRadius: 20, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 36px rgba(0,229,255,0.08)',
        }}>
          <div style={{ flex: 1, fontFamily: FONT, fontSize: 24, color: C.w60 }}>
            {f > 400
              ? <TypedText text="Ask me anything…" startFrame={405} speed={0.8} color={C.w60} />
              : <span style={{ color: C.w30 }}>Ask me anything…</span>}
          </div>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${C.blueGlow}`,
          }}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M2 14L14 8L2 2V6.5L10 8L2 9.5V14Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>

      <Grain opacity={0.016} />
      <Vignette intensity={0.62} />
    </AbsoluteFill>
  );
};
