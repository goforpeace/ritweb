'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Wallet, Building2, LayoutPanelLeft, Users, Timer, Plus, Clock } from 'lucide-react';
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

  const selectedClient = useMemo(() => clients?.find(c => c.id === project?.clientId), [clients, project]);
  const manager = useMemo(() => users?.find(u => u.email === project?.managerEmail), [users, project]);
  const teamMembers = useMemo(() => users?.filter(u => project?.assignedEmails?.includes(u.email)), [users, project]);

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
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className='rounded-full'>
             <Link href="/kothakom/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
               <Badge variant="secondary" className="bg-primary/10 text-primary uppercase text-[10px] tracking-wider">{project.status}</Badge>
               <span className="font-mono text-muted-foreground/60 uppercase">#PRJ-{projectId.slice(-4)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <EditProjectDialog project={project} />
        </div>
      </div>

      {/* Hero Summary Card */}
      <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 space-y-8">
          {/* Top Row: Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <StatItem 
                icon={Calendar} 
                label="Project Timeline" 
                value={`${project.startDate} — ${project.handoverDate}`}
                subValue="Start to Handover"
            />
            
            <StatItem 
                icon={Wallet} 
                label={project.projectType === 'Monthly' ? 'Monthly Fee' : 'Fixed Budget'} 
                value={`Tk ${project.budget?.toLocaleString() || '0'}`}
                iconColor="text-emerald-500"
                valueColor="text-emerald-500"
            />

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Timer className="h-3 w-3 text-primary" /> Logged Effort
              </h4>
              <div className="flex items-center gap-2 pt-1">
                  <p className="text-lg font-extrabold">{project.workHours || 0} <span className="text-xs font-normal text-muted-foreground">hrs</span></p>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button size="icon" variant="outline" className="h-6 w-6 rounded-full border-primary/30 text-primary hover:bg-primary/10">
                              <Plus className="h-3 w-3" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-4 shadow-xl" align="start">
                          <div className="space-y-3">
                              <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 text-primary' />
                                <p className="text-xs font-bold uppercase tracking-wider">Log Work Hours</p>
                              </div>
                              <div className="flex gap-2">
                                  <Input 
                                      type="number" 
                                      className="h-9 text-sm" 
                                      value={addHoursValue} 
                                      onChange={(e) => setAddHoursValue(e.target.value)} 
                                  />
                                  <Button size="sm" className="h-9 px-4" onClick={handleAddHours}>Log</Button>
                              </div>
                          </div>
                      </PopoverContent>
                  </Popover>
              </div>
            </div>

            <StatItem 
                icon={Building2} 
                label="Client Partner" 
                value={selectedClient?.name || 'Loading...'}
                subValue={selectedClient?.company || 'Not Specified'}
            />

             <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <LayoutPanelLeft className="h-3 w-3 text-accent" /> Revenue Model
                </h4>
                <p className="text-sm font-bold pt-1">{project.projectType === 'Monthly' ? 'Retainer (Monthly)' : 'Fixed Bid'}</p>
                <p className="text-[10px] text-muted-foreground">Business Structure</p>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Middle Row: Description */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <LayoutPanelLeft className="h-3 w-3" /> Description & Scope
            </h4>
            <div className="text-sm leading-relaxed text-foreground/90 bg-muted/20 p-6 rounded-xl border border-border/20 whitespace-pre-wrap min-h-[100px] break-words">
              {project.description || "No detailed summary provided for this project profile."}
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Bottom Row: Team */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <User className="h-3 w-3 text-primary/60" /> Lead Manager
              </h4>
              <div className='flex items-center gap-3 bg-background/30 p-3 rounded-lg border border-border/10'>
                <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase'>
                    {manager?.name?.substring(0,2) || '??'}
                </div>
                <div>
                    <p className="text-sm font-bold">{manager?.name || 'Awaiting Manager'}</p>
                    <p className="text-[10px] text-muted-foreground">{project.managerEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Users className="h-3 w-3 text-primary/60" /> Assigned Personnel
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {teamMembers?.map(member => (
                  <Badge key={member.id} variant="secondary" className="px-3 py-1 text-[11px] font-medium bg-secondary/40 border-border/40">
                    {member.name}
                  </Badge>
                ))}
                {(!teamMembers || teamMembers.length === 0) && <p className="text-xs italic text-muted-foreground pt-2">No team members allocated yet.</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace (Notes and Tasks moved down) */}
      <div className="grid grid-cols-12 gap-8 items-stretch min-h-[600px]">
        {/* Activity Pane */}
        <div className="col-span-12 lg:col-span-4 border border-border/40 rounded-2xl bg-card/20 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectNotes projectId={projectId} />
        </div>

        {/* Tasks Pane */}
        <div className="col-span-12 lg:col-span-8 border border-border/40 rounded-2xl bg-card/20 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectTasksTable projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, subValue, iconColor = "text-primary", valueColor }: any) {
  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
        <Icon className={cn("h-3 w-3", iconColor)} /> {label}
      </h4>
      <p className={cn("text-sm font-extrabold pt-1", valueColor)}>{value}</p>
      {subValue && <p className="text-[10px] text-muted-foreground">{subValue}</p>}
    </div>
  );
}
