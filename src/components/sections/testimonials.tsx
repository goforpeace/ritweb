import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = PlaceHolderImages.filter(p => p.id.startsWith('testimonial-'));

const Testimonials = () => {
    return (
        <section id="testimonials" className="py-20 sm:py-32 bg-background/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Clients Say</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
                        Real feedback from businesses we've helped empower.
                    </p>
                </div>
                <Carousel className="w-full max-w-4xl mx-auto">
                    <CarouselContent>
                        {testimonials.map((item) => (
                            <CarouselItem key={item.id}>
                                <div className="p-4">
                                    <Card className="bg-card border-border/60">
                                        <CardContent className="p-8 flex flex-col items-center text-center">
                                            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden">
                                              <Image
                                                  src={item.imageUrl}
                                                  alt={item.description}
                                                  fill
                                                  className="object-cover"
                                                  data-ai-hint={item.imageHint}
                                              />
                                            </div>
                                            <blockquote className="text-lg font-medium">
                                                &ldquo;Remotized IT transformed our infrastructure. Their support is second to none, and their expertise is evident in everything they do. Highly recommended!&rdquo;
                                            </blockquote>
                                            <div className="mt-6">
                                                <p className="font-semibold">{item.description}</p>
                                                <p className="text-sm text-muted-foreground">CEO, {item.imageHint.split(' ')[0]} Corp</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
};

export default Testimonials;
