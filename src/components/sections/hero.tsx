"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section id="home" className="relative h-dvh min-h-[700px] w-full flex items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background"></div>
            </div>

            <div className="relative z-10 container px-4 md:px-6">
                <div className="flex flex-col items-center">
                    <div>
                      <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl !leading-tight">
                          Powering Your Business with Smart IT Solutions
                      </h1>
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
                            <Button asChild size="lg" variant="outline">
                                <Link href="#contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
