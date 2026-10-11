"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { contactSchema, newsletterSchema, reviewSchema } from "@/lib/validators";
import { sendContactNotification } from "@/lib/email";
import { rateLimit } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(data: FormData) {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid review." };
  const purchased = await prisma.orderItem.findFirst({
    where: { productId: parsed.data.productId, order: { userId: user.id, status: { in: ["DELIVERED", "SHIPPED"] } } },
  });
  await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: user.id } },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment,
      isApproved: false,
      isHidden: false,
      isVerified: Boolean(purchased),
    },
    create: {
      productId: parsed.data.productId,
      userId: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment,
      isApproved: Boolean(purchased),
      isVerified: Boolean(purchased),
    },
  });
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (product) revalidatePath(`/products/${product.slug}`);
  return { ok: true, message: purchased ? "Review submitted." : "Review submitted and awaiting approval." };
}

export async function contactAction(data: FormData) {
  const parsed = contactSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Please complete the form." };
  const limit = rateLimit(`contact:${parsed.data.email}`, 5, 10 * 60_000);
  if (!limit.ok) return { error: "Please wait before sending another message." };
  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    },
  });
  await sendContactNotification(parsed.data.name, parsed.data.email, parsed.data.message);
  return { ok: true, message: "Message sent. We will get back to you by email." };
}

export async function newsletterAction(data: FormData) {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(data.entries()));
  if (!parsed.success) return { error: "Enter a valid email." };
  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {},
    create: { email: parsed.data.email.toLowerCase() },
  });
  return { ok: true, message: "You’re on the list." };
}
