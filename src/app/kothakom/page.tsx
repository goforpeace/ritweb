'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

export default function KothakomDashboard() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be logged in to view this page.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-center">
              <p>Please log in to access the dashboard.</p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Admin Dashboard</h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
                    View and manage your website leads.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Link href="/kothakom/call-requests">
                    <Card className="bg-card hover:bg-card/80 transition-colors border-border/60 hover:-translate-y-2 duration-300 h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Phone className="h-10 w-10 text-primary" />
                            <div>
                                <CardTitle className="text-2xl">Call Requests</CardTitle>
                                <CardDescription className="mt-1">Leads from the "Request a Call" button.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>View all potential clients who have requested a callback.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/kothakom/contact-submissions">
                     <Card className="bg-card hover:bg-card/80 transition-colors border-border/60 hover:-translate-y-2 duration-300 h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Mail className="h-10 w-10 text-primary" />
                            <div>
                                <CardTitle className="text-2xl">Contact Submissions</CardTitle>
                                <CardDescription className="mt-1">Messages from your contact form.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>Read and manage all messages submitted through the contact form.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
