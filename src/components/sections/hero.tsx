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
          linesGradient={['#88FFF2', '#00FFFF']}
          animationSpeed={0.5}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[10, 15, 20]}
          lineDistance={[8, 6, 4]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background"></div>

      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="w-full">
            <SplitText
              tag="h1"
              text="Powering Your Business with Smart IT Solutions"
              className="text-4xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl !leading-tight"
              splitType="chars"
              delay={20}
              from={{ opacity: 0, y: 50, scale: 0.9 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              duration={0.8}
              ease="power3.out"
            />
          </div>
          <div>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              We provide innovative and reliable IT services to help your business thrive in the digital age.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="#services">
                  Get Started
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
