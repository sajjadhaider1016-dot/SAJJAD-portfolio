import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ number }: { number?: string | null }) {
  if (!number) return null;
  const href = `https://wa.me/${number.replace(/[^\d]/g, "")}`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-black shadow-lg"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
    </Link>
  );
}
