import Header from '@/components/sections/header';
import Hero from '@/components/sections/hero';
import Highlights from '@/components/sections/highlights';
import Services from '@/components/sections/services';
import Portfolio from '@/components/sections/portfolio';
import Testimonials from '@/components/sections/testimonials';
import Contact from '@/components/sections/contact';
import Footer from '@/components/sections/footer';
import AnimatedContent from '@/components/ui/animated-content';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <Hero />
        <AnimatedContent>
          <Highlights />
        </AnimatedContent>
        <AnimatedContent>
          <Services />
        </AnimatedContent>
        <AnimatedContent>
          <Portfolio />
        </AnimatedContent>
        <AnimatedContent>
          <Testimonials />
        </AnimatedContent>
        <AnimatedContent>
          <Contact />
        </AnimatedContent>
      </main>
      <Footer />
    </div>
  );
}
