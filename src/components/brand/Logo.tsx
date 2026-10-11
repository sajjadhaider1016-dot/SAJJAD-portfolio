import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="CHINA VIBES home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-bg font-display text-sm font-bold">
        CV
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-sm font-semibold tracking-[0.18em]">CHINA VIBES</span>
          <span className="block text-[11px] text-muted">Technology That Fits Your Vibe.</span>
        </span>
      )}
    </Link>
  );
}
