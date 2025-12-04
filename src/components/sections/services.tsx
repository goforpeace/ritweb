import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudCog, DatabaseZap, Network, Shield, TabletSmartphone, Users } from 'lucide-react';
import AnimatedContent from '../animated-content';

const services = [
  {
    icon: <Network className="h-10 w-10 text-primary" />,
    title: 'Managed IT Services',
    description: 'Comprehensive IT support and management for a flat monthly fee.',
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: 'Cybersecurity Solutions',
    description: 'Protect your assets with our multi-layered security approach.',
  },
  {
    icon: <CloudCog className="h-10 w-10 text-primary" />,
    title: 'Cloud Computing',
    description: 'Leverage the power of the cloud for scalability and efficiency.',
  },
  {
    icon: <DatabaseZap className="h-10 w-10 text-primary" />,
    title: 'Data Backup & Recovery',
    description: 'Ensure business continuity with reliable backup solutions.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'IT Consulting',
    description: 'Strategic IT guidance to help you achieve your business objectives.',
  },
  {
    icon: <TabletSmartphone className="h-10 w-10 text-primary" />,
    title: 'Mobile Device Management',
    description: 'Secure and manage your company’s mobile devices with ease.',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 sm:py-32 bg-background/50">
      <AnimatedContent as="div" className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Services</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
            We offer a wide range of IT solutions to meet your business needs.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="bg-card hover:bg-card/80 transition-colors border-border/60 hover:-translate-y-2 duration-300">
              <CardHeader>
                {service.icon}
                <CardTitle className="mt-4">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedContent>
    </section>
  );
};

export default Services;
