"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useFirebase, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  company: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
})

const Contact = () => {
  const { toast } = useToast()
  const { firestore } = useFirebase();
  const mapImage = PlaceHolderImages.find(p => p.id === 'contact-map');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not connect to the database. Please try again later.",
        });
        return;
    }
    const submissionsCollection = collection(firestore, 'contact_form_submissions');
    
    addDocumentNonBlocking(submissionsCollection, {
        ...values,
        submissionDate: new Date().toISOString(),
        status: "New",
    });

    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you shortly.",
    })
    form.reset()
  }

  return (
    <section id="contact" className="py-20 sm:py-32 bg-background border-t border-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl uppercase text-foreground">Initiate a Conversation</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl font-medium">
            Have a complex IT challenge? Let's engineer a solution together.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="bg-white p-10 rounded-3xl border-2 border-secondary shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Your Name</FormLabel>
                        <FormControl>
                          <Input className="h-12 border-2 border-secondary focus:border-primary transition-colors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Email Address</FormLabel>
                        <FormControl>
                          <Input className="h-12 border-2 border-secondary focus:border-primary transition-colors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Company (Optional)</FormLabel>
                      <FormControl>
                        <Input className="h-12 border-2 border-secondary focus:border-primary transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase text-[10px] tracking-widest text-primary">Message Details</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[150px] border-2 border-secondary focus:border-primary transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white text-base shadow-lg shadow-primary/30">
                  Send Inquiry
                </Button>
              </form>
            </Form>
          </div>
          {mapImage && (
            <div className="space-y-8">
               <div className="h-[400px] w-full rounded-3xl overflow-hidden relative border-2 border-secondary shadow-lg">
                <Image
                  src={mapImage.imageUrl}
                  alt={mapImage.description}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  data-ai-hint={mapImage.imageHint}
                />
              </div>
              <div className="grid gap-6">
                 <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/50">
                    <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-2">Global Operations</h4>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">Providing high-availability IT services to businesses across multiple regions and time zones.</p>
                 </div>
                 <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/50">
                    <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-2">Direct Contact</h4>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">Support: hello@remotized-it.com<br />Emergency: +1 (555) REMOTIZED</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Contact;