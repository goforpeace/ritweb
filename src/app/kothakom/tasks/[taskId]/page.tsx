'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { TaskStatus } from '@/components/kothakom/TaskStatusBadge';
import { TaskStatusBadge } from '@/components/kothakom/TaskStatusBadge';
import { TaskNotes } from '@/components/kothakom/TaskNotes';
import EditTaskDialog from '@/components/kothakom/EditTaskDialog';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';

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

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { taskId } = params;

  const taskRef = useMemoFirebase(() => {
    if (!firestore || !user || !taskId) return null;
    return doc(firestore, 'tasks', taskId);
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

  if (isUserLoading || isLoadingTask) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be logged in to view this page.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-center">
              <p>Please log in to access the dashboard.</p>
              <Button asChild>
                <Link href="/cmi">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!task) {
     return (
      <div className="flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
             <Card className="w-full max-w-md mx-4">
                <CardHeader>
                <CardTitle>Task Not Found</CardTitle>
                <CardDescription>The task you are looking for does not exist.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/kothakom/tasks">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tasks
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  const assignedToEmails = Array.isArray(task.assignedTo) ? task.assignedTo : [];

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6 bg-muted/20">
        <div className="container mx-auto space-y-8">
            <Button asChild variant="outline">
                <Link href="/kothakom/tasks">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Tasks
                </Link>
            </Button>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column - Task Details */}
            <Card className="h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl mb-2">{task.title}</CardTitle>
                            <CardDescription>Task Details</CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                          <EditTaskDialog task={task} />
                          <TaskStatusBadge currentStatus={task.status || 'New'} documentId={task.id} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Summary</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{task.summary}</p>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-2 text-primary">Assigned To</h3>
                        <div className="flex flex-wrap gap-2">
                           {assignedToEmails.length > 0 ? (
                                assignedToEmails.map(email => (
                                    <Badge key={email} variant="secondary">{userEmailToNameMap.get(email) || email}</Badge>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Unassigned</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Column - Notepad */}
            <TaskNotes taskId={taskId} className="bg-card/50" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
