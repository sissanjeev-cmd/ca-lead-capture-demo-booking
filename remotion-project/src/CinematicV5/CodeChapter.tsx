import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';
import { C, FONT, MONO, T, rand } from './shared';
import {
  AIParticles, VolumetricLight, LensFlare, Vignette,
  GlowOrb, GridBG, Grain,
} from './CinematicFX';

const TOTAL = T.CODE_FRAMES; // 463

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
// Syntax tokens
// ─────────────────────────────────────────────────────────────────────
type Token = { text: string; color: string };

const LINE_TOKENS: Token[][] = [
  [{ text: 'import', color: C.purple }, { text: ' { ', color: C.w60 }, { text: 'useState', color: C.cyan }, { text: ', ', color: C.w60 }, { text: 'useEffect', color: C.cyan }, { text: ' }', color: C.w60 }, { text: " from 'react'", color: '#98c379' }],
  [],
  [{ text: 'export default function', color: C.purple }, { text: ' Dashboard', color: C.cyan }, { text: '() {', color: C.w60 }],
  [{ text: '  const ', color: C.purple }, { text: '[data, setData] = ', color: C.w80 }, { text: 'useState', color: C.cyan }, { text: '<', color: C.w60 }, { text: 'Metric[]', color: C.blue }, { text: '>([])', color: C.w60 }],
  [{ text: '  const ', color: C.purple }, { text: '[loading, setLoading] = ', color: C.w80 }, { text: 'useState', color: C.cyan }, { text: '(', color: C.w60 }, { text: 'true', color: C.blue }, { text: ')', color: C.w60 }],
  [],
  [{ text: '  useEffect', color: C.cyan }, { text: '(() => {', color: C.w60 }],
  [{ text: '    fetchMetrics', color: C.blue }, { text: '().then(d => {', color: C.w60 }],
  [{ text: '      setData', color: C.blue }, { text: '(d)', color: C.w60 }],
  [{ text: '      setLoading', color: C.blue }, { text: '(', color: C.w60 }, { text: 'false', color: C.blue }, { text: ')', color: C.w60 }],
  [{ text: '    })', color: C.w60 }],
  [{ text: '  }, [])', color: C.w60 }],
  [],
  [{ text: '  if ', color: C.purple }, { text: '(loading) ', color: C.w80 }, { text: 'return ', color: C.purple }, { text: '<', color: C.w60 }, { text: 'Skeleton ', color: C.cyan }, { text: '/>', color: C.w60 }],
];

const SUGGESTION_LINES: { text: string; type: 'add' | 'context' }[] = [
  { text: '  // Claude: add error boundary', type: 'add' },
  { text: '  const [error, setError] = useState<Error | null>(null)', type: 'add' },
  { text: '', type: 'context' },
  { text: '  if (error) return <ErrorCard message={error.message} />', type: 'add' },
  { text: '  if (loading) return <Skeleton />', type: 'context' },
];

const CodeLine: React.FC<{
  tokens: Token[]; lineNum: number; startFrame: number; speed?: number;
}> = ({ tokens, lineNum, startFrame, speed = 2.6 }) => {
  const f = useCurrentFrame();
  const appear      = interpolate(f, [startFrame, startFrame + 8], [0, 1], { extrapolateRight: 'clamp' });
  const fullText    = tokens.map(t => t.text).join('');
  const charsVisible = Math.max(0, (f - startFrame) * speed);
  const rendered: React.ReactNode[] = [];
  let acc = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t   = tokens[i];
    const end = acc + t.text.length;
    if (charsVisible >= end) {
      rendered.push(<span key={i} style={{ color: t.color }}>{t.text}</span>);
    } else if (charsVisible > acc) {
      rendered.push(<span key={i} style={{ color: t.color }}>{t.text.slice(0, Math.floor(charsVisible - acc))}</span>);
      break;
    } else break;
    acc = end;
  }
  const cursor = charsVisible < fullText.length && Math.floor(f * 0.5) % 2 === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 34, opacity: appear }}>
      <span style={{
        width: 44, textAlign: 'right', paddingRight: 18,
        fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.18)',
        userSelect: 'none', flexShrink: 0,
      }}>{lineNum}</span>
      <span style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1, flex: 1 }}>
        {rendered}
        {cursor && <span style={{ display: 'inline-block', width: 2, height: '0.9em', background: C.cyan, verticalAlign: 'middle' }} />}
      </span>
    </div>
  );
};

const DiffLine: React.FC<{
  text: string; type: 'add' | 'context'; lineNum: number; startFrame: number;
}> = ({ text, type, lineNum, startFrame }) => {
  const f    = useCurrentFrame();
  const op   = interpolate(f, [startFrame, startFrame + 12], [0, 1], { extrapolateRight: 'clamp' });
  const isAdd = type === 'add';
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 34, opacity: op, background: isAdd ? 'rgba(0,229,255,0.07)' : 'transparent' }}>
      <span style={{ width: 20, textAlign: 'center', flexShrink: 0, fontFamily: MONO, fontSize: 18, color: isAdd ? C.cyan : 'transparent' }}>{isAdd ? '+' : ' '}</span>
      <span style={{ width: 40, textAlign: 'right', paddingRight: 16, flexShrink: 0, fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.18)' }}>{lineNum}</span>
      <span style={{ fontFamily: MONO, fontSize: 20, color: isAdd ? C.cyan : C.w50 }}>{text}</span>
    </div>
  );
};

const TerminalLine: React.FC<{ text: string; startFrame: number; color?: string }> = ({
  text, startFrame, color = C.w80,
}) => {
  const f     = useCurrentFrame();
  const op    = interpolate(f, [startFrame, startFrame + 8], [0, 1], { extrapolateRight: 'clamp' });
  const count = Math.max(0, Math.floor((f - startFrame) * 2.6));
  return (
    <div style={{ opacity: op, fontFamily: MONO, fontSize: 20, lineHeight: 1.75, color }}>
      {text.slice(0, count)}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
export const CodeChapter: React.FC = () => {
  const f = useCurrentFrame();

  const fadeIn  = interpolate(f, [0, 28],            [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(f, [TOTAL - 28, TOTAL], [1, 0], { extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;
  const zoom    = 1 + interpolate(f, [0, TOTAL], [0, 0.030], { extrapolateRight: 'clamp' });

  const editorOp = interpolate(f, [10, 38],  [0, 1], { extrapolateRight: 'clamp' });
  const sideOp   = interpolate(f, [22, 52],  [0, 1], { extrapolateRight: 'clamp' });
  const termOp   = interpolate(f, [290, 315], [0, 1], { extrapolateRight: 'clamp' });
  const accentColor = C.codeColor;

  const CODE_START    = 32;
  const LINE_INTERVAL = 14;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', position: 'absolute', inset: 0 }}>
        <GlowOrb x={400}  y={200} r={520} color={accentColor} opacity={0.055} />
        <GlowOrb x={1700} y={900} r={370} color={C.purple}    opacity={0.045} />
      </div>
      <GridBG color={accentColor} opacity={0.028} />
      <AIParticles count={30} color={accentColor} speed={0.10} />
      <VolumetricLight x={300} y={500} color={accentColor} intensity={0.09} rayCount={10} />
      <LensFlare x={250} y={160} color={accentColor} />

      {/* ── CHAPTER TITLE BANNER ── */}
      <ChapterBanner title="Claude Code" color={accentColor} glow={C.blueGlow} />

      {/* ── Editor title bar (below banner) ── */}
      <div style={{
        position: 'absolute', top: 130, left: 0, right: 0, height: 58,
        background: '#0d1117',
        borderBottom: '1px solid rgba(0,102,255,0.20)',
        display: 'flex', alignItems: 'center',
        opacity: interpolate(f, [6, 26], [0, 1], { extrapolateRight: 'clamp' }),
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px' }}>
          {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
            <div key={i} style={{ width: 15, height: 15, borderRadius: '50%', background: c }} />
          ))}
        </div>
        {['Dashboard.tsx', 'api/metrics.ts', 'types.ts'].map((tab, i) => (
          <div key={i} style={{
            padding: '0 22px', height: '100%', display: 'flex', alignItems: 'center',
            fontFamily: MONO, fontSize: 18,
            color: i === 0 ? C.w80 : C.w40,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: i === 0 ? 'rgba(0,102,255,0.10)' : 'transparent',
            borderBottom: i === 0 ? `2.5px solid ${accentColor}` : 'none',
          }}>
            <span style={{ fontSize: 14, marginRight: 10 }}>{i === 0 ? '⚛' : i === 1 ? '⚙' : '𝑇'}</span>
            {tab}
          </div>
        ))}
      </div>

      {/* ── Code editor panel ── */}
      <div style={{
        position: 'absolute', left: 48, top: 200, bottom: 210, right: 480,
        opacity: editorOp,
        background: '#0d1117',
        border: '1px solid rgba(0,102,255,0.15)',
        borderRadius: '0 0 16px 16px', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.60)',
      }}>
        <div style={{ padding: '20px 0' }}>
          {LINE_TOKENS.map((tokens, i) => (
            <CodeLine
              key={i} tokens={tokens} lineNum={i + 1}
              startFrame={CODE_START + i * LINE_INTERVAL}
              speed={tokens.length ? 2.6 : 0}
            />
          ))}
          {f > 250 && (
            <div style={{ marginTop: 4, borderLeft: `3px solid ${C.cyan}40` }}>
              {SUGGESTION_LINES.map((line, i) => (
                <DiffLine
                  key={i} text={line.text} type={line.type}
                  lineNum={LINE_TOKENS.length + i + 1}
                  startFrame={254 + i * 14}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: Claude Code assistant ── */}
      <div style={{
        position: 'absolute', right: 48, top: 200, bottom: 210, width: 410,
        opacity: sideOp, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Claude header card */}
        <div style={{
          background: 'rgba(6,14,40,0.82)',
          border: '1px solid rgba(0,102,255,0.30)',
          borderRadius: 18, padding: '20px 22px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 44px rgba(0,102,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: `radial-gradient(circle, ${C.blue}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 22px ${C.blueGlow}`,
              fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.white,
            }}>C</div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: C.white }}>Claude Code</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: accentColor, letterSpacing: '0.06em' }}>analysing…</div>
            </div>
          </div>
          {f > 52 && (
            <div style={{ fontFamily: FONT, fontSize: 24, lineHeight: 1.7, color: C.w80 }}>
              <span>
                I notice there's no error handling in{' '}
                <span style={{ color: C.cyan, fontFamily: MONO, fontSize: 18 }}>useEffect</span>.
                Should I add an error boundary and graceful fallback?
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {[
          { label: 'Accept suggestion',    color: accentColor, frame: 166 },
          { label: 'Explain this code',    color: C.w60,       frame: 194 },
          { label: 'Write unit tests',     color: C.w60,       frame: 222 },
          { label: 'Add TypeScript types', color: C.w60,       frame: 250 },
        ].map(({ label, color, frame }, i) => {
          const op     = interpolate(f, [frame, frame + 18], [0, 1], { extrapolateRight: 'clamp' });
          const isMain = i === 0;
          return (
            <div key={i} style={{
              opacity: op,
              padding: '14px 20px', borderRadius: 14,
              background: isMain ? 'rgba(0,102,255,0.20)' : 'rgba(6,14,40,0.60)',
              border: `1px solid ${isMain ? 'rgba(0,102,255,0.42)' : 'rgba(255,255,255,0.08)'}`,
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {isMain && (
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L8.2 5.8L13 7L8.2 8.2L7 13L5.8 8.2L1 7L5.8 5.8L7 1Z" fill={accentColor} />
                </svg>
              )}
              <span style={{ fontFamily: FONT, fontSize: 24, color }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Terminal panel ── */}
      <div style={{
        position: 'absolute', left: 48, right: 48, bottom: 40, height: 160,
        opacity: termOp,
        background: '#0a0e1a',
        border: '1px solid rgba(0,102,255,0.18)',
        borderRadius: 16, padding: '16px 24px', overflow: 'hidden',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 15, color: accentColor, letterSpacing: '0.10em', marginBottom: 12 }}>
          TERMINAL
        </div>
        <TerminalLine text="$ npx tsc --noEmit"              startFrame={296} color={C.w60} />
        <TerminalLine text="✓ No type errors found."          startFrame={320} color="#98c379" />
        <TerminalLine text="$ npm test -- --watchAll=false"   startFrame={344} color={C.w60} />
        <TerminalLine text="✓ 47 tests passed in 2.1s"        startFrame={372} color="#98c379" />
      </div>

      <Grain opacity={0.016} />
      <Vignette intensity={0.62} />
    </AbsoluteFill>
  );
};
