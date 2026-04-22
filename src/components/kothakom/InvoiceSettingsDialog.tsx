'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Settings, ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Invalid email"),
  paymentDetails: z.string().min(5, "Payment info is required"),
  logoUrl: z.string().optional(),
});

export default function InvoiceSettingsDialog() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [pastedLogo, setPastedLogo] = useState<string | null>(null);

  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'business') : null, [firestore]);
  const { data: settings, isLoading } = useDoc<any>(settingsRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      address: '',
      phone: '',
      email: '',
      paymentDetails: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        paymentDetails: settings.paymentDetails || '',
        logoUrl: settings.logoUrl || '',
      });
      if (settings.logoUrl && settings.logoUrl.startsWith('data:image')) {
          setPastedLogo(settings.logoUrl);
      } else {
          setPastedLogo(null);
      }
    }
  }, [settings, form]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
           const reader = new FileReader();
           reader.onload = (event) => {
             const base64 = event.target?.result as string;
             setPastedLogo(base64);
             form.setValue('logoUrl', base64);
             toast({ title: "Logo detected", description: "Image added from clipboard." });
           };
           reader.readAsDataURL(blob);
        }
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!settingsRef) return;

    setDocumentNonBlocking(settingsRef, {
      ...values,
      logoUrl: values.logoUrl || null,
    }, { merge: true });

    toast({ title: 'Settings Saved', description: 'Your business profile has been updated.' });
    setIsOpen(false);
  }

  const currentLogo = form.watch('logoUrl');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Profile</DialogTitle>
          <DialogDescription>Setup your company information for professional invoices.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
                <FormLabel>Company Logo</FormLabel>
                <div 
                    className="h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-muted/20"
                    onPaste={handlePaste}
                >
                    {currentLogo ? (
                        <>
                            <Image src={currentLogo} alt="Logo Preview" fill className="object-contain p-2" />
                            <button 
                                type="button" 
                                onClick={() => {
                                    setPastedLogo(null);
                                    form.setValue('logoUrl', '');
                                }}
                                className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 shadow-lg z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                            <p className="text-[10px] text-muted-foreground mt-2">Paste image (Ctrl+V) or enter URL below</p>
                        </div>
                    )}
                </div>
            </div>

            <FormField control={form.control} name="logoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Image URL</FormLabel>
                <FormControl>
                    <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://example.com/logo.png" className="pl-9" {...field} />
                    </div>
                </FormControl>
                <FormDescription className="text-[10px]">Provide a direct link to your company logo.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl><Input placeholder="Remotized IT" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl><Input placeholder="billing@company.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl><Input placeholder="+880..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Office Address</FormLabel>
                <FormControl><Textarea placeholder="Floor, Building, Road, City..." className="min-h-[80px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="paymentDetails" render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Information</FormLabel>
                <FormControl><Textarea placeholder="Bank Name, A/C Number, Bkash, etc." className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>Save Profile</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
