import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const SanjeevIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Hi" slides in from left
  const hiX = spring({
    fps,
    frame,
    from: -400,
    to: 0,
    config: { damping: 120, stiffness: 200, mass: 0.5 },
  });

  const hiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "This is" fades + scales in after "Hi"
  const thisIsScale = spring({
    fps,
    frame: frame - 20,
    config: { damping: 150, stiffness: 180 },
  });

  const thisIsOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "Sanjeev" bounces in last with a pop
  const sanjeevScale = spring({
    fps,
    frame: frame - 45,
    from: 0,
    to: 1,
    config: { damping: 80, stiffness: 300, mass: 0.8 },
  });

  const sanjeevOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle background pulse
  const bgShift = interpolate(frame, [0, 150], [0, 30], {
    extrapolateRight: "clamp",
  });

  // Underline grows under "Sanjeev"
  const underlineWidth = interpolate(frame, [65, 100], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0f0c29 0%, #302b63 ${50 + bgShift}%, #24243e 100%)`,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* "Hi" line */}
      <div
        style={{
          opacity: hiOpacity,
          transform: `translateX(${hiX}px)`,
          fontSize: 90,
          fontWeight: 300,
          color: "rgba(255,255,255,0.85)",
          fontFamily: "sans-serif",
          letterSpacing: 8,
        }}
      >
        Hi 👋
      </div>

      {/* "This is" line */}
      <div
        style={{
          opacity: thisIsOpacity,
          transform: `scale(${thisIsScale})`,
          fontSize: 55,
          fontWeight: 400,
          color: "rgba(255,255,255,0.65)",
          fontFamily: "sans-serif",
          marginTop: 20,
          letterSpacing: 4,
        }}
      >
        This is
      </div>

      {/* "Sanjeev" with underline */}
      <div
        style={{
          opacity: sanjeevOpacity,
          transform: `scale(${sanjeevScale})`,
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: "white",
            fontFamily: "sans-serif",
            letterSpacing: -2,
            background: "linear-gradient(90deg, #f093fb, #f5576c, #fda085)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Sanjeev
        </div>
        <div
          style={{
            height: 5,
            width: `${underlineWidth}%`,
            background: "linear-gradient(90deg, #f093fb, #fda085)",
            borderRadius: 3,
            marginTop: 4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
