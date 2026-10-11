import { notFound } from "next/navigation";
import { getSettings } from "@/lib/store";

const pages = {
  privacy: { title: "Privacy Policy", key: "privacyPolicy" as const },
  terms: { title: "Terms & Conditions", key: "terms" as const },
  shipping: { title: "Shipping Policy", key: "shippingPolicy" as const },
  returns: { title: "Return & Refund Policy", key: "returnPolicy" as const },
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();
  const settings = await getSettings();
  return (
    <article className="mx-auto max-w-3xl py-16">
      <h1 className="font-display text-4xl">{page.title}</h1>
      <div className="mt-8 whitespace-pre-wrap text-sm leading-7 text-muted">{settings[page.key]}</div>
    </article>
  );
}
