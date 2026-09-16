import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types';
import { productsSeed } from './products';
import { round2 } from '../utils/helpers';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, TAX_RATE } from '../constants';

/**
 * Órdenes iniciales para dar vida al panel de administración.
 *
 * Se generan con fechas relativas a "ahora" (spread en los últimos ~9 semanas)
 * para que las gráficas de tendencia, ventas por categoría y top de ventas
 * tengan información real desde el primer arranque.
 */
const DAY = 86_400_000;
const now = Date.now();

const productById = new Map(productsSeed.map((p) => [p.id, p]));

const daysAgo = (days: number, extraMinutes = 0): string =>
  new Date(now - days * DAY + extraMinutes * 60_000).toISOString();

const line = (productId: string, quantity: number): OrderItem => {
  const product = productById.get(productId);
  if (!product) {
    throw new Error(`ordersSeed: unknown product "${productId}"`);
  }
  return {
    productId,
    name: product.name,
    nameEn: product.nameEn,
    image: product.images[0],
    sku: product.sku,
    unitPrice: product.price,
    quantity,
    subtotal: round2(product.price * quantity),
  };
};

interface OrderSpec {
  days: number;
  status: OrderStatus;
  payment: PaymentStatus;
  items: Array<[string, number]>;
}

const specs: OrderSpec[] = [
  { days: 62, status: 'DELIVERED', payment: 'PAID', items: [['prd_05', 1], ['prd_13', 1]] },
  { days: 58, status: 'DELIVERED', payment: 'PAID', items: [['prd_04', 1]] },
  { days: 55, status: 'DELIVERED', payment: 'PAID', items: [['prd_15', 1], ['prd_18', 1]] },
  { days: 51, status: 'DELIVERED', payment: 'PAID', items: [['prd_06', 1]] },
  { days: 48, status: 'DELIVERED', payment: 'PAID', items: [['prd_10', 2], ['prd_09', 1]] },
  { days: 45, status: 'DELIVERED', payment: 'PAID', items: [['prd_01', 1]] },
  { days: 42, status: 'DELIVERED', payment: 'PAID', items: [['prd_16', 1]] },
  { days: 39, status: 'DELIVERED', payment: 'PAID', items: [['prd_11', 1], ['prd_12', 1]] },
  { days: 36, status: 'DELIVERED', payment: 'PAID', items: [['prd_13', 2]] },
  { days: 33, status: 'CANCELLED', payment: 'FAILED', items: [['prd_03', 1]] },
  { days: 31, status: 'DELIVERED', payment: 'PAID', items: [['prd_02', 1]] },
  { days: 28, status: 'DELIVERED', payment: 'PAID', items: [['prd_17', 1], ['prd_18', 1]] },
  { days: 26, status: 'DELIVERED', payment: 'PAID', items: [['prd_14', 1]] },
  { days: 23, status: 'DELIVERED', payment: 'PAID', items: [['prd_08', 1]] },
  { days: 21, status: 'DELIVERED', payment: 'PAID', items: [['prd_20', 1], ['prd_04', 1]] },
  { days: 19, status: 'DELIVERED', payment: 'PAID', items: [['prd_07', 1]] },
  { days: 16, status: 'DELIVERED', payment: 'PAID', items: [['prd_01', 1], ['prd_05', 1]] },
  { days: 14, status: 'SHIPPED', payment: 'PAID', items: [['prd_09', 1]] },
  { days: 12, status: 'DELIVERED', payment: 'PAID', items: [['prd_12', 2]] },
  { days: 10, status: 'DELIVERED', payment: 'PAID', items: [['prd_03', 1], ['prd_18', 1]] },
  { days: 8, status: 'PROCESSING', payment: 'PAID', items: [['prd_06', 1]] },
  { days: 6, status: 'DELIVERED', payment: 'PAID', items: [['prd_15', 1]] },
  { days: 4, status: 'PROCESSING', payment: 'PAID', items: [['prd_16', 1], ['prd_13', 1]] },
  { days: 2, status: 'SHIPPED', payment: 'PAID', items: [['prd_02', 1]] },
  { days: 1, status: 'PENDING', payment: 'PENDING', items: [['prd_19', 1]] },
  { days: 0, status: 'DELIVERED', payment: 'PAID', items: [['prd_01', 1], ['prd_10', 2]] },
];

export const ordersSeed: Order[] = specs.map((spec, index) => {
  const items = spec.items.map(([id, qty]) => line(id, qty));
  const subtotal = round2(items.reduce((sum, i) => sum + i.subtotal, 0));
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const tax = round2(subtotal * TAX_RATE);
  const createdAt = daysAgo(spec.days, index * 13);

  return {
    id: `ord_s${String(index + 1).padStart(2, '0')}`,
    userId: 'usr_2',
    items,
    subtotal,
    shipping,
    discount: 0,
    tax,
    total: round2(subtotal + shipping + tax),
    status: spec.status,
    paymentStatus: spec.payment,
    shippingAddress: {
      label: 'Home',
      line1: '412 Willow Lane',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
    billingAddress: {
      label: 'Home',
      line1: '412 Willow Lane',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
    contact: {
      email: 'customer@afcfurniture.com',
      firstName: 'Felipe',
      lastName: 'Flerez',
      phone: '+1 (555) 300-4000',
    },
    createdAt,
    updatedAt: createdAt,
  };
});