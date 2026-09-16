import { prisma } from '../config/prisma';

const tables = [
  'User',
  'UserSession',
  'Address',
  'Category',
  'Product',
  'Wishlist',
  'Coupon',
  'CouponUsage',
  'Order',
  'OrderItem',
  'CartItem',
  'NewsletterSubscriber',
  'Testimonial',
];

async function enableRls() {
  console.log('[Supabase Security] Enabling Row Level Security (RLS) on all public tables...');

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`✓ RLS activado en la tabla: ${table}`);
    } catch (err: any) {
      console.warn(`! Advertencia al activar RLS en ${table}:`, err?.message || err);
    }
  }

  // Crear políticas de lectura pública segura para tablas de catálogo público (Product, Category, Testimonial)
  const readPolicies = [
    { table: 'Category', policy: 'Public_Read_Category' },
    { table: 'Product', policy: 'Public_Read_Product' },
    { table: 'Testimonial', policy: 'Public_Read_Testimonial' },
  ];

  for (const item of readPolicies) {
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${item.table}' AND policyname = '${item.policy}'
          ) THEN
            CREATE POLICY "${item.policy}" ON "${item.table}" FOR SELECT USING (true);
          END IF;
        END $$;
      `);
      console.log(`✓ Política de lectura pública verificada para: ${item.table}`);
    } catch (err: any) {
      console.warn(`! Error configurando política en ${item.table}:`, err?.message || err);
    }
  }

  console.log('🎉 [Supabase Security] Proceso completado exitosamente. Alertas RLS corregidas.');
  await prisma.$disconnect();
}

enableRls().catch((err) => {
  console.error('Error ejecutando script de seguridad RLS:', err);
  process.exit(1);
});

