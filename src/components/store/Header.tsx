"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/store/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({
  cartCount,
  signedIn,
  settings,
}: {
  cartCount: number;
  signedIn: boolean;
  settings: { storeName: string; instagramUrl: string; facebookUrl: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [, start] = useTransition();

  function onSearch(event: FormEvent) {
    event.preventDefault();
    start(() => {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          className="rounded-full p-2 lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <Logo name={settings.storeName} />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${pathname === link.href ? "text-text" : "text-muted hover:text-text"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={onSearch} className="ml-auto hidden min-w-[220px] flex-1 max-w-md md:block">
          <label className="sr-only" htmlFor="search">
            Search products
          </label>
          <div className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              id="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search AirPods, headphones, chargers..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/search" className="rounded-full p-2 md:hidden" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link href={signedIn ? "/account" : "/login"} className="rounded-full p-2" aria-label="Account">
            <User size={20} />
          </Link>
          <Link href="/cart" className="relative rounded-full p-2" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" role="dialog" aria-label="Mobile menu">
          <div className="h-full w-[86%] max-w-sm bg-bg p-6">
            <div className="flex items-center justify-between">
              <Logo name={settings.storeName} />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <X />
              </button>
            </div>
            <nav className="mt-8 grid gap-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg">
                  {link.label}
                </Link>
              ))}
              <Link href="/wishlist" onClick={() => setOpen(false)}>
                Wishlist
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
