import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(20),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  province: z.string().trim().max(80).optional().or(z.literal("")),
  shippingMethod: z.string().trim().max(40).optional().or(z.literal("")),
  instructions: z.string().trim().max(400).optional().or(z.literal("")),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "EASYPAISA", "JAZZCASH", "CARD"]),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().min(2).max(40),
  slug: z.string().trim().max(80).optional(),
  categoryId: z.string().min(1),
  brand: z.string().trim().max(60).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  price: z.coerce.number().positive(),
  salePrice: z.coerce.number().nonnegative().optional().or(z.nan()),
  costPrice: z.coerce.number().nonnegative().optional().or(z.nan()),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  shortDescription: z.string().max(240).optional().or(z.literal("")),
  description: z.string().max(8000).optional().or(z.literal("")),
  specifications: z.string().max(8000).optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().max(400).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().int().positive().optional().or(z.nan()),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  comment: z.string().trim().min(8).max(1000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(120),
});
