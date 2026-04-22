'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, CreditCard } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';

type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  date: string;
  projectId?: string;
};

type BusinessSettings = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  paymentDetails: string;
};

type Client = {
    name: string;
    company: string;
    address?: string;
    country?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

interface InvoiceModalProps {
  record: FinanceRecord;
  project?: any;
}

export default function InvoiceModal({ record, project }: InvoiceModalProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'business') : null, [firestore]);
  const { data: settings } = useDoc<BusinessSettings>(settingsRef);

  const clientRef = useMemoFirebase(() => (firestore && project?.clientId) ? doc(firestore, 'clients', project.clientId) : null, [firestore, project]);
  const { data: client } = useDoc<Client>(clientRef);

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);

  // Look up the name for the "Processed By" field based on the current user's email
  const processedByName = useMemo(() => {
    if (!users || !user?.email) return user?.displayName || user?.email || 'Administrator';
    const profile = users.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
    return profile?.name || user.displayName || user.email;
  }, [users, user]);

  const invoiceNumber = useMemo(() => {
    const idPart = record.id.slice(-5).toUpperCase();
    return `INV-${idPart}`;
  }, [record.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" title="Create Invoice">
          <FileText className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95dvh] overflow-y-auto print:p-0 print:m-0 print:max-w-full print:bg-white bg-slate-50/50">
        <DialogHeader className="print:hidden">
          <DialogTitle>Professional Invoice</DialogTitle>
        </DialogHeader>
        
        <div id="invoice-content" className="p-12 bg-white text-black shadow-2xl border-t-[12px] border-primary space-y-12 min-h-[1050px] flex flex-col print:border-t-0 print:shadow-none print:p-12 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-6">
                    {settings?.logoUrl ? (
                        <div className="relative h-28 w-72">
                            <Image src={settings.logoUrl} alt="Logo" fill className="object-contain object-left" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">{settings?.companyName || 'REMOTIZED IT'}</h2>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest">GREEN TECH SOLUTIONS. GLOBAL SUPPORT.</p>
                        </div>
                    )}
                </div>
                <div className="text-right text-[11px] leading-relaxed font-medium text-slate-500">
                    <p className="whitespace-pre-wrap max-w-[200px] ml-auto">{settings?.address || 'Office Address'}</p>
                    <p className="text-primary font-bold mt-1 underline">{settings?.email || 'email@company.com'}</p>
                    <p className="mt-0.5">{settings?.phone || ''}</p>
                </div>
            </div>

            <Separator className="bg-primary/20 h-[1.5px]" />

            {/* Main Title & Meta */}
            <div className="flex justify-between items-end">
                <div className="space-y-8">
                    <h1 className="text-8xl font-black tracking-tighter text-primary/10 select-none absolute top-40 left-12">INVOICE</h1>
                    <h1 className="text-7xl font-bold tracking-tighter text-primary relative z-10">Invoice</h1>
                    
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">BILL TO:</h4>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{client?.name || 'Valued Client'}</p>
                            <p className="text-sm font-bold text-primary/80">{client?.company || 'Organization'}</p>
                            <p className="text-sm text-slate-600 max-w-xs">{client?.address || ''} {client?.country || ''}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">INVOICE #</div>
                    <div className="text-sm font-black text-slate-900">{invoiceNumber}</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">INVOICE DATE</div>
                    <div className="text-sm font-bold text-slate-900">{format(new Date(record.date), "dd/MM/yyyy")}</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">P.O. #</div>
                    <div className="text-sm font-bold text-slate-900">--</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">DUE DATE</div>
                    <div className="text-sm font-bold text-primary">{format(addDays(new Date(record.date), 10), "dd/MM/yyyy")}</div>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 mt-10">
                <table className="w-full">
                    <thead>
                        <tr className="border-y-2 border-slate-900">
                            <th className="py-4 px-2 text-left text-xs font-black uppercase tracking-widest text-slate-900">NAME / ITEM</th>
                            <th className="py-4 px-2 text-left text-xs font-black uppercase tracking-widest text-slate-900">DESCRIPTION & PROJECT</th>
                            <th className="py-4 px-2 text-right text-xs font-black uppercase tracking-widest text-slate-900">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-12 px-2 text-lg font-bold text-slate-900 align-top">
                                {record.title}
                            </td>
                            <td className="py-12 px-2 text-sm text-slate-600 max-w-[350px] leading-relaxed align-top">
                                <div className="font-bold text-primary mb-1">{project?.name || 'General Services'}</div>
                                <span className="italic opacity-80">Payment for project deliverables and professional services as agreed in scope of work.</span>
                            </td>
                            <td className="py-12 px-2 text-right font-mono font-black text-xl text-slate-900 align-top">
                                ৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Summary / Total Section */}
            <div className="flex justify-between items-start pt-8 border-t-2 border-slate-100">
                <div className="space-y-4 max-w-sm">
                    <div className="flex items-center gap-2 text-primary">
                        <CreditCard className="h-4 w-4" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Payment Instructions</h4>
                    </div>
                    <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap">
                        {settings?.paymentDetails || 'Please contact us for payment details.'}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-end gap-12 items-center">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Subtotal:</span>
                        <span className="text-lg font-bold text-slate-900">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-end gap-12 items-center">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tax (0%):</span>
                        <span className="text-lg font-bold text-slate-900">৳ 0.00</span>
                    </div>
                    <div className="border-t-4 border-slate-900 w-72 pt-4 flex justify-between items-center">
                        <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Total:</span>
                        <span className="text-3xl font-black text-primary">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Footer Teal Bar */}
            <div className="bg-primary text-primary-foreground -mx-12 px-12 py-5 mt-auto flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                <div className="flex gap-8">
                    <span>Invoice Generated: {format(new Date(), "PP")}</span>
                    <span>Status: PAID</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="opacity-70">Processed By:</span>
                    <span className="text-xs tracking-normal">{processedByName}</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 print:hidden py-4 border-t bg-muted/30 px-6">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Save PDF
            </Button>
            <Button className="bg-primary hover:brightness-110" onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
