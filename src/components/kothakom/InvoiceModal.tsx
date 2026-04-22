'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, CreditCard, Building, User, Calendar, Hash } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import Image from 'next/image';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

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
  trigger?: React.ReactNode;
}

const DARK_NAVY = "text-[#000033]"; // Custom Dark Navy Blue

export default function InvoiceModal({ record, project, trigger }: InvoiceModalProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'business') : null, [firestore]);
  const { data: settings } = useDoc<BusinessSettings>(settingsRef);

  const clientRef = useMemoFirebase(() => (firestore && project?.clientId) ? doc(firestore, 'clients', project.clientId) : null, [firestore, project]);
  const { data: client } = useDoc<Client>(clientRef);

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const processedByName = useMemo(() => {
    if (!users || !user?.email) return user?.displayName || user?.email || 'Administrator';
    const profile = users.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
    return profile?.name || user.displayName || user.email;
  }, [users, user]);

  const invoiceNumber = useMemo(() => {
    const idPart = record.id.slice(-5).toUpperCase();
    const datePart = format(new Date(record.date), "yyyyMM");
    return `INV-${datePart}-${idPart}`;
  }, [record.id, record.date]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" title="Create Invoice">
                <FileText className="h-3.5 w-3.5" />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95dvh] overflow-y-auto print:p-0 print:m-0 print:max-w-full print:bg-white bg-slate-100 p-0 border-none">
        <DialogHeader className="print:hidden p-6 bg-background border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice Preview
          </DialogTitle>
        </DialogHeader>
        
        <div id="invoice-content" className="mx-auto my-8 print:my-0 w-full max-w-[210mm] bg-white text-slate-900 shadow-2xl print:shadow-none min-h-[297mm] flex flex-col relative overflow-hidden font-sans">
            {/* Design Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 print:hidden" />
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

            {/* Header Section */}
            <div className="p-12 pb-8 flex justify-between items-start z-10">
                <div className="space-y-6">
                    {settings?.logoUrl ? (
                        <div className="relative h-32 w-80">
                            <Image src={settings.logoUrl} alt="Logo" fill className="object-contain object-left" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black text-primary tracking-tighter uppercase">{settings?.companyName || 'REMOTIZED IT'}</h2>
                            <p className="text-[10px] text-primary/60 font-bold tracking-[0.2em]">SMART SOLUTIONS • GLOBAL SUPPORT</p>
                        </div>
                    )}
                </div>
                <div className="text-right space-y-1">
                    <h1 className={cn("text-6xl font-black tracking-tighter uppercase select-none", DARK_NAVY)}>Invoice</h1>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full inline-block mt-2">
                        Status: Paid
                    </div>
                </div>
            </div>

            {/* Meta Info Grid */}
            <div className="px-12 grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-3 flex items-center gap-1.5">
                            <Building className="h-3 w-3" /> From
                        </h4>
                        <div className="text-[12px] leading-relaxed font-medium text-slate-600 space-y-1">
                            <p className="font-black text-slate-900 text-sm">{settings?.companyName || 'Remotized IT'}</p>
                            <p className="whitespace-pre-wrap max-w-xs">{settings?.address || 'Your Business Address'}</p>
                            <p className="text-primary font-bold">{settings?.email || 'billing@company.com'}</p>
                            <p>{settings?.phone || ''}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-3 flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Bill To
                        </h4>
                        <div className="text-[12px] leading-relaxed font-medium text-slate-600 space-y-1">
                            <p className="font-black text-slate-900 text-sm">{client?.name || 'Valued Client'}</p>
                            <p className="font-bold text-primary/80">{client?.company || 'Organization'}</p>
                            <p className="max-w-xs">{client?.address || ''} {client?.country || ''}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Hash className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Invoice Number</span>
                        </div>
                        <span className={cn("text-sm font-black", DARK_NAVY)}>{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Calendar className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Issue Date</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{format(new Date(record.date), "PPP")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Calendar className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Due Date</span>
                        </div>
                        <span className={cn("text-sm font-black", DARK_NAVY)}>{format(addDays(new Date(record.date), 10), "PPP")}</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 px-12">
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-primary text-slate-950">
                                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Service Description</th>
                                <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em]">Project</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="py-10 px-6 align-top">
                                    <p className="text-lg font-black text-slate-900 mb-2">{record.title}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed italic max-w-sm">
                                        Professional IT services and deliverables as per the agreed scope and technical documentation.
                                    </p>
                                </td>
                                <td className="py-10 px-6 text-center align-top">
                                    <span className={cn("inline-block px-4 py-1.5 rounded-full bg-slate-100 text-[11px] font-black uppercase tracking-wider", DARK_NAVY)}>
                                        {project?.name || 'Standard Service'}
                                    </span>
                                </td>
                                <td className="py-10 px-6 text-right align-top">
                                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                                        ৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calculations & Footer Payment Info */}
            <div className="p-12 pt-8 space-y-12">
                <div className="flex justify-between items-start">
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-2 text-primary">
                            <CreditCard className="h-4 w-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Payment Information</h4>
                        </div>
                        <div className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-medium">
                            {settings?.paymentDetails || 'Please refer to our standard terms or contact our finance department for payment details.'}
                        </div>
                    </div>

                    <div className="w-72 space-y-3">
                        <div className="flex justify-between items-center text-slate-500">
                            <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                            <span className="text-sm font-bold">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                            <span className="text-[10px] font-black uppercase tracking-widest">Tax (0%)</span>
                            <span className="text-sm font-bold">৳ 0.00</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between items-center bg-primary p-4 rounded-xl text-slate-950 shadow-lg shadow-primary/20">
                            <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                            <span className="text-2xl font-black tabular-nums">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Final Footer Bar */}
                <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Thank you for your business!</p>
                        <p className="text-[9px] text-slate-400">Generated on {format(new Date(), "PPpp")}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Processed By</p>
                        <div className="flex items-center gap-3 justify-end">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-black text-[10px]">
                                {processedByName.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-black text-slate-900">{processedByName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1.5 bg-primary w-full mt-auto" />
        </div>

        <div className="flex justify-center gap-4 print:hidden py-8 bg-slate-100">
            <Button variant="outline" size="lg" onClick={handlePrint} className="bg-white border-slate-200 hover:bg-slate-50 shadow-sm px-8">
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
            <Button size="lg" onClick={handlePrint} className="bg-primary hover:brightness-110 shadow-lg shadow-primary/20 px-8 font-bold text-slate-950">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
