// ── Shared design tokens ─────────────────────────────────────────────
export const C = {
  bg:           '#04050f',
  bgDeep:       '#020308',
  blue:         '#00c8ff',
  blueGlow:     'rgba(0,200,255,0.35)',
  blueDeep:     '#0066cc',
  cyan:         '#00f5d4',
  cyanGlow:     'rgba(0,245,212,0.3)',
  purple:       '#a855f7',
  purpleGlow:   'rgba(168,85,247,0.3)',
  gold:         '#fbbf24',
  white:        '#ffffff',
  w90:          'rgba(255,255,255,0.90)',
  w70:          'rgba(255,255,255,0.70)',
  w40:          'rgba(255,255,255,0.40)',
  w15:          'rgba(255,255,255,0.15)',
  w08:          'rgba(255,255,255,0.08)',
  w04:          'rgba(255,255,255,0.04)',
  glass:        'rgba(10,20,50,0.6)',
  glassBorder:  'rgba(0,200,255,0.18)',
  chatColor:    '#00c8ff',
  codeColor:    '#00f5d4',
  coworkColor:  '#a855f7',
};

export const FONT   = '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const MONO   = '"SF Mono", "Fira Code", "Cascadia Code", Menlo, monospace';

// ── EXACT TIMING FROM WHISPER TRANSCRIPTION @ 30fps ──────────────────
// Voice: "AI is changing..." → Chat → Cowork → Code → Outro
//
// Intro:  0.00–8.20s  → frames 0–246
// Chat:   8.86–23.86s → frames 266–716  (15s of content)
// Cowork: 24.30–39.66s→ frames 729–1190 (15.4s of content)
// Code:   40.24–53.98s→ frames 1207–1619(13.7s of content)
// Outro:  54.58–62.30s→ frames 1637–1869(7.7s)
//
// Chapter cards: 1.5s (45 frames) inserted BETWEEN voice sections
// (voice audio continues underneath cards uninterrupted)

export const T = {
  // Intro — voice 0–8.86s
  INTRO_START:        0,
  INTRO_FRAMES:       270,   // 9s

  // Chat card — 1.5s cinematic title card (voice: 8.86s = frame 266)
  CHAT_CARD_START:    270,
  CHAT_CARD_FRAMES:   45,    // 1.5s
  CHAT_START:         270,   // Chat visuals overlap with card reveal
  CHAT_FRAMES:        459,   // 15.3s (voice 8.86–23.86s)

  // Cowork card — at voice 24.30s = frame 729
  COWORK_CARD_START:  729,
  COWORK_CARD_FRAMES: 45,    // 1.5s
  COWORK_START:       729,
  COWORK_FRAMES:      462,   // 15.4s (voice 24.30–39.66s)

  // Code card — at voice 40.24s = frame 1207
  CODE_CARD_START:    1207,
  CODE_CARD_FRAMES:   45,    // 1.5s
  CODE_START:         1207,
  CODE_FRAMES:        414,   // 13.8s (voice 40.24–53.98s)

  // Outro — voice 54.58s = frame 1637
  OUTRO_START:        1637,
  OUTRO_FRAMES:       232,   // 7.7s to end of voice + hold

  TOTAL:              1870,  // 62.3s — matches voice exactly
};

// Deterministic pseudo-random
export const rand = (i: number, seed: number = 1): number => {
  const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
