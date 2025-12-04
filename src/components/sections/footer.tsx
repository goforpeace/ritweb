import Link from 'next/link';
import { Code, Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/button';

const Footer = () => {
    return (
        <footer className="border-t border-border/40 bg-background">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Code className="h-6 w-6 text-primary" />
                        <span className="text-lg font-bold">Remotized IT</span>
                    </div>
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
