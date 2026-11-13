"use client";

import { FormEvent, useState } from "react";

type Status = { kind: "success" | "error"; message: string; emailDraft?: string } | null;

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.status === 503) {
        const subject = String(payload.subject || "Portfolio inquiry");
        const message = `From: ${payload.name} <${payload.email}>\n\n${payload.message}`;
        const emailDraft = `mailto:sajjadhaider1016@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        setStatus({ kind: "error", message: "Online delivery is not connected yet. Open this prefilled email and press Send to deliver your message.", emailDraft });
        return;
      }
      if (!response.ok) throw new Error(result.error || "The message could not be sent.");
      form.reset();
      setStatus({ kind: "success", message: "Your message has been sent. Thank you for reaching out." });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "The message could not be sent. Please email directly." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" maxLength={100} required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label>Subject<input name="subject" maxLength={160} required /></label>
      <label>Message<textarea name="message" rows={4} maxLength={5000} required /></label>
      <button className="button button-dark" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}<span aria-hidden="true">↗</span>
      </button>
      {status && <div className={`form-status ${status.kind}`} role="status" aria-live="polite">
        <p>{status.message}</p>
        {status.emailDraft && <a href={status.emailDraft}>Open email draft <span aria-hidden="true">↗</span></a>}
      </div>}
      <p className="form-note">Messages are sent through the portfolio email service. If it is unavailable, you can send the message from your email app.</p>
    </form>
  );
}
