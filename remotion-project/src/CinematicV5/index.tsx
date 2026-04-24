import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { C, T } from './shared';
import { Intro }         from './Intro';
import { ChatChapter }   from './ChatChapter';
import { CoworkChapter } from './CoworkChapter';
import { CodeChapter }   from './CodeChapter';
import { Outro }         from './Outro';

// ── Timing map (all values from shared.ts, driven by Whisper timestamps):
//   INTRO   0      → 283   (0.00s – 9.43s)   "AI is changing… chat, co-work, and code"
//   CHAT    283    → 758   (9.43s – 25.27s)  "Claude Chat is your intelligent thinking partner…"
//   COWORK  758    → 1244  (25.27s – 41.47s) "Claude Co-Work takes it further…"
//   CODE    1244   → 1707  (41.47s – 56.90s) "And for developers, Claude Code…"
//   OUTRO   1707   → 1937  (56.90s – 64.55s) "Chat, Co-Work, Code. Three ways…"

export const CinematicV5: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* ── Voice narration — latest Indian-accent cloned voice ── */}
      <Audio src={staticFile('sanjeev-v6.mp3')} />

      {/* ── Intro (0 → 283) ─────────────────────────────────────────────
           Claude wordmark reveal + three product cards flying in from
           three separate angles in sync with "chat / co-work / code"   */}
      <Sequence from={T.INTRO_START} durationInFrames={T.INTRO_FRAMES}>
        <Intro />
      </Sequence>

      {/* ── CHAT chapter (283 → 758) ─────────────────────────────────── */}
      <Sequence from={T.CHAT_START} durationInFrames={T.CHAT_FRAMES}>
        <ChatChapter />
      </Sequence>

      {/* ── COWORK chapter (758 → 1244) ─────────────────────────────── */}
      <Sequence from={T.COWORK_START} durationInFrames={T.COWORK_FRAMES}>
        <CoworkChapter />
      </Sequence>

      {/* ── CODE chapter (1244 → 1707) ──────────────────────────────── */}
      <Sequence from={T.CODE_START} durationInFrames={T.CODE_FRAMES}>
        <CodeChapter />
      </Sequence>

      {/* ── Outro (1707 → 1937) ─────────────────────────────────────── */}
      <Sequence from={T.OUTRO_START} durationInFrames={T.OUTRO_FRAMES}>
        <Outro />
      </Sequence>

    </AbsoluteFill>
  );
};
