import { useEffect, useRef } from 'react';
import type { Game } from '../game/engine';
import { Kinetic } from '../components/Kinetic';
import { TLink } from '../components/TransitionLink';
import { reducedMotion } from '../animations/util';

/** The live preview: the game's own renderer, loaded as you approach and run only while on screen. */
export function District() {
  const stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let game: Game | null = null, dead = false, visible = false;
    const sync = () => game?.setRunning(visible && !reducedMotion());
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      import('../game/engine').then(({ createGame }) => { if (!dead) { try { game = createGame(canvas.current!, { preview: true, reducedMotion: reducedMotion() }); sync(); } catch { /* no WebGL: the gradient stays, and the link still opens the page with its fallback */ } } });
    }, { rootMargin: '600px 0px' });
    const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); });
    near.observe(stage.current!); seen.observe(stage.current!);
    return () => { dead = true; near.disconnect(); seen.disconnect(); game?.dispose(); };
  }, []);
  return (
    <section className="container band district" data-district="">
      <Kinetic className="display-l band__title on-sky" text="Want a new way to navigate a" soft="website?" />
      <div className="stage" ref={stage} data-sheet="">
        <canvas ref={canvas} aria-hidden="true" style={{ background: 'linear-gradient(#2a2860, #7d5a8c 55%, #e2a08c)' }} />
        <div className="stage__info">
          <div className="stage__text">
            <p className="caption">A playable portfolio</p>
            <p className="display-m stage__name">Signal Isles</p>
            <p className="stage__lede">Fly Pip across floating islands at golden hour, scan a beacon for each part of my portfolio and bring the signal relay back online. Click anywhere here to start playing.</p>
            <p className="caption">Best explored on desktop with a keyboard. Touch controls included.</p>
          </div>
          <span className="btn btn--light stage__cta">Enter the isles</span>
        </div>
        <TLink className="stage__link" to="/play" data-tip="Enter the isles" aria-label="Play Signal Isles, a playable portfolio" />
      </div>
    </section>
  );
}
