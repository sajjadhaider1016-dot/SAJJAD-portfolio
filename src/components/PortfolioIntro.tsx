"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

const motionWords = ["AI", "PRODUCTS", "WEB", "AUTOMATION"];

/** A single, short arrival sequence, shared by the existing portfolio routes. */
export function PortfolioIntro() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce || window.sessionStorage.getItem("portfolio-intro-seen-v2")) return;
    window.sessionStorage.setItem("portfolio-intro-seen-v2", "true");
    let frame = 0;
    let finishTimer = 0;
    frame = window.requestAnimationFrame(() => {
      setVisible(true);
      const start = performance.now();
      const update = (now: number) => {
        const next = Math.min(100, Math.round(((now - start) / 1250) * 100));
        setProgress(next);
        if (next < 100) frame = window.requestAnimationFrame(update);
        else finishTimer = window.setTimeout(() => setVisible(false), 220);
      };
      frame = window.requestAnimationFrame(update);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finishTimer);
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="portfolio-intro"
          aria-hidden="true"
          initial={{ y: 0 }}
          exit={{ y: "-102%", transition: { duration: .78, ease: [.76, 0, .24, 1] } }}
        >
          <div className="portfolio-intro-top">
            <span>{site.name}</span>
            <span>{String(progress).padStart(2, "0")}%</span>
          </div>
          <div className="portfolio-intro-center">
            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: .7, ease: [.22, 1, .36, 1] }}
            >
              {site.title}
            </motion.p>
            <div className="portfolio-intro-track">
              {[...motionWords, ...motionWords].map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ y: "110%", rotate: 4, opacity: 0 }}
                  animate={{ y: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: .62, delay: .12 + index * .055, ease: [.22, 1, .36, 1] }}
                >{word}<i /></motion.span>
              ))}
            </div>
          </div>
          <div className="portfolio-intro-progress"><motion.span animate={{ scaleX: progress / 100 }} transition={{ duration: .18, ease: "linear" }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
