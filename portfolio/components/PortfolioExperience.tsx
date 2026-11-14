"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import SectionPanel from "@/components/SectionPanel";
import { links, sections, type SectionId } from "@/data/portfolio";

const CorridorScene = dynamic(() => import("@/components/CorridorScene"), {
  ssr: false,
  loading: () => <div className="scene-loading" role="status">Drawing the corridor<span className="loading-dots">···</span></div>,
});

type SocialName = "github" | "linkedin" | "email" | "whatsapp";
function SocialIcon({ name }: { name: SocialName }) {
  if (name === "github") return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.85 2.05 3.34 1.55.1-.73.4-1.23.72-1.51-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" /></svg>;
  if (name === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5.2 3.3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.3 9h3.8v11.7H3.3V9Zm6.1 0H13v1.6h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7v6.4h-3.8V15c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.8H9.4V9Z" /></svg>;
  if (name === "email") return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="M3.5 5.5h17v13h-17z" /><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="m4 6 8 6.5L20 6" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.1a9.7 9.7 0 0 0-8.3 14.7L2.5 21l4.3-1.1A9.7 9.7 0 1 0 12 2.1Zm0 17.6a7.9 7.9 0 0 1-4-1.1l-.3-.2-2.5.7.7-2.4-.2-.3A7.9 7.9 0 1 1 12 19.7Zm4.3-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.8c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4l.4-.5.2-.4c.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.4.5.2 1 .2 1.3.1.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.5-.3Z" /></svg>;
}

export default function PortfolioExperience() {
  const [mode, setMode] = useState<"portfolio" | "tour">("portfolio");
  const [active, setActive] = useState<SectionId>("home");
  const [movement, setMovement] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roomDetailsVisible, setRoomDetailsVisible] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);

  const returnToWebsite = useCallback(() => {
    setMovement([]);
    setMenuOpen(false);
    setMoreOpen(false);
    setActive("home");
    setMode("portfolio");
    setRoomDetailsVisible(false);
    window.requestAnimationFrame(() => document.getElementById("section-home")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const goTo = useCallback((id: SectionId) => {
    setActive(id);
    setMovement([]);
    setMenuOpen(false);
    if (mode === "tour") setRoomDetailsVisible(true);
    if (mode === "portfolio") document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [mode]);

  const roomArrived = useCallback(() => setRoomDetailsVisible(true), []);

  const enter = useCallback(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setMode("tour");
    setRoomDetailsVisible(true);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const card = document.querySelector(".section-scroll");
    if (card instanceof HTMLElement) card.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (mode !== "tour") return;
    const held = new Set<string>();
    const down = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName))) return;
      const key = event.key.toLowerCase();
      if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) return;
      event.preventDefault();
      held.add(key);
      setMovement([...held]);
    };
    const up = (event: KeyboardEvent) => {
      held.delete(event.key.toLowerCase());
      setMovement([...held]);
    };
    const blur = () => { held.clear(); setMovement([]); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "portfolio") return;
    const nodes = sections.map(({ id }) => document.getElementById(`section-${id}`)).filter((node): node is HTMLElement => node instanceof HTMLElement);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id.replace("section-", "") as SectionId);
    }, { rootMargin: "-18% 0px -55% 0px", threshold: [0, .15, .35, .6] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    const onLock = (event: Event) => setPointerLocked((event as CustomEvent<boolean>).detail);
    window.addEventListener("portfolio:pointer-lock-change", onLock);
    return () => window.removeEventListener("portfolio:pointer-lock-change", onLock);
  }, []);

  useEffect(() => {
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMoreOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenus);
    return () => window.removeEventListener("keydown", closeMenus);
  }, []);

  function hold(key: string) {
    setMovement((current) => current.includes(key) ? current : [...current, key]);
  }
  function release(key: string) {
    setMovement((current) => current.filter((item) => item !== key));
  }

  return (
    <main className={`portfolio-world mode-${mode}${roomDetailsVisible ? " has-tour-room-details" : ""}`}>
      <a className="skip-link" href="#portfolio-content">Skip to portfolio content</a>
      <div className="scene-wrap">
        {mode === "tour" && <CorridorScene active={active} movement={movement} onChoose={goTo} onRoomArrive={roomArrived} onReady={() => setSceneReady(true)} onError={() => setSceneFailed(true)} />}
        {sceneFailed && <div className="scene-fallback" role="status"><span className="fallback-drawing" aria-hidden="true">⌂</span><p>The 3D scene is unavailable in this browser. You can still visit every section from the destinations menu.</p></div>}
        {!sceneReady && !sceneFailed && <div className="scene-loader" aria-hidden="true"><span />Preparing the illustrated world</div>}
      </div>

      <header className={`world-header ${mode === "tour" ? "tour-header" : "site-header"}`}>
        <button type="button" className="wordmark" onClick={returnToWebsite} aria-label="Go to home">
          <span className="monogram">SH</span><span className="wordmark-copy"><strong>SAJJAD HAIDER</strong><small>AI &amp; FULL-STACK DEVELOPER</small></span>
        </button>
        {mode === "portfolio" ? <>
          <nav className="primary-nav" aria-label="Main navigation">
            {["home", "about", "projects", "experience", "skills", "services", "contact"].map((id) => <button type="button" key={id} className={active === id ? "is-active" : ""} aria-current={active === id ? "location" : undefined} onClick={() => goTo(id as SectionId)}>{id}</button>)}
            <div className="more-nav"><button type="button" aria-expanded={moreOpen} aria-haspopup="true" onClick={() => setMoreOpen((open) => !open)}>More <span aria-hidden="true">⌄</span></button>{moreOpen && <div className="more-menu">{(["education", "certifications", "achievements"] as SectionId[]).map((id) => <button type="button" key={id} onClick={() => { goTo(id); setMoreOpen(false); }}>{id}</button>)}</div>}</div>
          </nav>
          <div className="header-tools"><button type="button" className="menu-toggle mode-switch" onClick={enter}>Explore 3D world <span aria-hidden="true">↗</span></button><button type="button" className="mobile-nav-toggle" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "Close" : "Menu"}</button></div>
          {menuOpen && <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">{sections.map(({id,label}) => <button type="button" key={id} aria-current={active === id ? "location" : undefined} onClick={() => { goTo(id); setMenuOpen(false); }}>{label}<span>↗</span></button>)}<button type="button" onClick={() => { enter(); setMenuOpen(false); }}>Explore 3D world<span>↗</span></button></nav>}
        </> : <div className="header-tools"><span className="available-status"><i />Interactive 3D experience</span><button type="button" className="menu-toggle mode-switch" onClick={returnToWebsite}><span className="desktop-control-label">← Return to website</span><span className="mobile-control-label">← Exit tour</span></button><button type="button" className="menu-toggle room-toggle" aria-expanded={menuOpen} aria-controls="tour-room-menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <><span className="desktop-control-label">Close rooms</span><span className="mobile-control-label">Close</span></> : <><span className="desktop-control-label">Choose a room</span><span className="mobile-control-label">Rooms</span></>}</button></div>}
      </header>

      {mode === "tour" && <aside id="tour-room-menu" className={`destination-map ${menuOpen ? "is-open" : "is-closed"}`} aria-label="Choose a portfolio destination">
        <div className="map-heading"><span>Destinations</span><small>10 rooms</small></div>
        <nav>
          {sections.map((section) => <button type="button" className={active === section.id ? "active" : ""} key={section.id} onClick={() => goTo(section.id)} aria-current={active === section.id ? "page" : undefined}>
            <span className="destination-number">{section.number}</span><span>{section.label}</span><span className="destination-arrow" aria-hidden="true">↗</span>
          </button>)}
        </nav>
        <div className="map-foot"><span className="pencil-line" />Choose a room to enter</div>
      </aside>}

      <div className={`content-anchor ${mode === "tour" && !roomDetailsVisible ? "tour-details-hidden" : ""}`} id="portfolio-content">
        <SectionPanel section={active} enter={enter} navigate={goTo} allSections={mode === "portfolio"} />
      </div>

      {mode === "tour" && <div className="movement-hint" role="status"><span className="keycaps"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span className="desktop-instructions">Move · move cursor to look · drag for free look</span><span className="mobile-instructions">Drag to look · pad to walk</span>{!pointerLocked ? <button className="lock-look" onClick={() => window.dispatchEvent(new Event("portfolio:pointer-lock"))}>Enable mouse look</button> : <span className="lock-instructions">Mouse locked · press Esc to release</span>}<button onClick={() => { setMovement([]); setMode("portfolio"); setRoomDetailsVisible(false); }} aria-label="Return to portfolio details">i</button></div>}

      {mode === "tour" && <div className={`touch-pad ${menuOpen ? "is-suspended" : ""}`} aria-label="Touch movement controls" aria-hidden={menuOpen}>
        <button type="button" aria-label="Move forward" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); hold("w"); }} onPointerUp={() => release("w")} onPointerCancel={() => release("w")} onPointerLeave={() => release("w")}>↑</button>
        <button type="button" aria-label="Move left" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); hold("a"); }} onPointerUp={() => release("a")} onPointerCancel={() => release("a")} onPointerLeave={() => release("a")}>←</button>
        <button type="button" aria-label="Move backward" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); hold("s"); }} onPointerUp={() => release("s")} onPointerCancel={() => release("s")} onPointerLeave={() => release("s")}>↓</button>
        <button type="button" aria-label="Move right" onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); hold("d"); }} onPointerUp={() => release("d")} onPointerCancel={() => release("d")} onPointerLeave={() => release("d")}>→</button>
      </div>}
      {mode === "portfolio" && <footer className="portfolio-footer">
        <div className="footer-main">
          <div className="footer-signature"><a href="#section-home" className="footer-wordmark"><span className="footer-monogram">SH</span><span>SAJJAD HAIDER</span></a><p>AI &amp; Full-Stack Developer<br />Building useful products with intelligent systems.</p><span className="footer-availability"><i /> Available for remote opportunities</span></div>
          <nav className="footer-navigation" aria-label="Footer navigation"><strong>Explore</strong><a href="#section-home">Home</a><a href="#section-about">About</a><a href="#section-projects">Selected work</a><a href="#section-experience">Experience</a><a href="#section-contact">Contact</a></nav>
          <div className="footer-connect"><strong>Connect</strong><div className="footer-socials" aria-label="Social profiles">
            <a href={links.githubProfile} target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub"><SocialIcon name="github" /></a>
            <a href={links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn"><SocialIcon name="linkedin" /></a>
            <a href={links.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp conversation" title="WhatsApp"><SocialIcon name="whatsapp" /></a>
            <a href={`mailto:${links.email}`} aria-label="Email Sajjad" title="Email"><SocialIcon name="email" /></a>
          </div><button type="button" className="footer-tour" onClick={enter}>Explore the 3D world ↗</button></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Sajjad Haider</span><span>Designed around thoughtful, practical software.</span><a href="#section-home">Back to top ↑</a></div>
      </footer>}
      {mode === "tour" && <footer className="world-footer"><span>AN ILLUSTRATED WORLD BY SAJJAD HAIDER</span><span className="footer-center"><i />INTERACTIVE ARCHITECTURE</span><a href={`mailto:sajjadhaider1016@gmail.com`}>SAY HELLO ↗</a></footer>}
    </main>
  );
}
