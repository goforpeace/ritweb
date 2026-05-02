import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Quote } from 'lucide-react';

const testimonials = PlaceHolderImages.filter(p => p.id.startsWith('testimonial-'));

const Testimonials = () => {
    return (
        <section id="testimonials" className="py-20 sm:py-32 bg-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl uppercase text-foreground">Client Feedback</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl font-medium">
                        Real-world results delivered to businesses worldwide.
                    </p>
                </div>
                <Carousel className="w-full max-w-5xl mx-auto">
                    <CarouselContent>
                        {testimonials.map((item) => (
                            <CarouselItem key={item.id}>
                                <div className="p-4">
                                    <Card className="bg-white border-2 border-secondary shadow-2xl rounded-3xl overflow-hidden">
                                        <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center gap-10">
                                            <div className="relative shrink-0 w-40 h-40 rounded-3xl overflow-hidden border-4 border-secondary/30 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                              <Image
                                                  src={item.imageUrl}
                                                  alt={item.description}
                                                  fill
                                                  className="object-cover"
                                                  data-ai-hint={item.imageHint}
                                              />
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <Quote className="h-12 w-12 text-primary opacity-20" />
                                                <blockquote className="text-xl md:text-2xl font-bold leading-relaxed text-foreground">
                                                    &ldquo;Remotized IT transformed our infrastructure. Their support is second to none, and their expertise is evident in everything they do. Highly recommended!&rdquo;
                                                </blockquote>
                                                <div className="pt-4 border-t border-secondary/50">
                                                    <p className="font-black uppercase tracking-tight text-primary text-lg">{item.description}</p>
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">CEO, {item.imageHint.split(' ')[0]} Corp</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden lg:flex -left-16 h-14 w-14 border-2" />
                    <CarouselNext className="hidden lg:flex -right-16 h-14 w-14 border-2" />
                </Carousel>
            </div>
        </section>
    );
};

export default Testimonials;