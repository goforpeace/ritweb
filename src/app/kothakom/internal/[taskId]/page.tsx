'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { InternalTaskStatusBadge, type TaskStatus } from '@/components/kothakom/InternalTaskStatusBadge';
import { InternalTaskNotes } from '@/components/kothakom/InternalTaskNotes';
import EditInternalTaskDialog from '@/components/kothakom/EditInternalTaskDialog';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

type Task = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  status: TaskStatus;
  assignedTo?: string[];
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export default function InternalTaskDetailPage({ params }: { params: { taskId: string } }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { taskId } = params;

  const taskRef = useMemoFirebase(() => {
    if (!firestore || !user || !taskId) return null;
    return doc(firestore, 'internal_tasks', taskId);
  }, [firestore, user, taskId]);

  const { data: task, isLoading: isLoadingTask } = useDoc<Task>(taskRef);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users } = useCollection<UserProfile>(usersRef);
  
  const userEmailToNameMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.email, u.name]));
  }, [users]);

  if (isLoadingTask) {
    return <div className="py-20 text-center animate-pulse text-muted-foreground">Accessing internal board...</div>;
  }

  if (!task) {
     return (
        <div className="flex items-center justify-center py-20">
             <Card className="w-full max-w-md mx-4 text-center">
                <CardHeader>
                    <CardTitle>Record Not Found</CardTitle>
                    <CardDescription>The internal task record could not be retrieved.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/kothakom/internal">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Internal List
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const assignedToEmails = Array.isArray(task.assignedTo) ? task.assignedTo : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
                <Link href="/kothakom/internal">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Internal Logged: {format(new Date(task.createdAt), "PPP")}</span>
                </div>
            </div>
        </div>
          
        <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/50 border-l-4 border-l-orange-500/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Internal Operations</CardTitle>
                            <CardDescription>Confidential team documentation</CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                          <EditInternalTaskDialog task={task} />
                          <InternalTaskStatusBadge currentStatus={task.status || 'New'} documentId={task.id} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 border-t">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-3">Operating Summary</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 bg-muted/20 p-4 rounded-lg">
                                {task.summary}
                            </p>
                        </div>
                        
                        <Separator />

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-3">Internal Owners</h3>
                            <div className="flex flex-wrap gap-2">
                            {assignedToEmails.length > 0 ? (
                                    assignedToEmails.map(email => (
                                        <Badge key={email} variant="secondary" className="px-3 py-1 font-medium bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                                            {userEmailToNameMap.get(email) || email}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm italic text-muted-foreground">Awaiting internal ownership</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                <InternalTaskNotes taskId={taskId} className="bg-card/50 border-border/40 shadow-none" />
            </div>
        </div>
    </div>
  );
}
