import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { initStore, getStore } from './store';
import { categoriesSeed } from './categories';
import { productsSeed } from './products';
import { usersSeed } from './users';
import { couponsSeed, testimonialsSeed } from './coupons';

const run = async (): Promise<void> => {
  if (env.prismaEnabled) {
    console.log('[seed] Seeding Supabase / Prisma database...');

    for (const c of categoriesSeed) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          sortOrder: c.sortOrder,
        },
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.imageUrl,
          sortOrder: c.sortOrder,
        },
      });
    }

    for (const p of productsSeed) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          nameEn: p.nameEn,
          slug: p.slug,
          description: p.description,
          descriptionEn: p.descriptionEn,
          longDescription: p.longDescription,
          longDescriptionEn: p.longDescriptionEn,
          categoryId: p.categoryId,
          brand: p.brand,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          sku: p.sku,
          stock: p.stock,
          material: p.material,
          materialEn: p.materialEn,
          color: p.color,
          colorEn: p.colorEn,
          dimensions: p.dimensions as any,
          weight: p.weight,
          featured: p.featured,
          isActive: p.isActive,
          rating: p.rating,
          reviewCount: p.reviewCount,
          tags: p.tags,
          tagsEn: p.tagsEn,
        },
        create: {
          id: p.id,
          name: p.name,
          nameEn: p.nameEn,
          slug: p.slug,
          description: p.description,
          descriptionEn: p.descriptionEn,
          longDescription: p.longDescription,
          longDescriptionEn: p.longDescriptionEn,
          categoryId: p.categoryId,
          brand: p.brand,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images,
          sku: p.sku,
          stock: p.stock,
          material: p.material,
          materialEn: p.materialEn,
          color: p.color,
          colorEn: p.colorEn,
          dimensions: p.dimensions as any,
          weight: p.weight,
          featured: p.featured,
          isActive: p.isActive,
          rating: p.rating,
          reviewCount: p.reviewCount,
          tags: p.tags,
          tagsEn: p.tagsEn,
        },
      });
    }

    for (const u of usersSeed) {
      const passwordHash = await hashPassword(u.plainPassword);
      await prisma.user.upsert({
        where: { email: u.email.toLowerCase() },
        update: {
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
          role: u.role,
        },
        create: {
          email: u.email.toLowerCase(),
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone,
          role: u.role,
          addresses: {
            create: u.addresses,
          },
        },
      });
    }

    for (const cp of couponsSeed) {
      await prisma.coupon.upsert({
        where: { code: cp.code },
        update: {
          type: cp.type,
          value: cp.value,
          minSubtotal: cp.minSubtotal,
          maxDiscount: cp.maxDiscount,
          expiresAt: cp.expiresAt ? new Date(cp.expiresAt) : null,
          isActive: cp.isActive,
          usageLimit: cp.usageLimit,
        },
        create: {
          code: cp.code,
          type: cp.type,
          value: cp.value,
          minSubtotal: cp.minSubtotal,
          maxDiscount: cp.maxDiscount,
          expiresAt: cp.expiresAt ? new Date(cp.expiresAt) : null,
          isActive: cp.isActive,
          usageLimit: cp.usageLimit,
        },
      });
    }

    for (const t of testimonialsSeed) {
      await prisma.testimonial.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
        },
        create: {
          id: t.id,
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
        },
      });
    }

    console.log('[seed] Supabase / Prisma database seeded successfully.');
    return;
  }

  await initStore();
  const store = getStore();
  console.log('[seed] Store initialized (InMemory)');
  console.log(`[seed] users:        ${store.users.length}`);
  console.log(`[seed] categories:   ${store.categories.length}`);
  console.log(`[seed] products:     ${store.products.length}`);
  console.log(`[seed] coupons:      ${store.coupons.length}`);
  console.log(`[seed] testimonials: ${store.testimonials.length}`);
};

run().catch((err) => {
  console.error('[seed] Failed to seed database:', err);
  process.exit(1);
});
