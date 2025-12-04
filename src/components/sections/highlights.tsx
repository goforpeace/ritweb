import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, LifeBuoy, Server, ShieldCheck } from 'lucide-react';

const highlights = [
    {
        icon: <Server className="h-8 w-8 text-primary" />,
        title: 'Remote IT Management',
        description: 'Proactive monitoring and management of your IT infrastructure, wherever you are.'
    },
    {
        icon: <LifeBuoy className="h-8 w-8 text-primary" />,
        title: '24/7 Support',
        description: 'Around-the-clock assistance from our expert team to resolve issues quickly.'
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: 'Cybersecurity',
        description: 'Advanced security solutions to protect your data from evolving threats.'
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: 'Strategic Consulting',
        description: 'Expert guidance to align your technology with your business goals.'
    }
];

const Highlights = () => {
    return (
        <section className="py-20 sm:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {highlights.map((item, index) => (
                        <Card key={index} className="bg-card/50 border-border/50 text-center">
                            <CardHeader className="items-center">
                                {item.icon}
                                <CardTitle className="mt-4">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Highlights;
