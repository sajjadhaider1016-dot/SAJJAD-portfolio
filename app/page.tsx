'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Bot, BrainCircuit, BriefcaseBusiness, Check,
  ChevronDown, Code2, Download, ExternalLink, GraduationCap, Mail, Menu,
  MessageCircle, Rocket, Sparkles, X
} from 'lucide-react';
import { capabilityGroups, projects } from '@/lib/data';

const reveal = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const navItems = ['About', 'Work', 'Skills', 'Experience', 'Contact'];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [caseOpen, setCaseOpen] = useState<number | null>(null);

  const faqs = [
    ['What is your main focus?', 'I focus on practical AI applications, full-stack web development and digital systems that solve clear real-world problems.'],
    ['What AI technologies do you work with?', 'My projects use LLM APIs, AI agents, prompt engineering, document processing, RAG concepts, Groq, Gemini and Python-based AI workflows.'],
    ['Do you also work with social media and digital content?', 'Yes. Alongside development, I work with content strategy, digital communication, Meta Ads concepts and AI-assisted content workflows.'],
    ['Are these projects real?', 'Yes. The portfolio only includes projects and links I have actually built or provided. No fake client results or fabricated metrics are used.'],
    ['Are you open to opportunities?', 'Yes. I am open to relevant internships, freelance projects and opportunities where I can contribute to AI, web development or digital products.'],
  ];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>SAJJAD<span>.</span></a>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          {navItems.map((item) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>)}
        </nav>
        <div className="header-actions">
          <a className="mini-link" href="https://github.com/sajjadhaider1016-dot" target="_blank" rel="noreferrer">GitHub</a>
          <a className="header-cta" href="#contact">Let&apos;s talk <ArrowUpRight size={15}/></a>
        </div>
        <button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X/> : <Menu/>}</button>
      </header>

      <section id="home" className="hero shell">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={reveal} transition={{duration:.55}}>
          <div className="status-badge"><span/> Available for opportunities</div>
          <p className="eyebrow">AI DEVELOPER · FULL-STACK DEVELOPER · DIGITAL CREATOR</p>
          <h1>Building <span>intelligent products</span> for the real world.</h1>
          <p className="hero-text">I&apos;m Sajjad Haider, a BS Artificial Intelligence student and developer focused on building AI-powered applications, intelligent workflows and modern full-stack products that solve real-world problems.</p>
          <div className="hero-actions">
            <a className="button primary" href="#work">View my work <ArrowRight size={17}/></a>
            <a className="button secondary" href="/resume.pdf" download>Download CV <Download size={16}/></a>
          </div>
          <div className="hero-tags"><span>AI Applications</span><span>Full-Stack Development</span><span>Automation</span><span>Digital Content</span></div>
        </motion.div>

        <motion.aside className="hero-visual" initial={{opacity:0,x:26}} animate={{opacity:1,x:0}} transition={{duration:.7,delay:.12}} aria-label="AI systems visual">
          <div className="visual-grid"/>
          <div className="visual-glow glow-a"/><div className="visual-glow glow-b"/>
          <div className="visual-top"><span>SELECTED SIGNAL</span><span>01 / 04</span></div>
          <div className="system-orbit orbit-one"><span/><span/><span/></div>
          <div className="system-orbit orbit-two"><span/><span/></div>
          <div className="core-mark"><div className="core-ring"><Bot size={30}/></div><strong>INTELLIGENT<br/>SYSTEMS</strong></div>
          <div className="visual-chip chip-ai"><Sparkles size={14}/><span>Generative AI</span></div>
          <div className="visual-chip chip-web"><Code2 size={14}/><span>Full-Stack</span></div>
          <div className="visual-chip chip-auto"><Rocket size={14}/><span>Automation</span></div>
          <div className="visual-code"><span>01</span><span>LLM / RAG / AGENTS</span><span>BUILD → DEPLOY → IMPROVE</span></div>
          <div className="visual-bottom"><span>SAJJAD HAIDER</span><span>AI · WEB · DIGITAL</span></div>
        </motion.aside>
      </section>

      <section className="proof-strip"><div className="shell proof-inner"><p>Currently building with</p>{['Next.js','TypeScript','Node.js','Python','PostgreSQL','LLM APIs','Git'].map(x=><span key={x}>{x}</span>)}</div></section>

      <section id="about" className="section shell">
        <div className="section-kicker">About</div>
        <div className="about-grid">
          <div><h2>Curious by nature.<br/>Practical by choice.</h2></div>
          <div className="about-copy"><p className="lead">I learn by building. I turn ideas into working products, experiment with emerging technologies, and continuously improve what I create.</p><p>My work spans AI assistants, intelligent automation, full-stack web applications, research tools, customer-support systems, and digital platforms. I focus on building products that are useful, intuitive, and technically reliable.</p></div>
        </div>
        <div className="principles">
          <article><Check/><div><h3>Purpose over complexity</h3><p>I choose practical solutions that solve the problem without unnecessary complexity.</p></div></article>
          <article><Rocket/><div><h3>Build. Ship. Improve.</h3><p>I turn ideas into working products, then refine them through testing and iteration.</p></div></article>
          <article><BrainCircuit/><div><h3>AI with purpose</h3><p>I use AI where it creates meaningful value—not simply because the technology is available.</p></div></article>
        </div>
      </section>

      <section id="work" className="section work-section">
        <div className="shell">
          <div className="section-kicker">Selected work</div>
          <div className="section-heading-row"><h2>Projects built to solve real problems.</h2><p>A selection of deployed applications and source-code projects demonstrating my approach to AI, software development, automation, and digital products.</p></div>
          <div className="projects-grid">
            {projects.map((project,index)=><motion.article className={`project-card ${index<2?'project-featured':''}`} key={project.title} initial="hidden" whileInView="visible" viewport={{once:true,amount:.12}} variants={reveal} transition={{duration:.45,delay:(index%2)*.06}}>
              {project.image && <a className="project-image" href={project.live} target="_blank" rel="noreferrer"><img src={project.image} alt={`Preview of ${project.title}`}/><div className="image-overlay"><span>Open live project</span><ArrowUpRight size={16}/></div></a>}
              <div className="project-content">
                <div className="project-meta"><span>{project.type}</span></div>
                <h3>{project.title}</h3><p>{project.description}</p>
                <div className="skill-list">{project.technologies.map(t=><span key={t}>{t}</span>)}</div>
                <div className="project-links">{project.live && <a href={project.live} target="_blank" rel="noreferrer">Live demo <ExternalLink size={14}/></a>}{project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub <ExternalLink size={14}/></a>}<button onClick={()=>setCaseOpen(caseOpen===index?null:index)}>Case study <ChevronDown className={caseOpen===index?'rotate':''} size={14}/></button></div>
                {caseOpen===index && <motion.div className="case-study" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}><div><small>Problem</small><p>{project.problem}</p></div><div><small>Solution</small><p>{project.solution}</p></div><div><small>Outcome</small><p>{project.result}</p></div></motion.div>}
              </div>
            </motion.article>)}
          </div>
        </div>
      </section>

      <section id="skills" className="section skills-section"><div className="shell">
        <div className="section-kicker">Expertise</div><div className="section-heading-row"><h2>Technical skills applied to real projects.</h2><p>Technologies and capabilities I actively use across AI development, software engineering, automation, and digital content.</p></div>
        <div className="capability-grid">{capabilityGroups.map((g,i)=>{const Icon=i===0?Sparkles:i===1?Code2:BriefcaseBusiness;return <motion.article className="capability-card" key={g.title} initial="hidden" whileInView="visible" viewport={{once:true}} variants={reveal} transition={{delay:i*.06}}><div className="capability-icon"><Icon/></div><h3>{g.title}</h3><p>{g.description}</p><div className="skill-list">{g.skills.map(s=><span key={s}>{s}</span>)}</div></motion.article>})}</div>
      </div></section>

      <section id="experience" className="section shell journey-section">
        <div className="section-kicker">Journey</div><div className="section-heading-row"><h2>Learning through education, building through projects.</h2><p>A snapshot of my academic background, independent projects, and digital work.</p></div>
        <div className="journey-grid">
          <article className="journey-card"><div className="journey-icon"><GraduationCap/></div><span className="journey-label">Education</span><h3>BS Artificial Intelligence</h3><h4>Bahauddin Zakariya University · Multan</h4><p>2025–2029</p><div className="journey-tags"><span>Artificial Intelligence</span><span>Machine Learning</span><span>Programming</span><span>AI Systems</span></div></article>
          <article className="journey-card"><div className="journey-icon"><Code2/></div><span className="journey-label">Independent Projects</span><h3>AI & Full-Stack Development</h3><h4>Applied project work</h4><p>Building and deploying AI-powered applications, agents, APIs and modern web experiences.</p><div className="journey-tags"><span>LLM APIs</span><span>Next.js</span><span>Node.js</span><span>Python</span></div></article>
          <article className="journey-card"><div className="journey-icon"><BriefcaseBusiness/></div><span className="journey-label">Digital Work</span><h3>Marketing & Content</h3><h4>Digital communication and brand support</h4><p>Experience with Meta Ads workflows, content strategy, visual communication and online marketing operations.</p><div className="journey-tags"><span>Meta Ads</span><span>Content</span><span>Branding</span><span>Digital Strategy</span></div></article>
        </div>
      </section>

      <section className="section current-section"><div className="shell current-card"><div><p className="section-kicker light">Currently building</p><h2>Currently expanding my AI engineering skills.</h2><p>I&apos;m currently deepening my work in AI agents, generative AI, RAG, automation, and production-ready full-stack systems.</p></div><div className="current-stack"><span>AI Agents</span><span>Generative AI</span><span>Automation</span><span>RAG</span><span>Full-Stack Systems</span><span>Deployment</span></div></div></section>

      <section className="section shell faq-section"><div className="faq-layout"><div><div className="section-kicker">FAQ</div><h2>A few things you may want to know.</h2></div><div className="faq-list">{faqs.map(([q,a],i)=><div className="faq-item" key={q}><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} aria-expanded={faqOpen===i}><span>{q}</span><ChevronDown className={faqOpen===i?'rotate':''}/></button>{faqOpen===i&&<motion.p initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}}>{a}</motion.p>}</div>)}</div></div></section>

      <section id="contact" className="contact-section"><div className="shell contact-inner"><p className="section-kicker light">Let&apos;s connect</p><h2>Let&apos;s build something useful.</h2><p>I&apos;m open to internships, development opportunities, freelance projects, and collaborations across AI, software, and digital products.</p><div className="contact-actions"><a className="button contact-primary" href="mailto:sajjadhaider1016@gmail.com"><Mail size={17}/> Email me</a><a className="button contact-secondary" href="https://wa.me/923337379195" target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp</a><a className="button contact-secondary" href="https://github.com/sajjadhaider1016-dot" target="_blank" rel="noreferrer"><Code2 size={17}/> GitHub</a><a className="button contact-secondary" href="/resume.pdf" download><Download size={17}/> CV</a></div><small>sajjadhaider1016@gmail.com · +92 333 7379195</small></div></section>

      <footer className="footer shell"><a className="brand" href="#home">SAJJAD<span>.</span></a><p>AI · DEVELOPMENT · DIGITAL</p><p>© 2026 Sajjad Haider</p></footer>
    </main>
  );
}
