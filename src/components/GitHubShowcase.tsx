import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { site } from "@/data/site";
import { formatEvent, getGithubShowcase } from "@/lib/github";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export async function GitHubShowcase() {
  const { user, repos, events } = await getGithubShowcase();

  return (
    <section id="github" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="GitHub Showcase"
          title="Public work, in the open."
          description="Profile, featured repositories, contribution graph, and recent activity."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <article className="glass h-full rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-[72px] w-[72px] place-items-center rounded-2xl border border-border bg-surface font-display text-lg font-semibold tracking-tight text-accent">
                {site.mark}
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">{user?.name ?? site.name}</h3>
                <p className="text-sm text-muted">@{site.githubUser}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              {user?.bio ?? "AI & Full-Stack Developer building intelligent products in public."}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-border bg-surface px-3 py-3">
                <dt className="text-[11px] text-muted uppercase">Repos</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{user?.public_repos ?? "—"}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-surface px-3 py-3">
                <dt className="text-[11px] text-muted uppercase">Followers</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{user?.followers ?? "—"}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-surface px-3 py-3">
                <dt className="text-[11px] text-muted uppercase">Following</dt>
                <dd className="mt-1 font-display text-lg font-semibold">{user?.following ?? "—"}</dd>
              </div>
            </dl>
            <Button href={site.github} className="mt-5">
              Open GitHub
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </article>
        </Reveal>

        <Reveal delay={80}>
          <article className="h-full rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Contribution graph</h3>
            <p className="mt-1 text-sm text-muted">Live calendar from GitHub.</p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-bg-elevated p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://ghchart.rshah.org/6d8cff/${site.githubUser}`}
                alt={`${site.name} GitHub contribution graph`}
                className="h-auto min-w-[520px] w-full"
              />
            </div>
          </article>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <article className="h-full rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Featured repositories</h3>
            <ul className="mt-4 space-y-3">
              {repos.length === 0 ? (
                <li className="text-sm text-muted">Repositories will appear here when GitHub is reachable.</li>
              ) : (
                repos.map((repo) => (
                  <li key={repo.id}>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-2xl border border-border px-4 py-3 transition hover:border-accent/35"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{repo.name}</p>
                        <span className="flex items-center gap-3 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            {repo.stargazers_count}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <GitFork className="h-3.5 w-3.5" />
                            {repo.forks_count}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{repo.description ?? repo.language ?? "Public repository"}</p>
                    </a>
                  </li>
                ))
              )}
            </ul>
          </article>
        </Reveal>
        <Reveal delay={70}>
          <article className="h-full rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Recent activity</h3>
            <ul className="mt-4 space-y-3">
              {events.length === 0 ? (
                <li className="text-sm text-muted">Recent public events will appear here.</li>
              ) : (
                events.map((event) => (
                  <li key={event.id} className="rounded-2xl border border-border px-4 py-3 text-sm text-muted">
                    {formatEvent(event)}
                    <span className="mt-1 block text-xs">
                      {new Date(event.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
