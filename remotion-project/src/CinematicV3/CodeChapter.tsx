import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, MONO, rand } from './shared';
import { AIParticles, LightStreak, LensFlare, Vignette, Scanlines,
  CinematicBars, DotGrid } from './CinematicFX';

const GREEN = C.codeColor;

interface CodeLine { text: string; color: string; indent?: number }
const CODE: CodeLine[] = [
  { text: "// Claude Code generating OAuth login...", color: '#636e7b', indent: 0 },
  { text: "import { useState } from 'react';", color: '#7dd3fc', indent: 0 },
  { text: "import { GoogleOAuthProvider, GoogleLogin }", color: '#7dd3fc', indent: 0 },
  { text: "  from '@react-oauth/google';", color: '#7dd3fc', indent: 0 },
  { text: '', color: 'transparent', indent: 0 },
  { text: 'export const LoginPage: React.FC = () => {', color: '#c084fc', indent: 0 },
  { text: 'const [user, setUser] = useState(null);', color: '#fbbf24', indent: 1 },
  { text: '', color: 'transparent', indent: 0 },
  { text: 'const onSuccess = (credential: any) => {', color: '#fbbf24', indent: 1 },
  { text: "localStorage.setItem('auth', credential);", color: C.w70, indent: 2 },
  { text: 'setUser(credential);', color: C.w70, indent: 2 },
  { text: '};', color: C.w70, indent: 1 },
  { text: '', color: 'transparent', indent: 0 },
  { text: 'return (', color: '#c084fc', indent: 1 },
  { text: '<GoogleOAuthProvider clientId={CLIENT_ID}>', color: '#4ade80', indent: 2 },
  { text: '<div className="login-wrapper">', color: '#4ade80', indent: 3 },
  { text: '<h1>Welcome back</h1>', color: '#f472b6', indent: 4 },
  { text: '<GoogleLogin onSuccess={onSuccess} />', color: '#f472b6', indent: 4 },
  { text: '</div>', color: '#4ade80', indent: 3 },
  { text: '</GoogleOAuthProvider>', color: '#4ade80', indent: 2 },
  { text: ');', color: '#c084fc', indent: 1 },
  { text: '};', color: '#c084fc', indent: 0 },
];

// Holographic file tree
const FileTree: React.FC<{ op: number }> = ({ op }) => {
  const frame = useCurrentFrame();
  const files = [
    { name: 'src/', color: C.blue, indent: 0, icon: '📁' },
    { name: 'pages/', color: C.blue, indent: 1, icon: '📁' },
    { name: 'LoginPage.tsx', color: GREEN, indent: 2, icon: '✨' },
    { name: 'Dashboard.tsx', color: C.w40, indent: 2, icon: '📄' },
    { name: 'components/', color: C.blue, indent: 1, icon: '📁' },
    { name: 'GoogleButton.tsx', color: GREEN, indent: 2, icon: '✨' },
    { name: 'package.json', color: '#fbbf24', indent: 0, icon: '📦' },
  ];
  return (
    <div style={{
      opacity: op,
      background: 'rgba(5,12,30,0.85)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${GREEN}22`,
      borderRadius: 14, padding: '18px 20px',
      minWidth: 260,
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${GREEN}12`,
    }}>
      <div style={{ fontSize: 18, color: C.w40, fontFamily: FONT, marginBottom: 12, letterSpacing: 3 }}>
        PROJECT
      </div>
      {files.map((f, i) => {
        const appear = interpolate(frame, [i * 15 + 60, i * 15 + 85], [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingLeft: f.indent * 20,
            fontSize: 21, fontFamily: MONO, color: f.color,
            lineHeight: 2, opacity: appear,
          }}>
            <span style={{ fontSize: 14 }}>{f.icon}</span>
            <span>{f.name}</span>
            {f.name.includes('.tsx') && f.color === GREEN && (
              <span style={{ fontSize: 14, color: GREEN, marginLeft: 4,
                textShadow: `0 0 8px ${GREEN}` }}>← new</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CodeChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = 570;

  // Parallax background
  const bgY = interpolate(frame, [0, TOTAL], [0, -20], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [TOTAL - 25, TOTAL], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Headline
  const headOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const headX = interpolate(frame, [0, 30], [-60, 0], { extrapolateRight: 'clamp' });

  // Terminal window
  const termScale = spring({ fps, frame: frame - 12, config: { damping: 110, stiffness: 160 } });
  const termOp = interpolate(frame, [12, 45], [0, 1], { extrapolateRight: 'clamp' });

  // Typing command
  const cmdFull = 'claude "Add OAuth login with Google"';
  const cmdChars = Math.max(0, Math.floor((frame - 45) * 2.2));
  const cmdText = cmdFull.slice(0, Math.min(cmdChars, cmdFull.length));
  const cmdDone = frame > 62;

  // Status messages
  const statuses = [
    { text: '✦ Reading codebase...', color: GREEN, f: 65 },
    { text: '✦ Planning component structure', color: C.w40, f: 80 },
    { text: '✦ Writing LoginPage.tsx', color: GREEN, f: 100 },
    { text: '✦ Installing @react-oauth/google', color: C.w40, f: 118 },
    { text: '✦ Adding GoogleButton component', color: C.w40, f: 135 },
    { text: '✦ Wiring up auth flow', color: GREEN, f: 152 },
  ];

  // Code lines
  const linesVisible = Math.max(0, Math.floor((frame - 170) / 8));

  // File tree
  const treeOp = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: 'clamp' });

  // Browser preview
  const previewScale = spring({ fps, frame: frame - 430, config: { damping: 90, stiffness: 150 } });
  const previewOp = interpolate(frame, [430, 460], [0, 1], { extrapolateRight: 'clamp' });
  const previewFlash = interpolate(frame, [432, 455], [0.25, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Matrix rain
  const matrixOp = interpolate(frame, [90, 140], [0, 0.05],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% ${60 + bgY * 0.2}%, #050f0a 0%, ${C.bg} 58%)`,
      overflow: 'hidden', opacity: fadeOut,
    }}>
      <DotGrid color={GREEN} opacity={0.04} />
      <AIParticles count={28} color={GREEN} speed={0.22} />

      {/* Matrix rain */}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0,
        opacity: matrixOp, pointerEvents: 'none' }}>
        {Array.from({ length: 28 }, (_, ci) => {
          const x = rand(ci, 99) * 1920;
          const speed = 0.5 + rand(ci, 88) * 1.2;
          return Array.from({ length: 10 }, (_, j) => {
            const chars = '01アイウエオカキクケコABCDEF<>{}[]';
            const charIdx = Math.floor(rand(ci * 10 + j, frame * 0.1)) % chars.length;
            const y = ((rand(ci, 77) * 1080 + frame * speed * 28 + j * 38) % 1200) - 50;
            return (
              <text key={`${ci}-${j}`} x={x} y={y} fill={GREEN}
                fontSize="18" fontFamily="monospace" opacity={0.15 + (1 - j / 10) * 0.5}>
                {chars[charIdx]}
              </text>
            );
          });
        })}
      </svg>

      {/* Left panel */}
      <div style={{
        position: 'absolute', left: 90, top: '50%',
        transform: `translate(${headX}px, -50%)`,
        opacity: headOp, display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '8px 18px',
            background: `${GREEN}18`, border: `1px solid ${GREEN}33`, borderRadius: 100,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN,
              boxShadow: `0 0 10px ${GREEN}` }} />
            <span style={{ fontSize: 20, color: GREEN, fontFamily: FONT,
              letterSpacing: 4, textTransform: 'uppercase' }}>Claude Code</span>
          </div>
          <div style={{
            fontSize: 68, fontWeight: 800, color: C.white, fontFamily: FONT,
            lineHeight: 1.1, letterSpacing: -2,
            textShadow: `0 0 40px ${GREEN}33, 0 3px 6px rgba(0,0,0,0.4)`,
          }}>
            Your AI<br />co-engineer
          </div>
          <div style={{
            marginTop: 20, fontSize: 26, color: C.w70, fontFamily: FONT,
            lineHeight: 1.6, maxWidth: 440,
          }}>
            Lives in your terminal. Knows your entire codebase. Ships features autonomously.
          </div>
        </div>
        <FileTree op={treeOp} />
      </div>

      {/* Terminal + browser stacked on right */}
      <div style={{
        position: 'absolute', right: 70, top: '50%',
        transform: `translateY(-50%) scale(${termScale})`,
        opacity: termOp, width: 700,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {/* Terminal */}
        <div style={{
          background: '#0a0e1a',
          border: `1px solid ${GREEN}28`,
          borderRadius: 18, overflow: 'hidden',
          boxShadow: `0 30px 90px rgba(0,0,0,0.7), 0 0 60px ${GREEN}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}>
          {/* Chrome */}
          <div style={{
            background: '#111822', borderBottom: `1px solid ${GREEN}18`,
            padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: 13, height: 13, borderRadius: '50%',
                background: c, boxShadow: `0 0 6px ${c}66` }} />
            ))}
            <span style={{ marginLeft: 18, fontSize: 20, fontFamily: MONO, color: C.w40 }}>
              bash — ~/project
            </span>
            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
              background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
          </div>

          {/* Body */}
          <div style={{ padding: '18px 22px', fontFamily: MONO, minHeight: 340, position: 'relative' }}>
            <Scanlines opacity={0.02} />
            {/* Prompt */}
            <div style={{ fontSize: 22, lineHeight: 1.8 }}>
              <span style={{ color: GREEN, textShadow: `0 0 8px ${GREEN}` }}>$ </span>
              <span style={{ color: C.w90 }}>{cmdText}</span>
              {!cmdDone && <span style={{ color: GREEN, opacity: cursorBlink ? 1 : 0 }}>▌</span>}
            </div>
            {/* Status */}
            {statuses.map(({ text, color, f }) =>
              frame > f ? (
                <div key={text} style={{
                  fontSize: 20, color, lineHeight: 2,
                  textShadow: color === GREEN ? `0 0 8px ${GREEN}44` : 'none',
                }}>{text}</div>
              ) : null
            )}
            {/* Code */}
            {linesVisible > 0 && (
              <div style={{ marginTop: 8, borderTop: `1px solid ${GREEN}18`, paddingTop: 10 }}>
                {CODE.slice(0, linesVisible).map((line, i) => (
                  <div key={i} style={{
                    fontSize: 18, color: line.color, lineHeight: 1.75,
                    paddingLeft: (line.indent || 0) * 18,
                    textShadow: line.color !== 'transparent' && line.color !== C.w70
                      ? `0 0 5px ${line.color}33` : 'none',
                    minHeight: line.text === '' ? 8 : undefined,
                  }}>{line.text || '\u00a0'}</div>
                ))}
                {linesVisible < CODE.length && (
                  <span style={{ color: GREEN, opacity: cursorBlink ? 1 : 0,
                    textShadow: `0 0 6px ${GREEN}` }}>▌</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Browser preview popup */}
        {frame >= 430 && (
          <div style={{
            transform: `scale(${previewScale})`,
            opacity: previewOp,
            transformOrigin: '50% 0',
            background: 'white',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${GREEN}22`,
          }}>
            {/* Flash */}
            <div style={{ position: 'absolute', inset: 0, background: 'white',
              opacity: previewFlash, zIndex: 10, pointerEvents: 'none' }} />
            {/* Browser chrome */}
            <div style={{ background: '#f1f3f4', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #ddd' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, background: 'white', borderRadius: 6,
                padding: '4px 14px', fontSize: 16, fontFamily: FONT, color: '#666', marginLeft: 10 }}>
                localhost:3000/login
              </div>
            </div>
            {/* Login UI */}
            <div style={{ padding: '30px 28px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 18 }}>
              <div style={{ fontSize: 30, fontWeight: 700, fontFamily: FONT, color: '#111' }}>
                Welcome back
              </div>
              <div style={{ fontSize: 18, color: '#666', fontFamily: FONT }}>
                Sign in to continue
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                border: '1px solid #ddd', borderRadius: 12, padding: '14px 24px',
                background: 'white', width: '100%', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#4285f4,#ea4335,#fbbc05,#34a853)' }} />
                <span style={{ fontSize: 20, fontFamily: FONT, color: '#333', fontWeight: 600 }}>
                  Continue with Google
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <LightStreak startFrame={8} duration={22} color={GREEN} />
      <LensFlare x={1400} y={300} startFrame={430} duration={35} color={GREEN} />
      <Vignette intensity={0.75} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
