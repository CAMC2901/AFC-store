/**
 * Seed script: initializes the in-memory store and prints a summary.
 * Replace with `prisma db seed` once PostgreSQL is enabled.
 */
import { initStore } from './store';
import { getStore } from './store';

const run = async (): Promise<void> => {
  await initStore();
  const store = getStore();
  console.log('[seed] store initialized');
  console.log(`[seed] users:        ${store.users.length}`);
  console.log(`[seed] categories:   ${store.categories.length}`);
  console.log(`[seed] products:     ${store.products.length}`);
  console.log(`[seed] coupons:      ${store.coupons.length}`);
  console.log(`[seed] testimonials: ${store.testimonials.length}`);
  console.log(
    `[seed] demo accounts:\n  admin    -> admin@afcfurniture.com / Admin@1234\n  customer -> customer@afcfurniture.com / Customer@1234`
  );
};

run().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
