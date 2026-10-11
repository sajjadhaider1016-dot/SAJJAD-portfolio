/**
 * Temporary studio photography. Replace URLs here (or in admin) without redesigning layouts.
 * Sources are professional product photographs on clean backgrounds.
 */
const u = (id: string, extra = "") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80${extra}`;

export const media = {
  hero: u("photo-1590658268037-6bf12165a8df", "&sat=-20"),
  earbuds: u("photo-1590658268037-6bf12165a8df"),
  earbudsAlt: u("photo-1606220588913-b3aacb4d2f46"),
  tws: u("photo-1572569511254-d8f925fe2cbb"),
  headphones: u("photo-1505740420928-5e560c06d30e"),
  headphonesAlt: u("photo-1484704849700-f032a568e944"),
  case: u("photo-1600298881974-6f060011b387"),
  cable: u("photo-1583394838336-acd977736f90"),
  editorial: u("photo-1487215078519-e21cc028cb29"),
} as const;

export type MediaKey = keyof typeof media;
