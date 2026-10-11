import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
  download?: boolean | string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  external,
  download,
}: ButtonProps) {
  const isExternal = external ?? /^(https?:|mailto:)/.test(href);
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
    variant === "primary" &&
      "bg-accent text-white shadow-[0_10px_30px_var(--glow)] hover:-translate-y-0.5 hover:brightness-110",
    variant === "secondary" &&
      "border border-border bg-surface text-text hover:-translate-y-0.5 hover:border-accent/40",
    variant === "ghost" && "text-muted hover:text-text",
    className,
  );

  if (!isExternal && !download) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      {...(isExternal && !href.startsWith("mailto:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...(download ? { download: typeof download === "string" ? download : true } : {})}
    >
      {children}
    </a>
  );
}
