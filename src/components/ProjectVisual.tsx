"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

function LiveWebsitePreview({ src, title }: { src: string; title: string }) {
  return (
    <div role="img" aria-label={title} className="live-project-preview relative isolate aspect-[1.42] w-full overflow-hidden bg-[#141824]">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
      />
      <div className="live-project-light pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

function LiveProjectPreview({ kind, alt }: { kind: "study-buddy" | "recoveriest"; alt: string }) {
  const reduce = useReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.02, 1.08]);
  const src = kind === "study-buddy" ? "/projects/study-buddy-live.png" : "/projects/recoveriest-live.png";

  return (
    <div ref={previewRef} className={`live-project-preview live-project-preview-${kind} relative isolate aspect-[1.42] w-full overflow-hidden bg-[#141824]`}>
      <motion.div className="live-project-mask absolute inset-0 overflow-hidden" initial={false} whileInView={{ clipPath: "inset(0 0 0% 0)" }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}>
        <motion.div className="absolute -inset-[6%]" style={reduce ? undefined : { y: imageY, scale: imageScale }}>
          <Image src={src} alt={alt} fill sizes="(max-width: 680px) 100vw, (max-width: 1200px) 50vw, 720px" className="live-project-image object-cover object-top" priority={kind === "study-buddy"} />
        </motion.div>
      </motion.div>
      <motion.div className="live-project-light pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

export function GenericPreview({
  label,
  accent,
}: {
  label: string;
  accent: "blue" | "violet" | "steel";
}) {
  const reduce = useReducedMotion();
  const tone = accent === "violet" ? "from-accent-2/30" : accent === "steel" ? "from-muted/20" : "from-accent/30";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-linear-to-br ${tone} to-transparent min-h-[180px]`}>
      <div className="absolute inset-0 grid-overlay opacity-60" />
      <svg className="project-network absolute inset-0 h-full w-full" viewBox="0 0 640 260" fill="none" aria-hidden="true">
        <motion.path d="M75 204 190 88l113 88 112-124 151 88M190 88l37 133 189-9M303 176l112-124" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" initial={false} whileInView={{ pathLength: 1, opacity: .46 }} viewport={{ once: true, amount: .4 }} transition={{ duration: 1.4, ease: [.22, 1, .36, 1] }} />
        {[[75, 204], [190, 88], [303, 176], [415, 52], [566, 140], [227, 221], [416, 212]].map(([cx, cy], i) => (
          <motion.circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={i === 2 ? 7 : 4} fill="currentColor" initial={false} whileInView={{ opacity: [0, .8, .5], scale: [0, 1.35, 1] }} viewport={{ once: true, amount: .4 }} transition={{ duration: .65, delay: .2 + i * .1, ease: [.22, 1, .36, 1] }} />
        ))}
      </svg>
      <div className="relative flex h-full min-h-[180px] items-end p-5">
        <span className="font-mono text-xs tracking-widest text-muted uppercase">{label}</span>
      </div>
    </div>
  );
}

export function ProjectVisual({ kind }: { kind: string }) {
  if (kind === "docedit") return <LiveWebsitePreview src="https://docedit-submission.vercel.app/" title="Live DocEdit application preview" />;
  if (kind === "bzu") return <LiveWebsitePreview src="https://bzu-ai-assistant-production-8cc9.up.railway.app/" title="Live BZU AI Assistant preview" />;
  if (kind === "recoveriest") return <LiveProjectPreview kind="recoveriest" alt="Live Recoveriest homepage project preview" />;
  if (kind === "chatbots") return <GenericPreview label="Conversational systems" accent="blue" />;
  if (kind === "agents") return <GenericPreview label="Agents & automation" accent="violet" />;
  if (kind === "study-buddy") return <LiveProjectPreview kind="study-buddy" alt="Live StudyBuddy homepage project preview" />;
  if (kind === "cpp-course") return <GenericPreview label="C++ / OOP" accent="steel" />;
  return <GenericPreview label="Academic C++" accent="steel" />;
}
