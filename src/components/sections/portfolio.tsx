import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import AnimatedContent from '../animated-content';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const portfolioItems = PlaceHolderImages.filter(p => p.id.startsWith('portfolio-'));

const Portfolio = () => {
    return (
        <section id="portfolio" className="py-20 sm:py-32 bg-background">
            <AnimatedContent as="div" className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Portfolio</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
                        A glimpse into our successful projects and partnerships.
                    </p>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {portfolioItems.map((item) => (
                            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="h-full overflow-hidden bg-card/80 border-border/60 group">
                                        <div className="relative h-60 w-full overflow-hidden">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.description}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                data-ai-hint={item.imageHint}
                                            />
                                        </div>
                                        <CardHeader>
                                            <CardTitle>{item.description}</CardTitle>
                                            <CardDescription>
                                                <Badge variant="secondary" className="mt-2">{item.imageHint.split(' ')[0]}</Badge>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                A showcase of our capabilities in delivering robust solutions for our clients.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="ml-12" />
                    <CarouselNext className="mr-12" />
                </Carousel>
            </AnimatedContent>
        </section>
    );
};

export default Portfolio;
