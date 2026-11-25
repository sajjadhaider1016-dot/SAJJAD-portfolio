import { useCallback, useEffect, useRef, useState } from 'react';
import { education, experience, profile, projects, skills } from '../data/content';

const { url, fileName } = profile.resume;
const download = () => { const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove(); };

/** The paper tab on the right edge opens a drawer with a little printer. Printing feeds out the page, then downloads it. */
export function CvDrawer() {
  const dialog = useRef<HTMLDialogElement>(null), timer = useRef(0);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'printing' | 'done'>('idle');

  const show = useCallback(() => {
    const d = dialog.current!; if (d.open) return;
    d.showModal(); document.documentElement.classList.add('is-locked'); window.__lenis?.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }, []);
  const hide = () => {
    setOpen(false);
    setTimeout(() => { dialog.current?.close(); document.documentElement.classList.remove('is-locked'); window.__lenis?.start(); setPhase('idle'); clearTimeout(timer.current); }, 520);
  };
  useEffect(() => { addEventListener('cv:open', show); return () => removeEventListener('cv:open', show); }, [show]);
  const print = () => {
    if (phase === 'printing') return;
    setPhase('printing');
    timer.current = window.setTimeout(() => { setPhase('done'); download(); }, 2700);
  };

  return (
    <>
      <button className={`cvtab${open ? ' is-tucked' : ''}`} type="button" onClick={show} aria-haspopup="dialog" aria-label="Print my resume">
        <span className="cvtab__sheet" aria-hidden="true"><b>{profile.initials}</b><strong>CV</strong><i /><i /><i /></span>
      </button>
      <dialog ref={dialog} className={`cvd${open ? ' is-open' : ''}`} aria-label="Resume printer" data-lenis-prevent=""
        onCancel={(e) => { e.preventDefault(); hide(); }} onClick={(e) => { if (e.target === e.currentTarget) hide(); }}>
        <button className="cvd__x" type="button" aria-label="Close the resume printer" onClick={hide}>×</button>
        <div className="cvd__in">
          <div className={`printer is-${phase}`}>
            <div className="printer__body" />
            <div className="printer__feed">
              <article className="paper">
                <h3>{profile.name}</h3><p>{profile.role}</p><p>{profile.email}</p>
                <h4>Experience</h4>{experience.map((x) => <p key={x.role + x.org}><b>{x.role}</b>, {x.org}</p>)}
                <h4>Education</h4>{education.map((e) => <p key={e.degree}>{e.degree}, {e.school}</p>)}
                <h4>Skills</h4><p>{[...new Set(skills.flatMap((g) => g.items))].join(', ')}</p>
                <h4>Projects</h4><p>{projects.map((p) => p.title).join(', ')}</p>
              </article>
            </div>
          </div>
          <button className="btn btn--ink" type="button" onClick={print} disabled={phase === 'printing'}>{phase === 'done' ? 'Print again' : 'Print my resume'}</button>
          <p className="cvd__status" aria-live="polite">
            {phase === 'idle' && 'Press the button to print my resume.'}
            {phase === 'printing' && 'Printing…'}
            {phase === 'done' && <>Printed. Check your downloads. Nothing there? <a href={url} download={fileName}>Grab the PDF</a></>}
          </p>
        </div>
      </dialog>
    </>
  );
}
