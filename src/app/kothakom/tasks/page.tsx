'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import type { TaskStatus } from '@/components/kothakom/TaskStatusBadge';
import { TaskStatusBadge } from '@/components/kothakom/TaskStatusBadge';
import NewTaskDialog from '@/components/kothakom/NewTaskDialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type Task = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  status: TaskStatus;
};

export default function TasksPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const tasksRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'tasks');
  }, [firestore, user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!tasksRef) return null;
    return query(tasksRef, orderBy('createdAt', 'desc'));
  }, [tasksRef]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const filteredTasks = tasks?.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUserLoading) {
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
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container mx-auto space-y-8">
            <div className='flex justify-between items-center'>
                <Button asChild variant="outline">
                    <Link href="/kothakom">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <NewTaskDialog />
            </div>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your internal project tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search tasks by title..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
              </div>
              {isLoadingTasks && <p>Loading tasks...</p>}
              {!isLoadingTasks && (!filteredTasks || filteredTasks.length === 0) && <p>No tasks found.</p>}
              {!isLoadingTasks && filteredTasks && filteredTasks.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Title</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task, index) => (
                          <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono">
                                <Link href={`/kothakom/tasks/${task.id}`} className="block w-full h-full">
                                    {String(tasks.length - index).padStart(2, '0')}
                                </Link>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                 <Link href={`/kothakom/tasks/${task.id}`} className="block w-full h-full">
                                    {format(new Date(task.createdAt), "PPP")}
                                 </Link>
                            </TableCell>
                            <TableCell>
                                <TaskStatusBadge currentStatus={task.status || 'New'} documentId={task.id} />
                            </TableCell>
                            <TableCell>
                                <Link href={`/kothakom/tasks/${task.id}`} className="block w-full h-full">
                                    {task.title}
                                </Link>
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
      </main>
      <Footer />
    </div>
  );
}
