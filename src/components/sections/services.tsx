
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudCog, DatabaseZap, Network, Shield, Users, Code } from 'lucide-react';

const services = [
  {
    icon: <Network className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'Managed IT Services',
    description: 'Comprehensive IT support and management for a flat monthly fee.',
  },
  {
    icon: <Shield className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'Cybersecurity Solutions',
    description: 'Protect your assets with our multi-layered security approach.',
  },
  {
    icon: <CloudCog className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'Cloud Computing',
    description: 'Leverage the power of the cloud for scalability and efficiency.',
  },
  {
    icon: <DatabaseZap className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'Data Backup & Recovery',
    description: 'Ensure business continuity with reliable backup solutions.',
  },
  {
    icon: <Users className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'IT Consulting',
    description: 'Strategic IT guidance to help you achieve your business objectives.',
  },
  {
    icon: <Code className="h-12 w-12 text-[#FFFFE3]" />,
    title: 'Web Development',
    description: 'Custom website and web application development to serve your customers.',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 sm:py-32 bg-secondary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl uppercase text-foreground">Our Core Capabilities</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full"></div>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground md:text-xl font-medium">
            Tailored technology solutions designed to scale with your business growth.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="bg-white border-2 border-secondary shadow-lg hover:border-primary transition-all duration-500 overflow-hidden group">
              <CardHeader className="bg-[#6D8196] p-8 group-hover:bg-[#4A4A4A] transition-colors">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-black uppercase text-[#FFFFE3] tracking-tight">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-[#4A4A4A] leading-relaxed font-medium">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
