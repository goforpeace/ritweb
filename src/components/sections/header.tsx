"use client";

import Link from 'next/link';
import { Code, Menu } from 'lucide-react';
import GooeyNav from '@/components/gooey-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = ["Home", "Services", "Portfolio", "Testimonials", "Contact"];

const Header = () => {
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "sticky top-0 z-40 w-full transition-all duration-300",
            hasScrolled ? "border-b border-border/40 bg-background/95 backdrop-blur-sm" : "bg-transparent"
        )}>
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                <Link href="#home" className="flex items-center gap-2" aria-label="Remotized IT Home">
                    <Code className="h-7 w-7 text-primary" />
                    <span className="text-xl font-bold">Remotized IT</span>
                </Link>
                
                <div className="hidden md:block">
                    <GooeyNav />
                </div>
                
                <div className="md:hidden">
                    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <nav className="flex flex-col items-start justify-center h-full gap-8 pl-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="text-3xl font-medium transition-colors hover:text-primary"
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;
