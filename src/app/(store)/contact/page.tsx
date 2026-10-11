import { getSettings } from "@/lib/store";
import { ContactForm } from "@/components/store/ContactForm";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div className="py-10">
      <h1 className="font-display text-4xl">CHINA VIBES</h1>
      <p className="mt-4 text-muted">Email: <a href={`mailto:${settings.email}`}>{settings.email}</a></p>
      <div className="mt-4 flex gap-3 text-sm">
        <a href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
        <a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
      </div>
      <ContactForm />
    </div>
  );
}
