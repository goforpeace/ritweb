'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, CreditCard, Building, User, Calendar, Hash, Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const DARK_NAVY = "text-[#000033]"; // Professional Dark Navy Blue

export default function InvoiceModal({ record, project, trigger }: InvoiceModalProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const viewRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
    if (!viewRef.current) return;
    const printContent = viewRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + invoiceNumber + '</title>');
      
      // Inject comprehensive CSS to format the print window correctly for A4
      // We replicate key tailwind styles to ensure the document looks exact
      printWindow.document.write(`<style>
        @media print { 
            @page { size: A4; margin: 0; } 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
        } 
        body { font-family: sans-serif; background: white; color: #0f172a; margin: 0; padding: 0; }
        .invoice-print-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; position: relative; }
        .bg-primary { background-color: #00FFFF !important; }
        .text-primary { color: #00FFFF !important; }
        .text-\\[\\#000033\\] { color: #000033 !important; }
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-slate-100 { background-color: #f1f5f9 !important; }
        .border-slate-100 { border-color: #f1f5f9 !important; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
        .text-slate-900 { color: #0f172a !important; }
        .text-slate-600 { color: #475569 !important; }
        .text-slate-500 { color: #64748b !important; }
        .text-slate-400 { color: #94a3b8 !important; }
        .flex { display: flex; }
        .flex-col { display: flex; flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .items-center { align-items: center; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-12 { gap: 3rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .p-12 { padding: 3rem; }
        .p-8 { padding: 2rem; }
        .px-12 { padding-left: 3rem; padding-right: 3rem; }
        .pb-8 { padding-bottom: 2rem; }
        .pt-8 { padding-top: 2rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mt-auto { margin-top: auto; }
        .w-full { width: 100%; }
        .w-80 { width: 20rem; }
        .h-32 { height: 8rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .border { border-width: 1px; border-style: solid; }
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
        .border-t { border-top-width: 1px; border-top-style: solid; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-\\[11px\\] { font-size: 11px; }
        .text-\\[12px\\] { font-size: 12px; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[9px\\] { font-size: 9px; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
        .opacity-10 { opacity: 0.1; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .top-0 { top: 0; }
        .left-0 { left: 0; }
        .right-12 { right: 3rem; }
        .top-10 { top: 2.5rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .italic { font-style: italic; }
        .whitespace-pre-wrap { white-space: pre-wrap; }
        img { max-width: 100%; height: auto; }
      </style>`);
      
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      
      // Slight timeout ensures styles and images load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleSavePdf = async () => {
    if (!viewRef.current) return;
    setIsSaving(true);
    
    try {
      const canvas = await html2canvas(viewRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Use JPEG with quality setting to reduce file size while maintaining quality
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsSaving(false);
    }
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
      <DialogContent className="max-w-5xl h-[95dvh] flex flex-col p-0 border-none bg-slate-200 overflow-hidden">
        <DialogHeader className="p-4 bg-background border-b z-20">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice Preview
          </DialogTitle>
        </DialogHeader>
        
        {/* Document Viewer Area */}
        <div className="flex-1 overflow-y-auto p-8">
            <div 
                ref={viewRef}
                id="invoice-content" 
                className="mx-auto w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl flex flex-col relative overflow-hidden font-sans invoice-print-container"
            >
                {/* Top Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary z-20" />

                {/* Header Section */}
                <div className="p-12 pb-8 flex justify-between items-start z-10 relative">
                    <div className="space-y-6">
                        {settings?.logoUrl ? (
                            <div className="relative h-32 w-80">
                                <Image src={settings.logoUrl} alt="Company Logo" fill className="object-contain object-left" data-ai-hint="company logo" unoptimized />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <h2 className="text-4xl font-black text-primary tracking-tighter uppercase">{settings?.companyName || 'REMOTIZED IT'}</h2>
                                <p className="text-[10px] text-primary/60 font-bold tracking-[0.2em]">SMART SOLUTIONS • GLOBAL SUPPORT</p>
                            </div>
                        )}
                    </div>
                    <div className="text-right space-y-1">
                        <h1 className={cn("text-6xl font-black tracking-tighter uppercase select-none opacity-10 absolute right-12 top-10 pointer-events-none", DARK_NAVY)}>Invoice</h1>
                        <div className="relative z-10">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full inline-block mt-2">
                                Status: Paid
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta Info Grid */}
                <div className="px-12 grid grid-cols-2 gap-12 mb-12 relative z-10">
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
                <div className="flex-1 px-12 relative z-10">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-primary text-slate-950">
                                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">Service Description</th>
                                    <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">Project</th>
                                    <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="py-10 px-6 align-top">
                                        <p className="text-lg font-black text-slate-900 mb-2">{record.title}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed italic max-w-sm">
                                            Professional IT services and deliverables as per agreed terms.
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
                <div className="p-12 pt-8 space-y-12 relative z-10 mt-auto">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 max-w-sm">
                            <div className="flex items-center gap-2 text-primary">
                                <CreditCard className="h-4 w-4" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Payment Information</h4>
                            </div>
                            <div className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-medium">
                                {settings?.paymentDetails || 'Please refer to our standard terms.'}
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

                <div className="h-1.5 bg-primary w-full mt-auto" />
            </div>
        </div>

        <DialogFooter className="p-6 bg-background border-t flex items-center justify-center gap-4 flex-row">
            <Button variant="outline" size="lg" onClick={handlePrint} className="bg-white border-slate-200 hover:bg-slate-50 shadow-sm px-8 text-slate-900">
                <Printer className="mr-2 h-4 w-4" />
                Print Preview
            </Button>
            <Button 
                size="lg" 
                onClick={handleSavePdf} 
                disabled={isSaving}
                className="bg-primary hover:brightness-110 shadow-lg shadow-primary/20 px-8 font-bold text-slate-950 min-w-[200px]"
            >
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...</>
                ) : (
                    <><Download className="mr-2 h-4 w-4" /> Save as PDF</>
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
