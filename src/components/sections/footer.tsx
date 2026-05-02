import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-[#4A4A4A] text-[#FFFFE3]">
            <div className="container mx-auto px-4 md:px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center" aria-label="Remotized IT Home">
                          <Image src="https://res.cloudinary.com/dj4lirc0d/image/upload/v1764888498/Artboard_5_2x_otkwum.png" alt="Remotized IT Logo" width={220} height={55} className="brightness-0 invert" />
                        </Link>
                        <p className="text-[#CBCBCB] max-w-sm leading-relaxed font-medium">
                            Powering business continuity through innovative remote infrastructure management and strategic IT consulting.
                        </p>
                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" size="icon" className="rounded-full border-[#CBCBCB] text-[#FFFFE3] hover:bg-[#FFFFE3] hover:text-[#4A4A4A] transition-colors">
                                <Link href="#" aria-label="Twitter"><Twitter className="h-4 w-4" /></Link>
                            </Button>
                            <Button asChild variant="outline" size="icon" className="rounded-full border-[#CBCBCB] text-[#FFFFE3] hover:bg-[#FFFFE3] hover:text-[#4A4A4A] transition-colors">
                                <Link href="#" aria-label="GitHub"><Github className="h-4 w-4" /></Link>
                            </Button>
                            <Button asChild variant="outline" size="icon" className="rounded-full border-[#CBCBCB] text-[#FFFFE3] hover:bg-[#FFFFE3] hover:text-[#4A4A4A] transition-colors">
                                <Link href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-black uppercase text-xs tracking-widest text-[#6D8196]">Solutions</h4>
                        <nav className="flex flex-col gap-3 text-sm font-bold text-[#CBCBCB]">
                            <Link href="#services" className="hover:text-white transition-colors">Managed Services</Link>
                            <Link href="#services" className="hover:text-white transition-colors">Cybersecurity</Link>
                            <Link href="#services" className="hover:text-white transition-colors">Cloud Migration</Link>
                            <Link href="#services" className="hover:text-white transition-colors">Data Recovery</Link>
                        </nav>
                    </div>
                    <div className="space-y-6">
                        <h4 className="font-black uppercase text-xs tracking-widest text-[#6D8196]">Company</h4>
                        <nav className="flex flex-col gap-3 text-sm font-bold text-[#CBCBCB]">
                            <Link href="#portfolio" className="hover:text-white transition-colors">Our Portfolio</Link>
                            <Link href="#testimonials" className="hover:text-white transition-colors">Client Reviews</Link>
                            <Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link>
                            <Link href="/cmi" className="hover:text-white transition-colors">Admin Portal</Link>
                        </nav>
                    </div>
                </div>
                <div className="pt-8 border-t border-[#CBCBCB]/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#CBCBCB] font-medium tracking-wide">
                        &copy; {new Date().getFullYear()} REMOTIZED IT. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-[#6D8196]">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;