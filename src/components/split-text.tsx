"use client";

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SplitTextProps {
  children: string;
  className?: string;
  as?: React.ElementType;
}

const SplitText: React.FC<SplitTextProps> = ({ children, className, as: Component = 'h1' }) => {
  const container = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (container.current) {
      const chars = container.current.querySelectorAll('.char');
      gsap.from(chars, {
        opacity: 0,
        y: '100%',
        stagger: 0.03,
        duration: 1,
        ease: 'power4.out',
      });
    }
  }, { scope: container });

  return (
    <Component ref={container} className={className} aria-label={children}>
      {children.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
          {word.split('').map((char, charIndex) => (
            <span key={charIndex} className="char inline-block" aria-hidden="true">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
};

export default SplitText;
