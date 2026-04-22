
'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type ProjectTask = {
  id: string;
  title: string;
  status: 'New' | 'In Progress' | 'Completed';
  createdAt: string;
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

  const handleAddTask = () => {
    if (!tasksRef) return;
    const title = prompt("Enter project task title:");
    if (!title) return;
    
    addDocumentNonBlocking(tasksRef, {
      title,
      status: 'New',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          Project Deliverables
        </h3>
        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleAddTask}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-xs">Task Name</TableHead>
              <TableHead className="text-xs text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="text-xs font-medium">{task.title}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={cn(
                    "text-[8px] px-1 py-0 h-4",
                    task.status === 'Completed' ? "bg-green-500/10 text-green-600 border-green-500/20" : ""
                  )}>
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!tasks || tasks.length === 0) && !isLoading && (
              <TableRow>
                <TableCell colSpan={2} className="py-20 text-center opacity-40 italic text-[10px]">
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

// Helper utility for conditional classes if not imported
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
