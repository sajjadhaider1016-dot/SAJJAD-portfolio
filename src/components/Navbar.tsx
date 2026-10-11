"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Mail, Menu, Moon, Sun } from "lucide-react";
import { navItems, site } from "@/data/site";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { toggleTheme } from "./ThemeProvider";
import { IconClose, IconGithub, IconLinkedin } from "./Icons";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isNavActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.header
      key={pathname}
      className="portfolio-navbar sticky top-0 z-50 border-b border-border/60"
      initial={{ opacity: 0, y: -16, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: .68, delay: .16, ease: [.22, 1, .36, 1] }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-display text-sm font-semibold tracking-tight">
            <span className="brand-mark relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border">
              <Image src={site.profileImage} alt="" fill sizes="40px" className="object-cover object-[center_14%]" />
            </span>
            <span className="hidden min-[380px]:inline">{site.name}</span>
          </Link>

          <nav aria-label="Primary" className="desktop-nav hidden items-center gap-0.5 rounded-full border border-border/70 p-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isNavActive(item.href) ? "page" : undefined}
                className="nav-link relative rounded-full px-2.5 py-2 text-[11px] font-medium text-muted transition-colors hover:text-text aria-[current=page]:text-accent xl:px-3 xl:text-xs"
              >
                {isNavActive(item.href) && <motion.span layoutId="portfolio-nav-active" className="nav-active-pill absolute inset-0 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <a
              href={site.github}
              aria-label="GitHub"
              className="nav-icon grid h-9 w-9 place-items-center rounded-full text-muted transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGithub className="h-4 w-4" />
            </a>
            <a
              href={site.linkedin}
              aria-label="LinkedIn"
              className="nav-icon grid h-9 w-9 place-items-center rounded-full text-muted transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconLinkedin className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="nav-icon hidden h-9 w-9 place-items-center rounded-full text-muted transition sm:grid"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Button href={site.cvPath} className="hidden !rounded-full !px-4 !py-2 text-xs shadow-sm md:inline-flex" download>
              <Download className="h-4 w-4" />
              Resume
            </Button>
            <button
              type="button"
              onClick={toggleTheme}
              className="nav-icon grid h-9 w-9 place-items-center rounded-full text-muted transition"
              aria-label="Toggle color theme"
            >
              <Sun className="theme-sun h-4 w-4" />
              <Moon className="theme-moon hidden h-4 w-4" />
            </button>
            <button
              type="button"
              className="nav-icon grid h-9 w-9 place-items-center rounded-full text-muted lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <motion.div
          id="mobile-nav"
          aria-hidden={!open}
          inert={!open}
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: open ? 0.38 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className={cn("mobile-nav overflow-hidden border-t border-border/70 lg:hidden", !open && "pointer-events-none border-transparent")}
        >
          <nav aria-label="Mobile" className="min-h-0 overflow-hidden">
            <motion.div
              initial={false}
              animate={open ? "open" : "closed"}
              variants={{ open: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } }, closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } } }}
              className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8"
            >
              {navItems.map((item) => (
                <motion.div key={item.href} variants={{ open: { opacity: 1, x: 0, clipPath: "inset(0 0 0% 0)" }, closed: { opacity: 0, x: -8, clipPath: "inset(0 0 100% 0)" } }}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isNavActive(item.href) ? "page" : undefined}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface hover:text-text aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold aria-[current=page]:text-accent"
                >
                  {item.label}
                </Link>
                </motion.div>
              ))}
              <motion.div variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 5 } }}>
              <Button href={site.cvPath} variant="secondary" className="mt-2" download>
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
              </motion.div>
            </motion.div>
          </nav>
        </motion.div>
      </div>
    </motion.header>
  );
}
