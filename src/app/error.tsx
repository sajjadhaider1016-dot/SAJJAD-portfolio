"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-3 text-muted">Please try again. If this continues, contact support.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-text px-5 py-2 text-sm text-bg">
        Try again
      </button>
    </main>
  );
}
