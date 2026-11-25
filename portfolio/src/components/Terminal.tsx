import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { achievements, certifications, education, experience, profile, projects, services, skills } from '../data/content';
import { useTransitionNavigate } from './TransitionLink';

const HELP = ['help            list commands', 'about           who I am', 'projects        list projects', 'open <number>   open a project', 'experience      roles', 'education       what I studied', 'skills          what I work with', 'services        what I offer', 'certs           certificates', 'achievements    recognition', 'contact         reach me', 'play            enter Signal Isles', 'resume          download my résumé', 'clear           clear the screen'];

type Line = { text: string; cmd?: boolean };

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([{ text: `${profile.name}'s portfolio. Type "help" to start.` }]);
  const [value, setValue] = useState('');
  const history = useRef<string[]>([]), at = useRef(0);
  const log = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  const go = useTransitionNavigate();
  useEffect(() => { log.current!.scrollTop = log.current!.scrollHeight; }, [lines]);
  useEffect(() => { input.current!.focus({ preventScroll: true }); }, []);

  const run = (raw: string): string[] | 'clear' => {
    const [cmd, arg] = raw.trim().toLowerCase().split(/\s+/);
    switch (cmd) {
      case 'help': return HELP;
      case 'about': case 'whoami': return [profile.name, profile.role, profile.location, profile.about.lead];
      case 'projects': case 'ls': return projects.map((p, i) => `${i + 1}. ${p.title} (${p.category})`);
      case 'experience': return experience.map((x) => `${x.role}, ${x.org} [${x.status}] ${x.period}`);
      case 'education': return education.map((e) => `${e.degree}, ${e.school} [${e.status}]`);
      case 'skills': return skills.map((g) => `${g.name}: ${g.items.join(', ')}`);
      case 'services': return services.map((s) => s.name);
      case 'certs': return certifications.map((c) => `${c.title} (${c.provider}, ${c.date}) ${c.credentialId}`);
      case 'achievements': return achievements.map((a) => `${a.title}: ${a.description}`);
      case 'contact': return [profile.email, profile.links.github, profile.links.linkedin, profile.links.whatsapp];
      case 'open': {
        const p = projects[Number(arg) - 1] ?? projects.find((x) => x.slug === arg);
        if (!p) return [`Usage: open <1-${projects.length}>`];
        setTimeout(() => go(`/projects/${p.slug}`), 350);
        return [`Opening ${p.title}…`];
      }
      case 'play': setTimeout(() => go('/play'), 350); return ['Loading Signal Isles…'];
      case 'resume': {
        const a = document.createElement('a'); a.href = profile.resume.url; a.download = profile.resume.fileName; a.click();
        return ['Résumé download started.'];
      }
      case 'clear': return 'clear';
      case '': return [];
      default: return [`command not found: ${cmd}. Type "help".`];
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const out = run(value);
    if (value.trim()) history.current.push(value);
    at.current = history.current.length;
    setLines((l) => (out === 'clear' ? [] : [...l, { text: `$ ${value}`, cmd: true }, ...out.map((text) => ({ text }))]));
    setValue('');
  };
  const keys = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      at.current = Math.min(history.current.length, Math.max(0, at.current + (e.key === 'ArrowUp' ? -1 : 1)));
      setValue(history.current[at.current] ?? '');
    } else if (e.key === 'Tab' && value) {
      const hit = HELP.map((h) => h.split(' ')[0]).find((c) => c.startsWith(value));
      if (hit) { e.preventDefault(); setValue(hit); }
    }
  };
  return (
    <div className="term" onClick={() => input.current!.focus({ preventScroll: true })}>
      <div className="term__log" ref={log} aria-live="polite" data-lenis-prevent="">
        {lines.map((l, i) => <div key={i} className={l.cmd ? 'term__cmd' : ''}>{l.text}</div>)}
      </div>
      <form className="term__form" onSubmit={submit}>
        <span aria-hidden="true">$</span>
        <input ref={input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={keys} aria-label="Terminal command" autoCapitalize="off" autoComplete="off" spellCheck={false} />
      </form>
    </div>
  );
}
