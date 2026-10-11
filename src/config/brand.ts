/** Central brand tokens. Recolor the store by changing CSS variables in globals.css. */
export const brand = {
  name: "China Vibes",
  legalName: "China Vibes",
  tagline: "Wireless audio, designed with restraint.",
  description:
    "China Vibes is a consumer electronics store for wireless earbuds, TWS, headphones, charging cases, and audio accessories.",
  emailPlaceholder: "hello@example.com",
  industry: "Consumer electronics / wireless audio",
} as const;

export const categorySlugs = {
  earbuds: "wireless-earbuds",
  tws: "tws",
  headphones: "headphones",
  accessories: "accessories",
} as const;
