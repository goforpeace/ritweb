
'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, LayoutPanelLeft, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ProjectTaskNotes } from '@/components/kothakom/ProjectTaskNotes';
import { TaskStatusBadge, type TaskStatus } from '@/components/kothakom/TaskStatusBadge';

type Task = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  dueDate?: string;
  status: TaskStatus;
  assignedTo?: string[];
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export default function ProjectTaskDetailPage({ params }: { params: { projectId: string; taskId: string } }) {
  const { firestore } = useFirebase();
  const { projectId, taskId } = params;

  const taskRef = useMemoFirebase(() => {
    if (!firestore || !projectId || !taskId) return null;
    return doc(firestore, 'projects', projectId, 'tasks', taskId);
  }, [firestore, projectId, taskId]);

  const { data: task, isLoading: isLoadingTask } = useDoc<Task>(taskRef);

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);
  const nameMap = useMemo(() => new Map(users?.map(u => [u.email, u.name])), [users]);

  if (isLoadingTask) return <div className="py-20 text-center animate-pulse">Syncing task details...</div>;
  if (!task) return <div className="py-20 text-center">Task not found.</div>;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
             <Link href={`/kothakom/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
               <span className="font-mono text-[10px]">TASK-REF-{taskId.slice(-4).toUpperCase()}</span>
               <Separator orientation="vertical" className="h-3" />
               <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {task.dueDate || 'No Date'}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <TaskStatusBadge 
                currentStatus={task.status || 'New'} 
                documentId={task.id} 
                // Note: TaskStatusBadge currently defaults to root tasks collection
                // I will need to either update it or handle internal project task status here
            />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch flex-1">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <Card className="border-border/50 shadow-sm bg-card/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <LayoutPanelLeft className="h-4 w-4" /> Deliverable Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm leading-relaxed text-foreground/80 bg-background/50 p-6 rounded-xl border border-border/40 whitespace-pre-wrap italic">
                        {task.summary || "No description provided for this deliverable."}
                    </p>

                    <Separator />

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
                                <Users className="h-3 w-3" /> Assigned Personnel
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {task.assignedTo?.map(email => (
                                    <Badge key={email} variant="secondary" className="bg-secondary/60 px-3 py-1 text-[11px]">
                                        {nameMap.get(email) || email}
                                    </Badge>
                                ))}
                                {(!task.assignedTo || task.assignedTo.length === 0) && (
                                    <span className="text-xs italic text-muted-foreground">Awaiting personnel allocation.</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Milestones
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Created: {format(new Date(task.createdAt), "PPP")}</span>
                                </div>
                                {task.dueDate && (
                                    <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Target Date: {task.dueDate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 min-h-[500px]">
            <ProjectTaskNotes projectId={projectId} taskId={taskId} />
        </div>
      </div>
    </div>
  );
}
