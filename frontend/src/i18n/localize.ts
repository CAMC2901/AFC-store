import type {
  CartLine,
  Category,
  OrderItem,
  Product,
  Testimonial,
} from '@/types';
import type { Locale } from './locale';

/**
 * Resolve the localized variant of a pair of fields. The `es` variant is the
 * canonical one; when the active locale is `en` we fall back to the base value
 * if no English variant is present.
 */
function pick<T>(base: T, en?: T, locale?: Locale, english = true): T {
  return english ? (en ?? base) : base;
}

const isEn = (locale: Locale) => locale === 'en';

/** Returns a shallow copy of `product` with text fields localized for `locale`. */
export function localizeProduct(product: Product, locale: Locale): Product {
  const en = isEn(locale);
  return {
    ...product,
    name: pick(product.name, product.nameEn, locale, en),
    description: pick(product.description, product.descriptionEn, locale, en),
    longDescription: pick(product.longDescription, product.longDescriptionEn, locale, en),
    categoryName: pick(product.categoryName, product.categoryNameEn, locale, en),
    material: pick(product.material, product.materialEn, locale, en),
    color: pick(product.color, product.colorEn, locale, en),
    tags: pick(product.tags, product.tagsEn, locale, en),
    dimensions: product.dimensions
      ? {
          ...product.dimensions,
          assembly: pick(product.dimensions.assembly, product.dimensions.assemblyEn, locale, en),
        }
      : undefined,
  };
}

/** Returns a localized copy of `category`. */
export function localizeCategory(category: Category, locale: Locale): Category {
  const en = isEn(locale);
  return {
    ...category,
    name: pick(category.name, category.nameEn, locale, en),
    description: pick(category.description, category.descriptionEn, locale, en),
  };
}

/** Returns a localized copy of `testimonial`. */
export function localizeTestimonial(testimonial: Testimonial, locale: Locale): Testimonial {
  const en = isEn(locale);
  return {
    ...testimonial,
    role: pick(testimonial.role, testimonial.roleEn, locale, en),
    content: pick(testimonial.content, testimonial.contentEn, locale, en),
  };
}

/** Returns a localized copy of a cart line (name only). */
export function localizeCartLine(line: CartLine, locale: Locale): CartLine {
  const en = isEn(locale);
  return { ...line, name: pick(line.name, line.nameEn, locale, en) };
}

/** Returns a localized copy of an order item (name only). */
export function localizeOrderItem(item: OrderItem, locale: Locale): OrderItem {
  const en = isEn(locale);
  return { ...item, name: pick(item.name, item.nameEn, locale, en) };
}