'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
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
                        <div className="relative h-24 w-64">
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
                    <p className="mt-0.5">https://remotizedit.com</p>
                </div>
            </div>

            <Separator className="bg-primary/20 h-[1.5px]" />

            {/* Main Title & Meta */}
            <div className="flex justify-between items-end">
                <div className="space-y-8">
                    <h1 className="text-8xl font-bold tracking-tighter text-primary/90 opacity-90">Invoice</h1>
                    
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">BILL TO:</h4>
                        <div className="space-y-0.5">
                            <p className="text-xl font-bold text-primary">{client?.name || 'Valued Client'}</p>
                            <p className="text-sm font-bold text-slate-800">{client?.company || 'Organization'}</p>
                            <p className="text-sm text-slate-600">{client?.address || ''}, {client?.country || ''}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">INVOICE #</div>
                    <div className="text-sm font-black">{invoiceNumber}</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">INVOICE DATE</div>
                    <div className="text-sm font-bold">{format(new Date(record.date), "dd/MM/yyyy")}</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">P.O. #</div>
                    <div className="text-sm font-bold">--</div>
                    
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">DUE DATE</div>
                    <div className="text-sm font-bold">{format(addDays(new Date(record.date), 10), "dd/MM/yyyy")}</div>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 mt-10">
                <table className="w-full">
                    <thead>
                        <tr className="border-y-2 border-primary">
                            <th className="py-3 px-2 text-left text-xs font-black uppercase tracking-widest text-slate-600">NAME</th>
                            <th className="py-3 px-2 text-left text-xs font-black uppercase tracking-widest text-slate-600">DESCRIPTION</th>
                            <th className="py-3 px-2 text-right text-xs font-black uppercase tracking-widest text-slate-600">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-10 px-2 text-base font-bold text-slate-800 align-top">
                                {record.title}
                            </td>
                            <td className="py-10 px-2 text-sm text-slate-500 max-w-[300px] leading-relaxed align-top">
                                {project?.name || 'General Services'}<br/>
                                <span className="text-xs italic opacity-70">Payment for project milestones as per terms.</span>
                            </td>
                            <td className="py-10 px-2 text-right font-mono font-black text-lg align-top">
                                ৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Summary / Total Section */}
            <div className="flex justify-end gap-x-20 items-start border-t-2 border-primary/10 pt-6">
                <div className="flex gap-12 items-center">
                    <span className="text-lg font-bold text-slate-500 uppercase tracking-widest">Subtotal:</span>
                    <span className="text-xl font-black">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Payment Info Section */}
            <div className="mt-12 space-y-6">
                <h3 className="text-xl font-black text-slate-700 tracking-tight">Payment Info:</h3>
                <div className="grid grid-cols-2 text-sm">
                    <div className="space-y-2 text-slate-500 font-bold">
                        <p>Payment Method:</p>
                        <p>Payment To:</p>
                        <p>Payment Date:</p>
                        <p>Received Date:</p>
                    </div>
                    <div className="space-y-2 text-slate-800 font-medium">
                        <p>Bank Transfer / Digital</p>
                        <p>{settings?.companyName || 'RemotizedIT'}</p>
                        <p>--</p>
                        <p>--</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-10 flex justify-end">
                 <div className="border-t-4 border-primary w-64 pt-2 text-right">
                    <span className="text-xl font-bold text-slate-500 uppercase tracking-tighter mr-4">Total:</span>
                    <span className="text-3xl font-black text-primary">৳ {record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
            </div>

            {/* Footer Teal Bar */}
            <div className="bg-primary text-primary-foreground -mx-12 px-12 py-4 mt-8 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                <span>Processed By:</span>
                <span>{user?.displayName || user?.email || 'Administrator'}</span>
            </div>
        </div>

        <div className="flex justify-end gap-3 print:hidden py-4 border-t bg-muted/30 px-6">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
            <Button className="bg-primary hover:brightness-110">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
