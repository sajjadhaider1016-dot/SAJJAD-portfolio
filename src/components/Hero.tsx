"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { site } from "@/data/site";

const easing = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, -58]);
  const pointerXValue = useMotionValue(0);
  const pointerYValue = useMotionValue(0);
  const rotateX = useSpring(pointerYValue, { stiffness: 120, damping: 20, mass: .6 });
  const rotateY = useSpring(pointerXValue, { stiffness: 120, damping: 20, mass: .6 });

  function movePortrait(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerXValue.set(((event.clientX - bounds.left) / bounds.width - .5) * 7);
    pointerYValue.set(((event.clientY - bounds.top) / bounds.height - .5) * -7);
  }

  function resetPortrait() {
    pointerXValue.set(0);
    pointerYValue.set(0);
  }

  return (
    <section id="home" ref={heroRef} className="hero-experience relative isolate overflow-hidden">
      <div className="hero-layout">
        <div className="hero-copy">
          <h1 className="hero-display" aria-label="I build AI tools and web products.">
            {["I build", "AI tools and", "web products."].map((line, index) => (
              <span className="hero-title-row" key={line}>
                {line.split(" ").map((word, wordIndex) => (
                  <span className="hero-word-mask" key={`${line}-${word}`}>
                    <motion.span
                      className={index === 1 ? "hero-title-emphasis" : undefined}
                      initial={reduce ? false : { y: "120%", rotate: index === 4 ? -3 : 2, opacity: 0, filter: "blur(7px)" }}
                      animate={{ y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: .92, delay: .18 + index * .12 + wordIndex * .045, ease: easing }}
                    >{word}</motion.span>
                    {wordIndex < line.split(" ").length - 1 ? " " : null}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <motion.div className="hero-intro" initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .8, delay: 1.12, ease: easing }}>
            <p className="hero-name">{site.name}<span> / {site.title}</span></p>
            <p className="hero-description">I turn ambitious ideas into useful AI products and thoughtful web experiences — from the first sketch to the working thing.</p>
            <div className="hero-actions">
              <Link href="/portfolio/projects" className="hero-action-primary"><span>See what I make</span><MoveUpRight size={17} /></Link>
              <Link href="/portfolio/contact" className="hero-action-secondary">Start a conversation <ArrowUpRight size={14} /></Link>
            </div>
          </motion.div>

          <motion.div className="hero-availability" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: .7 }}>
            <span className="hero-live-dot" /> Available for remote work
          </motion.div>
        </div>

        <motion.div className="hero-art" onPointerMove={movePortrait} onPointerLeave={resetPortrait} style={reduce ? undefined : { y: artY, rotateX, rotateY, transformPerspective: 1100 }} initial={reduce ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .35, ease: easing }}>
          <div className="hero-art-backdrop" />
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-orbit-point" aria-hidden="true" />
          <div className="hero-photo-mat">
            <Image src={site.profileImage} alt={`${site.name}, ${site.title}`} fill priority sizes="(max-width: 768px) 82vw, 43vw" className="hero-photo" />
            <div className="hero-photo-edge" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
