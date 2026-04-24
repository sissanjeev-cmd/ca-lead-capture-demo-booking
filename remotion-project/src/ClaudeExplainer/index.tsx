import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Intro } from './Intro';
import { ChatSection } from './ChatSection';
import { CoworkSection } from './CoworkSection';
import { CodeSection } from './CodeSection';
import { Outro } from './Outro';

// Timing (frames @ 30fps)
export const INTRO_START    = 0;
export const INTRO_FRAMES   = 360;   // 12s

export const CHAT_START     = 360;
export const CHAT_FRAMES    = 840;   // 28s

export const COWORK_START   = 1200;
export const COWORK_FRAMES  = 750;   // 25s

export const CODE_START     = 1950;
export const CODE_FRAMES    = 750;   // 25s

export const OUTRO_START    = 2700;
export const OUTRO_FRAMES   = 600;   // 20s

export const TOTAL_FRAMES   = 3300;  // 110s

export const ClaudeExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#06061a' }}>
      {/* Per-section voiceover — each starts when its scene starts */}
      <Sequence from={INTRO_START} durationInFrames={INTRO_FRAMES}>
        <Audio src={staticFile('vo-intro-final.mp3')} />
      </Sequence>
      <Sequence from={CHAT_START} durationInFrames={CHAT_FRAMES}>
        <Audio src={staticFile('vo-chat-final.mp3')} />
      </Sequence>
      <Sequence from={COWORK_START} durationInFrames={COWORK_FRAMES}>
        <Audio src={staticFile('vo-cowork-final.mp3')} />
      </Sequence>
      <Sequence from={CODE_START} durationInFrames={CODE_FRAMES}>
        <Audio src={staticFile('vo-code-final.mp3')} />
      </Sequence>
      <Sequence from={OUTRO_START} durationInFrames={OUTRO_FRAMES}>
        <Audio src={staticFile('vo-outro-final.mp3')} />
      </Sequence>

      {/* Visual scenes */}
      <Sequence from={INTRO_START} durationInFrames={INTRO_FRAMES}>
        <Intro />
      </Sequence>

      <Sequence from={CHAT_START} durationInFrames={CHAT_FRAMES}>
        <ChatSection />
      </Sequence>

      <Sequence from={COWORK_START} durationInFrames={COWORK_FRAMES}>
        <CoworkSection />
      </Sequence>

      <Sequence from={CODE_START} durationInFrames={CODE_FRAMES}>
        <CodeSection />
      </Sequence>

      <Sequence from={OUTRO_START} durationInFrames={OUTRO_FRAMES}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
