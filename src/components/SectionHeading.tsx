"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const words = title.split(" ");
  return (
    <motion.div data-section={eyebrow} className={cn("section-heading-motion max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="section-kicker mb-3">{eyebrow}</p>
      <motion.h2
        aria-label={title}
        className="font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl"
        // The heading must remain legible if an in-view observer misses it.
        initial={false}
        whileInView="visible"
        viewport={{ once: true, amount: .12, margin: "0px 0px -5% 0px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: .055, delayChildren: .04 } } }}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="section-word-mask inline-block overflow-hidden align-bottom pb-[0.08em]">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "115%", rotate: -4, opacity: 0, filter: "blur(5px)" },
                visible: { y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)", transition: { duration: .72, ease: [.76, 0, .24, 1] } },
              }}
            >{word}</motion.span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </motion.h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted sm:text-[1.05rem]">{description}</p>
      ) : null}
    </motion.div>
  );
}
