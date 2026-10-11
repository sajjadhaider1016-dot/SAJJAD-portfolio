export const analyticsIds = {
  ga: process.env.NEXT_PUBLIC_GA_ID || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
};

export type AnalyticsEvent =
  | "view_item"
  | "search"
  | "add_to_cart"
  | "add_to_wishlist"
  | "begin_checkout"
  | "purchase"
  | "sign_up";

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: unknown[]; fbq?: (...args: unknown[]) => void; ttq?: { track: (n: string, p?: unknown) => void } };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
  if (w.fbq) w.fbq("trackCustom", event, payload);
  if (w.ttq) w.ttq.track(event, payload);
}
