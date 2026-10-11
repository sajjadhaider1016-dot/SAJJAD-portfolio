import { put, del } from "@vercel/blob";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveProductImage(file: File) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Unsupported image format. Use JPG, PNG, WebP, or AVIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const filename = `${crypto.randomUUID()}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${filename}`, optimized, {
      access: "public",
      contentType: "image/webp",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), optimized);
  return `/uploads/products/${filename}`;
}

export async function deleteStoredImage(url: string) {
  if (!url) return;
  try {
    if (url.startsWith("http") && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      return;
    }
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url));
    }
  } catch {
    // Missing files should not block product edits.
  }
}
