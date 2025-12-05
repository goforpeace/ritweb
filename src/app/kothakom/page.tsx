'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ContactFormSubmission = {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  submissionDate: string;
};

type CallRequest = {
    id: string;
    name: string;
    email: string;
    phone: string;
    submissionDate: string;
};

export default function KothakomDashboard() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const contactSubmissionsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'contact_form_submissions');
  }, [firestore, user]);
  
  const callRequestsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'call_requests');
  }, [firestore, user]);

  const { data: contactSubmissions, isLoading: isLoadingContacts } = useCollection<ContactFormSubmission>(contactSubmissionsRef);
  const { data: callRequests, isLoading: isLoadingRequests } = useCollection<CallRequest>(callRequestsRef);

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
        <div className="container mx-auto space-y-12">
          <Card>
            <CardHeader>
              <CardTitle>Call Requests</CardTitle>
              <CardDescription>Leads from the "Request a Call" button.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests && <p>Loading call requests...</p>}
              {!isLoadingRequests && (!callRequests || callRequests.length === 0) && <p>No call requests yet.</p>}
              {!isLoadingRequests && callRequests && callRequests.length > 0 && (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callRequests
                        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                        .map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline">
                                {format(new Date(request.submissionDate), "PPP p")}
                              </Badge>
                            </TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.phone}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactSubmissions
                        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                        .map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline">
                                {format(new Date(submission.submissionDate), "PPP p")}
                              </Badge>
                            </TableCell>
                            <TableCell>{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.company || 'N/A'}</TableCell>
                            <TableCell className="max-w-sm truncate">{submission.message}</TableCell>
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
