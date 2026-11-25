import { useEffect, useRef } from 'react';
import { ART_H, ART_W, drawProject, loadImage, START_TIME } from '../animations/projectArt';
import { pixelMorph } from '../animations/pixelMorph';
import { clamp, easeIO, lerp, reducedMotion } from '../animations/util';
import { Kinetic } from '../components/Kinetic';
import { TLink } from '../components/TransitionLink';
import { profile, projects } from '../data/content';

const DECK = projects.slice(0, 4);

/** Four project cards rest in a fan under the headline, then fly into their slots in My work. */
export function Hero() {
  const deckRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const deck = deckRef.current!, rm = reducedMotion(), root = document.documentElement;
    const cards = [...deck.querySelectorAll<HTMLElement>('.deck__card')];
    const arts = cards.map((c) => c.querySelector<HTMLCanvasElement>('.art')!);
    const morphs = cards.map((c) => c.querySelector<HTMLCanvasElement>('.morph')!);
    const paint = () => arts.forEach((a, i) => drawProject(a.getContext('2d')!, DECK[i], START_TIME));
    paint(); document.fonts.ready.then(paint);
    DECK.forEach((p) => { if (p.image) loadImage(p.image, paint); });
    let raf = 0;
    const docTop = (el: HTMLElement) => { let y = 0; for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop; return y; };
    const place = (now: number) => {
      raf = requestAnimationFrame(place);
      const targets = cards.map((_, i) => document.querySelector<HTMLElement>(`[data-dock-target="${i}"]`));
      // while the projects are filtered their slots don't exist, so the deck steps aside
      if (targets.some((t) => !t)) { deck.classList.add('is-docked'); root.classList.remove('deck-flying'); return; }
      const sheet = targets[0]!.closest<HTMLElement>('.sheet')!;
      const vw = root.clientWidth, vh = innerHeight, small = vw < 720;
      // the cards land as the first row of My work reaches the upper part of the screen
      const p = rm ? 1 : clamp(scrollY / Math.max(1, docTop(targets[0]!) - vh * 0.2, docTop(sheet) - vh * 0.16));
      const docked = p >= 1;
      deck.classList.toggle('is-docked', docked); root.classList.toggle('deck-flying', !docked);
      if (docked) return;
      const sw = Math.min(vw * (small ? 0.42 : 0.21), 300);
      cards.forEach((c, i) => {
        const r = targets[i]!.getBoundingClientRect(), sh = sw * (r.height / r.width), o = i - (cards.length - 1) / 2;
        const f = easeIO(clamp((p - i * 0.06) / 0.82));
        const bob = (1 - f) * Math.sin(now / 1250 + i * 1.7) * 8;
        const w = lerp(sw, r.width, f), h = lerp(sh, r.height, f);
        const x = lerp(vw / 2 + o * sw * (small ? 0.78 : 0.94) - sw / 2, r.left, f);
        const y = lerp(vh * (small ? 0.82 : 0.83) + o * o * sh * 0.13 - sh / 2 + bob, r.top, f);
        c.style.zIndex = String(10 - Math.round(Math.abs(o) * 2));
        c.style.width = `${w}px`; c.style.height = `${h}px`;
        c.style.setProperty('--go', String(1 - clamp(f / 0.75)));
        c.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${lerp(o * (small ? 7 : 9), 0, f)}deg)`;
        pixelMorph(arts[i], morphs[i], w, h, f);
      });
    };
    raf = requestAnimationFrame(place);
    return () => { cancelAnimationFrame(raf); root.classList.remove('deck-flying'); };
  }, []);

  return (
    <header className="hero">
      <div className="container hero__inner">
        <p className="hero__eyebrow on-sky-2" data-rv="">{profile.eyebrow}</p>
        <Kinetic as="h1" className="display-xl hero__title on-sky" text={`Hello, I’m ${profile.first}. ${profile.headline.lead}`} soft={profile.headline.soft} />
        <p className="hero__status on-sky-2" data-rv=""><i aria-hidden="true" />{profile.availability}</p>
        <div className="hero__actions" data-rv="">
          <TLink className="btn btn--ink" to="/#work">Explore my work</TLink>
          <TLink className="btn float" to="/#contact">Let’s connect</TLink>
          <a className="btn float" href={profile.resume.url} download={profile.resume.fileName}>Download résumé</a>
        </div>
      </div>
      <div className="deck" ref={deckRef} aria-hidden="true">
        {DECK.map((p) => (
          <TLink key={p.slug} className="deck__card" to={`/projects/${p.slug}`} data-tip={p.title} tabIndex={-1}>
            <span className="deck__face"><canvas className="art" width={ART_W} height={ART_H} /><canvas className="morph" /></span>
          </TLink>
        ))}
      </div>
    </header>
  );
}
