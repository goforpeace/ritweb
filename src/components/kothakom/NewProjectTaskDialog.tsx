
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
import { addDocumentNonBlocking, useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import UserSelect from './UserSelect';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title is required.' }),
  summary: z.string().min(5, { message: 'Summary is required.' }),
  dueDate: z.string().optional(),
  assignedTo: z.array(z.string().email()).optional(),
});

interface NewProjectTaskDialogProps {
  projectId: string;
}

export default function NewProjectTaskDialog({ projectId }: NewProjectTaskDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      summary: '',
      dueDate: format(new Date(), "yyyy-MM-dd"),
      assignedTo: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !projectId) return;

    const tasksRef = collection(firestore, 'projects', projectId, 'tasks');

    addDocumentNonBlocking(tasksRef, {
      ...values,
      status: 'New',
      createdAt: new Date().toISOString(),
    });

    toast({
      title: 'Task Created',
      description: `New deliverable "${values.title}" added to project.`,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 px-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Project Task</DialogTitle>
          <DialogDescription>Add a specific milestone for this project.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl><Input placeholder="E.g., Client Review Session" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Summary</FormLabel>
                  <FormControl><Textarea placeholder="Task details..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <FormControl><UserSelect field={field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">Create Project Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
