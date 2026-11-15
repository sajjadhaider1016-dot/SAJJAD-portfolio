import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link className="not-found-wordmark" href="/" aria-label="Sajjad Haider — return to home">
          <span className="not-found-monogram">SH</span>
          <span><strong>SAJJAD HAIDER</strong><small>AI &amp; FULL-STACK DEVELOPER</small></span>
        </Link>
        <span className="not-found-label">PORTFOLIO · 404</span>
      </header>

      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-illustration" aria-hidden="true">
          <span className="illustration-number">04</span>
          <span className="illustration-door"><span className="illustration-door-panel" /><i /></span>
          <span className="illustration-floor" />
          <span className="illustration-caption">A ROOM OUT OF PLACE</span>
        </div>
        <div className="not-found-copy">
          <p className="eyebrow">You took a wrong turn</p>
          <h1 id="not-found-title">This page isn’t <em>here.</em></h1>
          <p className="not-found-description">The address may have changed, or the page may have moved. Let’s get you back to the portfolio.</p>
          <div className="not-found-actions">
            <Link className="button button-dark" href="/">Back to home <span aria-hidden="true">↗</span></Link>
            <a className="not-found-text-link" href="mailto:sajjadhaider1016@gmail.com">Get in touch <span aria-hidden="true">→</span></a>
          </div>
          <span className="not-found-code">ERROR 404 <i /> PAGE NOT FOUND</span>
        </div>
      </section>

      <footer className="not-found-footer"><span>SAJJAD HAIDER</span><span>AI, web development, and automation.</span><Link href="/">Return to portfolio ↑</Link></footer>
    </main>
  );
}
