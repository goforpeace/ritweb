
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, LifeBuoy, Server, ShieldCheck } from 'lucide-react';

const highlights = [
    {
        icon: <Server className="h-10 w-10 text-[#FFFFE3]" />,
        title: 'Remote IT Management',
        description: 'Proactive monitoring and management of your IT infrastructure, wherever you are.'
    },
    {
        icon: <LifeBuoy className="h-10 w-10 text-[#FFFFE3]" />,
        title: '24/7 Support',
        description: 'Around-the-clock assistance from our expert team to resolve issues quickly.'
    },
    {
        icon: <ShieldCheck className="h-10 w-10 text-[#FFFFE3]" />,
        title: 'Cybersecurity',
        description: 'Advanced security solutions to protect your data from evolving threats.'
    },
    {
        icon: <BrainCircuit className="h-10 w-10 text-[#FFFFE3]" />,
        title: 'Strategic Consulting',
        description: 'Expert guidance to align your technology with your business goals.'
    }
];

const Highlights = () => {
    return (
        <section className="py-20 sm:py-32 bg-background border-y border-secondary/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {highlights.map((item, index) => (
                        <Card key={index} className="bg-white border-secondary shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 group">
                            <CardHeader className="items-center pb-2">
                                <div className="p-4 rounded-2xl bg-[#6D8196] group-hover:bg-[#4A4A4A] transition-colors shadow-md">
                                    {item.icon}
                                </div>
                                <CardTitle className="mt-4 text-lg font-black uppercase tracking-tight text-[#4A4A4A]">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Highlights;
