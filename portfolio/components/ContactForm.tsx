"use client";

import { FormEvent, useState } from "react";

type Status = { kind: "success" | "error"; message: string; emailDraft?: string } | null;

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function createEmailDraft(payload: ContactPayload) {
  const body = `From: ${payload.name} <${payload.email}>\n\n${payload.message}`;
  return `mailto:sajjadhaider1016@gmail.com?subject=${encodeURIComponent(payload.subject || "Portfolio inquiry")}&body=${encodeURIComponent(body)}`;
}

function deliveryError(status: number) {
  if (status === 403) {
    return "Web3Forms rejected this site’s request. You can still send your message by email; the site domain may need approval in Web3Forms.";
  }
  if (status === 429) {
    return "The contact form is temporarily rate-limited. Please wait a little and try again, or send your message by email.";
  }
  return "The message could not be delivered. You can open a prefilled email draft instead.";
}

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries()) as ContactPayload;
    setBusy(true);
    setStatus(null);
    try {
      const configResponse = await fetch("/api/contact", { cache: "no-store" });
      const config = await configResponse.json().catch(() => null) as { accessKey?: unknown } | null;

      if (!configResponse.ok || typeof config?.accessKey !== "string" || !config.accessKey) {
        throw new Error("Online delivery is not configured. Open a prefilled email draft to send your message.");
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: config.accessKey,
          ...payload,
          subject: `[Portfolio] ${payload.subject}`,
          from_name: "Sajjad Haider Portfolio",
          botcheck: "",
        }),
      });
      const result = await response.json().catch(() => null) as { success?: unknown } | null;
      if (!response.ok || result?.success !== true) throw new Error(deliveryError(response.status));
      form.reset();
      setStatus({ kind: "success", message: "Your message has been sent. Thank you for reaching out." });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "The message could not be delivered. You can send it by email instead.",
        emailDraft: createEmailDraft(payload),
      });
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
