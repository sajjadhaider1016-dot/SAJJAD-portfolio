import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = site.seoTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg,#05070d 0%,#10182c 55%,#1a1430 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 4, color: "#9aa4b8" }}>
          AI ENGINEER • FULL-STACK DEVELOPER
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.12 }}>{site.headline}</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#c5cce0" }}>{site.name}</div>
        </div>
      </div>
    ),
    size,
  );
}
