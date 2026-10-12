"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

function LiveWebsitePreview({ src, title }: { src: string; title: string }) {
  return (
    <div role="img" aria-label={title} className="live-project-preview relative isolate aspect-[1.42] w-full overflow-hidden bg-[#141824]">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
      />
      <div className="live-project-light pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

function LiveProjectPreview({ kind, alt }: { kind: "study-buddy" | "recoveriest"; alt: string }) {
  const reduce = useReducedMotion();
  const previewRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.02, 1.08]);
  const src = kind === "study-buddy" ? "/projects/study-buddy-live.png" : "/projects/recoveriest-live.png";

  return (
    <div ref={previewRef} className={`live-project-preview live-project-preview-${kind} relative isolate aspect-[1.42] w-full overflow-hidden bg-[#141824]`}>
      <motion.div className="live-project-mask absolute inset-0 overflow-hidden" initial={false} whileInView={{ clipPath: "inset(0 0 0% 0)" }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}>
        <motion.div className="absolute -inset-[6%]" style={reduce ? undefined : { y: imageY, scale: imageScale }}>
          <Image src={src} alt={alt} fill sizes="(max-width: 680px) 100vw, (max-width: 1200px) 50vw, 720px" className="live-project-image object-cover object-top" priority={kind === "study-buddy"} />
        </motion.div>
      </motion.div>
      <motion.div className="live-project-light pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}

function PreviewWindow({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="img" aria-label={`${title} project preview`} className={`project-mock project-mock-${className}`}>
      <div className="project-mock-toolbar">
        <span className="project-mock-lights" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
        <span className="project-mock-toolbar-status">CONCEPT PREVIEW</span>
      </div>
      {children}
    </div>
  );
}

function ChatbotPreview() {
  return (
    <PreviewWindow title="Customer Support AI Copilot" className="chat">
      <div className="project-chat-shell">
        <aside className="project-chat-sidebar"><span className="project-chat-brand">S</span><span className="project-chat-side-line active" /><span className="project-chat-side-line" /><span className="project-chat-side-line short" /><span className="project-chat-side-spacer" /><span className="project-chat-avatar">SH</span></aside>
        <div className="project-chat-main">
          <div className="project-chat-top"><div><strong>Case analysis</strong><small><i /> Draft ready for review</small></div><span>GROK</span></div>
          <div className="project-chat-messages">
            <div className="project-copilot-signals"><span>INTENT <b>Billing</b></span><span>PRIORITY <b>High</b></span><span>SENTIMENT <b>Frustrated</b></span></div>
            <div className="project-copilot-draft"><small>SUGGESTED REPLY</small><p>Thanks for letting us know. I’ll review the charge and help resolve this.</p></div>
            <div className="project-copilot-next"><span>Next step</span><b>Review account activity</b><span className="project-copilot-escalation">Human review recommended</span></div>
          </div>
          <div className="project-chat-composer"><span>Reply is ready to edit</span><b>↗</b></div>
        </div>
      </div>
    </PreviewWindow>
  );
}

function AgentsPreview() {
  return (
    <PreviewWindow title="ContentPilot AI" className="agents">
      <div className="project-flow-head"><span>CONTENT WORKFLOW</span><span className="project-flow-live"><i /> READY</span></div>
      <div className="project-flow-canvas">
        <svg viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true"><path d="M120 90h112M288 90h112M456 90h48" /></svg>
        <div className="project-flow-node"><span className="project-flow-icon">↳</span><small>BRIEF</small><strong>Audience + goal</strong></div>
        <div className="project-flow-node project-flow-node-ai"><span className="project-flow-icon">✳</span><small>GROQ / LLAMA</small><strong>Shape the voice</strong></div>
        <div className="project-flow-node"><span className="project-flow-icon">✓</span><small>CONTENT</small><strong>Ready to refine</strong></div>
      </div>
      <div className="project-flow-footer"><span>Platform-ready variants</span><span>English · Urdu · Roman Urdu</span></div>
    </PreviewWindow>
  );
}

function BzuAssistantPreview() {
  return (
    <PreviewWindow title="BZU AI Assistant" className="bzu">
      <div className="bzu-preview-shell">
        <aside className="bzu-preview-sidebar">
          <div className="bzu-preview-brand">
            <Image src="/projects/bzu-logo.png" alt="Bahauddin Zakariya University logo" width={38} height={38} />
            <span>BZU<br /><small>STUDENT ASSISTANT</small></span>
          </div>
          <div className="bzu-preview-nav"><span className="active">⌂ <i>New conversation</i></span><span>▤ <i>Admissions</i></span><span>⌕ <i>Departments</i></span><span>◷ <i>Fees & notices</i></span></div>
          <span className="bzu-preview-history">YOUR CHATS</span>
          <span className="bzu-preview-history-item">Finding university information</span>
        </aside>
        <div className="bzu-preview-main">
          <div className="bzu-preview-top"><span>University AI Assistant</span><span className="bzu-preview-online"><i /> READY TO HELP</span></div>
          <div className="bzu-preview-conversation">
            <div className="bzu-preview-welcome"><Image src="/projects/bzu-logo.png" alt="" width={34} height={34} /><div><strong>How can I help with BZU?</strong><small>Ask a question or share a university document.</small></div></div>
            <div className="bzu-preview-question"><span>SH</span><p>Where can I find information about admissions?</p></div>
            <div className="bzu-preview-answer"><b>AI</b><p>I can help you find admission details, programs, deadlines, and related university information. You can also upload a notice or document for help understanding it.</p></div>
          </div>
          <div className="bzu-preview-compose"><span>Ask about admissions, departments, fees…</span><b>↑</b></div>
          <div className="bzu-preview-tools"><span>＋ Upload document</span><span>◉ Voice input</span><small>AI answers may need verification.</small></div>
        </div>
      </div>
    </PreviewWindow>
  );
}

function CoursePreview() {
  return (
    <PreviewWindow title="Course Registration System" className="course">
      <div className="project-terminal">
        <div className="project-terminal-heading"><span>UNIVERSITY PORTAL</span><span>STUDENT ACCESS</span></div>
        <h3>Course Registration</h3>
        <p>Manage your academic record</p>
        <div className="project-terminal-menu"><span><b>01</b> Student records <i>↗</i></span><span className="selected"><b>02</b> Course registration <i>↗</i></span><span><b>03</b> Exit application <i>↗</i></span></div>
        <div className="project-terminal-prompt"><i /> Select an option to continue <span>_</span></div>
      </div>
    </PreviewWindow>
  );
}

function RacingPreview() {
  return (
    <PreviewWindow title="Car Racing Game" className="racing">
      <div className="project-race-scene">
        <div className="project-race-label"><span>RACE MODE</span><b>01</b></div>
        <svg className="project-race-track" viewBox="0 0 620 270" fill="none" aria-hidden="true">
          <path d="M-30 224C89 220 69 40 224 43c97 2 91 166 199 164 80-1 88-123 226-130" stroke="currentColor" strokeWidth="104" />
          <path d="M-30 224C89 220 69 40 224 43c97 2 91 166 199 164 80-1 88-123 226-130" stroke="var(--bg)" strokeOpacity=".74" strokeWidth="2" strokeDasharray="12 12" />
          <g transform="translate(397 174) rotate(-12)"><rect x="-12" y="-24" width="24" height="48" rx="7" fill="var(--accent)" /><rect x="-7" y="-15" width="14" height="14" rx="3" fill="var(--bg)" /><rect x="-7" y="9" width="14" height="8" rx="2" fill="var(--accent-2)" /></g>
        </svg>
        <div className="project-race-hud"><span><small>POSITION</small><b>01</b></span><span><small>CONTROLS</small><b>ARROW KEYS</b></span><span className="project-race-speed"><b>FAST</b><i /></span></div>
      </div>
    </PreviewWindow>
  );
}

export function ProjectVisual({ kind }: { kind: string }) {
  if (kind === "docedit") return <LiveWebsitePreview src="https://docedit-submission.vercel.app/" title="Live DocEdit application preview" />;
  if (kind === "bzu") return <BzuAssistantPreview />;
  if (kind === "recoveriest") return <LiveProjectPreview kind="recoveriest" alt="Live Recoveriest homepage project preview" />;
  if (kind === "chatbots") return <ChatbotPreview />;
  if (kind === "agents") return <AgentsPreview />;
  if (kind === "study-buddy") return <LiveProjectPreview kind="study-buddy" alt="Live StudyBuddy homepage project preview" />;
  if (kind === "cpp-course") return <CoursePreview />;
  return <RacingPreview />;
}
