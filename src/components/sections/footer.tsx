import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center" aria-label="Remotized IT Home">
                      <Image src="https://res.cloudinary.com/dj4lirc0d/image/upload/v1764888498/Artboard_5_2x_otkwum.png" alt="Remotized IT Logo" width={160} height={40} />
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Remotized IT. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="#" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                            <Link href="#" aria-label="GitHub">
                                <Github className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                            <Link href="#" aria-label="LinkedIn">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
