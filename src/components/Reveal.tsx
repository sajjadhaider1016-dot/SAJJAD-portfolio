"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("portfolio-reveal", className)}
      // Keep content readable if an in-view observer is delayed or misses a
      // section; `whileInView` still animates it when the visitor reaches it.
      initial={false}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 1.12, delay: delay / 1000, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}
