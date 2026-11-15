import { ImageResponse } from "next/og";

export const alt = "Sajjad Haider — AI Engineer and Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "76px 84px",
      color: "#302c26",
      backgroundColor: "#f3f0e8",
      border: "18px solid #e8e1d6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#80573b", fontSize: 22, letterSpacing: 4 }}>
        <span style={{ display: "flex", width: 54, height: 54, alignItems: "center", justifyContent: "center", border: "1px solid #a9633f", borderRadius: 50, fontSize: 19, letterSpacing: 0 }}>SH</span>
        SAJJAD HAIDER
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "#80573b", fontSize: 20, letterSpacing: 3 }}>AI ENGINEER · FULL-STACK DEVELOPER</div>
        <div style={{ maxWidth: 1000, fontSize: 72, fontWeight: 600, lineHeight: 1.04, letterSpacing: -2 }}>Intelligent software for real problems.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #cfc5b5", paddingTop: 20, color: "#62594e", fontSize: 18 }}>
        <span>AI applications · automation · web products</span>
        <span>sajjad-haider-portfolio.vercel.app</span>
      </div>
    </div>,
    { ...size },
  );
}
