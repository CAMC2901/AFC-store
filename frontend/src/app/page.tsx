import { Hero, TrustBar } from '@/components/home/Hero';
import { BrandStrip } from '@/components/home/BrandStrip';
import { CategoriesShowcase } from '@/components/home/CategoriesShowcase';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Promotions } from '@/components/home/Promotions';
import { Testimonials } from '@/components/home/Testimonials';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Muebles premium y diseño de interiores',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <BrandStrip />
      <FeaturedProducts />
      <CategoriesShowcase />
      <Promotions />
      <Testimonials />
    </>
  );
}
