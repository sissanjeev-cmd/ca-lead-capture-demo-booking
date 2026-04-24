import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { SanjeevIntro } from "./SanjeevIntro";
import { ClaudeExplainer, TOTAL_FRAMES } from "./ClaudeExplainer";
import { CinematicV3, T } from "./CinematicV3";
import { CinematicV5 } from "./CinematicV5";
import { T as T5 } from "./CinematicV5/shared";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SanjeevIntro"
        component={SanjeevIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClaudeExplainer"
        component={ClaudeExplainer}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CinematicV3"
        component={CinematicV3}
        durationInFrames={1870}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CinematicV5"
        component={CinematicV5}
        durationInFrames={T5.TOTAL}   // 1937 frames = 64.55s
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
