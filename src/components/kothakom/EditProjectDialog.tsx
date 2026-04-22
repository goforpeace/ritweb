
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import UserSelect from './UserSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, "Project title is required"),
  description: z.string().min(5, "Description is required"),
  status: z.enum(["New", "In Progress", "Hold", "Cancelled", "Completed"]),
  projectType: z.enum(["Fixed", "Monthly"]),
  clientId: z.string().min(1, "Please select a client"),
  budget: z.coerce.number().min(0),
  workHours: z.coerce.number().min(0),
  startDate: z.string().min(1, "Start date is required"),
  handoverDate: z.string().min(1, "Handover date is required"),
  managerEmail: z.string().email("Please select a manager"),
  assignedEmails: z.array(z.string().email()).optional(),
});

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'In Progress' | 'Hold' | 'Cancelled' | 'Completed';
  projectType: 'Fixed' | 'Monthly';
  clientId: string;
  budget: number;
  workHours: number;
  startDate: string;
  handoverDate: string;
  managerEmail: string;
  assignedEmails: string[];
};

type Client = { id: string; name: string; };
type UserProfile = { id: string; name: string; email: string; };

export default function EditProjectDialog({ project }: { project: Project }) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : null, [firestore]);
  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: clients } = useCollection<Client>(clientsRef);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
      projectType: project.projectType || 'Fixed',
      clientId: project.clientId,
      budget: project.budget,
      workHours: project.workHours || 0,
      startDate: project.startDate,
      handoverDate: project.handoverDate,
      managerEmail: project.managerEmail,
      assignedEmails: project.assignedEmails || [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    const projectRef = doc(firestore, 'projects', project.id);

    updateDocumentNonBlocking(projectRef, values);

    toast({
      title: 'Project Updated',
      description: `Project "${values.name}" has been updated successfully.`,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3 w-3" /> Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto border-border">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>Modify the project configuration and revenue settings.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="clientId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="handoverDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handover Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (Tk)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="workHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Hours (Accumulated)</FormLabel>
                    <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="projectType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Fixed">Fixed Price</SelectItem>
                        <SelectItem value="Monthly">Monthly Service</SelectItem>
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
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Hold">Hold</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField control={form.control} name="managerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Manager</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {users?.map(u => <SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="assignedEmails" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Team Members</FormLabel>
                    <FormControl><UserSelect field={field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
