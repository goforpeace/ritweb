
'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ListChecks, Eye, Calendar, Users as UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import NewProjectTaskDialog from './NewProjectTaskDialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

type ProjectTask = {
  id: string;
  title: string;
  status: 'New' | 'In Progress' | 'Completed';
  createdAt: string;
  dueDate?: string;
  assignedTo?: string[];
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export function ProjectTasksTable({ projectId }: { projectId: string }) {
  const { firestore } = useFirebase();

  const tasksRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return collection(firestore, 'projects', projectId, 'tasks');
  }, [firestore, projectId]);

  const { data: tasks, isLoading } = useCollection<ProjectTask>(
    useMemoFirebase(() => tasksRef ? query(tasksRef, orderBy('createdAt', 'desc')) : null, [tasksRef])
  );

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);
  const nameMap = useMemo(() => new Map(users?.map(u => [u.email, u.name])), [users]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Project Deliverables
        </h3>
        <NewProjectTaskDialog projectId={projectId} />
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-xs">Task Name</TableHead>
              <TableHead className="text-xs">Assigned</TableHead>
              <TableHead className="text-xs">Due Date</TableHead>
              <TableHead className="text-xs text-right">Status</TableHead>
              <TableHead className="text-xs text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id} className="group">
                <TableCell className="text-xs font-bold">{task.title}</TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {task.assignedTo?.slice(0, 3).map((email, i) => (
                      <div key={i} className="h-5 w-5 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[8px] font-bold" title={nameMap.get(email) || email}>
                        {(nameMap.get(email) || 'U').charAt(0)}
                      </div>
                    ))}
                    {task.assignedTo && task.assignedTo.length > 3 && (
                      <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">
                        +{task.assignedTo.length - 3}
                      </div>
                    )}
                    {(!task.assignedTo || task.assignedTo.length === 0) && <span className="text-[10px] text-muted-foreground italic">None</span>}
                  </div>
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground">
                   {task.dueDate ? (
                     <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                     </div>
                   ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={cn(
                    "text-[8px] px-1 py-0 h-4",
                    task.status === 'Completed' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                    task.status === 'In Progress' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : ""
                  )}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button asChild variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/kothakom/projects/${projectId}/tasks/${task.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                   </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!tasks || tasks.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center opacity-40 italic text-[10px]">
                   Awaiting deliverable entry.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
