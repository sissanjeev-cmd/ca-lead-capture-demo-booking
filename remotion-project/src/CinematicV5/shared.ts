// ── Design tokens — brief-exact colour palette ────────────────────────
export const C = {
  bg:           '#030712',      // deep dark navy
  bgCard:       '#070d1f',
  blue:         '#0066FF',      // electric blue
  blueGlow:     'rgba(0,102,255,0.45)',
  blueDim:      'rgba(0,102,255,0.12)',
  cyan:         '#00E5FF',      // cyan glow
  cyanGlow:     'rgba(0,229,255,0.40)',
  cyanDim:      'rgba(0,229,255,0.10)',
  purple:       '#7B2FFF',      // AI purple
  purpleGlow:   'rgba(123,47,255,0.40)',
  purpleDim:    'rgba(123,47,255,0.10)',
  white:        '#ffffff',
  w95:          'rgba(255,255,255,0.95)',
  w80:          'rgba(255,255,255,0.80)',
  w70:          'rgba(255,255,255,0.70)',
  w60:          'rgba(255,255,255,0.60)',
  w50:          'rgba(255,255,255,0.50)',
  w40:          'rgba(255,255,255,0.40)',
  w30:          'rgba(255,255,255,0.30)',
  w12:          'rgba(255,255,255,0.12)',
  w06:          'rgba(255,255,255,0.06)',
  w03:          'rgba(255,255,255,0.03)',
  glass:        'rgba(6,14,40,0.72)',
  glassBright:  'rgba(12,28,80,0.60)',
  glassBorder:  'rgba(0,102,255,0.22)',
  glassBorderC: 'rgba(0,229,255,0.22)',
  glassBorderP: 'rgba(123,47,255,0.22)',
  chatColor:    '#00E5FF',
  coworkColor:  '#7B2FFF',
  codeColor:    '#0066FF',
};

export const FONT = '"SF Pro Display",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
export const MONO = '"SF Mono","Fira Code","Cascadia Code",Menlo,monospace';

// ── Exact timing from Whisper transcription of sanjeev-v6.mp3 @ 30 fps ──
// Total audio: 64.549s = 1937 frames
//
//  0.00s  "AI is changing how we work"            → INTRO
//  2.34s  "Claude by Anthropic gives you..."
//  6.72s  word: "chat"    → product card flies in
//  7.52s  word: "co-work" → product card flies in
//  8.48s  word: "code"    → product card flies in
//  9.44s  "Claude Chat is..."                     → CHAT chapter
// 25.26s  "Claude Co-Work takes it further"       → COWORK chapter
// 41.46s  "And for developers, Claude Code..."    → CODE chapter
// 56.90s  "Chat, Co-Work, Code."                  → OUTRO
// 64.55s  END
export const T = {
  INTRO_START:    0,
  INTRO_FRAMES:   283,    // 0 → 9.43s

  // Key word frames for product-card entrances inside Intro:
  WORD_CHAT:      202,    // 6.72s × 30
  WORD_COWORK:    226,    // 7.52s × 30
  WORD_CODE:      254,    // 8.48s × 30

  CHAT_START:     283,
  CHAT_FRAMES:    475,    // 9.43s → 25.27s

  COWORK_START:   758,
  COWORK_FRAMES:  486,    // 25.27s → 41.47s

  CODE_START:     1244,
  CODE_FRAMES:    463,    // 41.47s → 56.90s

  OUTRO_START:    1707,
  OUTRO_FRAMES:   230,    // 56.90s → 64.55s

  TOTAL:          1937,
};

// ── Math helpers ──────────────────────────────────────────────────────
export const rand = (i: number, seed = 1) => {
  const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
export const easeOut      = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOut    = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo  = (t: number) =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
export const spring       = (t: number, tension = 180, damping = 18) => {
  const b = damping / (2 * Math.sqrt(tension));
  if (b >= 1) return 1 - (1 + tension * 0.01 * t) * Math.exp(-Math.sqrt(tension) * 0.01 * t);
  const wd = Math.sqrt(tension) * Math.sqrt(1 - b * b);
  return 1 - Math.exp(-b * Math.sqrt(tension) * t) * Math.cos(wd * t);
};
export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const remap = (v: number, a: number, b: number, c = 0, d = 1) =>
  clamp((v - a) / (b - a)) * (d - c) + c;
