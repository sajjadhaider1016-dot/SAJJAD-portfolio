// Experience, education and achievement lists, shared by the home page and the About page.
import { achievements, education, experience } from '../data/content';

export function ExperienceList() {
  return (
    <ol className="xp">
      {experience.map((x) => (
        <li key={`${x.role}-${x.org}`} data-rv="">
          <div className="xp__when"><p className="caption">{x.period}</p><span className="badge">{x.status}</span></div>
          <div>
            <h3 className="xp__role">{x.role}</h3>
            <p className="xp__org">{x.org}</p>
            <p>{x.summary}</p>
            <ul className="bullets">{x.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            <ul className="chips chips--small">{x.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EducationList() {
  return (
    <ol className="tiles tiles--3">
      {education.map((e, i) => (
        <li key={e.degree} data-rv="">
          <p className="tiles__index">{String(i + 1).padStart(2, '0')}<span className="badge">{e.status}</span></p>
          <h3>{e.degree}</h3>
          <p className="xp__org">{e.school}</p>
          <p>{e.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function AchievementList() {
  return (
    <ol className="tiles tiles--3">
      {achievements.map((a, i) => (
        <li key={a.title} data-rv="">
          <p className="tiles__index">{String(i + 1).padStart(2, '0')}</p>
          <h3>{a.title}</h3>
          <p>{a.description}</p>
        </li>
      ))}
    </ol>
  );
}
