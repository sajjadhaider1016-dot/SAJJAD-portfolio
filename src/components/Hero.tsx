"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/data/site";

const easing = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="hero-experience relative isolate overflow-hidden">
      <div className="hero-layout">
        <div className="hero-copy">
          <motion.p className="hero-role" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .18, ease: easing }}>{site.title}</motion.p>
          <h1 className="hero-display" aria-label={site.name}>
            {["Sajjad", "Haider"].map((word, index) => (
              <span className="hero-title-row" key={word}>
                <motion.span
                  initial={reduce ? false : { y: "115%", rotate: index ? 2 : -2, opacity: 0, filter: "blur(9px)" }}
                  animate={{ y: "0%", rotate: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1, delay: .24 + index * .16, ease: easing }}
                >{word}</motion.span>
              </span>
            ))}
          </h1>

          <motion.div className="hero-intro" initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: .8, delay: .76, ease: easing }}>
            <p className="hero-description">I build AI-powered applications and thoughtful web products, shaping useful ideas into polished digital experiences.</p>
            <div className="hero-actions">
              <Link href="/portfolio/projects" className="hero-action-primary"><span>Explore Projects</span><MoveUpRight size={17} /></Link>
              <Link href="/portfolio/contact" className="hero-action-secondary">Contact Me <ArrowUpRight size={14} /></Link>
            </div>
          </motion.div>
        </div>

      </div>
      <div className="hero-bottomline">
        <span><i /> Available for remote work</span>
        <a href="#about" aria-label="Start the guided 3D portfolio tour at About">Start the tour <ArrowDown size={14} /></a>
      </div>
    </section>
  );
}
