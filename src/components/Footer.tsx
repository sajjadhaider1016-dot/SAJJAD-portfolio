"use client";

import { ArrowUp, Download, Mail } from "lucide-react";
import Link from "next/link";
import { site } from "@/data/site";
import { IconGithub, IconLinkedin } from "./Icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="font-display text-sm font-semibold">{site.name}</p>
            <p className="mt-1 text-sm text-muted">{site.title}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Building intelligent digital products with AI and modern web technologies.
            </p>
          </div>
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
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            © {year} {site.name}. All rights reserved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted hover:text-text"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Back to top
          </Link>
        </div>
      </div>
    </footer>
  );
}
