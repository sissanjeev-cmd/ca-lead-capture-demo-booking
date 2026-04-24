import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, rand } from './shared';
import { AIParticles, NeuralOverlay, LightStreak, LensFlare, Vignette,
  DotGrid, CinematicBars } from './CinematicFX';

const PURPLE = C.coworkColor;

// Holographic dashboard card
const DashCard: React.FC<{
  label: string; value: string; change: string; positive: boolean;
  color: string; op: number; x: number; y: number;
}> = ({ label, value, change, positive, color, op, x, y }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.07 + x * 0.01) * 0.02;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 220, opacity: op,
      background: `rgba(8,5,28,0.82)`,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${color}28`,
      borderRadius: 18,
      padding: '22px 22px',
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${color}14, inset 0 1px 0 rgba(255,255,255,0.06)`,
      transform: `scale(${pulse})`,
    }}>
      <div style={{ fontSize: 18, color: C.w40, fontFamily: FONT, letterSpacing: 2,
        textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 44, fontWeight: 800, color, fontFamily: FONT,
        textShadow: `0 0 20px ${color}66`, letterSpacing: -1, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 10, fontSize: 20, color: positive ? '#22c55e' : '#ef4444',
        fontFamily: FONT }}>
        {positive ? '↑' : '↓'} {change}
      </div>
      {/* Mini sparkline */}
      <svg width="180" height="40" style={{ marginTop: 12 }}>
        <polyline
          points={Array.from({ length: 12 }, (_, i) => {
            const v = 20 + rand(i, 41 + x) * 15 + (positive ? i * 1.2 : -i * 0.8);
            return `${i * 16},${40 - Math.max(0, Math.min(38, v))}`;
          }).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={[
            ...Array.from({ length: 12 }, (_, i) => {
              const v = 20 + rand(i, 41 + x) * 15 + (positive ? i * 1.2 : -i * 0.8);
              return `${i * 16},${40 - Math.max(0, Math.min(38, v))}`;
            }),
            '176,40', '0,40',
          ].join(' ')}
          fill={`${color}18`}
        />
      </svg>
    </div>
  );
};

// Workflow step node
const WorkflowNode: React.FC<{
  label: string; icon: string; status: 'done' | 'active' | 'pending';
  x: number; y: number; op: number;
}> = ({ label, icon, status, x, y, op }) => {
  const frame = useCurrentFrame();
  const color = status === 'done' ? '#22c55e' : status === 'active' ? PURPLE : C.w15;
  const pulse = status === 'active' ? 1 + Math.sin(frame * 0.12) * 0.08 : 1;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, opacity: op,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      transform: `scale(${pulse})`,
    }}>
      <div style={{
        width: 70, height: 70,
        background: status === 'pending' ? 'rgba(255,255,255,0.04)' : `${color}18`,
        border: `2px solid ${color}`,
        borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30,
        boxShadow: status === 'active' ? `0 0 30px ${color}55` : 'none',
      }}>{icon}</div>
      <div style={{ fontSize: 18, color: status === 'pending' ? C.w40 : color,
        fontFamily: FONT, textAlign: 'center', maxWidth: 100,
        textShadow: status !== 'pending' ? `0 0 10px ${color}44` : 'none' }}>{label}</div>
    </div>
  );
};

export const CoworkChapter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const TOTAL = 600;

  const fadeOut = interpolate(frame, [TOTAL - 25, TOTAL], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hue = interpolate(frame, [0, TOTAL], [275, 285], { extrapolateRight: 'clamp' });

  // Headline
  const headOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const headX = interpolate(frame, [0, 30], [-60, 0], { extrapolateRight: 'clamp' });

  // Dashboard
  const dashScale = spring({ fps, frame: frame - 12, config: { damping: 115, stiffness: 170 } });
  const dashOp = interpolate(frame, [12, 45], [0, 1], { extrapolateRight: 'clamp' });

  // Cards stagger in
  const cards = [
    { label: 'Tasks Done', value: '47', change: '12 today', positive: true,  color: PURPLE, x: 0,   y: 0   },
    { label: 'Files Synced', value: '128', change: '23% faster', positive: true, color: C.blue, x: 240, y: 60  },
    { label: 'Time Saved', value: '3.2h', change: 'this week', positive: true, color: C.cyan, x: 0,   y: 190 },
    { label: 'Summaries', value: '19', change: '8 pending', positive: false,  color: '#f59e0b', x: 240, y: 250 },
  ];

  // Workflow nodes
  const workflowProgress = interpolate(frame, [200, 450], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const nodeStates: Array<'done' | 'active' | 'pending'> = workflowProgress < 0.25 ? ['active','pending','pending','pending']
    : workflowProgress < 0.5 ? ['done','active','pending','pending']
    : workflowProgress < 0.75 ? ['done','done','active','pending']
    : ['done','done','done','active'];

  const nodes = [
    { label: 'Read Files', icon: '📂', y: 0 },
    { label: 'Analyze Data', icon: '🔍', y: 130 },
    { label: 'Draft Report', icon: '📝', y: 260 },
    { label: 'Send Summary', icon: '📤', y: 390 },
  ];

  // Completion flash
  const completeOp = interpolate(frame, [450, 470, 490, 520], [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Summary doc
  const summaryOp = interpolate(frame, [480, 510], [0, 1], { extrapolateRight: 'clamp' });
  const summaryY = interpolate(frame, [480, 510], [30, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 65% 50%, hsl(${hue},45%,10%) 0%, ${C.bg} 60%)`,
      overflow: 'hidden', opacity: fadeOut,
    }}>
      <DotGrid color={PURPLE} opacity={0.04} />
      <AIParticles count={35} color={PURPLE} speed={0.2} />
      <NeuralOverlay opacity={0.06} color={PURPLE} />

      {/* Left headline */}
      <div style={{
        position: 'absolute', left: 90, top: '50%',
        transform: `translate(${headX}px, -50%)`,
        opacity: headOp, maxWidth: 540,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24,
          padding: '8px 18px',
          background: `${PURPLE}18`, border: `1px solid ${PURPLE}33`, borderRadius: 100,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PURPLE,
            boxShadow: `0 0 10px ${PURPLE}` }} />
          <span style={{ fontSize: 20, color: PURPLE, fontFamily: FONT,
            letterSpacing: 4, textTransform: 'uppercase' }}>Claude Cowork</span>
        </div>
        <div style={{
          fontSize: 68, fontWeight: 800, color: C.white, fontFamily: FONT,
          lineHeight: 1.1, letterSpacing: -2,
          textShadow: `0 0 40px ${PURPLE}33, 0 3px 6px rgba(0,0,0,0.4)`,
        }}>
          AI that acts<br />on your behalf
        </div>
        <div style={{
          marginTop: 22, fontSize: 26, color: C.w70, fontFamily: FONT,
          lineHeight: 1.6, maxWidth: 460,
        }}>
          Connects to your files, apps, and desktop. Takes action, so you don't have to.
        </div>

        {/* Workflow nodes */}
        <div style={{ position: 'relative', marginTop: 50, height: 470 }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', left: 35, top: 70, width: 2, height: 380,
            background: `linear-gradient(180deg, ${PURPLE} 0%, ${PURPLE}22 100%)`,
            opacity: 0.3,
          }} />
          {/* Progress fill */}
          <div style={{
            position: 'absolute', left: 35, top: 70, width: 2,
            height: 380 * workflowProgress,
            background: `linear-gradient(180deg, #22c55e, ${PURPLE})`,
            boxShadow: `0 0 12px ${PURPLE}`,
            opacity: 0.8,
          }} />
          {nodes.map((n, i) => (
            <WorkflowNode
              key={n.label}
              label={n.label} icon={n.icon}
              status={nodeStates[i]}
              x={0} y={n.y}
              op={interpolate(frame, [70 + i * 35, 95 + i * 35], [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
          ))}
        </div>
      </div>

      {/* Right dashboard */}
      <div style={{
        position: 'absolute', right: 70, top: '50%',
        transform: `translateY(-50%) scale(${dashScale})`,
        opacity: dashOp, width: 520,
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(8,5,28,0.88)',
          backdropFilter: 'blur(30px)',
          border: `1px solid ${PURPLE}22`,
          borderRadius: '20px 20px 0 0',
          padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${PURPLE}18`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${PURPLE}, ${C.blue})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: `0 0 20px ${PURPLE}66` }}>⬡</div>
          <span style={{ fontSize: 22, fontFamily: FONT, color: C.white, fontWeight: 700 }}>
            Cowork Dashboard
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 17, color: '#22c55e', fontFamily: FONT }}>Active</span>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{
          background: 'rgba(5,3,18,0.88)',
          backdropFilter: 'blur(30px)',
          border: `1px solid ${PURPLE}16`,
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          padding: '28px 22px',
          position: 'relative', height: 520,
          boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${PURPLE}12`,
        }}>
          {cards.map((card, i) => (
            <DashCard
              key={card.label}
              {...card}
              op={interpolate(frame, [50 + i * 30, 80 + i * 30], [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
          ))}

          {/* Completion badge */}
          {frame >= 450 && (
            <div style={{
              position: 'absolute', bottom: 28, left: 22, right: 22,
              opacity: completeOp,
              background: `linear-gradient(135deg, rgba(34,197,94,0.15), rgba(139,92,246,0.15))`,
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: 14, padding: '16px 22px',
              display: 'flex', alignItems: 'center', gap: 14,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(34,197,94,0.2)',
            }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <div style={{ fontSize: 22, color: '#22c55e', fontFamily: FONT, fontWeight: 700 }}>
                  Task Complete
                </div>
                <div style={{ fontSize: 18, color: C.w70, fontFamily: FONT }}>
                  Weekly summary drafted & sent
                </div>
              </div>
            </div>
          )}

          {/* Summary doc */}
          {frame >= 480 && (
            <div style={{
              position: 'absolute', top: -130, left: 22, right: 22,
              opacity: summaryOp, transform: `translateY(${summaryY}px)`,
              background: 'rgba(8,5,28,0.92)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${PURPLE}33`,
              borderRadius: 14, padding: '18px 22px',
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 25px ${PURPLE}18`,
            }}>
              <div style={{ fontSize: 18, color: PURPLE, fontFamily: FONT,
                marginBottom: 10, letterSpacing: 2 }}>✦ WEEKLY SUMMARY — AUTO GENERATED</div>
              {['Q3 sales +18% vs target', 'Risk: churn rate ↑ in APAC',
                'Action: Expand support coverage'].map((line, i) => (
                <div key={i} style={{ fontSize: 20, color: C.w90, fontFamily: FONT,
                  lineHeight: 1.8 }}>• {line}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LightStreak startFrame={8} duration={22} color={PURPLE} />
      <LensFlare x={1400} y={250} startFrame={12} duration={40} color={PURPLE} />
      <Vignette intensity={0.72} />
      <CinematicBars />
    </AbsoluteFill>
  );
};
