'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { InternalTaskStatusBadge, type TaskStatus } from '@/components/kothakom/InternalTaskStatusBadge';
import NewInternalTaskDialog from '@/components/kothakom/NewInternalTaskDialog';
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


export default function InternalTasksPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');

  const tasksRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'internal_tasks');
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Internal Tasks</h1>
                <p className="text-muted-foreground mt-1">Manage team-only operations and internal processes.</p>
            </div>
            <NewInternalTaskDialog />
        </div>

        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search internal board..." 
                        className="pl-9 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-muted/30 px-3 h-10 rounded-md border border-border/50">
                    <Switch id="my-internal-tasks" checked={showMyTasks} onCheckedChange={setShowMyTasks} />
                    <Label htmlFor="my-internal-tasks" className="text-xs font-medium cursor-pointer">My Tasks</Label>
                </div>
            </div>

            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
                    <TabsTrigger value="All">All</TabsTrigger>
                    <TabsTrigger value="New">New</TabsTrigger>
                    <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <Card className="border-border/50">
            <CardContent className="pt-6">
              {isLoadingTasks && <div className="py-10 text-center text-muted-foreground animate-pulse">Syncing board...</div>}
              {!isLoadingTasks && (!filteredTasks || filteredTasks.length === 0) && (
                 <div className="py-20 text-center border-2 border-dashed rounded-lg">
                    <Filter className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">No internal tasks found.</p>
                </div>
              )}
              {!isLoadingTasks && filteredTasks && filteredTasks.length > 0 && (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[80px]">Ref</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                          <TableRow key={task.id} className="hover:bg-muted/30 group">
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                <Link href={`/kothakom/internal/${task.id}`} className="block">
                                    #INT-{String((tasks?.length || 0) - (tasks?.findIndex(t => t.id === task.id) || 0)).padStart(2, '0')}
                                </Link>
                            </TableCell>
                            <TableCell className="font-medium">
                                <Link href={`/kothakom/internal/${task.id}`} className="block hover:underline decoration-primary/50 underline-offset-4">
                                    {task.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <InternalTaskStatusBadge currentStatus={task.status || 'New'} documentId={task.id} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {(Array.isArray(task.assignedTo) && task.assignedTo.length > 0) 
                                    ? task.assignedTo.map(email => userEmailToNameMap.get(email) || email).join(', ')
                                    : <span className="italic">Unassigned</span>
                                }
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                                {format(new Date(task.createdAt), "MMM d, yyyy")}
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
