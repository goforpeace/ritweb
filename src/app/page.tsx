import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Highlights from '@/components/sections/highlights';
import Services from '@/components/sections/services';
import Portfolio from '@/components/sections/portfolio';
import Testimonials from '@/components/sections/testimonials';
import Contact from '@/components/sections/contact';
import Footer from '@/components/sections/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <Hero />
        <Highlights />
        <Services />
        <Portfolio />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
