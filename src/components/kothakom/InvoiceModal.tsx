
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
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

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
};

interface InvoiceModalProps {
  record: FinanceRecord;
  project?: any;
}

export default function InvoiceModal({ record, project }: InvoiceModalProps) {
  const { firestore } = useFirebase();
  
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'business') : null, [firestore]);
  const { data: settings } = useDoc<BusinessSettings>(settingsRef);

  const clientRef = useMemoFirebase(() => (firestore && project?.clientId) ? doc(firestore, 'clients', project.clientId) : null, [firestore, project]);
  const { data: client } = useDoc<Client>(clientRef);

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
      <DialogContent className="max-w-3xl max-h-[90dvh] overflow-y-auto print:p-0 print:m-0 print:max-w-full">
        <DialogHeader className="print:hidden">
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>
        
        <div id="invoice-content" className="p-8 bg-white text-black rounded-lg shadow-sm border space-y-8 min-h-[800px] flex flex-col print:border-0 print:shadow-none print:p-10">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    {settings?.logoUrl ? (
                        <div className="relative h-16 w-48">
                            <Image src={settings.logoUrl} alt="Logo" fill className="object-contain object-left" />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{settings?.companyName || 'REMOTIZED IT'}</h2>
                    )}
                    <div className="text-[10px] space-y-1">
                        <p className="font-bold">{settings?.address || 'Office Address'}</p>
                        <p>{settings?.phone || 'Phone Number'}</p>
                        <p>{settings?.email || 'email@company.com'}</p>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-muted-foreground/20">INVOICE</h1>
                    <p className="text-sm font-bold">#{record.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px]">Date: {format(new Date(record.date), "PPP")}</p>
                </div>
            </div>

            <Separator className="bg-black/10" />

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bill To:</h4>
                    <div className="space-y-1">
                        <p className="font-bold text-sm">{client?.name || 'Valued Client'}</p>
                        <p className="text-xs">{client?.company || 'Organization'}</p>
                        <p className="text-xs">{client?.address || ''}</p>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project:</h4>
                    <p className="text-xs font-medium">{project?.name || 'General Services'}</p>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1">
                <table className="w-full border-collapse">
                    <thead className="bg-muted/10 border-y border-black">
                        <tr>
                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest">Description</th>
                            <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-widest">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black/5">
                            <td className="py-6 px-4 text-sm font-medium">
                                {record.title}
                                <p className="text-[10px] text-muted-foreground mt-1">Service rendered as per agreement.</p>
                            </td>
                            <td className="py-6 px-4 text-right font-mono font-bold text-sm">Tk {record.amount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="py-6 px-4 text-right text-[10px] font-bold uppercase">Grand Total</td>
                            <td className="py-6 px-4 text-right text-xl font-black border-t-2 border-black">Tk {record.amount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer / Payment */}
            <div className="space-y-4 pt-10 mt-auto">
                <div className="p-4 bg-muted/5 rounded-lg border border-black/5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Payment Methods:</h4>
                    <p className="text-[10px] whitespace-pre-wrap leading-relaxed">{settings?.paymentDetails || 'Bank Details will follow.'}</p>
                </div>
                <p className="text-[9px] text-center text-muted-foreground italic">Thank you for your business. Please pay within 15 days of receipt.</p>
            </div>
        </div>

        <div className="flex justify-end gap-3 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
