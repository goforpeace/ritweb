
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Phone, Mail, ListChecks, ClipboardList, ArrowRight, Briefcase, Users, Banknote } from 'lucide-react';

export default function KothakomDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-muted-foreground mt-1">Unified business operations and management.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                href="/kothakom/projects"
                icon={Briefcase}
                title="Projects"
                description="Active client deliverables"
                color="text-primary"
            />
            <DashboardCard 
                href="/kothakom/clients"
                icon={Users}
                title="Clients"
                description="Managed business accounts"
                color="text-accent"
            />
            <DashboardCard 
                href="/kothakom/finance"
                icon={Banknote}
                title="Teka Poisha"
                description="Financial overview & cashflow"
                color="text-green-500"
            />
            <DashboardCard 
                href="/kothakom/tasks"
                icon={ListChecks}
                title="Project Tasks"
                description="Upcoming milestones"
                color="text-purple-500"
            />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Inquiries & Leads</CardTitle>
                    <CardDescription>Recent traffic from website forms.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 border-t pt-4">
                    <Link href="/kothakom/call-requests" className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-sm border border-transparent hover:border-border/50">
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-blue-500" />
                            <span>Call Requests</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/kothakom/contact-submissions" className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-sm border border-transparent hover:border-border/50">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-emerald-500" />
                            <span>Contact Submissions</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Internal Operations</CardTitle>
                    <CardDescription>Confidential team management.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 border-t pt-4">
                    <Link href="/kothakom/internal" className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-sm border border-transparent hover:border-border/50">
                         <div className="flex items-center gap-3">
                            <ClipboardList className="h-4 w-4 text-orange-500" />
                            <span>Internal Task Board</span>
                        </div>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function DashboardCard({ href, icon: Icon, title, description, color }: any) {
    return (
        <Link href={href}>
            <Card className="hover:bg-muted/50 transition-all duration-300 border-border/50 group h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">{description}</div>
                    <div className="mt-4 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View Section <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
