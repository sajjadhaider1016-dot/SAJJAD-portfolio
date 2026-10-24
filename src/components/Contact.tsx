"use client";

import { FormEvent, useState } from "react";
import { Download, Mail, MessageCircle, Send } from "lucide-react";
import { site } from "@/data/site";
import { IconGithub, IconLinkedin } from "./Icons";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "ready">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const subject = String(data.get("subject") ?? "Portfolio inquiry");
    const message = String(data.get("message") ?? "");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    setStatus("ready");
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-bg-elevated px-6 py-12 sm:px-12">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">Contact</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Let&apos;s Build Something Great Together
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Whether you need a full-stack application, AI-powered solution, chatbot, automation system, or
            technical consultation, let&apos;s connect.
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <label className="grid gap-2 text-sm">
              Your name
              <input
                required
                name="name"
                autoComplete="name"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm">
              Work email
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm sm:col-span-2">
              What should we discuss?
              <input
                required
                name="subject"
                placeholder="Role, project, or collaboration"
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus:border-accent"
              />
            </label>
            <label className="grid gap-2 text-sm sm:col-span-2">
              Message
              <textarea
                required
                name="message"
                rows={5}
                placeholder="A little context helps me respond with the right next steps."
                className="resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus:border-accent"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_var(--glow)] hover:brightness-110"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
              {status === "ready" ? (
                <p className="mt-3 text-sm text-muted">Opening your email client to send the message.</p>
              ) : null}
            </div>
          </form>

          <aside className="flex flex-col justify-between gap-8 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7" aria-label="Recruiter contact details">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">For recruiters & collaborators</p>
              <p className="mt-3 text-sm leading-6 text-muted">{site.heroBadge}. Send a short note about the role or project and I’ll follow up by email.</p>
            </div>
            <div className="grid gap-3 text-sm">
              <a className="inline-flex items-center gap-2 font-medium text-text transition hover:text-accent" href={`mailto:${site.email}`}><Mail className="h-4 w-4 text-accent" />{site.email}</a>
              <a className="inline-flex items-center gap-2 font-medium text-text transition hover:text-accent" href={site.cvPath} download><Download className="h-4 w-4 text-accent" />Download resume</a>
              <a className="inline-flex items-center gap-2 font-medium text-text transition hover:text-accent" href={site.linkedin} target="_blank" rel="noreferrer"><IconLinkedin className="h-4 w-4 text-accent" />LinkedIn profile</a>
            </div>
          </aside>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={`https://wa.me/${site.whatsapp}`} variant="secondary">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button href={site.github} variant="secondary">
              <IconGithub className="h-4 w-4" />
              GitHub
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
