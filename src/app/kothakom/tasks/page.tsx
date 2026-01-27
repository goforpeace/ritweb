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
import { useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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


export default function TasksPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');

  const tasksRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'tasks');
  }, [firestore, user]);

  const tasksQuery = useMemoFirebase(() => {
    if (!tasksRef) return null;
    return query(tasksRef, orderBy('createdAt', 'desc'));
  }, [tasksRef]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const userEmailToNameMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.email, u.name]));
  }, [users]);


  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAssignee = !showMyTasks || (Array.isArray(task.assignedTo) && task.assignedTo.includes(user?.email || ''));
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        return matchesSearch && matchesAssignee && matchesStatus;
    });
  }, [tasks, searchTerm, showMyTasks, user, statusFilter]);


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
                <Link href="/cmi">Go to Login</Link>
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
                <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search tasks by title..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="my-tasks-filter" checked={showMyTasks} onCheckedChange={setShowMyTasks} />
                        <Label htmlFor="my-tasks-filter">Show My Tasks</Label>
                    </div>
                </div>
                 <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)} className="w-full">
                    <TabsList>
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="New">New</TabsTrigger>
                        <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                        <TabsTrigger value="Completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
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
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task, index) => (
                          <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono">
                                <Link href={`/kothakom/tasks/${task.id}`} className="block w-full h-full">
                                    {String((tasks?.length || 0) - (tasks?.findIndex(t => t.id === task.id) || 0)).padStart(2, '0')}
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
                            <TableCell>
                                <Link href={`/kothakom/tasks/${task.id}`} className="block w-full h-full">
                                    {(Array.isArray(task.assignedTo) && task.assignedTo.length > 0) 
                                        ? task.assignedTo.map(email => userEmailToNameMap.get(email) || email).join(', ')
                                        : 'Unassigned'
                                    }
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
