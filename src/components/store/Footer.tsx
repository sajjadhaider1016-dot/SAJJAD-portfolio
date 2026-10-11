import Link from "next/link";
import { Logo } from "./Logo";

export function Footer({
  settings,
  categories,
}: {
  settings: {
    storeName: string;
    tagline: string;
    email: string;
    facebookUrl: string;
    instagramUrl: string;
  };
  categories: { name: string; slug: string }[];
}) {
  return (
    <footer className="mt-20 border-t border-border bg-bg-elevated">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Logo name={settings.storeName} />
          <p className="mt-4 max-w-xs text-sm text-muted">{settings.tagline} Premium electronics and accessories for everyday life.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/shop">All products</Link></li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/categories/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Support</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/legal/shipping">Shipping Policy</Link></li>
            <li><Link href="/legal/returns">Return Policy</Link></li>
            <li><Link href="/legal/privacy">Privacy Policy</Link></li>
            <li><Link href="/legal/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            <li><a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </p>
    </footer>
  );
}
