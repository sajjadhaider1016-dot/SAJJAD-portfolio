"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <p className="eyebrow">A pause in the tour</p>
      <h1>The portfolio could not finish opening.</h1>
      <p>The destinations remain available after a retry. You can reload the page if the issue continues.</p>
      <button className="button button-dark" onClick={reset}>Try again <span aria-hidden="true">↗</span></button>
      <a href="mailto:sajjadhaider1016@gmail.com">Email Sajjad directly</a>
    </main>
  );
}
