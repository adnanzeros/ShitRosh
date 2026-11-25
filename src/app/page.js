import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import { Trust, Story, Process, Why, Testimonials, HowTo, Faq } from "@/components/home/Sections";
import Products from "@/components/products/Products";
import OrderForm from "@/components/order/OrderForm";
import { announcement } from "@/data/content";

export default function Home() {
  return (
    <>
      <div className="announce">{announcement}</div>
      <Navbar />
      <main>
        <Hero /><Trust /><Products /><Story /><Process /><Why /><Testimonials /><HowTo /><OrderForm /><Faq />
      </main>
      <Footer />
    </>
  );
}
