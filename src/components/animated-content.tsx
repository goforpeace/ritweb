"use client";

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({ children, className, as: Component = 'div' }) => {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (container.current) {
      gsap.from(container.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          end: 'bottom top',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: container });

  return (
    <Component ref={container} className={className}>
      {children}
    </Component>
  );
};

export default AnimatedContent;
