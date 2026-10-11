import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { getSession } from "@/lib/auth";
import { getCart, getSettings } from "@/lib/store";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, session, cart, categories] = await Promise.all([
    getSettings(),
    getSession(),
    getCart(),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <>
      <Header cartCount={cartCount} signedIn={Boolean(session)} settings={settings} />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 sm:px-6">{children}</main>
      <Footer
        settings={settings}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <WhatsAppButton number={settings.whatsappNumber} />
    </>
  );
}
