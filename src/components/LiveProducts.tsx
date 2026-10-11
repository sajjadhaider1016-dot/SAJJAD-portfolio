import { liveProducts } from "@/data/projects";
import { Button } from "./Button";
import { IconExternal, IconGithub, IconPlay } from "./Icons";
import { ProjectVisual } from "./ProjectVisual";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function LiveProducts() {
  return (
    <div className="mb-16">
      <Reveal>
        <SectionHeading
          eyebrow="Live Products"
          title="Shipped software, running in production."
          description="These are deployed applications — not mockups. Highest visual priority: DocEdit, BZU AI Assistant, and Recoveriest."
        />
      </Reveal>
      <div className="mt-10 grid gap-6">
        {liveProducts.map((product, index) => (
          <Reveal key={product.slug} delay={index * 70}>
            <article className="project-card overflow-hidden rounded-3xl border border-border bg-surface">
              <div className={index === 0 ? "grid lg:grid-cols-2" : "grid lg:grid-cols-[0.95fr_1.05fr]"}>
                <div className="p-4 sm:p-6">
                  <ProjectVisual kind={product.image} />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="live-badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                      <span className="live-dot h-1.5 w-1.5 rounded-full" />
                      {product.status}
                    </span>
                    {product.productType ? (
                      <span className="text-[11px] tracking-[0.16em] text-muted uppercase">
                        {product.productType}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {product.title}
                  </h3>
                  {product.subtitle ? <p className="mt-1 text-sm text-accent">{product.subtitle}</p> : null}
                  <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{product.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.links
                      .filter((link) => link.kind !== "caseStudy" && link.kind !== "view")
                      .map((link) => (
                        <Button
                          key={link.label}
                          href={link.href}
                          variant={link.kind === "live" ? "primary" : "secondary"}
                          className="!px-3.5 !py-2 text-xs"
                        >
                          {link.kind === "github" ? <IconGithub className="h-3.5 w-3.5" /> : null}
                          {link.kind === "video" ? <IconPlay className="h-3.5 w-3.5" /> : null}
                          {link.kind === "live" ? <IconExternal className="h-3.5 w-3.5" /> : null}
                          {link.label}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
