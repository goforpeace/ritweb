'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Note = {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

interface NotesDialogProps {
  collectionPath: 'call_requests' | 'contact_form_submissions';
  documentId: string;
}

export function NotesDialog({ collectionPath, documentId }: NotesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { firestore } = useFirebase();
  const { user } = useUser();

  const notesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, collectionPath, documentId, 'notes');
  }, [firestore, collectionPath, documentId]);

  const notesQuery = useMemoFirebase(() => {
    if (!notesCollectionRef) return null;
    return query(notesCollectionRef, orderBy('createdAt', 'desc'));
  }, [notesCollectionRef]);

  const { data: notes, isLoading } = useCollection<Note>(notesQuery);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users } = useCollection<UserProfile>(usersRef);
  
  const userEmailToNameMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(u => [u.email, u.name]));
  }, [users]);

  const handleAddNote = () => {
    if (!newNote.trim() || !user?.email || !notesCollectionRef) return;
    addDocumentNonBlocking(notesCollectionRef, {
      content: newNote,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
    });
    setNewNote('');
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleSaveEdit = () => {
    if (!editingNoteId || !firestore) return;
    const noteRef = doc(firestore, collectionPath, documentId, 'notes', editingNoteId);
    updateDocumentNonBlocking(noteRef, { content: editingContent });
    handleCancelEdit();
  };
  
  const handleDeleteNote = (noteId: string) => {
    if (!firestore) return;
    const noteRef = doc(firestore, collectionPath, documentId, 'notes', noteId);
    deleteDocumentNonBlocking(noteRef);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              className='min-h-[100px]'
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()} className='w-full'>
              Add Note
            </Button>
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-4 pr-4">
                {isLoading && <p>Loading notes...</p>}
                {!isLoading && (!notes || notes.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="mx-auto h-8 w-8" />
                        <p>No notes yet.</p>
                    </div>
                )}
                {notes?.map((note) => (
                    <div key={note.id} className="text-sm p-3 bg-muted/50 rounded-lg group">
                       {editingNoteId === note.id ? (
                                <div className='space-y-2'>
                                    <Textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <div className='flex justify-end gap-2'>
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="whitespace-pre-wrap">{note.content}</p>
                                    <div className='flex justify-between items-center'>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {userEmailToNameMap.get(note.createdBy) || note.createdBy} - {format(new Date(note.createdAt), 'PPP p')}
                                        </p>
                                        <div className='opacity-0 group-hover:opacity-100 transition-opacity flex gap-1'>
                                            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => handleEditNote(note)}>
                                                <Pencil className='h-4 w-4' />
                                            </Button>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button variant='ghost' size='icon' className='h-7 w-7 hover:bg-destructive/10 hover:text-destructive'>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this note.
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </>
                            )}
                    </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
