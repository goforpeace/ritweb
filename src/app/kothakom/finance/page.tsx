
'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Banknote, PlusCircle, Search, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
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

type FinanceRecord = {
  id: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Pending' | 'Completed' | 'Cancelled';
  date: string;
};

const financeSchema = z.object({
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["Income", "Expense"]),
  status: z.enum(["Pending", "Completed", "Cancelled"]),
  date: z.string().min(1, "Date is required"),
});

export default function FinancePage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const financeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'finance');
  }, [firestore, user]);

  const { data: records, isLoading } = useCollection<FinanceRecord>(useMemoFirebase(() => financeRef ? query(financeRef, orderBy('date', 'desc')) : null, [financeRef]));

  const form = useForm<z.infer<typeof financeSchema>>({
    resolver: zodResolver(financeSchema),
    defaultValues: { 
      description: '', 
      amount: 0, 
      type: 'Income', 
      status: 'Completed', 
      date: format(new Date(), "yyyy-MM-dd") 
    },
  });

  const stats = useMemo(() => {
    if (!records) return { income: 0, expenses: 0, balance: 0 };
    const completed = records.filter(r => r.status === 'Completed');
    const income = completed.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expenses = completed.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(r => r.description.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [records, searchTerm]);

  async function onSubmit(values: z.infer<typeof financeSchema>) {
    if (!financeRef) return;
    addDocumentNonBlocking(financeRef, values);
    toast({ title: "Record Saved", description: `Transaction of $${values.amount} recorded.` });
    form.reset();
    setIsAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teka Poisha</h1>
          <p className="text-muted-foreground mt-1">Cashflow management and financial records.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input placeholder="E.g., Client Payment: Acme Inc" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
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
                        <FormLabel>Type</FormLabel>
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
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Record Entry</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-500">${stats.income.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">${stats.expenses.toLocaleString()}</div>
            </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">${stats.balance.toLocaleString()}</div>
            </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search records..." 
          className="pl-9"
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
              <p className="text-muted-foreground">No financial records found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">{record.date}</TableCell>
                      <TableCell className="font-medium text-xs">{record.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(
                            "text-[10px]",
                            record.type === 'Income' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                        )}>
                            {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                            "text-[10px] font-medium",
                            record.status === 'Completed' ? "text-emerald-500" : "text-yellow-500"
                        )}>
                            {record.status}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                          "text-right font-mono font-bold",
                          record.type === 'Income' ? "text-emerald-500" : "text-red-500"
                      )}>
                        {record.type === 'Income' ? '+' : '-'}${record.amount.toLocaleString()}
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
