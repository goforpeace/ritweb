'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Phone, Mail, ListChecks, ClipboardList, ArrowRight } from 'lucide-react';

export default function KothakomDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-muted-foreground mt-1">Here's an overview of your management boards and leads.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                href="/kothakom/call-requests"
                icon={Phone}
                title="Call Requests"
                description="Potential client callbacks"
                color="text-blue-500"
            />
            <DashboardCard 
                href="/kothakom/contact-submissions"
                icon={Mail}
                title="Submissions"
                description="Website contact messages"
                color="text-emerald-500"
            />
            <DashboardCard 
                href="/kothakom/tasks"
                icon={ListChecks}
                title="Project Tasks"
                description="Standard project management"
                color="text-purple-500"
            />
            <DashboardCard 
                href="/kothakom/internal"
                icon={ClipboardList}
                title="Internal Tasks"
                description="Internal team operations"
                color="text-orange-500"
            />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Stay updated with the latest updates across all boards.</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center border-t">
                    <p className="text-muted-foreground italic text-sm">Real-time activity feed coming soon...</p>
                </CardContent>
            </Card>
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Fast access to frequent administration tools.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 border-t pt-4">
                    <Link href="/kothakom/tasks" className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-sm">
                        <span>New Project Task</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/kothakom/internal" className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-sm">
                        <span>New Internal Task</span>
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
                        View Board <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
