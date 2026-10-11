import Link from "next/link";

export function Logo({ name = "CHINA VIBES" }: { name?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${name} home`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-text text-[11px] font-bold tracking-tight text-bg">
        CV
      </span>
      <span className="font-display text-sm font-semibold tracking-[0.18em]">{name}</span>
    </Link>
  );
}
