export const COLORS = {
  bg: '#06061a',
  chatBlue: '#3b82f6',
  chatBlueSurface: '#0d1829',
  chatBlueDeep: '#1e3a5f',
  coworkPurple: '#8b5cf6',
  coworkPurpleSurface: '#130a2d',
  coworkPurpleDeep: '#2d1b69',
  codeGreen: '#22c55e',
  codeGreenBright: '#4ade80',
  termBg: '#0d1117',
  white: '#ffffff',
  whiteMid: 'rgba(255,255,255,0.75)',
  whiteLow: 'rgba(255,255,255,0.4)',
  whiteVeryLow: 'rgba(255,255,255,0.1)',
};

export const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
export const MONO = '"SF Mono", "Fira Code", "Cascadia Code", Menlo, monospace';

export const typeText = (text: string, frame: number, startFrame: number, charsPerFrame = 2): string => {
  const chars = Math.max(0, Math.floor((frame - startFrame) * charsPerFrame));
  return text.slice(0, Math.min(chars, text.length));
};
