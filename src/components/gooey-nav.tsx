"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const navItems = ["Home", "Services", "Portfolio", "Testimonials", "Contact"];

const GooeyNav: React.FC = () => {
    const navRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const links = gsap.utils.toArray<HTMLElement>('.nav-link');
        
        function moveIndicator(link: HTMLElement) {
            if (indicatorRef.current) {
                gsap.to(indicatorRef.current, {
                    x: link.offsetLeft,
                    width: link.offsetWidth,
                    duration: 0.4,
                    ease: 'power3.out'
                });
            }
        }
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => moveIndicator(link));
        });

        if (navRef.current) {
            navRef.current.addEventListener('mouseleave', () => {
                if (indicatorRef.current) {
                    gsap.to(indicatorRef.current, {
                        width: 0,
                        duration: 0.4,
                        ease: 'power3.in'
                    });
                }
            });
        }
    }, { scope: navRef });

    return (
        <div className="relative">
            <svg width="0" height="0" className="absolute">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>
            <nav ref={navRef} className="relative flex items-center" style={{ filter: 'url(#goo)' }}>
                <div ref={indicatorRef} className="absolute h-full bg-primary rounded-full top-0 left-0" style={{ width: 0 }} />
                {navItems.map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="nav-link relative z-10 px-5 py-2 text-sm font-medium transition-colors"
                    >
                       <span className="mix-blend-difference text-white">{item}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default GooeyNav;
