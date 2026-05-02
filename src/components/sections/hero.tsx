'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import FloatingLines from '../ui/floating-lines';
import SplitText from '../ui/split-text';
import RequestCallDialog from './request-call-dialog';

const Hero = () => {
  return (
    <section id="home" className="relative h-dvh min-h-[700px] w-full flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <FloatingLines
          linesGradient={['#6D8196', '#CBCBCB', '#4A4A4A']}
          animationSpeed={0.4}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[12, 18, 24]}
          lineDistance={[10, 8, 6]}
          bendRadius={4.0}
          bendStrength={-0.3}
          interactive={true}
          parallax={true}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background"></div>

      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="w-full">
            <SplitText
              tag="h1"
              text="Powering Your Business with Smart IT Solutions"
              className="text-4xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl !leading-tight text-foreground"
              splitType="chars"
              delay={25}
              from={{ opacity: 0, y: 30, scale: 0.95 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              duration={1}
              ease="expo.out"
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl font-medium">
              Proactive management, 24/7 support, and ironclad security for the modern enterprise.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="px-10 h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                <Link href="#services">
                  Our Solutions
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <RequestCallDialog />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;