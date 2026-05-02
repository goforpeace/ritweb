'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Banknote, PlusCircle, Search, TrendingUp, TrendingDown, Wallet, ImageIcon, X, Link as LinkIcon, User, FileText, Pencil, Trash2, RotateCcw, AlertTriangle, Eye, MoreHorizontal, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import InvoiceSettingsDialog from '@/components/kothakom/InvoiceSettingsDialog';
import InvoiceModal from '@/components/kothakom/InvoiceModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FinanceRecord = {
  id: string;
  title: string;
  referenceNote: string;
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Paid' | 'Unpaid' | 'Cancelled';
  date: string;
  projectId?: string;
  imageUrl?: string;
  createdBy?: string;
  isDeleted?: boolean;
};

type Project = {
    id: string;
    name: string;
    clientId?: string;
};

const financeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  referenceNote: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["Income", "Expense"]),
  status: z.enum(["Paid", "Unpaid", "Cancelled"]),
  date: z.string().min(1, "Date is required"),
  projectId: z.string().optional(),
});

export default function FinancePage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Lifted state for modals to prevent freezing bug
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FinanceRecord | null>(null);
  const [invoiceRecord, setInvoiceRecord] = useState<FinanceRecord | null>(null);
  
  const [showDeleted, setShowDeleted] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  const financeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'finance');
  }, [firestore, user]);

  const projectsRef = useMemoFirebase(() => firestore ? collection(firestore, 'projects') : null, [firestore]);
  const { data: projects } = useCollection<Project>(projectsRef);
  const projectMap = useMemo(() => new Map(projects?.map(p => [p.id, p.name])), [projects]);

  const { data: records, isLoading } = useCollection<FinanceRecord>(useMemoFirebase(() => financeRef ? query(financeRef, orderBy('date', 'desc')) : null, [financeRef]));

  const form = useForm<z.infer<typeof financeSchema>>({
    resolver: zodResolver(financeSchema),
    defaultValues: { 
      title: '',
      referenceNote: '', 
      amount: 0, 
      type: 'Income', 
      status: 'Paid', 
      date: format(new Date(), "yyyy-MM-dd"),
      projectId: ''
    },
  });

  useEffect(() => {
    if (editingRecord) {
        form.reset({
            title: editingRecord.title,
            referenceNote: editingRecord.referenceNote || '',
            amount: editingRecord.amount,
            type: editingRecord.type,
            status: editingRecord.status,
            date: editingRecord.date,
            projectId: editingRecord.projectId || 'none'
        });
        setPastedImage(editingRecord.imageUrl || null);
    } else {
        form.reset({
            title: '',
            referenceNote: '', 
            amount: 0, 
            type: 'Income', 
            status: 'Paid', 
            date: format(new Date(), "yyyy-MM-dd"),
            projectId: 'none'
        });
        setPastedImage(null);
    }
  }, [editingRecord, form]);

  const stats = useMemo(() => {
    if (!records) return { income: 0, expenses: 0, balance: 0 };
    const valid = records.filter(r => r.status === 'Paid' && !r.isDeleted);
    const income = valid.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expenses = valid.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             r.referenceNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (r.projectId && projectMap.get(r.projectId)?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesView = showDeleted ? r.isDeleted === true : !r.isDeleted;
        return matchesSearch && matchesView;
    });
  }, [records, searchTerm, projectMap, showDeleted]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
           const reader = new FileReader();
           reader.onload = (event) => {
             setPastedImage(event.target?.result as string);
             toast({ title: "Attachment detected", description: "Reference image added to transaction." });
           };
           reader.readAsDataURL(blob);
        }
      }
    }
  };

  async function onSubmit(values: z.infer<typeof financeSchema>) {
    if (!financeRef || !firestore) return;
    
    const data = {
        ...values,
        projectId: values.projectId === 'none' ? null : values.projectId,
        imageUrl: pastedImage || null,
        isDeleted: false,
    };

    if (editingRecord) {
        const docRef = doc(firestore, 'finance', editingRecord.id);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: "Record Updated" });
    } else {
        addDocumentNonBlocking(financeRef, {
            ...data,
            createdBy: user?.displayName || user?.email || 'System',
            createdAt: new Date().toISOString()
        });
        toast({ title: "Transaction Recorded" });
    }

    form.reset();
    setPastedImage(null);
    setIsAddOpen(false);
    setEditingRecord(null);
  }

  const toggleDelete = (id: string, isDeleted: boolean) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'finance', id);
    updateDocumentNonBlocking(docRef, { isDeleted });
    toast({ 
        title: isDeleted ? "Record Deleted" : "Record Restored", 
        variant: isDeleted ? "destructive" : "default" 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Teka Poisha</h1>
          <p className="text-muted-foreground mt-1">Cashflow management and financial records.</p>
        </div>

        <div className="flex items-center gap-2">
            <InvoiceSettingsDialog />
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleted(!showDeleted)}
                className={cn("font-bold uppercase tracking-tighter", showDeleted && "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20")}
            >
                {showDeleted ? <RotateCcw className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {showDeleted ? "Ledger" : "Trash"}
            </Button>

            <Button className="font-bold uppercase tracking-tighter" onClick={() => setIsAddOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Transaction
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="ink-card border-l-4 border-l-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Net Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">Tk {stats.income.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card className="ink-card border-l-4 border-l-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">Tk {stats.expenses.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card className="ink-card bg-black text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-white/60">Balance</CardTitle>
                <Wallet className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">Tk {stats.balance.toLocaleString()}</div>
            </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search records..." 
          className="pl-9 h-11 border-2 focus-visible:ring-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className={cn("ink-card", showDeleted && "border-destructive/30 bg-destructive/5")}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">Syncing ledger...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <Banknote className="mx-auto h-8 w-8 mb-4" />
              <p>No records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="ink-table-header">
                <TableRow>
                  <TableHead className="w-[100px]">TID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Title & Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-[10px] font-mono font-black text-muted-foreground">
                      #{record.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-xs">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                          <span className="font-bold text-sm">{record.title}</span>
                          {record.projectId && (
                              <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-1">
                                  <LinkIcon className="h-2 w-2" />
                                  {projectMap.get(record.projectId)}
                              </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                          "text-[9px] font-black h-5 uppercase",
                          record.type === 'Income' ? "border-black text-black" : "border-muted-foreground text-muted-foreground"
                      )}>
                          {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                        "text-right font-mono font-black",
                        record.type === 'Income' ? "text-black" : "text-muted-foreground"
                    )}>
                      Tk {record.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase">Actions</DropdownMenuLabel>
                              {!showDeleted ? (
                                  <>
                                      <DropdownMenuItem onSelect={() => setViewingRecord(record)}>
                                          <Eye className="mr-2 h-4 w-4" /> View
                                      </DropdownMenuItem>
                                      {record.type === 'Income' && (
                                        <DropdownMenuItem onSelect={() => setInvoiceRecord(record)}>
                                            <FileDown className="mr-2 h-4 w-4" /> Invoice
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onSelect={() => setEditingRecord(record)}>
                                          <Pencil className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                          onSelect={() => toggleDelete(record.id, true)} 
                                          className="text-destructive font-bold"
                                      >
                                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                  </>
                              ) : (
                                  <DropdownMenuItem onSelect={() => toggleDelete(record.id, false)}>
                                      <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                  </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lifted Modals */}
      <Dialog open={isAddOpen || !!editingRecord} onOpenChange={(val) => { if(!val) { setIsAddOpen(false); setEditingRecord(null); setPastedImage(null); } }}>
        <DialogContent className="max-w-md border-2 border-black shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-black uppercase">{editingRecord ? "Edit Record" : "Add Transaction"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-black uppercase text-xs">Link Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="none">General / None</SelectItem>
                            {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </FormItem>
                )} />

                <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-black uppercase text-xs">Title</FormLabel>
                    <FormControl><Input className="border-2" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />

                <FormField control={form.control} name="referenceNote" render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-black uppercase text-xs">Note</FormLabel>
                    <FormControl>
                        <Textarea onPaste={handlePaste} {...field} className="min-h-[100px] border-2 text-xs" />
                    </FormControl>
                </FormItem>
                )} />

                {pastedImage && (
                    <div className="relative w-full h-32 border-2 rounded-lg overflow-hidden">
                        <Image src={pastedImage} alt="Attachment" fill className="object-contain bg-muted" />
                        <button type="button" onClick={() => setPastedImage(null)} className="absolute top-2 right-2 bg-black text-white rounded-full p-1"><X className="h-4 w-4" /></button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black uppercase text-xs">Amount (Tk)</FormLabel>
                        <FormControl><Input type="number" className="border-2" {...field} /></FormControl>
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black uppercase text-xs">Date</FormLabel>
                        <FormControl><Input type="date" className="border-2" {...field} /></FormControl>
                    </FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black uppercase text-xs">Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Income">Income (+)</SelectItem>
                                <SelectItem value="Expense">Expense (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-black uppercase text-xs">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="border-2"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                    )} />
                </div>
                <Button type="submit" className="w-full font-black uppercase h-12">Save Record</Button>
            </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingRecord} onOpenChange={(val) => !val && setViewingRecord(null)}>
        <DialogContent className="max-w-2xl border-2 border-black">
            <DialogHeader>
                <DialogTitle className="font-black uppercase">Transaction Details</DialogTitle>
            </DialogHeader>
            {viewingRecord && (
                <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-start border-b-4 border-black pb-4">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">{viewingRecord.title}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{viewingRecord.date} • By {viewingRecord.createdBy}</p>
                        </div>
                        <div className="text-right">
                             <div className="text-3xl font-black">Tk {viewingRecord.amount.toLocaleString()}</div>
                             <Badge variant="outline" className="font-black uppercase">{viewingRecord.status}</Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase text-muted-foreground">Reference Note</h4>
                        <p className="text-sm bg-muted p-4 border italic">{viewingRecord.referenceNote || 'No notes.'}</p>
                    </div>
                    {viewingRecord.imageUrl && (
                        <div className="relative w-full h-80 rounded border-2 overflow-hidden bg-muted">
                            <Image src={viewingRecord.imageUrl} alt="Attachment" fill className="object-contain" />
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>

      <InvoiceModal 
          record={invoiceRecord} 
          project={projects?.find(p => p.id === invoiceRecord?.projectId)} 
          open={!!invoiceRecord}
          onOpenChange={(val) => !val && setInvoiceRecord(null)}
      />
    </div>
  );
}