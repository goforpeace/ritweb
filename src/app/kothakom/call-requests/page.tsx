'use client';

import { useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { StatusBadge, type Status } from '@/components/kothakom/StatusBadge';
import { NotesDialog } from '@/components/kothakom/NotesDialog';

type CallRequest = {
    id: string;
    name: string;
    email: string;
    phone: string;
    submissionDate: string;
    status: Status;
};

export default function CallRequestsPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  
  const callRequestsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'call_requests');
  }, [firestore, user]);

  const { data: callRequests, isLoading: isLoadingRequests } = useCollection<CallRequest>(callRequestsRef);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Requests</h1>
            <p className="text-muted-foreground mt-1">Manage leads who requested a callback.</p>
        </div>

        <Card className="border-border/50">
            <CardHeader>
                <CardTitle>Requests Log</CardTitle>
                <CardDescription>Sorted by most recent submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingRequests && <div className="py-10 text-center text-muted-foreground animate-pulse">Loading data...</div>}
                {!isLoadingRequests && (!callRequests || callRequests.length === 0) && (
                    <div className="py-20 text-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No call requests recorded yet.</p>
                    </div>
                )}
                {!isLoadingRequests && callRequests && callRequests.length > 0 && (
                <div className="rounded-md border overflow-hidden">
                    <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                        <TableHead>Date Received</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {callRequests
                        .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                        .map((request) => (
                            <TableRow key={request.id} className="hover:bg-muted/30">
                            <TableCell className="whitespace-nowrap font-medium">
                                {format(new Date(request.submissionDate), "PP p")}
                            </TableCell>
                            <TableCell>
                                <StatusBadge currentStatus={request.status || 'New'} collectionPath="call_requests" documentId={request.id} />
                            </TableCell>
                            <TableCell>{request.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{request.email}</TableCell>
                            <TableCell>{request.phone}</TableCell>
                            <TableCell className="text-right">
                                <NotesDialog collectionPath='call_requests' documentId={request.id} />
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
