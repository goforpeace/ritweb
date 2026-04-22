
'use client';

import { useFirebase, useUser, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Briefcase, User, Wallet, Building2, LayoutPanelLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { ProjectNotes } from '@/components/kothakom/ProjectNotes';
import { ProjectTasksTable } from '@/components/kothakom/ProjectTasksTable';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';

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
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
             <Link href="/kothakom/projects"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
               <Badge variant="secondary" className="bg-primary/10 text-primary">{project.status}</Badge>
               <span>Project Reference: #PRJ-{projectId.slice(-4).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section (Full Width) */}
      <Card className="border-border/50 shadow-sm bg-card/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                  <LayoutPanelLeft className="h-3 w-3" /> Project Summary
                </h4>
                <p className="text-sm leading-relaxed text-foreground/80 bg-background/50 p-4 rounded-lg border border-border/40">
                  {project.description || "No project description provided."}
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-5 grid grid-cols-2 gap-6">
              <DetailItem icon={Calendar} label="Project Timeline" value={`${project.startDate} to ${project.handoverDate}`} />
              <DetailItem icon={Wallet} label="Budget (Tk)" value={project.budget?.toLocaleString() || '0'} />
              
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Client Partner
                </h4>
                <p className="text-sm font-bold truncate">{selectedClient?.name || 'Unknown'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{selectedClient?.company}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <User className="h-3 w-3" /> Lead Manager
                </h4>
                <p className="text-sm font-bold truncate">{manager?.name || project.managerEmail}</p>
              </div>

              <div className="col-span-2 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Assigned Team
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {teamMembers?.map(member => (
                    <Badge key={member.id} variant="secondary" className="px-2 py-0 h-5 text-[10px] font-medium bg-secondary/60">
                      {member.name}
                    </Badge>
                  ))}
                  {(!teamMembers || teamMembers.length === 0) && <p className="text-[10px] italic text-muted-foreground">No personnel assigned.</p>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace (Activity Left, Tasks Right Wider) */}
      <div className="grid grid-cols-12 gap-6 items-stretch flex-1 min-h-[500px]">
        {/* Left Pane: Activity/Notes (4/12) */}
        <div className="col-span-12 lg:col-span-4 border rounded-xl bg-card/30 flex flex-col h-full overflow-hidden shadow-sm">
          <ProjectNotes projectId={projectId} />
        </div>

        {/* Right Pane: Tasks (8/12 - Wider) */}
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
        <Icon className="h-3 w-3" /> {label}
      </h4>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
