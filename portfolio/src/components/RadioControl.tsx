import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { radio, STATIONS, type Station } from '../audio/radio';
import { reducedMotion } from '../animations/util';

const stored = (key: string) => { try { return localStorage.getItem(`sh-radio-${key}`); } catch { return null; } };
const store = (key: string, v: string) => { try { localStorage.setItem(`sh-radio-${key}`, v); } catch { /* private mode */ } };

export function Disc({ hue }: { hue: string }) {
  return <span className="disc" style={{ '--hue': hue } as CSSProperties}><span className="disc__spin"><span className="disc__label" /></span></span>;
}

function Visualizer({ on }: { on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!on) return;
    const bars = [...ref.current!.children] as HTMLElement[], data = new Uint8Array(64);
    let raf = 0;
    const tick = () => {
      radio.analyser?.getByteFrequencyData(data);
      bars.forEach((b, i) => { b.style.transform = `scaleY(${0.12 + (data[2 + i * 4] / 255) * 0.88})`; });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); bars.forEach((b) => (b.style.transform = '')); };
  }, [on]);
  return <span className="radio__eq" ref={ref} aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</span>;
}

export function RadioControl() {
  const [station, setStation] = useState<Station | null>(() => STATIONS.find((s) => s.id === stored('station')) ?? null);
  const [playing, setPlaying] = useState(radio.playing);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<Station | null>(null);
  const [volume, setVolume] = useState(() => Number(stored('vol') ?? 60));
  const [failed, setFailed] = useState(false);
  const root = useRef<HTMLDivElement>(null), slot = useRef<HTMLSpanElement>(null);

  useEffect(() => { radio.setVolume(volume / 100); store('vol', String(volume)); }, [volume]);
  useEffect(() => {
    const outside = (e: PointerEvent) => { if (!root.current!.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', outside); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', outside); removeEventListener('keydown', esc); };
  }, []);

  const play = async (s: Station) => {
    setStation(s); store('station', s.id);
    try { await radio.play(s); setPlaying(true); setFailed(false); } catch { setFailed(true); setPlaying(false); }
  };
  const toggle = () => { if (playing) { radio.stop(); setPlaying(false); } else void play(station ?? STATIONS[0]); };
  // The picked disc flies from the row into the sleeve before the music starts.
  const pick = async (s: Station, button: HTMLElement) => {
    const from = button.querySelector<HTMLElement>('.disc')!, to = slot.current!.getBoundingClientRect(), a = from.getBoundingClientRect();
    if (!reducedMotion()) {
      const fly = from.cloneNode(true) as HTMLElement;
      Object.assign(fly.style, { position: 'fixed', zIndex: '90', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, pointerEvents: 'none' });
      document.body.appendChild(fly);
      const dx = to.left + to.width / 2 - (a.left + a.width / 2), dy = to.top + to.height / 2 - (a.top + a.height / 2), k = to.width / a.width;
      const anim = fly.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)' },
        { transform: `translate(${dx / 2 + 10}px, ${dy / 2 - 30}px) scale(${(1 + k) / 2}) rotate(130deg)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(250deg)` },
      ], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      await anim.finished.catch(() => {});
      fly.remove();
    }
    await play(s);
  };
  const shown = hover ?? station;

  return (
    <div ref={root} className={`radio${open ? ' is-open' : ''}${playing ? ' is-playing' : ''}`} style={{ '--disc-hue': station?.hue } as CSSProperties}>
      <div className="radio__bar float">
        <button className="radio__name" type="button" aria-expanded={open} aria-controls="radio-menu" aria-label="Choose music" onClick={() => setOpen(!open)}>
          <span className="rcase" aria-hidden="true"><span className="rcase__slot" ref={slot}><Disc hue={station?.hue ?? '#2DBE7E'} /></span><span className="rcase__sleeve" /></span>
          <span className="radio__label">{failed ? 'Audio blocked' : station?.name ?? 'Music'}</span>
          {playing && <Visualizer on />}
        </button>
        <button className="radio__play" type="button" aria-label={playing ? 'Pause music' : 'Play music'} aria-pressed={playing} onClick={toggle}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d={playing ? 'M4.6 3.6h2.4v8.8H4.6zM9 3.6h2.4v8.8H9z' : 'M5.2 3.6v8.8l7.2-4.4z'} /></svg>
        </button>
      </div>
      <div className="radio__menu" id="radio-menu" role="dialog" aria-label="Choose music">
        <p className="caption">Pick a disc. Music generated live in your browser.</p>
        <ul className="radio__discs">
          {STATIONS.map((s) => (
            <li key={s.id}>
              <button className="rpick" type="button" aria-label={`${s.name}: ${s.desc}`} aria-current={station?.id === s.id}
                onClick={(e) => void pick(s, e.currentTarget)} onPointerEnter={() => setHover(s)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(s)} onBlur={() => setHover(null)}>
                <Disc hue={s.hue} />
              </button>
            </li>
          ))}
        </ul>
        <p className="radio__info"><b>{shown?.name ?? 'Pick a disc'}</b>{shown?.desc}</p>
        <label className="radio__vol">
          <span>Volume</span>
          <input type="range" min="0" max="100" value={volume} style={{ '--v': `${volume}%` } as CSSProperties} onChange={(e) => setVolume(Number(e.target.value))} />
          <output>{volume}</output>
        </label>
      </div>
    </div>
  );
}
