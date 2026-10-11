"use client";

export function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="grid-overlay absolute inset-0" />
      <span className="hero-coordinate hero-coordinate-top absolute right-[6%] top-[12%]">SH—01 / 2026</span>
      <span className="hero-coordinate hero-coordinate-bottom absolute bottom-[17%] left-[4%]">SYSTEMS FOR PEOPLE</span>
      <div className="hero-hairline absolute left-[4%] top-0 h-full" />
      <div className="hero-hairline hero-hairline-right absolute right-[4%] top-0 h-full" />
    </div>
  );
}
