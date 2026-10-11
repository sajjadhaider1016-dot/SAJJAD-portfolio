import { aiWorkflow } from "@/data/content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function AIWorkflow() {
  return (
    <section id="ai-workflow" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionHeading eyebrow="AI Workflow" title={aiWorkflow.title} description={aiWorkflow.intro} />
      </Reveal>
      <Reveal className="relative mt-10 overflow-hidden rounded-[2rem] border border-border bg-bg-elevated p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent-2/10 blur-3xl" />
        <p className="relative max-w-3xl font-display text-xl font-medium leading-8 text-text sm:text-2xl">
          {aiWorkflow.statement}
        </p>
        <div className="relative mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {aiWorkflow.items.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted transition hover:border-accent/35 hover:text-text"
            >
              {item}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
