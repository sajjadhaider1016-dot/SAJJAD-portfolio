import { getSettings } from "@/lib/store";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-2xl py-16">
      <p className="text-sm tracking-[0.3em] text-accent">CHINA VIBES</p>
      <h1 className="mt-4 font-display text-4xl">Technology That Fits Your Vibe.</h1>
      <p className="mt-6 text-muted">
        CHINA VIBES is a consumer electronics and accessories store focused on everyday audio, charging, and mobile tech.
        We keep product details, pricing, and stock in the catalogue so what you see is what the store is actually selling.
      </p>
      <p className="mt-4 text-muted">Questions: {settings.email}</p>
    </div>
  );
}
