import { site } from "@/data/site";

export type GithubUser = {
  login: string;
  name: string | null;
  bio: string | null;
  html_url: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
};

export type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export type GithubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
};

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "sajjad-haider-portfolio",
};

async function readJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getGithubShowcase() {
  const [user, repos, events] = await Promise.all([
    readJson<GithubUser>(`https://api.github.com/users/${site.githubUser}`),
    readJson<GithubRepo[]>(
      `https://api.github.com/users/${site.githubUser}/repos?sort=updated&per_page=6`,
    ),
    readJson<GithubEvent[]>(
      `https://api.github.com/users/${site.githubUser}/events/public?per_page=6`,
    ),
  ]);

  return {
    user,
    repos: repos ?? [],
    events: events ?? [],
  };
}

export function formatEvent(event: GithubEvent) {
  const repo = event.repo.name.replace(`${site.githubUser}/`, "");
  const labels: Record<string, string> = {
    PushEvent: "Pushed to",
    CreateEvent: "Created",
    WatchEvent: "Starred",
    ForkEvent: "Forked",
    IssuesEvent: "Issue activity on",
    PullRequestEvent: "Pull request on",
    PublicEvent: "Open sourced",
  };
  return `${labels[event.type] ?? event.type} ${repo}`;
}
