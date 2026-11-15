import { roomDetailsFor } from "@/data/room-details";
import type { SectionId } from "@/data/portfolio";

export default function RoomDetailsCard({ section }: { section: SectionId }) {
  const content = roomDetailsFor(section);
  return (
    <section className="room-details-card" aria-labelledby="room-details-title" tabIndex={0}>
      <div className="room-details-heading">
        <p className="eyebrow">{section} · room notes</p>
        <span aria-hidden="true">{content.entries.length.toString().padStart(2, "0")}</span>
      </div>
      <h2 id="room-details-title">{content.title}</h2>
      <p className="room-details-subtitle">{content.subtitle}</p>
      <div className="room-details-list">
        {content.entries.map((entry, index) => {
          const href = section === "contact"
            ? entry.title === "Email" ? `mailto:${entry.detail}` : entry.meta
            : undefined;
          const external = Boolean(href && !href.startsWith("mailto:"));
          return (
            <article className="room-detail-item" key={`${entry.title}-${index}`}>
              <h3>{entry.title}</h3>
              {entry.detail && (href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{entry.detail}</a> : <p>{entry.detail}</p>)}
              {entry.meta && <small>{entry.meta}</small>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
