"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="portfolio-route"
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", y: 18 }}
        animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
        exit={reduce ? undefined : { clipPath: "inset(0 0 100% 0)", y: -12 }}
        transition={{ duration: reduce ? 0 : .72, ease: [.76, 0, .24, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
