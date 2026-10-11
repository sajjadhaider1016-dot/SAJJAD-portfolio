import { PrismaClient, DiscountType, Role, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultLegal, defaultPaymentConfig } from "../src/lib/payments";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@chinavibes.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisPassword123!";

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      payments: defaultPaymentConfig(),
      ...defaultLegal,
    },
    update: {},
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, adminRole: AdminRole.SUPER_ADMIN, isActive: true },
    create: {
      name: "CHINA VIBES Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      adminRole: AdminRole.SUPER_ADMIN,
    },
  });

  const categoryData = [
    { name: "AirPods", slug: "airpods", description: "True wireless earbuds and charging cases." },
    { name: "Headphones", slug: "headphones", description: "Over-ear and on-ear listening." },
    { name: "Earbuds", slug: "earbuds", description: "Everyday wireless earbuds." },
    { name: "Speakers", slug: "speakers", description: "Portable Bluetooth speakers." },
    { name: "Chargers", slug: "chargers", description: "Fast chargers and power adapters." },
    { name: "Cables", slug: "cables", description: "USB-C and charging cables." },
    { name: "Accessories", slug: "accessories", description: "Cases, mounts, and extras." },
  ];

  const categories = [];
  for (const [index, item] of categoryData.entries()) {
    categories.push(
      await prisma.category.upsert({
        where: { slug: item.slug },
        update: { name: item.name, description: item.description, isActive: true, sortOrder: index },
        create: { ...item, isActive: true, sortOrder: index },
      }),
    );
  }

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const products = [
    {
      name: "AirPods Pro (Demo)",
      slug: "airpods-pro",
      sku: "DEMO-AP-PRO",
      categoryId: bySlug.airpods,
      brand: "CHINA VIBES",
      tags: ["airpods", "wireless", "demo"],
      shortDescription: "Sample listing for active noise-cancelling wireless earbuds.",
      description:
        "This is a demo/sample product used to preview the store. Replace or delete it from the admin panel before selling live inventory.",
      specifications: [
        { key: "Type", value: "True wireless earbuds" },
        { key: "Connectivity", value: "Bluetooth" },
        { key: "Note", value: "Demo product — not live inventory" },
      ],
      price: 24999,
      salePrice: 21999,
      stock: 18,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      name: "Wireless Headphones (Demo)",
      slug: "wireless-headphones",
      sku: "DEMO-HP-01",
      categoryId: bySlug.headphones,
      brand: "CHINA VIBES",
      tags: ["headphones", "demo"],
      shortDescription: "Sample over-ear wireless headphones listing.",
      description: "Demo/sample product for the headphones category. Remove from admin when you add real stock.",
      specifications: [{ key: "Type", value: "Over-ear wireless" }, { key: "Note", value: "Demo product" }],
      price: 12999,
      salePrice: null,
      stock: 12,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: "Bluetooth Earbuds (Demo)",
      slug: "bluetooth-earbuds",
      sku: "DEMO-EB-01",
      categoryId: bySlug.earbuds,
      brand: "CHINA VIBES",
      tags: ["earbuds", "demo"],
      shortDescription: "Sample everyday wireless earbuds.",
      description: "Demo/sample product. Update price, stock, and photos in admin before publishing as a live item.",
      specifications: [{ key: "Type", value: "In-ear wireless" }, { key: "Note", value: "Demo product" }],
      price: 4999,
      salePrice: 3999,
      stock: 40,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: "Fast Charger (Demo)",
      slug: "fast-charger",
      sku: "DEMO-CH-01",
      categoryId: bySlug.chargers,
      brand: "CHINA VIBES",
      tags: ["charger", "demo"],
      shortDescription: "Sample fast wall charger listing.",
      description: "Demo/sample product for chargers. Confirm wattage and compatibility before selling.",
      specifications: [{ key: "Type", value: "Wall charger" }, { key: "Note", value: "Demo product" }],
      price: 2499,
      salePrice: null,
      stock: 50,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      name: "USB-C Cable (Demo)",
      slug: "usb-c-cable",
      sku: "DEMO-CB-01",
      categoryId: bySlug.cables,
      brand: "CHINA VIBES",
      tags: ["cable", "usb-c", "demo"],
      shortDescription: "Sample USB-C charging cable.",
      description: "Demo/sample product. Replace with your actual cable specifications and photos.",
      specifications: [{ key: "Connector", value: "USB-C" }, { key: "Note", value: "Demo product" }],
      price: 899,
      salePrice: 699,
      stock: 80,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: "Bluetooth Speaker (Demo)",
      slug: "bluetooth-speaker",
      sku: "DEMO-SP-01",
      categoryId: bySlug.speakers,
      brand: "CHINA VIBES",
      tags: ["speaker", "demo"],
      shortDescription: "Sample portable Bluetooth speaker.",
      description: "Demo/sample product for speakers. Delete from admin after you add real catalogue items.",
      specifications: [{ key: "Type", value: "Portable Bluetooth speaker" }, { key: "Note", value: "Demo product" }],
      price: 7999,
      salePrice: 6499,
      stock: 15,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, isDemo: true, isActive: true },
      create: { ...product, isDemo: true, isActive: true },
    });
    const imageCount = await prisma.productImage.count({ where: { productId: created.id } });
    if (imageCount === 0) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: `/demo/${product.slug}.svg`,
          alt: product.name,
          sortOrder: 0,
        },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "VIBE10" },
    update: {},
    create: {
      code: "VIBE10",
      type: DiscountType.PERCENTAGE,
      value: 10,
      minOrderAmount: 3000,
      usageLimit: 100,
      isActive: true,
    },
  });

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
