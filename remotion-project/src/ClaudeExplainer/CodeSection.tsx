import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONT, MONO, typeText } from './shared';
import { Particles, Vignette, ZoomTransition, Scanlines, SweepLight } from './Effects';

const GREEN = COLORS.codeGreen;
const GREEN_B = COLORS.codeGreenBright;

const CODE_LINES = [
  { text: "import { useState } from 'react';", color: '#7dd3fc' },
  { text: "import { GoogleOAuthProvider, GoogleLogin } from", color: '#7dd3fc' },
  { text: "  '@react-oauth/google';", color: '#7dd3fc' },
  { text: '', color: 'transparent' },
  { text: 'export const LoginPage: React.FC = () => {', color: '#c084fc' },
  { text: '  const [user, setUser] = useState(null);', color: '#fbbf24' },
  { text: '', color: 'transparent' },
  { text: '  const handleSuccess = (cred: any) => {', color: '#fbbf24' },
  { text: '    setUser(cred.credential);', color: COLORS.whiteMid },
  { text: "    localStorage.setItem('token', cred.credential);", color: COLORS.whiteMid },
  { text: '  };', color: COLORS.whiteMid },
  { text: '', color: 'transparent' },
  { text: '  return (', color: '#c084fc' },
  { text: '    <GoogleOAuthProvider clientId={CLIENT_ID}>', color: '#f472b6' },
  { text: '      <div className="login-wrapper">', color: '#f472b6' },
  { text: '        <h1>Welcome back</h1>', color: '#4ade80' },
  { text: '        <GoogleLogin onSuccess={handleSuccess} />', color: '#f472b6' },
  { text: '      </div>', color: '#f472b6' },
  { text: '    </GoogleOAuthProvider>', color: '#f472b6' },
  { text: '  );', color: '#c084fc' },
  { text: '};', color: '#c084fc' },
];

// Deterministic matrix rain
const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]()<>/\\|!@#$%^&*';
const matrixColumns = Array.from({ length: 35 }, (_, i) => ({
  x: (i / 35) * 1920 + 20,
  speed: 0.5 + (Math.sin(i * 7.13) * 0.5 + 0.5) * 1.5,
  offset: Math.sin(i * 3.71) * 500,
  charSeed: i * 17,
}));

export const CodeSection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelX = interpolate(frame, [0, 30], [-200, 0], { extrapolateRight: 'clamp' });
  const labelOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const hue = interpolate(frame, [0, 750], [140, 155], { extrapolateRight: 'clamp' });

  const termScale = spring({ fps, frame: frame - 30, config: { damping: 130, stiffness: 160 } });
  const termOpacity = interpolate(frame, [30, 65], [0, 1], { extrapolateRight: 'clamp' });

  const cmdText = typeText('claude "Add a login page with OAuth"', frame, 65, 2);
  const cmdDone = frame > 115;
  const linesToShow = Math.max(0, Math.floor((frame - 140) / 10));

  const previewY = interpolate(frame, [570, 630], [350, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const previewOpacity = interpolate(frame, [570, 630], [0, 1], { extrapolateRight: 'clamp' });
  const previewFlash = interpolate(frame, [630, 660], [0.15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  // Matrix rain opacity
  const matrixOpacity = interpolate(frame, [100, 160], [0, 0.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#06061a', overflow: 'hidden' }}>
      <ZoomTransition totalFrames={750}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 65%, hsl(${hue}, 40%, 8%) 0%, ${COLORS.bg} 55%)`,
          }}
        />

        {/* Matrix rain background */}
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{ position: 'absolute', opacity: matrixOpacity, pointerEvents: 'none' }}
        >
          {matrixColumns.map((col, ci) => {
            const chars = Array.from({ length: 12 }, (_, j) => {
              const y = ((col.offset + frame * col.speed * 30 + j * 35) % 1200) - 60;
              const charIdx = Math.floor(Math.sin((frame * 0.1 + ci * 3.7 + j * 11.3)) * 40 + 40) % matrixChars.length;
              const fade = j === 0 ? 1 : 0.3 + (1 - j / 12) * 0.5;
              return (
                <text
                  key={j}
                  x={col.x}
                  y={y}
                  fill={GREEN}
                  fontSize="18"
                  fontFamily="monospace"
                  opacity={fade}
                >
                  {matrixChars[charIdx]}
                </text>
              );
            });
            return <g key={ci}>{chars}</g>;
          })}
        </svg>

        <Particles count={25} color="rgba(34,197,94,0.35)" speed={0.3} maxSize={2.5} glowSize={5} />

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
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: GREEN, boxShadow: `0 0 20px ${GREEN}` }} />
          <span style={{ fontSize: 26, fontFamily: FONT, fontWeight: 600, color: GREEN, letterSpacing: 4, textTransform: 'uppercase' as const, textShadow: `0 0 15px ${GREEN}44` }}>
            Claude Code
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
            textShadow: `0 0 30px ${GREEN}22`,
          }}
        >
          Your AI
          <br />
          co-engineer
        </div>

        {/* Terminal */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: '50%',
            transform: `translateY(-50%) scale(${termScale})`,
            opacity: termOpacity,
            width: 760,
            background: COLORS.termBg,
            border: `1px solid ${GREEN}28`,
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${GREEN}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* chrome */}
          <div style={{ background: '#161b22', borderBottom: `1px solid ${GREEN}18`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.4)' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#febc2e', boxShadow: '0 0 6px rgba(254,188,46,0.4)' }} />
            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 6px rgba(40,200,64,0.4)' }} />
            <span style={{ marginLeft: 16, fontSize: 21, fontFamily: MONO, color: COLORS.whiteLow }}>bash — ~/my-app</span>
          </div>

          {/* body */}
          <div style={{ padding: '20px 24px', fontFamily: MONO, minHeight: 480, position: 'relative' }}>
            <Scanlines opacity={0.025} gap={3} />

            {/* prompt */}
            <div style={{ fontSize: 23, color: GREEN, marginBottom: 8 }}>
              <span style={{ color: GREEN_B, textShadow: `0 0 8px ${GREEN}66` }}>$ </span>
              <span style={{ color: COLORS.whiteMid }}>{cmdText}</span>
              {!cmdDone && <span style={{ color: GREEN, opacity: cursorBlink ? 1 : 0, textShadow: `0 0 6px ${GREEN}` }}>▌</span>}
            </div>

            {/* status messages */}
            {frame > 125 && (
              <div style={{ marginBottom: 14 }}>
                {[
                  { text: '✦ Analyzing codebase...', color: GREEN, f: 125 },
                  { text: '✦ Creating src/pages/LoginPage.tsx', color: COLORS.whiteLow, f: 138 },
                  { text: '✦ Installing @react-oauth/google', color: COLORS.whiteLow, f: 151 },
                  { text: '✦ Writing component...', color: GREEN, f: 164 },
                ].map(({ text, color, f }) =>
                  frame > f ? (
                    <div key={text} style={{ fontSize: 21, color, lineHeight: 1.9, textShadow: color === GREEN ? `0 0 8px ${GREEN}44` : 'none' }}>{text}</div>
                  ) : null
                )}
              </div>
            )}

            {/* code */}
            <div>
              {CODE_LINES.slice(0, linesToShow).map((line, i) => (
                <div key={i} style={{ fontSize: 20, color: line.color, lineHeight: 1.7, fontFamily: MONO, textShadow: line.color !== 'transparent' && line.color !== COLORS.whiteMid ? `0 0 6px ${line.color}33` : 'none' }}>
                  {line.text || '\u00a0'}
                </div>
              ))}
              {linesToShow < CODE_LINES.length && linesToShow > 0 && (
                <span style={{ color: GREEN, opacity: cursorBlink ? 1 : 0, textShadow: `0 0 6px ${GREEN}` }}>▌</span>
              )}
            </div>
          </div>
        </div>

        {/* Browser preview */}
        <div
          style={{
            position: 'absolute',
            bottom: 75,
            left: '50%',
            transform: `translateX(-50%) translateY(${previewY}px)`,
            opacity: previewOpacity,
            width: 480,
            background: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(34,197,94,0.15)',
          }}
        >
          {/* flash on appearance */}
          <div style={{ position: 'absolute', inset: 0, background: 'white', opacity: previewFlash, zIndex: 10, pointerEvents: 'none' }} />

          <div style={{ background: '#f1f3f4', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #ddd' }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
            <div style={{ flex: 1, background: 'white', borderRadius: 6, padding: '4px 12px', fontSize: 16, fontFamily: FONT, color: '#666', marginLeft: 8 }}>localhost:3000/login</div>
          </div>
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, background: 'white' }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: FONT, color: '#111' }}>Welcome back</div>
            <div style={{ fontSize: 18, color: '#666', fontFamily: FONT }}>Sign in to your account</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #ddd', borderRadius: 10, padding: '12px 20px', background: 'white', width: '100%', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #4285f4, #ea4335, #fbbc05, #34a853)', borderRadius: '50%' }} />
              <span style={{ fontSize: 20, fontFamily: FONT, color: '#333', fontWeight: 500 }}>Continue with Google</span>
            </div>
          </div>
        </div>

        <SweepLight startFrame={35} duration={50} color="rgba(34,197,94,0.05)" />
        <Vignette intensity={0.75} />
      </ZoomTransition>
    </AbsoluteFill>
  );
};
