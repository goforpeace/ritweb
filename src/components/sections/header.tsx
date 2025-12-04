"use client";

import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = ["Home", "Services", "Portfolio", "Testimonials", "Contact"];

const Header = () => {
    const [isSheetOpen, setSheetOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const { user, isUserLoading } = useUser();
    const { auth } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const handleLogout = () => {
        auth.signOut();
        router.push('/');
    };

    const NavLinks = () => (
        <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
                <Link
                    key={item}
                    href={`/#${item.toLowerCase()}`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={(e) => {
                        if(window.location.pathname !== '/') {
                            e.preventDefault();
                            router.push(`/#${item.toLowerCase()}`);
                        }
                    }}
                >
                    {item}
                </Link>
            ))}
        </nav>
    );

    return (
        <header className={cn(
            "sticky top-0 z-40 w-full transition-all duration-300",
            hasScrolled ? "border-b border-border/40 bg-background/95 backdrop-blur-sm" : "bg-transparent"
        )}>
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center" aria-label="Remotized IT Home">
                    <Image src="https://res.cloudinary.com/dj4lirc0d/image/upload/v1764888498/Artboard_5_2x_otkwum.png" alt="Remotized IT Logo" width={200} height={50} />
                </Link>
                
                <div className="flex items-center gap-6">
                    <NavLinks />
                    {!isUserLoading && user && (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="secondary">
                                <Link href="/kothakom">Dashboard</Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
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
                                        href={`/#${item.toLowerCase()}`}
                                        className="text-3xl font-medium transition-colors hover:text-primary"
                                        onClick={(e) => {
                                            setSheetOpen(false)
                                            if(window.location.pathname !== '/') {
                                                e.preventDefault();
                                                router.push(`/#${item.toLowerCase()}`);
                                            }
                                        }}
                                    >
                                        {item}
                                    </Link>
                                ))}
                                 {!isUserLoading && user && (
                                    <div className="flex flex-col gap-4 mt-8">
                                        <Link href="/kothakom" className="text-3xl font-medium" onClick={() => setSheetOpen(false)}>Dashboard</Link>
                                        <button onClick={() => { handleLogout(); setSheetOpen(false); }} className="text-3xl font-medium text-left">Logout</button>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

export default Header;
