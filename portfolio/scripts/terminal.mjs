// The portfolio in your own terminal. Run: npm run terminal
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const load = (n) => JSON.parse(readFileSync(new URL(`../src/data/${n}.json`, import.meta.url), 'utf8'));
const [p, projects, experience, education, skills, services, certs, achievements] =
  ['profile', 'projects', 'experience', 'education', 'skills', 'services', 'certifications', 'achievements'].map(load);
const blue = (s) => `\x1b[38;5;69m${s}\x1b[0m`, bold = (s) => `\x1b[1m${s}\x1b[0m`;
const list = (a) => a.join('\n');
const commands = {
  help: () => 'about, projects, open <number>, experience, education, skills, services, certs, achievements, contact, exit',
  about: () => list([p.name, p.role, p.location, p.about.lead]),
  projects: () => list(projects.map((x, i) => `${i + 1}. ${x.title} (${x.category})`)),
  open: (n) => {
    const x = projects[Number(n) - 1];
    if (!x) return `Usage: open <1-${projects.length}>`;
    return list([bold(x.title), x.description, ...x.features.map((f) => `- ${f}`), x.contribution, x.tags.join(', '), ...x.links.map((l) => `${l.label}: ${l.url}`)].filter(Boolean));
  },
  experience: () => list(experience.map((x) => `${bold(x.role)}, ${x.org} [${x.status}] ${x.period}\n${x.responsibilities.map((r) => `  - ${r}`).join('\n')}`)),
  education: () => list(education.map((e) => `${e.degree}, ${e.school} [${e.status}]`)),
  skills: () => list(skills.map((g) => `${bold(g.name)}: ${g.items.join(', ')}`)),
  services: () => list(services.map((s) => `${bold(s.name)}: ${s.description}`)),
  certs: () => list(certs.map((c) => `${c.title} (${c.provider}, ${c.date}) ${c.credentialId}`)),
  achievements: () => list(achievements.map((a) => `${bold(a.title)}: ${a.description}`)),
  contact: () => list([p.email, p.links.github, p.links.linkedin, p.links.whatsapp]),
};
console.log(`\n${blue('■■ ' + p.name)}\n${p.role}\nType "help" to start.\n`);
const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: blue('$ ') });
rl.prompt();
rl.on('line', (line) => {
  const [cmd, arg] = line.trim().toLowerCase().split(/\s+/);
  if (cmd === 'exit' || cmd === 'quit') return rl.close();
  if (cmd) console.log(Object.hasOwn(commands, cmd) ? commands[cmd](arg) : `command not found: ${cmd}. Type "help".`);
  rl.prompt();
});
rl.on('close', () => console.log('Bye.'));
