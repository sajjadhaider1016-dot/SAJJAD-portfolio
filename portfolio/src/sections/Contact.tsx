import { useState } from 'react';
import { botSvg } from '../animations/pixelBot';
import { ContactForm } from '../components/ContactForm';
import { Kinetic } from '../components/Kinetic';
import { Terminal } from '../components/Terminal';
import { TLink } from '../components/TransitionLink';
import { headings, profile } from '../data/content';

const COMMAND = 'npm run terminal';

export function Contact() {
  const [copy, setCopy] = useState('Copy');
  const [open, setOpen] = useState(false);
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(COMMAND); setCopy('Copied'); } catch { setCopy('Select to copy'); }
    setTimeout(() => setCopy('Copy'), 1600);
  };
  const channels: [string, string, string][] = [
    ['Email', profile.email, `mailto:${profile.email}`],
    ['WhatsApp', 'Open conversation ↗', profile.links.whatsapp],
    ['LinkedIn', 'View profile ↗', profile.links.linkedin],
    ['GitHub', `${profile.github.user} ↗`, profile.links.githubProfileCta],
  ];
  return (
    <footer className="contact" id="contact" data-nav="contact">
      <div className="container">
        <Kinetic className="display-l on-sky" text="Let’s get in" soft="touch" />
        <ul className="contact__links" data-rv="" data-dim="">
          <li><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href={`mailto:${profile.email}`}>Email</a></li>
          <li><a href={profile.links.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          <li><button type="button" onClick={() => dispatchEvent(new Event('cv:open'))}>Résumé</button></li>
        </ul>

        <div className="contact__grid">
          <div className="night-card" data-rv="">
            <h3 className="night-card__title">{headings.contact.title}</h3>
            <p className="caption">{headings.contact.lead}</p>
            <ContactForm />
          </div>
          <div>
            <div className="night-card" data-rv="">
              <h3 className="night-card__title">For recruiters &amp; collaborators</h3>
              <p className="caption">{profile.recruiterAvailability}</p>
              <ul className="channels">
                {channels.map(([name, text, url]) => (
                  <li key={name}><span>{name}</span><a href={url} {...(url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{text}</a></li>
                ))}
              </ul>
            </div>
            <div className="terminal-card" data-rv="">
              <img className="sheet__peek" src={botSvg(11)} alt="" />
              <p className="terminal-card__title">A whole new portfolio</p>
              <p className="caption">Run this in the project folder, or try it right here</p>
              <div className="terminal-card__row">
                <code>{COMMAND}</code>
                <button className="btn btn--night" type="button" onClick={doCopy}>{copy}</button>
                <button className="btn btn--night" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Close' : 'Try here'}</button>
              </div>
              {open && <Terminal />}
            </div>
          </div>
        </div>

        <div className="site-foot on-sky-2" data-dim="">
          <p><strong>{profile.name}</strong><br />{profile.role}<br />{profile.tagline}<br />{profile.availability}</p>
          <ul>
            <li><TLink to="/">Home</TLink></li><li><TLink to="/#about">About</TLink></li><li><TLink to="/#work">Selected work</TLink></li>
            <li><TLink to="/#experience">Experience</TLink></li><li><TLink to="/#contact">Contact</TLink></li><li><TLink to="/play">Explore the 3D world ↗</TLink></li>
          </ul>
          <p>© 2026 {profile.name}<br />{profile.footerNote}<br /><button type="button" onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }))}>Back to top ↑</button></p>
        </div>
      </div>
    </footer>
  );
}
