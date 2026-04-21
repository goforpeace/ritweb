'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Phone,
  Mail,
  ListChecks,
  ClipboardList,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import Image from 'next/image';

const data = {
  navMain: [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/kothakom',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Leads',
      items: [
        {
          title: 'Call Requests',
          url: '/kothakom/call-requests',
          icon: Phone,
        },
        {
          title: 'Contact Submissions',
          url: '/kothakom/contact-submissions',
          icon: Mail,
        },
      ],
    },
    {
      title: 'Task Boards',
      items: [
        {
          title: 'Project Tasks',
          url: '/kothakom/tasks',
          icon: ListChecks,
        },
        {
          title: 'Internal Tasks',
          url: '/kothakom/internal',
          icon: ClipboardList,
        },
      ],
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const { auth } = useFirebase();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-sidebar-border/50">
        <Link href="/kothakom" className="flex items-center gap-2 px-4">
           <Image 
            src="https://res.cloudinary.com/dj4lirc0d/image/upload/v1764888498/Artboard_5_2x_otkwum.png" 
            alt="Remotized IT" 
            width={160} 
            height={40}
            className="group-data-[collapsible=icon]:hidden"
          />
          <div className="hidden group-data-[collapsible=icon]:block w-8 h-8 bg-primary rounded-md flex items-center justify-center font-bold text-primary-foreground">R</div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
