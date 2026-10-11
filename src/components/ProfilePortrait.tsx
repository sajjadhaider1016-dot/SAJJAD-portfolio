"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/data/site";

export function ProfilePortrait() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[360px]"
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-accent/25 blur-3xl" />
      <div className="absolute -inset-2 rounded-[2.2rem] bg-linear-to-br from-accent/40 via-transparent to-accent-2/40" />
      <div className="glass relative rounded-[2rem] p-2 shadow-[var(--shadow)]">
        <div className="aspect-[3/4] overflow-hidden rounded-[1.6rem]">
          <Image
            src={site.profileImage}
            alt={`${site.name}, ${site.title}`}
            width={720}
            height={1200}
            priority
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 22%" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
