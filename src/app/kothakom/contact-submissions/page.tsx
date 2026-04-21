'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { StatusBadge, type Status } from '@/components/kothakom/StatusBadge';
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
  const { user } = useUser();

  const contactSubmissionsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'contact_form_submissions');
  }, [firestore, user]);

  const { data: contactSubmissions, isLoading: isLoadingContacts } = useCollection<ContactFormSubmission>(contactSubmissionsRef);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Submissions</h1>
            <p className="text-muted-foreground mt-1">General inquiries from your website contact form.</p>
        </div>

        <Card className="border-border/50">
            <CardHeader>
                <CardTitle>Submissions Log</CardTitle>
                <CardDescription>Sorted by most recent inquiries.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingContacts && <div className="py-10 text-center text-muted-foreground animate-pulse">Loading data...</div>}
                {!isLoadingContacts && (!contactSubmissions || contactSubmissions.length === 0) && (
                    <div className="py-20 text-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No contact submissions yet.</p>
                    </div>
                )}
                {!isLoadingContacts && contactSubmissions && contactSubmissions.length > 0 && (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="max-w-xs">Message Preview</TableHead>
                        <TableHead className="text-right">Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contactSubmissions
                        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                        .map((submission) => (
                            <TableRow key={submission.id} className="hover:bg-muted/30">
                            <TableCell className="whitespace-nowrap font-medium text-xs">
                                {format(new Date(submission.submissionDate), "PP p")}
                            </TableCell>
                            <TableCell>
                                <StatusBadge currentStatus={submission.status || 'New'} collectionPath="contact_form_submissions" documentId={submission.id} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{submission.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{submission.email}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs">{submission.company || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate text-xs text-muted-foreground italic">"{submission.message}"</TableCell>
                            <TableCell className="text-right">
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
  );
}
