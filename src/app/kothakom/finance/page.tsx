
'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Banknote, PlusCircle, Search, TrendingUp, TrendingDown, Wallet, ImageIcon, X, Link as LinkIcon, User, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
};

type Project = {
    id: string;
    name: string;
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

  const stats = useMemo(() => {
    if (!records) return { income: 0, expenses: 0, balance: 0 };
    const valid = records.filter(r => r.status === 'Paid');
    const income = valid.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expenses = valid.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referenceNote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.projectId && projectMap.get(r.projectId)?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [records, searchTerm, projectMap]);

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
    if (!financeRef) return;
    addDocumentNonBlocking(financeRef, {
        ...values,
        imageUrl: pastedImage || null,
        createdBy: user?.displayName || user?.email || 'System',
        createdAt: new Date().toISOString()
    });
    toast({ title: "Transaction Recorded", description: `Record for Tk ${values.amount} saved.` });
    form.reset();
    setPastedImage(null);
    setIsAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teka Poisha</h1>
          <p className="text-muted-foreground mt-1">Cashflow management and financial records.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(val) => { setIsAddOpen(val); if(!val) setPastedImage(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Financial Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Project (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="none">None / General</SelectItem>
                            {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="E.g., Client Advance or Monthly Rent" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="referenceNote" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Note & Attachments</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Textarea 
                                placeholder="Details about the transaction. Paste screenshot (Ctrl+V) here to attach..." 
                                onPaste={handlePaste}
                                {...field}
                                className="min-h-[100px] text-xs"
                            />
                            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground flex items-center gap-1 opacity-50">
                                <ImageIcon className="h-3 w-3" />
                                <span>Paste Screenshots Support</span>
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {pastedImage && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden group">
                        <Image src={pastedImage} alt="Reference Attachment" fill className="object-contain bg-black/5" />
                        <button 
                            type="button" 
                            onClick={() => setPastedImage(null)}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Amount (Tk)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Income">Income (+)</SelectItem>
                                <SelectItem value="Expense">Expense (-)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 text-lg font-bold">Record Transaction</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-emerald-500">Tk {stats.income.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">TOTAL RECEIVED PAYMENTS</p>
            </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-red-500">Tk {stats.expenses.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">TOTAL PAID EXPENDITURE</p>
            </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-primary">Tk {stats.balance.toLocaleString()}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">TOTAL OPERATING BALANCE</p>
            </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search records by title, note or project..." 
          className="pl-9 h-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-10 text-center animate-pulse">Syncing ledger...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
              <Banknote className="mx-auto h-8 w-8 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No financial records matching your search.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title & Reference Note</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="group">
                      <TableCell className="text-xs whitespace-nowrap">{record.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm flex items-center gap-1.5">
                                {record.title}
                                {record.imageUrl && <ImageIcon className="h-3 w-3 text-primary animate-pulse" />}
                            </span>
                            {record.referenceNote && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <FileText className="h-2.5 w-2.5" />
                                    {record.referenceNote.length > 50 ? `${record.referenceNote.substring(0, 50)}...` : record.referenceNote}
                                </span>
                            )}
                            {record.projectId && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LinkIcon className="h-2.5 w-2.5" />
                                    {projectMap.get(record.projectId) || 'Linked Project'}
                                </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <User className="h-3 w-3" />
                            {record.createdBy || 'Unknown'}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(
                            "text-[10px] font-bold h-5 px-1.5",
                            record.type === 'Income' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                        )}>
                            {record.type === 'Income' ? 'REV' : 'EXP'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                            "text-[10px] font-medium h-5 px-1.5",
                            record.status === 'Paid' ? "border-emerald-500/50 text-emerald-500" : 
                            record.status === 'Unpaid' ? "border-orange-500/50 text-orange-500" :
                            "border-muted text-muted-foreground"
                        )}>
                            {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                          "text-right font-mono font-bold text-sm",
                          record.type === 'Income' ? "text-emerald-500" : "text-red-500"
                      )}>
                        {record.type === 'Income' ? '+' : '-'}Tk {record.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
