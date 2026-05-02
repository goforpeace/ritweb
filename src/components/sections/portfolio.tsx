
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const portfolioItems = PlaceHolderImages.filter(p => p.id.startsWith('portfolio-'));

const Portfolio = () => {
    return (
        <section id="portfolio" className="py-20 sm:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl uppercase text-foreground">Success Stories</h2>
                            <p className="mt-4 text-muted-foreground md:text-xl font-medium">
                                A showcase of our recent deployments and infrastructure upgrades.
                            </p>
                        </div>
                        <div className="hidden md:flex gap-2 mb-2">
                            <CarouselPrevious className="static translate-y-0 h-12 w-12 border-2 border-secondary bg-white text-foreground hover:bg-secondary/20" />
                            <CarouselNext className="static translate-y-0 h-12 w-12 border-2 border-secondary bg-white text-foreground hover:bg-secondary/20" />
                        </div>
                    </div>
                    
                    <CarouselContent>
                        {portfolioItems.map((item) => (
                            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full overflow-hidden bg-white border-2 border-secondary shadow-sm hover:border-primary/60 group transition-all duration-300">
                                        <div className="relative h-64 w-full overflow-hidden">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.description}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                data-ai-hint={item.imageHint}
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
                                        </div>
                                        <CardHeader className="p-6">
                                            <Badge variant="outline" className="w-fit mb-2 border-primary text-primary font-black uppercase text-[10px] tracking-widest">
                                                {item.imageHint.split(' ')[0]}
                                            </Badge>
                                            <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground">{item.description}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-8">
                                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                                Implementing robust, scalable solutions that drive operational efficiency and digital transformation.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
};

export default Portfolio;
