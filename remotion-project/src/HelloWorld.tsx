import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    fps,
    frame,
    config: { damping: 200 },
  });

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          fontSize: 120,
          fontWeight: "bold",
          color: "white",
          fontFamily: "sans-serif",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        Hello World
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          marginTop: 40,
          fontSize: 40,
          color: "rgba(255, 255, 255, 0.7)",
          fontFamily: "sans-serif",
        }}
      >
        Made with Remotion
      </div>
    </AbsoluteFill>
  );
};
