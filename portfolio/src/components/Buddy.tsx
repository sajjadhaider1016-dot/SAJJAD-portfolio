import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { botSvg } from '../animations/pixelBot';
import { achievements, certifications, education, experience, profile, projects, services, skills } from '../data/content';
import { TLink } from './TransitionLink';

type Answer = { text: string; links?: [string, string][] };
type Msg = Answer & { me?: boolean };

/** Written answers matched by keyword. No AI service, no key, nothing leaves the browser. */
export function answer(q: string): Answer {
  const s = ` ${q.toLowerCase().replace(/[^a-z0-9+&' -]/g, ' ')} `;
  const hit = (...keys: string[]) => keys.some((k) => s.includes(k));
  const names: Record<string, string[]> = {
    'bzu-ai-assistant': ['bzu ai', 'university assistant'], 'customer-support-ai-copilot': ['customer support', 'copilot'], 'contentpilot-ai': ['contentpilot', 'content pilot'],
    'property-monitoring-agent': ['property'], docedit: ['docedit', 'doc edit'], 'china-vibes': ['china vibes'], 'studio-bdtla': ['bdtla'], 'veyra-language-studio': ['veyra'],
    'study-buddy': ['study buddy', 'studybuddy'], recoveriest: ['recoveriest'], 'course-registration': ['course registration'], 'car-racing': ['racing'],
  };
  const p = projects.find((x) => hit(x.title.toLowerCase(), ...(names[x.slug] ?? [])));
  if (p) return { text: `${p.title}: ${p.description}`, links: [['Read more', `/projects/${p.slug}`]] };
  if (hit('certif', 'courses', 'credential')) return { text: `${certifications.length} certificates from ${[...new Set(certifications.map((c) => c.provider))].join(', ')}.`, links: [['See certificates', '/#certifications']] };
  if (hit('achiev', 'award', 'scholarship', 'peef')) return { text: `${achievements.map((a) => a.title).join('; ')}.`, links: [['See achievements', '/#achievements']] };
  if (hit('experience', ' job', 'intern', ' role', 'working', 'company')) return { text: `${experience.map((x) => `${x.role} at ${x.org} (${x.status})`).join('. ')}.`, links: [['See experience', '/#experience']] };
  if (hit('service', ' offer', 'can you build')) return { text: `Services: ${services.map((x) => x.name).join(', ')}.`, links: [['See services', '/#services']] };
  if (hit('skill', 'stack', 'technolog', 'good at')) return { text: `Skill areas: ${skills.map((g) => g.name).join(', ')}.`, links: [['See all skills', '/#skills']] };
  if (hit('stud', 'educat', 'universit', 'degree', 'college', 'school', 'bzu')) return { text: `${education.map((e) => `${e.degree}, ${e.school} (${e.status})`).join('. ')}.`, links: [['See education', '/#education']] };
  if (hit('contact', 'email', 'hire', 'reach', 'linkedin', 'github', 'whatsapp', 'available')) return { text: `${profile.recruiterAvailability} Email ${profile.email}, or use the links in the contact section.`, links: [['Contact', '/#contact']] };
  if (hit('project', ' work', 'built', 'portfolio')) return { text: `${projects.length} projects: ${projects.map((x) => x.title).join(', ')}.`, links: [['See the work', '/#work']] };
  if (hit('where', 'location', ' live ', 'based', 'multan', ' from ')) return { text: `${profile.first} is based in ${profile.location}. ${profile.availability}.` };
  if (hit('resume', ' cv ')) return { text: 'Use the Résumé link in the footer, the Resume tab below, or the paper tab on the right.' };
  if (hit('game', ' play', 'isles', '3d')) return { text: 'Signal Isles is a small 3D version of this portfolio.', links: [['Play it', '/play']] };
  if (hit(' hi ', 'hello', ' hey ', 'salam')) return { text: `Hi, I’m Pip. Ask me about ${profile.first}'s projects, experience, skills or certificates.` };
  if (hit('who', 'about', profile.first.toLowerCase())) return { text: profile.about.lead, links: [['About page', '/about-me']] };
  return { text: 'I only know what’s on this portfolio. Try asking about projects, experience, skills, services or certificates.' };
}

type Recognition = { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void; start: () => void; stop: () => void };

export function Buddy() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const log = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null), eq = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null), rec = useRef<Recognition | null>(null), energy = useRef(0), timer = useRef(0);
  const sprites = useMemo(() => [botSvg(), botSvg(16, true)], []);
  const [blink, setBlink] = useState(false);
  const SR = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;

  useEffect(() => { const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 160); }, 3600); return () => clearInterval(t); }, []);
  useEffect(() => { if (open) input.current?.focus({ preventScroll: true }); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs, thinking]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', esc);
    return () => { removeEventListener('keydown', esc); rec.current?.stop(); clearTimeout(timer.current); };
  }, []);
  // a dot-matrix level meter along the bottom of the box
  useEffect(() => {
    if (!open) return;
    const cv = eq.current!, g = cv.getContext('2d')!;
    let raf = 0;
    const draw = (t: number) => {
      cv.width = cv.clientWidth; cv.height = 32; energy.current *= 0.96;
      for (let x = 0; x < cv.width; x += 5) {
        const level = 0.12 + energy.current * 0.9 + (thinking || listening ? 0.35 : 0);
        const h = Math.round(Math.abs(Math.sin(x * 0.045 + t / 240) * Math.sin(x * 0.017 - t / 400)) * level * 6) + 1;
        for (let r = 0; r < h; r++) { g.fillStyle = `rgba(46,84,209,${1 - r / 8})`; g.fillRect(x, 29 - r * 5, 3, 3); }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [open, thinking, listening]);

  const ask = (q: string) => {
    if (!q.trim() || thinking) return;
    setMsgs((m) => [...m, { text: q.trim(), me: true }]); setText(''); setThinking(true); energy.current = 1;
    timer.current = window.setTimeout(() => { setThinking(false); energy.current = 1; setMsgs((m) => [...m, answer(q)]); }, 600);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(text); };
  const listen = () => {
    if (!SR) return;
    if (listening) { rec.current?.stop(); return; }
    const r = new SR(); rec.current = r; r.lang = 'en-US';
    r.onresult = (e) => ask(e.results[0][0].transcript);
    r.onend = r.onerror = () => setListening(false);
    setListening(true); r.start();
  };
  // Pip can be picked up and dragged, then springs home.
  const down = (e: PointerEvent<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const move = (e: PointerEvent) => {
    const d = drag.current; if (!d) return;
    const x = e.clientX - d.x, y = e.clientY - d.y;
    if (Math.hypot(x, y) > 6) d.moved = true;
    if (d.moved) setOffset({ x, y });
  };
  const up = () => { setOffset(null); setTimeout(() => (drag.current = null), 0); };

  return (
    <div className="buddy">
      {open && (
        <div className="buddy__panel" role="dialog" aria-label="Chat with Pip">
          {msgs.length > 0 && (
            <div className="buddy__log" ref={log} aria-live="polite" data-lenis-prevent="">
              {msgs.map((m, i) => (
                <div key={i} className={m.me ? 'bmsg--me' : ''}>
                  <p>{m.me ? m.text : m.text.split(' ').map((w, k) => <span className="bword" key={k} style={{ animationDelay: `${k * 35}ms` }}>{w} </span>)}</p>
                  {m.links && <div className="buddy__chips" style={{ padding: '8px 0 0' }}>{m.links.map(([label, to]) => <TLink key={to} to={to} onClick={() => setOpen(false)}>{label} →</TLink>)}</div>}
                </div>
              ))}
              {thinking && <p aria-label="Thinking">…</p>}
            </div>
          )}
          <div className="buddy__chips">{['What have you built?', 'Where do you study?', 'Tell me about VEYRA'].map((q) => <button key={q} type="button" onClick={() => ask(q)}>{q}</button>)}</div>
          <form className="buddy__box" onSubmit={submit} autoComplete="off">
            <input ref={input} value={text} maxLength={300} placeholder="Ask me anything…" aria-label={`Ask Pip about ${profile.first}`} onChange={(e) => { setText(e.target.value); energy.current = 0.7; }} />
            <div className="buddy__row">
              <button className="buddy__btn" type="button" aria-label="Start a new chat" onClick={() => setMsgs([])}>＋</button>
              {SR && <button className="buddy__btn" type="button" aria-pressed={listening} onClick={listen}>{listening ? 'Listening…' : 'Mic'}</button>}
              <button className="buddy__btn" type="submit">Ask</button>
              <button className="buddy__btn" type="button" aria-label="Close the chat" onClick={() => setOpen(false)}>×</button>
            </div>
            <canvas className="buddy__eq" ref={eq} aria-hidden="true" />
          </form>
        </div>
      )}
      <button className={`buddy__bot${offset ? '' : ' is-back'}`} type="button" aria-expanded={open} aria-label="Chat with Pip, my little assistant"
        style={offset ? { translate: `${offset.x}px ${offset.y}px` } : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onClick={() => { if (!drag.current?.moved) setOpen(!open); }}>
        <img src={sprites[blink ? 1 : 0]} alt="" draggable={false} />
        {!open && <span className="buddy__hint" aria-hidden="true">Ask me about {profile.first}</span>}
      </button>
    </div>
  );
}
