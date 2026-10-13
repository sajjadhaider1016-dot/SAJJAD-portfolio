"use client";

import { ArrowUp, ArrowUpRight, Download, Home, Mail } from "lucide-react";
import Link from "next/link";
import { navItems, site } from "@/data/site";
import { IconGithub, IconLinkedin } from "./Icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr] lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-md">
            <p className="font-display text-sm font-semibold">{site.name}</p>
            <p className="mt-1 text-sm text-muted">{site.title}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Building intelligent digital products with AI and modern web technologies.
            </p>
          </div>
          <nav aria-label="Footer quick links">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Quick links</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent">
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3 text-muted">
            <a href={site.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="hover:text-text">
              <IconGithub className="h-5 w-5" />
            </a>
            <a
              href={site.linkedin}
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text"
            >
              <IconLinkedin className="h-5 w-5" />
            </a>
            <a href={`mailto:${site.email}`} aria-label="Email" className="hover:text-text">
              <Mail className="h-5 w-5" />
            </a>
            <a href={site.cvPath} download aria-label="Resume" className="hover:text-text">
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5">
              <Home className="h-3.5 w-3.5" />
              Back to home
            </Link>
            <a href="#main" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-xs text-muted transition-colors hover:text-text">
              <ArrowUp className="h-3.5 w-3.5" />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
