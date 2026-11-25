import { useEffect, useRef, useState, type FormEvent } from 'react';
import { profile } from '../data/content';

type State = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'failed'; mailto: string };

/** The site's Web3Forms key: from the /api/contact function when deployed, or from .env.local while developing. */
async function accessKey(): Promise<string> {
  const local = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;
  if (local) return local;
  const res = await fetch('/api/contact', { cache: 'no-store' });
  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.accessKey !== 'string' || !data.accessKey) throw new Error('not configured');
  return data.accessKey;
}

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [subject, setSubject] = useState(() => sessionStorage.getItem('sh-subject') ?? '');
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const prefill = (e: Event) => { const s = (e as CustomEvent<string>).detail; setSubject(s); sessionStorage.setItem('sh-subject', s); };
    addEventListener('contact:subject', prefill);
    return () => removeEventListener('contact:subject', prefill);
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.kind === 'sending') return;
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    if (fields.botcheck) return; // the honeypot: people never fill this in
    const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(fields.subject)}&body=${encodeURIComponent(`${fields.message}\n\nFrom: ${fields.name} <${fields.email}>`)}`;
    setState({ kind: 'sending' });
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: await accessKey(), ...fields, subject: `[Portfolio] ${fields.subject}`, from_name: `${profile.name} Portfolio`, botcheck: '' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success !== true) throw new Error('rejected');
      form.current?.reset(); setSubject(''); sessionStorage.removeItem('sh-subject');
      setState({ kind: 'sent' });
    } catch {
      setState({ kind: 'failed', mailto });
    }
  };

  return (
    <form className="cform" ref={form} onSubmit={submit}>
      <label className="cform__trap" aria-hidden="true">Website<input name="botcheck" tabIndex={-1} autoComplete="off" /></label>
      <label>Name<input name="name" autoComplete="name" maxLength={100} required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className="cform__wide">Subject<input name="subject" maxLength={160} required value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
      <label className="cform__wide">Message<textarea name="message" rows={4} maxLength={5000} required /></label>
      <button className="btn btn--light cform__wide" type="submit" disabled={state.kind === 'sending'}>{state.kind === 'sending' ? 'Sending…' : 'Send message ↗'}</button>
      <p className="caption cform__wide" role="status">
        {state.kind === 'sent' && 'Message sent. Thank you.'}
        {state.kind === 'failed' && <>Online delivery isn’t available right now. <a href={state.mailto}>Open a prefilled email draft</a> to send your message.</>}
        {(state.kind === 'idle' || state.kind === 'sending') && 'Messages are sent through the portfolio email service. If it is unavailable, you can send the message from your email app.'}
      </p>
    </form>
  );
}
