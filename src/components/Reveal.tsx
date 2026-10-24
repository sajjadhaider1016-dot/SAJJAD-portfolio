"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  id,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div id={id} className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("portfolio-reveal", className)}
      id={id}
      initial={{ opacity: 0, y: 34, rotateX: 2.2, scale: .985, filter: "blur(7px)", clipPath: "inset(0 0 16% 0)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -4% 0px" }}
      transition={{ duration: .92, delay: delay / 1000, ease: [.22, 1, .36, 1] }}
    >
      {children}
    </motion.div>
  );
}
