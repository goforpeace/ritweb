'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download, Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import Image from 'next/image';
import { useMemo, useRef, useState, useEffect } from 'react';
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
  record: FinanceRecord | null;
  project?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DARK_NAVY = "text-[#000033]"; 

export default function InvoiceModal({ record, project, open, onOpenChange }: InvoiceModalProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const viewRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Failsafe to restore body pointer events and scrolling when modal unmounts
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
  }, []);
  
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
    if (!record) return '';
    const idPart = record.id.slice(-5).toUpperCase();
    const datePart = format(new Date(record.date), "yyyyMM");
    return `INV-${datePart}-${idPart}`;
  }, [record]);

  const handlePrint = () => {
    if (!viewRef.current) return;
    const printContent = viewRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>' + invoiceNumber + '</title>');
      printWindow.document.write(`<style>
        @media print { 
            @page { size: A4; margin: 0; } 
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
        } 
        body { font-family: sans-serif; background: white; color: #000000; margin: 0; padding: 0; }
        .invoice-print-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; position: relative; }
        .bg-primary { background-color: #00FFFF !important; }
        .text-primary { color: #00FFFF !important; }
        .text-\\[\\#000033\\] { color: #000033 !important; }
        .bg-slate-50 { background-color: #f8fafc !important; }
        .border-slate-100 { border-color: #f1f5f9 !important; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
        .flex { display: flex; }
        .flex-col { display: flex; flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-12 { gap: 3rem; }
        .p-12 { padding: 3rem; }
        .px-12 { padding-left: 3rem; padding-right: 3rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mt-auto { margin-top: auto; }
        .w-full { width: 100%; }
        .w-80 { width: 20rem; }
        .h-32 { height: 8rem; }
        .rounded-2xl { border-radius: 1rem; }
        .border { border-width: 1px; border-style: solid; }
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
        .border-t { border-top-width: 1px; border-top-style: solid; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .text-4xl { font-size: 2.25rem; }
        .text-6xl { font-size: 3.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.125rem; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .opacity-10 { opacity: 0.1; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .top-0 { top: 0; }
        .left-0 { left: 0; }
        .right-12 { right: 3rem; }
        .top-10 { top: 2.5rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 24px; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        img { max-width: 100%; height: auto; }
      </style>`);
      
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      
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
      // Precise capture for A4 fitting
      const element = viewRef.current;
      const canvas = await html2canvas(element, { 
        scale: 4, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
            // Ensure no scrollbars or weird shifts in clone
            const clonedEl = clonedDoc.querySelector('.invoice-print-container') as HTMLElement;
            if (clonedEl) {
                clonedEl.style.boxShadow = 'none';
                clonedEl.style.transform = 'none';
            }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[95dvh] flex flex-col p-0 border-none bg-slate-200 overflow-hidden">
        <DialogHeader className="p-4 bg-background border-b z-20">
          <DialogTitle className="flex items-center gap-2 font-black uppercase text-foreground">
            <FileText className="h-5 w-5" />
            Invoice Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-8 bg-[#CBCBCB]">
            <div 
                ref={viewRef}
                className="mx-auto w-[210mm] min-h-[297mm] bg-white text-black flex flex-col relative overflow-hidden font-sans invoice-print-container shadow-2xl"
            >
                {/* Top Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[#6D8196] z-20" />

                {/* Header Section */}
                <div className="p-12 pb-8 flex justify-between items-start z-10 relative">
                    <div className="space-y-6">
                        {settings?.logoUrl ? (
                            <div className="relative h-32 w-80">
                                <Image src={settings.logoUrl} alt="Company Logo" fill className="object-contain object-left" unoptimized />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <h2 className="text-4xl font-black tracking-tighter uppercase text-[#4A4A4A]">{settings?.companyName || 'REMOTIZED IT'}</h2>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <h1 className={cn("text-6xl font-black tracking-tighter uppercase select-none opacity-10 absolute right-12 top-10 pointer-events-none", DARK_NAVY)}>Invoice</h1>
                        <div className="relative z-10 pt-10">
                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                Status: Paid
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="px-12 grid grid-cols-2 gap-12 mb-12 relative z-10">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-[#6D8196] tracking-[0.2em] mb-2">FROM</h4>
                            <div className="text-[12px] leading-relaxed text-slate-600 space-y-0.5">
                                <p className="font-black text-black text-sm">{settings?.companyName || 'Remotized IT'}</p>
                                <p className="whitespace-pre-wrap">{settings?.address || ''}</p>
                                <p className="text-[#6D8196] font-bold">{settings?.email || ''}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-[#6D8196] tracking-[0.2em] mb-2">BILL TO</h4>
                            <div className="text-[12px] leading-relaxed text-slate-600 space-y-0.5">
                                <p className="font-black text-black text-sm">{client?.name || 'Valued Client'}</p>
                                <p className="font-bold text-[#6D8196]">{client?.company || ''}</p>
                                <p>{client?.country || ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col justify-center gap-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice Number</span>
                            <span className={cn("text-sm font-black", DARK_NAVY)}>{invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Date</span>
                            <span className="text-sm font-bold text-black">{format(new Date(record.date), "PPP")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</span>
                            <span className={cn("text-sm font-black", DARK_NAVY)}>{format(addDays(new Date(record.date), 10), "PPP")}</span>
                        </div>
                    </div>
                </div>

                {/* Description Table */}
                <div className="flex-1 px-12 relative z-10">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#6D8196] text-white">
                                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em]">Service Description</th>
                                    <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em]">Project</th>
                                    <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-[0.2em]">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-10 px-6 align-top">
                                        <p className="text-lg font-black mb-1 text-black">{record.title}</p>
                                        <p className="text-xs text-slate-400 italic">Professional IT services provided.</p>
                                    </td>
                                    <td className="py-10 px-6 text-center align-top">
                                        <span className={cn("inline-block px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-black uppercase", DARK_NAVY)}>
                                            {project?.name || 'Service'}
                                        </span>
                                    </td>
                                    <td className="py-10 px-6 text-right align-top">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-black">৳</span>
                                            <span className="text-3xl font-black tabular-nums text-black">{record.amount.toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-12 pt-8 space-y-12 relative z-10 mt-auto">
                    <div className="flex justify-between items-start">
                        <div className="space-y-3 max-w-sm">
                            <h4 className="text-[10px] font-black uppercase text-[#6D8196] tracking-[0.2em]">PAYMENT INFORMATION</h4>
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-medium">
                                {settings?.paymentDetails || 'Terms apply.'}
                            </div>
                        </div>
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="text-[9px] font-black uppercase">Subtotal</span>
                                <span className="text-sm font-bold text-black">৳ {record.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="flex justify-between items-center bg-[#6D8196] p-4 rounded-xl text-white">
                                <span className="text-xs font-black uppercase">Total Amount</span>
                                <span className="text-2xl font-black tabular-nums">৳ {record.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#6D8196] uppercase tracking-[0.2em]">Thank you for your business!</p>
                            <p className="text-[8px] text-slate-400">Generated {format(new Date(), "PPpp")}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Processed By</p>
                            <div className="flex items-center gap-3 justify-end">
                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[#6D8196] font-black text-[9px]">
                                    {processedByName.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-sm font-black text-black">{processedByName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-1.5 bg-[#6D8196] w-full mt-auto" />
            </div>
        </div>

        <DialogFooter className="p-6 bg-background border-t flex items-center justify-center gap-4 flex-row">
            <Button variant="outline" size="lg" onClick={handlePrint} className="font-bold uppercase tracking-tighter shadow-sm px-8 bg-white border-[#CBCBCB] text-[#4A4A4A]">
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button 
                size="lg" 
                onClick={handleSavePdf} 
                disabled={isSaving}
                className="bg-[#4A4A4A] text-[#FFFFE3] hover:bg-black/90 font-black uppercase tracking-tighter px-8 min-w-[200px]"
            >
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering...</>
                ) : (
                    <><Download className="mr-2 h-4 w-4" /> Download PDF</>
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
