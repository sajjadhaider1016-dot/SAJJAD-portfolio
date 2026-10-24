"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Orchestrates the same scroll entrance and depth language on every portfolio route. */
export function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".portfolio-site");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("main section:not(.hero-experience), footer"));
    if (!sections.length || !("IntersectionObserver" in window)) return;

    sections.forEach((section, index) => {
      section.dataset.motionState = "waiting";
      section.dataset.scrollMotion = "true";
      section.style.setProperty("--section-order", String(index % 2));
    });
    root.dataset.motionReady = "true";

    let frame = 0;
    const syncScrollMotion = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const viewport = window.innerHeight;
        sections.forEach((section) => {
          const bounds = section.getBoundingClientRect();
          if (bounds.bottom < -100 || bounds.top > viewport + 100) return;
          const progress = Math.max(0, Math.min(1, (viewport - bounds.top) / (viewport + bounds.height)));
          const depth = .5 - progress;
          // CSS calc() cannot multiply two values consistently across browsers,
          // so write the final units for the perspective transform directly.
          section.style.setProperty("--scroll-z", `${(depth * 24).toFixed(2)}px`);
          section.style.setProperty("--scroll-rotate", `${(depth * 1.15).toFixed(3)}deg`);
          section.style.setProperty("--scroll-shift", `${(depth * 34).toFixed(1)}px`);
        });
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        section.dataset.motionState = "visible";
        observer.unobserve(section);
      });
    // Long sections (notably Skills and Certifications) may never reach a
    // 12% intersection ratio. Reveal them as soon as they enter the viewport.
    }, { threshold: 0.01, rootMargin: "0px 0px -7% 0px" });

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", syncScrollMotion, { passive: true });
    window.addEventListener("resize", syncScrollMotion);
    syncScrollMotion();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncScrollMotion);
      window.removeEventListener("resize", syncScrollMotion);
      if (frame) window.cancelAnimationFrame(frame);
      delete root.dataset.motionReady;
      sections.forEach((section) => {
        delete section.dataset.motionState;
        delete section.dataset.scrollMotion;
        section.style.removeProperty("--section-order");
        section.style.removeProperty("--scroll-z");
        section.style.removeProperty("--scroll-rotate");
        section.style.removeProperty("--scroll-shift");
        section.style.removeProperty("--scroll-depth");
      });
    };
  }, [pathname]);

  return null;
}
