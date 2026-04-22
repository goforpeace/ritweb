
'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Briefcase, User, Wallet, Building2, LayoutPanelLeft } from 'lucide-react';
import Link from 'next/link';
import { ProjectNotes } from '@/components/kothakom/ProjectNotes';
import { ProjectTasksTable } from '@/components/kothakom/ProjectTasksTable';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  clientId: string;
  budget: number;
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
  const { user } = useUser();
  const { projectId } = params;

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return doc(firestore, 'projects', projectId);
  }, [firestore, projectId]);

  const { data: project, isLoading: isLoadingProject } = useDoc<Project>(projectRef);

  const clientsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);
  const { data: clients } = useCollection<Client>(clientsRef);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);

  const selectedClient = useMemo(() => clients?.find(c => c.id === project?.clientId), [clients, project]);
  const manager = useMemo(() => users?.find(u => u.email === project?.managerEmail), [users, project]);
  const teamMembers = useMemo(() => users?.filter(u => project?.assignedEmails?.includes(u.email)), [users, project]);

  if (isLoadingProject) return <div className="py-20 text-center animate-pulse">Accessing project details...</div>;
  if (!project) return <div className="py-20 text-center">Project not found.</div>;

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
             <Link href="/kothakom/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Badge variant="secondary" className="bg-primary/10 text-primary">{project.status}</Badge>
               <span>Project Reference: #PRJ-{projectId.slice(-4).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch min-h-[calc(100dvh-200px)]">
        {/* Left Pane: Comments & Notes */}
        <div className="col-span-12 lg:col-span-3 border rounded-xl bg-card/30 flex flex-col h-full overflow-hidden">
          <ProjectNotes projectId={projectId} />
        </div>

        {/* Center Pane: Project Details */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <Card className="border-border/50">
            <CardHeader className="bg-muted/30">
               <div className="flex items-center gap-2 text-primary">
                 <LayoutPanelLeft className="h-5 w-5" />
                 <CardTitle className="text-lg">Execution Overview</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Project Scope</h4>
                  <p className="text-sm leading-relaxed bg-muted/20 p-4 rounded-lg italic">"{project.description}"</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={Calendar} label="Timeline" value={`${project.startDate} to ${project.handoverDate}`} />
                  <DetailItem icon={Wallet} label="Budget (Tk)" value={project.budget?.toLocaleString() || '0'} />
               </div>

               <Separator />

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Partner</h4>
                     <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-bold">{selectedClient?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground">{selectedClient?.company}</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Lead</h4>
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-bold">{manager?.name || project.managerEmail}</p>
                     </div>
                  </div>
               </div>

               <Separator />

               <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Assigned Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers?.map(member => (
                       <Badge key={member.id} variant="secondary" className="px-3 py-1 font-medium bg-secondary/80">
                          {member.name}
                       </Badge>
                    ))}
                    {(!teamMembers || teamMembers.length === 0) && <p className="text-xs italic text-muted-foreground">No personnel assigned yet.</p>}
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane: Tasks */}
        <div className="col-span-12 lg:col-span-4 border rounded-xl bg-card/30 flex flex-col h-full overflow-hidden">
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
        <Icon className="h-3 w-3" /> {label}
      </h4>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
