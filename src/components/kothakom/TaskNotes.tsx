'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

type Note = {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
};

interface TaskNotesProps {
  taskId: string;
}

export function TaskNotes({ taskId }: TaskNotesProps) {
  const [newNote, setNewNote] = useState('');
  const { firestore } = useFirebase();
  const { user } = useUser();

  const notesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !taskId) return null;
    return collection(firestore, 'tasks', taskId, 'notes');
  }, [firestore, taskId]);

  const notesQuery = useMemoFirebase(() => {
    if (!notesCollectionRef) return null;
    return query(notesCollectionRef, orderBy('createdAt', 'desc'));
  }, [notesCollectionRef]);

  const { data: notes, isLoading } = useCollection<Note>(notesQuery);

  const handleAddNote = () => {
    if (!newNote.trim() || !user?.email || !notesCollectionRef) return;
    addDocumentNonBlocking(notesCollectionRef, {
      content: newNote,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    });
    setNewNote('');
  };

  return (
    <Card className='h-full'>
        <CardHeader>
            <CardTitle>Notepad</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className='min-h-[120px]'
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className='w-full'>
                Add Note
                </Button>
            </div>
            <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                    {isLoading && <p>Loading notes...</p>}
                    {!isLoading && (!notes || notes.length === 0) && (
                        <div className="text-center text-muted-foreground py-8">
                            <MessageSquare className="mx-auto h-8 w-8" />
                            <p>No notes yet for this task.</p>
                        </div>
                    )}
                    {notes?.map((note) => (
                        <div key={note.id} className="text-sm p-3 bg-muted/50 rounded-lg">
                            <p className="whitespace-pre-wrap">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {note.createdBy} - {format(new Date(note.createdAt), 'PPP p')}
                            </p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            </div>
        </CardContent>
    </Card>
  );
}
