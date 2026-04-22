'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Wallet, Building2, LayoutPanelLeft, Users, Timer, Plus, Clock, CheckCircle2, Info, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { ProjectNotes } from '@/components/kothakom/ProjectNotes';
import { ProjectTasksTable } from '@/components/kothakom/ProjectTasksTable';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';
import EditProjectDialog from '@/components/kothakom/EditProjectDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'In Progress' | 'Hold' | 'Cancelled' | 'Completed';
  projectType: 'Fixed' | 'Monthly';
  clientId: string;
  budget: number;
  workHours: number;
  startDate: string;
  handoverDate: string;
  managerEmail: string;
  assignedEmails: string[];
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  company: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

type FinanceRecord = {
    id: string;
    projectId?: string;
    amount: number;
    type: 'Income' | 'Expense';
    status: 'Paid' | 'Unpaid' | 'Cancelled';
    isDeleted?: boolean;
};

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { firestore } = useFirebase();
  const { projectId } = params;
  const { toast } = useToast();
  const [addHoursValue, setAddHoursValue] = useState('1');

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return doc(firestore, 'projects', projectId);
  }, [firestore, projectId]);

  const { data: project, isLoading: isLoadingProject } = useDoc<Project>(projectRef);

  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : null, [firestore]);
  const { data: clients } = useCollection<Client>(clientsRef);

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const financeRef = useMemoFirebase(() => firestore ? collection(firestore, 'finance') : null, [firestore]);
  const { data: financeRecords } = useCollection<FinanceRecord>(financeRef);

  const selectedClient = useMemo(() => clients?.find(c => c.id === project?.clientId), [clients, project]);
  const manager = useMemo(() => users?.find(u => u.email === project?.managerEmail), [users, project]);
  const teamMembers = useMemo(() => users?.filter(u => project?.assignedEmails?.includes(u.email)), [users, project]);

  const projectFinanceStats = useMemo(() => {
    if (!financeRecords || !projectId) return { income: 0, expense: 0 };
    const projectRecords = financeRecords.filter(r => r.projectId === projectId && !r.isDeleted && r.status === 'Paid');
    const income = projectRecords.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expense = projectRecords.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    return { income, expense };
  }, [financeRecords, projectId]);

  const handleAddHours = () => {
    if (!projectRef || !addHoursValue) return;
    const hours = parseFloat(addHoursValue);
    if (isNaN(hours)) return;

    updateDocumentNonBlocking(projectRef, {
        workHours: increment(hours)
    });

    toast({ title: "Effort Logged", description: `Successfully added ${hours} hours to project effort.` });
    setAddHoursValue('1');
  };

  if (isLoadingProject) return <div className="py-20 text-center animate-pulse">Accessing project details...</div>;
  if (!project) return <div className="py-20 text-center">Project not found.</div>;

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className='rounded-full'>
             <Link href="/kothakom/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
               <span className="font-mono text-primary font-bold uppercase">#PRJ-{projectId.slice(-4)}</span>
               <Separator orientation="vertical" className="h-3" />
               <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Created {format(new Date(project.createdAt), "PPP")}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <EditProjectDialog project={project} />
        </div>
      </div>

      {/* Project Summary Pane (Hero Card) */}
      <Card className="border-border/50 shadow-xl bg-card/60 backdrop-blur-md overflow-hidden ring-1 ring-white/5">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4 px-8">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <LayoutPanelLeft className="h-4 w-4 text-primary" />
                    Project Overview
                </CardTitle>
                <Badge className={cn(
                    "px-4 py-1 font-bold uppercase text-[10px] tracking-widest",
                    project.status === 'Completed' ? "bg-emerald-500" :
                    project.status === 'In Progress' ? "bg-blue-500" :
                    project.status === 'Cancelled' ? "bg-destructive" : "bg-muted text-foreground"
                )}>
                    {project.status}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 border-b border-border/40">
            <div className="p-8 space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="h-3 w-3 text-emerald-500" /> 
                    Budget & Type
                </h4>
                <div className="flex flex-col">
                    <p className="text-2xl font-black text-emerald-500">Tk {project.budget?.toLocaleString() || '0'}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">{project.projectType === 'Monthly' ? 'Monthly Retainer' : 'Fixed Price Project'}</p>
                </div>
            </div>

            <div className="p-8 space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-primary" /> 
                    Timeline
                </h4>
                <div className="flex flex-col">
                    <p className="text-sm font-bold">Starts: <span className="font-normal text-muted-foreground">{project.startDate}</span></p>
                    <p className="text-sm font-bold">Handover: <span className="text-primary font-black underline decoration-primary/30 underline-offset-4">{project.handoverDate}</span></p>
                </div>
            </div>

            <div className="p-8 space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Timer className="h-3 w-3 text-accent" /> 
                    Logged Effort
                </h4>
                <div className="flex items-center gap-4">
                    <div>
                        <p className="text-2xl font-black text-accent">{project.workHours || 0} <span className="text-xs font-normal text-muted-foreground">hrs</span></p>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button size="icon" className="h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-4 shadow-2xl border-primary/20" align="start">
                            <div className="space-y-4">
                                <div className='flex items-center gap-2 border-b pb-2'>
                                    <Clock className='h-4 w-4 text-primary' />
                                    <p className="text-xs font-bold uppercase tracking-wider">Log Work Hours</p>
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        className="h-10 text-sm font-bold" 
                                        value={addHoursValue} 
                                        onChange={(e) => setAddHoursValue(e.target.value)} 
                                    />
                                    <Button className="h-10 px-6 font-bold" onClick={handleAddHours}>Log</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="p-8 space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-primary/60" /> 
                    Client
                </h4>
                <div className="flex flex-col">
                    <p className="text-sm font-bold truncate">{selectedClient?.name || 'Loading...'}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase">{selectedClient?.company || 'Organization'}</p>
                </div>
            </div>
          </div>

          {/* Financial Tracking Section (Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x border-b border-border/40 bg-muted/5">
              <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-500/10">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Income</p>
                          <p className="text-xl font-black text-emerald-500">Tk {projectFinanceStats.income.toLocaleString()}</p>
                      </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5">Project Revenue</Badge>
              </div>
              <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-500/10">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Expenses</p>
                          <p className="text-xl font-black text-red-500">Tk {projectFinanceStats.expense.toLocaleString()}</p>
                      </div>
                  </div>
                  <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/5">Operational Cost</Badge>
              </div>
          </div>

          {/* Description & Team Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-border/40">
            <div className="lg:col-span-2 p-8 space-y-4">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Info className="h-3 w-3" /> Description & Scope
                </h4>
                <div className="text-sm leading-relaxed text-foreground/90 bg-muted/20 p-6 rounded-xl border border-border/20 whitespace-pre-wrap min-h-[120px] break-words shadow-inner">
                    {project.description || "No detailed summary provided for this project profile."}
                </div>
            </div>

            <div className="p-8 space-y-6 bg-muted/10">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <User className="h-3 w-3 text-primary/60" /> Lead Manager
                    </h4>
                    <div className='flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-border/10'>
                        <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase shadow-sm'>
                            {manager?.name?.substring(0,2) || '??'}
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-none">{manager?.name || 'Awaiting Manager'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{project.managerEmail}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-3 w-3 text-primary/60" /> Assigned Personnel
                    </h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {teamMembers?.map(member => (
                            <Badge key={member.id} variant="secondary" className="px-3 py-1 text-[10px] font-medium bg-secondary/40 border-border/40 hover:bg-secondary/60">
                                {member.name}
                            </Badge>
                        ))}
                        {(!teamMembers || teamMembers.length === 0) && <p className="text-xs italic text-muted-foreground">No team members allocated yet.</p>}
                    </div>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace (Activity Feed & Tasks) */}
      <div className="grid grid-cols-12 gap-8 items-stretch min-h-[700px]">
        {/* Activity Pane (Left) */}
        <div className="col-span-12 lg:col-span-4 border border-border/40 rounded-2xl bg-card/40 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectNotes projectId={projectId} />
        </div>

        {/* Project Task Pane (Right) */}
        <div className="col-span-12 lg:col-span-8 border border-border/40 rounded-2xl bg-card/40 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectTasksTable projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
