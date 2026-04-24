import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, MONO, T } from './shared';
import {
  AIParticles, VolumetricLight, LensFlare, Vignette,
  GlowOrb, GridBG, Grain, NeuralNet,
} from './CinematicFX';

const TOTAL = T.COWORK_FRAMES; // 486

// ─────────────────────────────────────────────────────────────────────
// Chapter title banner
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
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      zIndex: 200,
    }}>
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
const Cursor: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const f = useCurrentFrame();
  const blink = Math.floor(f * 0.5) % 2 === 0;
  return visible && blink
    ? <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: C.cyan, verticalAlign: 'text-bottom', marginLeft: 1 }} />
    : null;
};

const TypeLine: React.FC<{
  text: string; startFrame: number; speed?: number;
  color?: string; style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 2.0, color = C.w80, style }) => {
  const f = useCurrentFrame();
  const count   = Math.max(0, Math.floor((f - startFrame) * speed));
  const done    = count >= text.length;
  const visible = text.slice(0, count);
  return (
    <span style={{ color, ...style }}>
      {visible}{!done && <Cursor />}
    </span>
  );
};

const AISuggestion: React.FC<{
  text: string; startFrame: number; x: number; y: number;
}> = ({ text, startFrame, x, y }) => {
  const f = useCurrentFrame();
  const op  = interpolate(f, [startFrame, startFrame + 18], [0, 1],  { extrapolateRight: 'clamp' });
  const scl = interpolate(f, [startFrame, startFrame + 18], [0.8, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      opacity: op, transform: `scale(${scl})`,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 18px',
      background: 'rgba(123,47,255,0.18)', border: '1px solid rgba(123,47,255,0.45)',
      borderRadius: 28,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 0 24px rgba(123,47,255,0.30)',
      zIndex: 20,
    }}>
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z" fill={C.purple} />
      </svg>
      <span style={{ fontFamily: FONT, fontSize: 18, color: C.w80 }}>{text}</span>
    </div>
  );
};

const DocBlock: React.FC<{
  heading: string; lines: string[]; startFrame: number; color?: string;
}> = ({ heading, lines, startFrame, color = C.cyan }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [startFrame, startFrame + 16], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ marginBottom: 32, opacity: op }}>
      <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color, marginBottom: 12, letterSpacing: '0.02em' }}>
        {f > startFrame + 4 ? <TypeLine text={heading} startFrame={startFrame + 4} speed={2.5} color={color} /> : ''}
      </div>
      {lines.map((line, i) => {
        const lineStart = startFrame + 18 + i * 22;
        if (f < lineStart) return null;
        return (
          <div key={i} style={{ fontFamily: FONT, fontSize: 24, lineHeight: 1.7, color: C.w60, marginBottom: 6 }}>
            <TypeLine text={`• ${line}`} startFrame={lineStart} speed={2.0} color={C.w60} />
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
export const CoworkChapter: React.FC = () => {
  const f = useCurrentFrame();

  const fadeIn  = interpolate(f, [0, 28],            [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(f, [TOTAL - 28, TOTAL], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;
  const zoom    = 1 + interpolate(f, [0, TOTAL], [0, 0.032], { extrapolateRight: 'clamp' });

  const leftPanelOp  = interpolate(f, [10, 42], [0, 1], { extrapolateRight: 'clamp' });
  const rightPanelOp = interpolate(f, [24, 56], [0, 1], { extrapolateRight: 'clamp' });

  const accentColor = C.coworkColor;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0 }}>
        <GlowOrb x={960}  y={800} r={620} color={accentColor} opacity={0.05} />
        <GlowOrb x={100}  y={200} r={320} color={C.blue}      opacity={0.04} />
      </div>
      <GridBG color={accentColor} opacity={0.025} />
      <NeuralNet opacity={0.05} color={accentColor} nodeCount={20} />
      <AIParticles count={35} color={accentColor} speed={0.12} />
      <VolumetricLight x={960} y={1100} color={accentColor} intensity={0.07} rayCount={12} />

      {/* ── CHAPTER TITLE BANNER ── */}
      <ChapterBanner title="Claude Cowork" color={accentColor} glow={C.purpleGlow} />

      {/* ── Top nav bar (below banner) ── */}
      <div style={{
        position: 'absolute', top: 130, left: 0, right: 0, height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: 'rgba(3,7,18,0.82)',
        borderBottom: `1px solid rgba(123,47,255,0.18)`,
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        opacity: interpolate(f, [6, 30], [0, 1], { extrapolateRight: 'clamp' }),
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Document', 'Research', 'Brainstorm', 'Review'].map((tab, i) => (
            <div key={i} style={{
              fontFamily: FONT, fontSize: 20, color: i === 0 ? accentColor : C.w50,
              paddingBottom: 6,
              borderBottom: i === 0 ? `2.5px solid ${accentColor}` : 'none',
            }}>{tab}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[C.cyan, accentColor, C.blue].map((c, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `radial-gradient(circle, ${c}, ${c}88)`,
              border: `2px solid ${C.bg}`, marginLeft: i === 0 ? 0 : -10,
              boxShadow: `0 0 14px ${c}60`,
            }} />
          ))}
          <div style={{ fontFamily: FONT, fontSize: 18, color: C.w60, marginLeft: 14 }}>3 collaborating</div>
        </div>
      </div>

      {/* ── Left: Document editor ── */}
      <div style={{
        position: 'absolute', left: 48, top: 206, bottom: 48, width: 840,
        opacity: leftPanelOp,
        background: 'rgba(6,14,40,0.60)',
        border: '1px solid rgba(123,47,255,0.18)',
        borderRadius: 20,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        padding: '36px 44px', overflow: 'hidden',
        boxShadow: '0 0 60px rgba(123,47,255,0.08)',
      }}>
        {/* Doc title */}
        <div style={{ marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 22 }}>
          {f > 22 && (
            <div style={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: C.white, marginBottom: 10 }}>
              <TypeLine text="Product Strategy 2025" startFrame={24} speed={1.8} color={C.white} />
            </div>
          )}
          <div style={{ fontFamily: FONT, fontSize: 16, color: C.w30, letterSpacing: '0.08em' }}>
            Collaborative document · Last edited just now
          </div>
        </div>

        <DocBlock
          heading="Executive Summary"
          lines={[
            'Expand into three new markets by Q3',
            'Launch AI-assisted onboarding flow',
            'Reduce churn by 18% through proactive engagement',
          ]}
          startFrame={46} color={accentColor}
        />
        <DocBlock
          heading="Market Opportunities"
          lines={[
            'Southeast Asia: 340M digitally active users, low competition',
            'Enterprise segment growing 42% YoY in target verticals',
            'Platform partnerships can accelerate distribution 3×',
          ]}
          startFrame={150} color={C.cyan}
        />
        <DocBlock
          heading="Action Items"
          lines={[
            'Finalize pricing model — owner: Sarah, due: Mar 15',
            'Complete technical architecture review',
            'Prepare investor deck for Series B',
          ]}
          startFrame={270} color={C.blue}
        />
      </div>

      {/* ── Right: AI coworker panel ── */}
      <div style={{
        position: 'absolute', right: 48, top: 206, bottom: 48, width: 420,
        opacity: rightPanelOp, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Claude suggestion card */}
        <div style={{
          background: 'rgba(6,14,40,0.72)',
          border: '1px solid rgba(123,47,255,0.32)',
          borderRadius: 18, padding: '22px 24px',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 44px rgba(123,47,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: `radial-gradient(circle, ${C.purple}, ${C.blue})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px ${C.purpleGlow}`,
              fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.white,
            }}>C</div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: C.white }}>Claude is reviewing…</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: C.w50 }}>Analysing document structure</div>
            </div>
          </div>
          {f > 80 && (
            <div style={{ fontFamily: FONT, fontSize: 24, lineHeight: 1.7, color: C.w80 }}>
              <TypeLine
                text="Your summary is strong. Consider quantifying the churn metric — e.g., '18% reduction saves ~$2.4M ARR at current scale.'"
                startFrame={84} speed={1.8} color={C.w80}
              />
            </div>
          )}
        </div>

        {/* Insight cards */}
        {[
          { label: 'Strengthen with data',    icon: '📊', frame: 168 },
          { label: 'Suggest related research', icon: '🔍', frame: 210 },
          { label: 'Improve action items',     icon: '✅', frame: 252 },
        ].map(({ label, icon, frame }, i) => {
          const op     = interpolate(f, [frame, frame + 18], [0, 1], { extrapolateRight: 'clamp' });
          const slideY = interpolate(f, [frame, frame + 18], [14, 0], { extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${slideY}px)`,
              background: 'rgba(6,14,40,0.60)',
              border: '1px solid rgba(123,47,255,0.18)',
              borderRadius: 16, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              backdropFilter: 'blur(16px)',
            }}>
              <span style={{ fontSize: 26 }}>{icon}</span>
              <span style={{ fontFamily: FONT, fontSize: 24, color: C.w80 }}>{label}</span>
              <svg style={{ marginLeft: 'auto' }} width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          );
        })}

        {/* Live edit indicator */}
        {f > 340 && (
          <div style={{
            opacity: interpolate(f, [340, 360], [0, 1], { extrapolateRight: 'clamp' }),
            background: 'rgba(6,14,40,0.60)',
            border: '1px solid rgba(0,229,255,0.22)',
            borderRadius: 16, padding: '18px 20px',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontFamily: FONT, fontSize: 16, color: C.cyan, letterSpacing: '0.10em', marginBottom: 10 }}>
              LIVE EDITS
            </div>
            <div style={{ fontFamily: FONT, fontSize: 22, color: C.w60, lineHeight: 1.6 }}>
              <TypeLine
                text="Adding market size data to Southeast Asia section…"
                startFrame={344} speed={1.5} color={C.w60}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating AI suggestions */}
      <AISuggestion text="Add revenue projection" startFrame={320} x={420} y={340} />
      <AISuggestion text="Cite market report"      startFrame={370} x={620} y={460} />

      <LensFlare x={1400} y={100} color={accentColor} />
      <Grain opacity={0.016} />
      <Vignette intensity={0.60} />
    </AbsoluteFill>
  );
};
