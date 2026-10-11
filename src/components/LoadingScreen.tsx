"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/data/site";

export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("sh-loaded")) {
      setVisible(false);
      return;
    }
    const timeout = window.setTimeout(
      () => {
        sessionStorage.setItem("sh-loaded", "1");
        setVisible(false);
      },
      reduce ? 200 : 1400,
    );
    return () => window.clearTimeout(timeout);
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface font-display text-lg tracking-[0.2em]">
              {site.mark}
            </div>
            <div className="h-1 w-40 overflow-hidden rounded-full bg-surface">
              <motion.div
                className="h-full bg-linear-to-r from-accent to-accent-2"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reduce ? 0.2 : 1.2, ease: "easeInOut" }}
              />
            </div>
            <p className="text-[11px] tracking-[0.28em] text-muted uppercase">Loading studio</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
