import { useEffect, useRef, useState } from 'react';
import { pixelMorph } from '../animations/pixelMorph';
import { clamp, reducedMotion } from '../animations/util';
import { GitHubShowcase } from '../components/GitHubShowcase';
import { Kinetic } from '../components/Kinetic';
import { AchievementList, EducationList, ExperienceList } from '../components/Records';
import { TLink } from '../components/TransitionLink';
import { hueOf, profile, projects } from '../data/content';
import { AboutText, SocialLinks } from '../sections/About';
import { Contact } from '../sections/Contact';

/** A pinned hero that starts as grey-blue pixels and resolves as you scroll, like the reference's video hero. */
function PinnedHero() {
  const wrap = useRef<HTMLElement>(null), art = useRef<HTMLCanvasElement>(null), morph = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = art.current!, g = cv.getContext('2d')!;
    // held here because React empties the refs before this loop is cancelled on the way out
    const hero = wrap.current!, overlay = morph.current!;
    const photo = new Image(); photo.src = profile.portrait;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const r = hero.getBoundingClientRect(); if (r.bottom < 0) return;
      const w = innerWidth, h = innerHeight;
      cv.width = Math.ceil(w / 2); cv.height = Math.ceil(h / 2);
      const bg = g.createLinearGradient(0, 0, cv.width, cv.height); bg.addColorStop(0, '#0B0D14'); bg.addColorStop(0.6, '#243259'); bg.addColorStop(1, '#4B61A6');
      g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
      if (photo.complete && photo.naturalWidth) {
        // the portrait is upright, so it stands at full height: to the right on wide screens, filling narrow ones
        const wide = cv.width > cv.height;
        const s = wide ? cv.height / photo.height : Math.max(cv.width / photo.width, cv.height / photo.height);
        g.drawImage(photo, wide ? cv.width * 0.68 - (photo.width * s) / 2 : (cv.width - photo.width * s) / 2, 0, photo.width * s, photo.height * s);
      }
      const p = reducedMotion() ? 1 : clamp(-r.top / Math.max(1, (r.height - h) * 0.7));
      pixelMorph(cv, overlay, w, h, p, 24);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <header className="vhero" ref={wrap}>
      <div className="vhero__pin">
        <canvas ref={art} role="img" aria-label={`Portrait of ${profile.name}`} /><canvas ref={morph} className="vhero__morph" aria-hidden="true" />
        <div className="container vhero__text">
          <h1 className="display-l">I’m {profile.name}</h1>
          <p className="body-l">{profile.intro}</p>
        </div>
      </div>
    </header>
  );
}

export function AboutPage() {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <>
      <main id="main">
        <PinnedHero />
        <section className="container cs-sec">
          <p className="caption" data-rv="">About me · {profile.location}</p>
          <Kinetic className="display-m" text="About Sajjad." />
          <p className="availability" data-rv=""><i aria-hidden="true" />{profile.availability}. {profile.recruiterAvailability}</p>
          <AboutText />
          <div data-rv=""><SocialLinks className="plinks plinks--buttons" /></div>
        </section>
        <section className="container cs-sec">
          <p className="caption" data-rv="">And what more?</p>
          <Kinetic className="display-m" text="Experience" />
          <ExperienceList />
        </section>
        <section className="container cs-sec"><Kinetic className="display-m" text="Education" /><EducationList /></section>
        <section className="container cs-sec"><Kinetic className="display-m" text="Achievements" /><AchievementList /></section>
        <section className="container cs-sec"><GitHubShowcase /></section>
        <section className="container cs-sec">
          <p className="caption" data-rv="">On the shelf</p>
          <Kinetic className="display-m" text="My project stack" />
          <p data-rv="">Pick a case off the shelf.</p>
          <ul className="cases" data-rv="">
            {projects.map((p, i) => (
              <li key={p.slug} style={{ ['--hue' as string]: hueOf(p) }}>
                <button type="button" className="case" aria-label={p.title} aria-pressed={pick === i} onClick={() => setPick(pick === i ? null : i)}>
                  <span className="case__spine" aria-hidden="true">{p.title}</span><span className="case__cover" aria-hidden="true"><b>{p.title}</b><small>{p.category}</small></span>
                </button>
              </li>
            ))}
          </ul>
          <p className="cases__info" aria-live="polite">{pick !== null && <><strong>{projects[pick].title}.</strong> {projects[pick].description} <TLink to={`/projects/${projects[pick].slug}`}>Open project →</TLink></>}</p>
        </section>
      </main>
      <Contact />
    </>
  );
}
