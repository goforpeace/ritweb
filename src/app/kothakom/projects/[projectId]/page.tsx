
'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Wallet, Building2, LayoutPanelLeft, Users, Timer, Plus, Edit3 } from 'lucide-react';
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
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
             <Link href="/kothakom/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
               <Badge variant="secondary" className="bg-primary/10 text-primary">{project.status}</Badge>
               <Badge variant="outline" className="border-accent text-accent">{project.projectType === 'Monthly' ? 'Retainer Service' : 'Fixed Project'}</Badge>
               <span>#PRJ-{projectId.slice(-4).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <EditProjectDialog project={project} />
        </div>
      </div>

      {/* Summary Section (Full Width) */}
      <Card className="border-border/50 shadow-sm bg-card/30 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Summary Left - Expanded Visibility */}
            <div className="lg:col-span-8 p-6 border-r border-border/40 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <LayoutPanelLeft className="h-3 w-3" /> Project Overview & Scope
                </h4>
                <div className="text-sm leading-relaxed text-foreground/90 bg-background/30 p-6 rounded-xl border border-border/40 whitespace-pre-wrap min-h-[100px]">
                  {project.description || "No detailed summary provided for this project profile."}
                </div>
              </div>
            </div>
            
            {/* Meta Right - Efficient Grid */}
            <div className="lg:col-span-4 p-6 bg-muted/5 flex flex-col justify-between space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem icon={Calendar} label="Timeline" value={`${project.startDate} — ${project.handoverDate}`} />
                
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-emerald-500" /> {project.projectType === 'Monthly' ? 'Monthly' : 'Budget'}
                  </h4>
                  <p className="text-sm font-bold text-emerald-500">Tk {project.budget?.toLocaleString() || '0'}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Timer className="h-3 w-3 text-primary" /> Effort Logged
                  </h4>
                  <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{project.workHours || 0} hrs</p>
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                  <Plus className="h-3 w-3" />
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-3" align="end">
                              <div className="space-y-2">
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Log Work Hours</p>
                                  <div className="flex gap-2">
                                      <Input 
                                          type="number" 
                                          className="h-8 text-xs" 
                                          value={addHoursValue} 
                                          onChange={(e) => setAddHoursValue(e.target.value)} 
                                      />
                                      <Button size="sm" className="h-8 px-2" onClick={handleAddHours}>Log</Button>
                                  </div>
                              </div>
                          </PopoverContent>
                      </Popover>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Client Partner
                  </h4>
                  <p className="text-sm font-bold truncate">{selectedClient?.name || 'Unknown'}</p>
                </div>
              </div>

              <Separator className="opacity-20" />

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <User className="h-3 w-3" /> Lead Manager
                  </h4>
                  <p className="text-xs font-medium">{manager?.name || project.managerEmail}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Allocated Team
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {teamMembers?.map(member => (
                      <Badge key={member.id} variant="secondary" className="px-2 py-0 h-5 text-[9px] font-medium bg-secondary/40">
                        {member.name}
                      </Badge>
                    ))}
                    {(!teamMembers || teamMembers.length === 0) && <p className="text-[9px] italic text-muted-foreground">No personnel allocated.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace */}
      <div className="grid grid-cols-12 gap-6 items-stretch flex-1 min-h-[500px]">
        {/* Left Pane: Activity/Notes (4/12) */}
        <div className="col-span-12 lg:col-span-4 border rounded-xl bg-card/30 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectNotes projectId={projectId} />
        </div>

        {/* Right Pane: Tasks (8/12) */}
        <div className="col-span-12 lg:col-span-8 border rounded-xl bg-card/30 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectTasksTable projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
        <Icon className="h-3 w-3 text-primary" /> {label}
      </h4>
      <p className="text-[11px] font-bold">{value}</p>
    </div>
  );
}
