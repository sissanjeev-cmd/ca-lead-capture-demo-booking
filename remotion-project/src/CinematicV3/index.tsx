import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { T, C } from './shared';
import { Intro } from './Intro';
import { ChapterCard } from './ChapterCard';
import { ChatChapter } from './ChatChapter';
import { CoworkChapter } from './CoworkChapter';
import { CodeChapter } from './CodeChapter';
import { Outro } from './Outro';

export { T };

export const CinematicV3: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>

      {/* ── Cloned voice — plays from frame 0 at natural pace ─────────── */}
      <Audio src={staticFile('sanjeev-voice.mp3')} />

      {/* ── Intro (voice 0–8.86s, frames 0–266) ──────────────────────── */}
      <Sequence from={T.INTRO_START} durationInFrames={T.INTRO_FRAMES}>
        <Intro />
      </Sequence>

      {/* ── Chapter 1: CHAT (voice 8.86–23.86s, frames 266–716) ────────
          Card overlaps first ~1.5s of chapter, then chapter continues  */}
      <Sequence from={T.CHAT_CARD_START} durationInFrames={T.CHAT_CARD_FRAMES}>
        <ChapterCard
          number="01"
          title="Chat"
          subtitle="Your always-on intelligent thinking partner"
          color={C.chatColor}
          totalFrames={T.CHAT_CARD_FRAMES}
        />
      </Sequence>
      <Sequence from={T.CHAT_START} durationInFrames={T.CHAT_FRAMES}>
        <ChatChapter />
      </Sequence>

      {/* ── Chapter 2: COWORK (voice 24.30–39.66s, frames 729–1190) ────
          Voice order: Chat → Cowork → Code                             */}
      <Sequence from={T.COWORK_CARD_START} durationInFrames={T.COWORK_CARD_FRAMES}>
        <ChapterCard
          number="02"
          title="Cowork"
          subtitle="AI that connects, organizes and acts on your behalf"
          color={C.coworkColor}
          totalFrames={T.COWORK_CARD_FRAMES}
        />
      </Sequence>
      <Sequence from={T.COWORK_START} durationInFrames={T.COWORK_FRAMES}>
        <CoworkChapter />
      </Sequence>

      {/* ── Chapter 3: CODE (voice 40.24–53.98s, frames 1207–1619) ───── */}
      <Sequence from={T.CODE_CARD_START} durationInFrames={T.CODE_CARD_FRAMES}>
        <ChapterCard
          number="03"
          title="Code"
          subtitle="Your AI co-engineer, living in your terminal"
          color={C.codeColor}
          totalFrames={T.CODE_CARD_FRAMES}
        />
      </Sequence>
      <Sequence from={T.CODE_START} durationInFrames={T.CODE_FRAMES}>
        <CodeChapter />
      </Sequence>

      {/* ── Outro (voice 54.58–62.30s, frames 1637–1870) ─────────────── */}
      <Sequence from={T.OUTRO_START} durationInFrames={T.OUTRO_FRAMES}>
        <Outro />
      </Sequence>

    </AbsoluteFill>
  );
};
