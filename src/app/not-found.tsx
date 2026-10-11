import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="text-sm tracking-[0.2em] text-accent uppercase">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">That page is not part of the CHINA VIBES store.</p>
      <Link href="/" className="mt-8 inline-block text-sm text-accent">
        Back home
      </Link>
    </main>
  );
}
