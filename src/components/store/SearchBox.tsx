"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBox({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial);
  const [hints, setHints] = useState<{ name: string; slug: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (q.length < 2) {
      setHints([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setHints(await res.json());
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <form
      className="relative mt-6 max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search AirPods, headphones, chargers..."
        className="w-full rounded-full border border-border bg-bg-elevated px-5 py-3"
        aria-label="Search products"
      />
      {hints.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-bg-elevated">
          {hints.map((hint) => (
            <li key={hint.slug}>
              <button type="button" className="w-full px-4 py-2 text-left text-sm" onClick={() => router.push(`/products/${hint.slug}`)}>
                {hint.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
