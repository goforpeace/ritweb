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
import { updateDocumentNonBlocking, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  summary: z.string().min(10, { message: 'Summary must be at least 10 characters.' }),
});

type Task = {
    id: string;
    title: string;
    summary: string;
}

interface EditTaskDialogProps {
    task: Task;
}

export default function EditTaskDialog({ task }: EditTaskDialogProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      summary: task.summary,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not connect to the database. Please try again later.',
      });
      return;
    }
    const taskRef = doc(firestore, 'tasks', task.id);

    updateDocumentNonBlocking(taskRef, values);

    toast({
      title: 'Task Updated!',
      description: `Task "${values.title}" has been updated.`,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Design new homepage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a short summary of the task..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter>
                    <Button type="submit" className="w-full" size="lg">
                        Save Changes
                    </Button>
               </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
