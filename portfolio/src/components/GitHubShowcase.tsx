import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/content';

type Repo = { id: number; name: string; description: string | null; language: string | null; html_url: string };

/** Recent public repositories, read from GitHub's public API when the block comes near the screen. */
export function GitHubShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{ count: number; repos: Repo[] } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const stop = new AbortController();
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const base = `https://api.github.com/users/${profile.github.user}`;
      const get = (url: string) => fetch(url, { signal: stop.signal }).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); });
      Promise.all([get(base), get(`${base}/repos?sort=updated&per_page=5`)])
        .then(([user, repos]) => { setData({ count: Number(user.public_repos), repos: Array.isArray(repos) ? repos : [] }); requestAnimationFrame(() => window.__lenis?.resize()); })
        .catch(() => { if (!stop.signal.aborted) setFailed(true); });
    }, { rootMargin: '320px 0px' });
    io.observe(ref.current!);
    return () => { io.disconnect(); stop.abort(); };
  }, []);

  return (
    <div className="block github" ref={ref}>
      <p className="caption">{profile.github.eyebrow}</p>
      <h3 className="xp__role">{profile.name} <small>@ {profile.github.user}</small></h3>
      <p>{profile.github.note}</p>
      <p className="caption" aria-live="polite">
        {data ? `${data.count} public repositories` : failed ? 'Repository data is unavailable right now. The profile link below still works.' : 'Repository data loads as you reach this section'}
      </p>
      {data && (
        <ul className="rows">
          {data.repos.map((r) => (
            <li key={r.id}>
              <a className="rows__role" href={r.html_url} target="_blank" rel="noopener noreferrer">{r.name} ↗</a>
              <span className="rows__org">{r.description ?? ''}</span>
              <span className="rows__when">{r.language ?? ''}</span>
            </li>
          ))}
        </ul>
      )}
      <a className="btn btn--ink" href={profile.links.githubProfileCta} target="_blank" rel="noopener noreferrer">Open GitHub profile ↗</a>
    </div>
  );
}
