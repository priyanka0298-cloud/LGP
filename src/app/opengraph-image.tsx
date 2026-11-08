import { ImageResponse } from "next/og";

export const alt = "Softlivi — Plan softly. Live fully.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fce7f3 0%, #f3e8ff 50%, #e0f2fe 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "linear-gradient(135deg, #fb7295, #ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
          </svg>
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, color: "#1c1917", letterSpacing: -2 }}>Softlivi</div>
        <div style={{ fontSize: 40, color: "#57534e", marginTop: 16 }}>Plan softly. Live fully.</div>
      </div>
    ),
    size
  );
}
