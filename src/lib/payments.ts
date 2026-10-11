export type PaymentMethodId = "COD" | "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH" | "CARD";

export type PaymentConfig = {
  methods: {
    COD: { enabled: boolean; note: string };
    BANK_TRANSFER: {
      enabled: boolean;
      bankName: string;
      accountTitle: string;
      accountNumber: string;
      iban: string;
      instructions: string;
    };
    EASYPAISA: { enabled: boolean; accountTitle: string; accountNumber: string; instructions: string };
    JAZZCASH: { enabled: boolean; accountTitle: string; accountNumber: string; instructions: string };
    CARD: { enabled: boolean; provider: string; instructions: string };
  };
};

export type PaymentProvider = {
  id: PaymentMethodId;
  label: string;
  isAvailable: (config: PaymentConfig, env: NodeJS.ProcessEnv) => boolean;
};

export const paymentProviders: PaymentProvider[] = [
  {
    id: "COD",
    label: "Cash on delivery",
    isAvailable: (config) => config.methods.COD.enabled,
  },
  {
    id: "BANK_TRANSFER",
    label: "Bank transfer",
    isAvailable: (config) => config.methods.BANK_TRANSFER.enabled,
  },
  {
    id: "EASYPAISA",
    label: "Easypaisa",
    isAvailable: (config) => config.methods.EASYPAISA.enabled,
  },
  {
    id: "JAZZCASH",
    label: "JazzCash",
    isAvailable: (config) => config.methods.JAZZCASH.enabled,
  },
  {
    id: "CARD",
    label: "Card",
    isAvailable: (config, env) => config.methods.CARD.enabled && Boolean(env.STRIPE_SECRET_KEY),
  },
];

export function enabledPaymentMethods(config: PaymentConfig, env: NodeJS.ProcessEnv = process.env) {
  return paymentProviders.filter((provider) => provider.isAvailable(config, env));
}

export const defaultPaymentConfig = (): PaymentConfig => ({
  methods: {
    COD: {
      enabled: true,
      note: "Pay when your order arrives.",
    },
    BANK_TRANSFER: {
      enabled: false,
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      instructions: "Transfer the order total and share the receipt with support. Details are configured in admin settings.",
    },
    EASYPAISA: {
      enabled: false,
      accountTitle: "",
      accountNumber: "",
      instructions: "Send payment to the configured Easypaisa account after placing your order.",
    },
    JAZZCASH: {
      enabled: false,
      accountTitle: "",
      accountNumber: "",
      instructions: "Send payment to the configured JazzCash account after placing your order.",
    },
    CARD: {
      enabled: false,
      provider: "stripe",
      instructions: "Card checkout is enabled only when a payment provider secret is configured on the server.",
    },
  },
});

export const defaultLegal = {
  privacyPolicy: `Privacy Policy

China Vibes collects only the information needed to process orders, support customers, and improve the store. This typically includes your name, email, phone number, delivery address, and order history.

We do not sell personal information. Payment card numbers and CVV codes are never stored on our servers. If a payment provider is connected later, card data is handled by that provider.

You can request access to or deletion of your account data using the contact email published on this site.

This policy may be updated from the admin panel as the business grows.`,
  terms: `Terms & Conditions

By placing an order on the China Vibes website you agree to provide accurate contact and delivery information and to pay for confirmed orders using the selected payment method.

Product availability, pricing, and promotions can change. Orders are subject to confirmation and stock. We may cancel an order if an item cannot be fulfilled, a payment cannot be verified, or information appears incomplete or fraudulent.

These terms do not claim affiliation with other electronics brands unless that relationship is stated by China Vibes in writing.`,
  shippingPolicy: `Shipping Policy

Delivery options, fees, and timelines are shown at checkout and can be updated by the store owner in settings. Shipping fees and free-shipping thresholds are configurable and should be treated as the current offer, not a permanent guarantee.

Once an order is marked shipped, tracking or delivery notes may be shared using the contact details on the order.`,
  returnPolicy: `Return & Refund Policy

If an item arrives damaged, incorrect, or not as described, contact China Vibes as soon as possible with your order number and photos. Approved returns and refunds are processed according to the order and payment status in the admin panel.

Opened or used accessories may not be eligible unless the product is defective. Final eligibility is confirmed by the store after reviewing the request.`,
};
