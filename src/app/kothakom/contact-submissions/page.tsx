'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Status } from '@/components/kothakom/StatusBadge';
import { StatusBadge } from '@/components/kothakom/StatusBadge';
import { NotesDialog } from '@/components/kothakom/NotesDialog';

type ContactFormSubmission = {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  submissionDate: string;
  status: Status;
};

export default function ContactSubmissionsPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const contactSubmissionsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'contact_form_submissions');
  }, [firestore, user]);

  const { data: contactSubmissions, isLoading: isLoadingContacts } = useCollection<ContactFormSubmission>(contactSubmissionsRef);

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
                <Link href="/cmi">Go to Login</Link>
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
        <div className="container mx-auto space-y-8">
            <Button asChild variant="outline">
                <Link href="/kothakom">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Submissions</CardTitle>
              <CardDescription>Messages received from your contact form.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingContacts && <p>Loading submissions...</p>}
              {!isLoadingContacts && (!contactSubmissions || contactSubmissions.length === 0) && <p>No submissions yet.</p>}
              {!isLoadingContacts && contactSubmissions && contactSubmissions.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactSubmissions
                        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                        .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="whitespace-nowrap">
                                {format(new Date(submission.submissionDate), "PPP p")}
                            </TableCell>
                             <TableCell>
                                <StatusBadge currentStatus={submission.status || 'New'} collectionPath="contact_form_submissions" documentId={submission.id} />
                            </TableCell>
                            <TableCell>{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.company || 'N/A'}</TableCell>
                            <TableCell className="max-w-sm truncate">{submission.message}</TableCell>
                            <TableCell>
                                <NotesDialog collectionPath='contact_form_submissions' documentId={submission.id} />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
