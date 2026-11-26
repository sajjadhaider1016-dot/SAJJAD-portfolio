import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/content';

const { url, fileName, preview } = profile.resume;
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
              <div className="paper"><img src={preview} alt={`${profile.name}’s CV, first page`} width={1000} height={1414} loading="lazy" /></div>
            </div>
          </div>
          <button className="btn btn--ink" type="button" onClick={print} disabled={phase === 'printing'}>{phase === 'done' ? 'Print again' : 'Print my resume'}</button>
          <p className="cvd__status" aria-live="polite">
            {phase === 'idle' && <>Press the button to print my resume. <a href={url} target="_blank" rel="noopener">View the full CV</a></>}
            {phase === 'printing' && 'Printing…'}
            {phase === 'done' && <>Printed. Check your downloads. Nothing there? <a href={url} download={fileName}>Grab the PDF</a></>}
          </p>
        </div>
      </dialog>
    </>
  );
}
