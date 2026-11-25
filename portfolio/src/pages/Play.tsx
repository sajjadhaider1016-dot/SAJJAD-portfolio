import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { createGame, type Game, type Guide, type Quality, type Screen } from '../game/engine';
import { sfx } from '../game/sound';
import { BEACONS, HUB, ISLES, SHARDS, type Beacon } from '../game/world';
import { TLink, useTransitionNavigate } from '../components/TransitionLink';
import { reducedMotion } from '../animations/util';
import { profile } from '../data/content';
import '../styles/game.css';

const BEST = 'sh-isles-best';
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type Panel = 'none' | 'card' | 'journal' | 'pause';

export function Play() {
  const canvas = useRef<HTMLCanvasElement>(null), game = useRef<Game | null>(null);
  const guideRef = useRef<HTMLDivElement>(null), knob = useRef<HTMLSpanElement>(null), stickRef = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>()), drag = useRef<number | null>(null), elapsed = useRef(0), timeLabel = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [screen, setScreen] = useState<Screen>('title');
  const [panel, setPanel] = useState<Panel>('none');
  const [near, setNear] = useState<Beacon | null>(null);
  const [card, setCard] = useState<Beacon | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [shards, setShards] = useState(0);
  const [sound, setSound] = useState(() => read('sh-isles-sound') !== 'off');
  const [calm, setCalm] = useState(reducedMotion);
  const [quality, setQuality] = useState<Quality>('high');
  const [flying, setFlying] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [loaderGone, setLoaderGone] = useState(false);
  const [result, setResult] = useState<{ time: number; best: number; record: boolean } | null>(null);
  const [hint, setHint] = useState(true);
  const soundRef = useRef(sound); soundRef.current = sound;
  const finished = useRef(false);
  const navigate = useTransitionNavigate();

  const done = found.length === BEACONS.length && shards === SHARDS.length;
  const progress = Math.round(((found.length + shards) / (BEACONS.length + SHARDS.length)) * 100);

  // ── the engine ──
  const onGuide = useCallback((g: Guide) => {
    const el = guideRef.current; if (!el) return;
    el.classList.toggle('is-on', !!g);
    if (!g) return;
    el.classList.toggle('is-off', g.off);
    el.style.transform = `translate3d(${g.x}px, ${g.y}px, 0)`;
    el.style.setProperty('--angle', `${g.angle}rad`);
    el.querySelector('b')!.textContent = g.title;
    el.querySelector('small')!.textContent = `${g.distance} m`;
  }, []);
  useEffect(() => {
    let created: Game | null = null;
    // one frame's delay lets the loading screen paint before the world is built
    const timer = setTimeout(() => {
      try {
        created = createGame(canvas.current!, { reducedMotion: reducedMotion() }, {
          onNear: setNear, onGuide, onAutopilot: setFlying,
          onShard: (n) => {
            setShards(n);
            if (!n) return;
            if (soundRef.current) sfx.shard(n);
            setToast({ id: Date.now(), text: `Signal shard ${n} of ${SHARDS.length}` });
          },
        });
        game.current = created;
        created.setRunning(true);
        setQuality(created.quality());
        setStatus('ready');
        if (import.meta.env.DEV) Object.assign(window, { __game: created });
      } catch (error) {
        console.warn('Signal Isles could not start', error);
        setStatus('failed');
      }
    }, 60);
    const el = canvas.current!;
    const lost = (e: Event) => { e.preventDefault(); setStatus('failed'); };
    el.addEventListener('webglcontextlost', lost);
    // nothing renders while the tab is in the background
    const visibility = () => game.current?.setRunning(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { clearTimeout(timer); el.removeEventListener('webglcontextlost', lost); document.removeEventListener('visibilitychange', visibility); created?.dispose(); game.current = null; };
  }, [onGuide]);

  // the loading screen leaves the page once its fade is over, whether or not the fade ran
  useEffect(() => { if (status !== 'ready') return; const t = setTimeout(() => setLoaderGone(true), 900); return () => clearTimeout(t); }, [status]);
  useEffect(() => { game.current?.setScreen(screen); }, [screen]);
  useEffect(() => { game.current?.setPaused(screen !== 'play' || panel !== 'none'); if (panel !== 'card') game.current?.setFocus(null); if (panel !== 'none') keys.current.clear(); }, [panel, screen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (screen !== 'play' || !hint) return; const t = setTimeout(() => setHint(false), 9000); return () => clearTimeout(t); }, [screen, hint]);
  // the run timer only counts while you're flying
  useEffect(() => {
    if (screen !== 'play' || panel !== 'none' || finished.current) return;
    let last = performance.now();
    const t = setInterval(() => { const now = performance.now(); elapsed.current += (now - last) / 1000; last = now; if (timeLabel.current) timeLabel.current.textContent = clock(elapsed.current); }, 250);
    return () => clearInterval(t);
  }, [screen, panel]);
  // finishing waits for any open card to be closed, then plays the ending once
  useEffect(() => {
    if (!done || screen !== 'play' || panel !== 'none' || finished.current) return;
    const t = setTimeout(() => {
      finished.current = true;
      const previous = Number(read(BEST)) || 0, time = Math.max(1, elapsed.current), record = !previous || time < previous;
      if (record) write(BEST, String(time));
      setResult({ time, best: record ? time : previous, record });
      setScreen('complete');
      if (soundRef.current) sfx.complete();
    }, 900);
    return () => clearTimeout(t);
  }, [done, screen, panel]);

  const start = useCallback(() => { setScreen('play'); if (soundRef.current) sfx.start(); (document.activeElement as HTMLElement | null)?.blur(); }, []);
  const scan = useCallback(() => {
    const b = game.current?.getNear(); if (!b) return;
    game.current!.scan(b.id); game.current!.setFocus(b.id);
    setCard(b); setPanel('card'); setHint(false);
    setFound((f) => (f.includes(b.id) ? f : [...f, b.id]));
    if (soundRef.current) sfx.scan();
  }, []);
  const close = useCallback(() => { setPanel('none'); (document.activeElement as HTMLElement | null)?.blur(); }, []);
  const restart = () => {
    game.current?.reset(); finished.current = false; elapsed.current = 0;
    setFound([]); setCard(null); setResult(null); setPanel('none'); setScreen('play'); setHint(true);
  };
  const flyTo = (id: string) => { close(); game.current?.flyTo(id); };
  const toggleSound = () => { setSound((s) => { write('sh-isles-sound', s ? 'off' : 'on'); return !s; }); };
  const toggleCalm = () => { setCalm((c) => { game.current?.setMotion(c); return !c; }); };
  const toggleQuality = () => { const next = quality === 'high' ? 'low' : 'high'; game.current?.setQuality(next); setQuality(next); };

  // ── keyboard ──
  useEffect(() => {
    const steer = () => {
      const k = keys.current, i = game.current?.input; if (!i) return;
      i.x = Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'));
      i.y = Number(k.has('KeyS') || k.has('ArrowDown')) - Number(k.has('KeyW') || k.has('ArrowUp'));
      i.boost = k.has('ShiftLeft') || k.has('ShiftRight');
    };
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || status !== 'ready') return;
      const onControl = !!(e.target as HTMLElement).closest?.('button, a');
      if (screen === 'title') { if ((e.code === 'Enter' || e.code === 'Space') && !onControl) { e.preventDefault(); start(); } return; }
      if (e.code === 'Escape') { e.preventDefault(); if (screen === 'play') setPanel((p) => (p === 'none' ? 'pause' : 'none')); return; }
      if (screen !== 'play') return;
      if (e.code === 'KeyJ') { setPanel((p) => (p === 'journal' ? 'none' : 'journal')); return; }
      if (panel !== 'none') return;
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !onControl) { e.preventDefault(); scan(); return; }
      if (e.code === 'KeyQ') game.current?.orbit(-0.3);
      if (e.code === 'KeyR') game.current?.orbit(0.3);
      if (e.code === 'KeyC') game.current?.recenter();
      if (e.code.startsWith('Arrow')) e.preventDefault();
      keys.current.add(e.code); steer();
    };
    const up = (e: KeyboardEvent) => { keys.current.delete(e.code); steer(); };
    const blur = () => { keys.current.clear(); steer(); };
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); };
  }, [screen, panel, status, start, scan]);

  // ── drag to look around, wheel to zoom ──
  useEffect(() => {
    const el = canvas.current!;
    const wheel = (e: WheelEvent) => { e.preventDefault(); game.current?.zoomBy(Math.sign(e.deltaY) * 0.07); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);
  const lookDown = (e: RPointerEvent<HTMLCanvasElement>) => { if (screen !== 'play' || panel !== 'none') return; drag.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); };
  const lookMove = (e: RPointerEvent) => { if (drag.current === null) return; game.current?.orbit(-(e.clientX - drag.current) * 0.005); drag.current = e.clientX; };
  const lookUp = () => { drag.current = null; };

  // ── touch joystick ──
  const stick = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const r = e.currentTarget.getBoundingClientRect(), max = r.width * 0.34;
    let x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const len = Math.hypot(x, y); if (len > max) { x *= max / len; y *= max / len; }
    knob.current!.style.transform = `translate(${x}px, ${y}px)`;
    if (game.current) { game.current.input.x = x / max; game.current.input.y = y / max; game.current.input.boost = len > max * 1.65; }
  };
  const release = () => { if (knob.current) knob.current.style.transform = ''; if (game.current) { game.current.input.x = game.current.input.y = 0; game.current.input.boost = false; } };
  useEffect(() => { if (panel !== 'none' || screen !== 'play') release(); }, [panel, screen]);

  if (status === 'failed') {
    return (
      <main className="game game--fallback" id="main">
        <div className="gpanel gfallback">
          <p className="gkicker">Signal Isles</p>
          <h1>3D isn’t available here</h1>
          <p>This browser couldn’t run WebGL. Everything in the isles is on the portfolio too.</p>
          <ul>{BEACONS.map((b) => <li key={b.id}><TLink to={b.to}>{b.title}<span aria-hidden="true">→</span></TLink></li>)}</ul>
          <div className="grow"><TLink className="gbtn gbtn--primary" to="/">Back to portfolio</TLink><button className="gbtn" type="button" onClick={() => window.location.reload()}>Try again</button></div>
        </div>
      </main>
    );
  }

  const playing = screen === 'play';
  return (
    <main className={`game is-${screen}${panel !== 'none' ? ' has-panel' : ''}${calm ? ' is-calm' : ''}`} id="main">
      <canvas ref={canvas} aria-label="Signal Isles, a 3D view of floating islands" onPointerDown={lookDown} onPointerMove={lookMove} onPointerUp={lookUp} onPointerCancel={lookUp} />

      {!loaderGone && (
        <div className={`gload${status === 'ready' ? ' is-gone' : ''}`} role="status" aria-hidden={status === 'ready'}>
          <span className="gload__ring" /><p>Preparing the isles</p>
        </div>
      )}

      {screen === 'title' && status === 'ready' && (
        <section className="gtitle" aria-labelledby="game-title">
          <div className="gtitle__in">
            <p className="gkicker">A playable portfolio</p>
            <h1 id="game-title">Signal Isles</h1>
            <p className="gtitle__lede">{profile.name}’s work, scattered across five floating islands. Fly Pip to each beacon, recover the lost shards and bring the relay back online.</p>
            <ul className="gfacts">
              <li><b>{BEACONS.length}</b>beacons</li><li><b>{SHARDS.length}</b>signal shards</li><li><b>~3</b>minutes</li>
            </ul>
            <div className="gcontrols gcontrols--desk">
              <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Fly</span></p>
              <p><kbd>Shift</kbd><span>Boost</span></p>
              <p><kbd>E</kbd><span>Scan</span></p>
              <p><kbd>Drag</kbd><span>Look around</span></p>
            </div>
            <p className="gcontrols--touch">Drag the stick to fly and push it further to boost. Swipe the view to look around, and tap Scan at a beacon.</p>
            <div className="grow">
              <button className="gbtn gbtn--primary gbtn--lg" type="button" onClick={start}>Start flying <span aria-hidden="true">→</span></button>
              <TLink className="gbtn gbtn--lg" to="/">Back to portfolio</TLink>
            </div>
            <button className="gtext" type="button" onClick={toggleSound} aria-pressed={sound}>Sound {sound ? 'on' : 'off'}</button>
          </div>
        </section>
      )}

      {playing && (
        <>
          <header className="ghud">
            <button className="gicon" type="button" aria-label="Pause" onClick={() => setPanel(panel === 'pause' ? 'none' : 'pause')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg></button>
            <div className="gprogress gpanel" role="status" aria-label={`${found.length} of ${BEACONS.length} beacons, ${shards} of ${SHARDS.length} shards`}>
              <div><span><small>Beacons</small><b>{found.length}<i>/{BEACONS.length}</i></b></span><span><small>Shards</small><b>{shards}<i>/{SHARDS.length}</i></b></span><span><small>Time</small><b ref={timeLabel}>{clock(elapsed.current)}</b></span></div>
              <em style={{ ['--p' as string]: `${progress}%` }} />
            </div>
            <button className="gbtn" type="button" onClick={() => setPanel(panel === 'journal' ? 'none' : 'journal')}>Journal<kbd>J</kbd></button>
          </header>

          <MiniMap game={game} found={found} />
          {toast && <p className="gtoast" key={toast.id} role="status"><i aria-hidden="true" />{toast.text}</p>}
          {hint && panel === 'none' && !near && <p className="ghint">Follow the marker to the nearest beacon<span> · open the Journal to fly there automatically</span></p>}
          {flying && panel === 'none' && <p className="ghint ghint--auto">Autopilot · steer to take over</p>}
          {near && panel === 'none' && (
            <button className="gprompt gpanel" type="button" onClick={scan} style={{ ['--hue' as string]: near.color }}>
              <kbd>E</kbd><span><small>{found.includes(near.id) ? 'Scan again' : 'Beacon in range'}</small>{near.title}</span>
            </button>
          )}
          {done && panel === 'card' && <p className="ghint ghint--auto">Everything found. Close this card to bring the relay online.</p>}

          {panel === 'none' && (
            <div className="gtouch">
              <div className="gstick" ref={stickRef} role="application" aria-label="Movement joystick" onPointerDown={stick} onPointerMove={stick} onPointerUp={release} onPointerCancel={release}><span ref={knob} /></div>
              <button className="gscan" type="button" onClick={scan} disabled={!near} style={{ ['--hue' as string]: near?.color }}>Scan</button>
            </div>
          )}
        </>
      )}

      <div className="gguide" ref={guideRef} aria-hidden="true"><i /><p><b /><small /></p></div>

      {playing && panel === 'card' && card && (
        <aside className="gsheet gpanel" role="dialog" aria-label={card.title} style={{ ['--hue' as string]: card.color }}>
          <p className="gkicker">Signal received · {card.kicker}</p>
          <h2>{card.title}</h2>
          <p className="gsheet__desc">{card.desc}</p>
          <ul className="gtags">{card.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="grow">
            <button className="gbtn gbtn--primary" type="button" onClick={close} autoFocus>Keep flying</button>
            <TLink className="gbtn" to={card.to}>Open in portfolio ↗</TLink>
          </div>
        </aside>
      )}

      {playing && panel === 'journal' && (
        <aside className="gsheet gpanel" role="dialog" aria-label="Journal">
          <p className="gkicker">Journal · {progress}% restored</p>
          <h2>Beacons</h2>
          <ol className="gjournal">
            {BEACONS.map((b) => (
              <li key={b.id} className={found.includes(b.id) ? 'is-found' : ''} style={{ ['--hue' as string]: b.color }}>
                <i aria-hidden="true" /><span>{b.title}<small>{found.includes(b.id) ? 'Scanned' : 'Not yet scanned'}</small></span>
                <button className="gbtn gbtn--sm" type="button" onClick={() => flyTo(b.id)}>Fly there</button>
                {found.includes(b.id) && <TLink className="gtext" to={b.to}>Open ↗</TLink>}
              </li>
            ))}
          </ol>
          <p className="gsheet__desc">{SHARDS.length - shards ? `${SHARDS.length - shards} signal shards still drifting, on the islands and along the bridges.` : 'All signal shards recovered.'}</p>
          <div className="grow"><button className="gbtn gbtn--primary" type="button" onClick={close}>Close</button></div>
        </aside>
      )}

      {playing && panel === 'pause' && (
        <div className="gmodal" role="dialog" aria-label="Paused" aria-modal="true">
          <div className="gpanel gmodal__in">
            <p className="gkicker">Paused</p>
            <h2>Signal Isles</h2>
            <button className="gbtn gbtn--primary" type="button" onClick={close} autoFocus>Resume</button>
            <button className="gbtn" type="button" onClick={restart}>Restart</button>
            <div className="gsettings">
              <button type="button" onClick={toggleSound} aria-pressed={sound}><span>Sound</span><b>{sound ? 'On' : 'Off'}</b></button>
              <button type="button" onClick={toggleCalm} aria-pressed={calm}><span>Reduced motion</span><b>{calm ? 'On' : 'Off'}</b></button>
              <button type="button" onClick={toggleQuality}><span>Graphics</span><b>{quality === 'high' ? 'High' : 'Light'}</b></button>
            </div>
            <p className="gkeys">WASD fly · Shift boost · E scan · J journal · Q / R turn view · C recentre</p>
            <button className="gtext" type="button" onClick={() => navigate('/')}>Leave the isles</button>
          </div>
        </div>
      )}

      {screen === 'complete' && result && (
        <section className="gend" role="dialog" aria-label="Relay online">
          <div className="gpanel gend__in">
            <p className="gkicker">Transmission complete</p>
            <h2>Relay online</h2>
            <p>You scanned every beacon and recovered every shard. That was the whole portfolio, from the air.</p>
            <dl>
              <div><dt>Your time</dt><dd>{clock(result.time)}</dd></div>
              <div><dt>{result.record ? 'New best' : 'Best'}</dt><dd>{clock(result.best)}</dd></div>
              <div><dt>Signal</dt><dd>100%</dd></div>
            </dl>
            <div className="grow">
              <TLink className="gbtn gbtn--primary" to="/#contact">Get in touch</TLink>
              <button className="gbtn" type="button" onClick={restart}>Fly again</button>
              <button className="gbtn" type="button" onClick={() => setScreen('play')}>Keep exploring</button>
            </div>
            <TLink className="gtext" to="/">Back to portfolio</TLink>
          </div>
        </section>
      )}
    </main>
  );
}

function MiniMap({ game, found }: { game: React.RefObject<Game | null>; found: string[] }) {
  const you = useRef<SVGGElement>(null);
  useEffect(() => {
    let heading = 0, px = 0, pz = 0;
    const t = setInterval(() => {
      const d = game.current?.debug(); if (!d) return;
      if (Math.hypot(d.x - px, d.z - pz) > 0.3) heading = (Math.atan2(d.x - px, -(d.z - pz)) * 180) / Math.PI;
      px = d.x; pz = d.z;
      you.current?.setAttribute('transform', `translate(${d.x} ${d.z}) rotate(${heading})`);
    }, 90);
    return () => clearInterval(t);
  }, [game]);
  return (
    <svg className="gmap" viewBox="-52 -54 104 104" aria-label="Map of the isles">
      {ISLES.map((i, n) => <line key={n} x1={HUB.x} y1={HUB.z} x2={i.x} y2={i.z} />)}
      {[HUB, ...ISLES].map((i, n) => <circle key={n} cx={i.x} cy={i.z} r={i.r * 0.82} />)}
      {BEACONS.map((b) => <circle key={b.id} className={found.includes(b.id) ? 'dot is-found' : 'dot'} cx={b.x} cy={b.z} r="3.4" style={{ ['--hue' as string]: b.color }} />)}
      <g ref={you}><path className="you" d="M0-5.5 4 4 0 2.2-4 4Z" /></g>
    </svg>
  );
}
