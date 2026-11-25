// FILE: src/app/page.js
import LogoHeader from '@/components/layout/LogoHeader';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import {
  Trust,
  Story,
  Process,
  Why,
  Testimonials,
  HowTo,
  Faq,
} from '@/components/home/Sections';
import Products from '@/components/products/Products';
import OrderForm from '@/components/order/OrderForm';
import { getCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic'; // admin changes show up immediately

export default async function Home() {
  const products = await getCatalog();
  return (
    <>
      <LogoHeader />
      <main>
        <Hero products={products} />
        <Trust />
        <Products products={products} />
        <Story />
        <Process />
        <Why />
        <Testimonials />
        <HowTo />
        <OrderForm products={products} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
