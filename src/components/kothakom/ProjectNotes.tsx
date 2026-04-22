
'use client';

import { useState, useMemo } from 'react';
import { useFirebase, useUser, useMemoFirebase, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { MessageSquare, ImageIcon, Trash2, Send, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Note = {
  id: string;
  content: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

export function ProjectNotes({ projectId }: { projectId: string }) {
  const [content, setContent] = useState('');
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  const notesRef = useMemoFirebase(() => {
    if (!firestore || !projectId) return null;
    return collection(firestore, 'projects', projectId, 'notes');
  }, [firestore, projectId]);

  const { data: notes, isLoading } = useCollection<Note>(
    useMemoFirebase(() => notesRef ? query(notesRef, orderBy('createdAt', 'desc')) : null, [notesRef])
  );

  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users } = useCollection<UserProfile>(usersRef);
  const nameMap = useMemo(() => new Map(users?.map(u => [u.email, u.name])), [users]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
           const reader = new FileReader();
           reader.onload = (event) => {
             const base64 = event.target?.result as string;
             setPastedImage(base64);
             toast({ title: "Screenshot detected", description: "Image ready to be attached to comment." });
           };
           reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleSend = () => {
    if ((!content.trim() && !pastedImage) || !notesRef || !user?.email) return;

    addDocumentNonBlocking(notesRef, {
      content: content.trim(),
      imageUrl: pastedImage || null,
      createdBy: user.email,
      createdAt: new Date().toISOString()
    });

    setContent('');
    setPastedImage(null);
  };

  const handleDelete = (noteId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'projects', projectId, 'notes', noteId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Project Activity
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? <div className="text-center text-xs animate-pulse">Syncing notes...</div> : null}
          {notes?.map((note) => (
            <div key={note.id} className="group flex flex-col space-y-1">
              <div className={cn(
                "p-3 rounded-lg text-sm relative",
                note.createdBy === user?.email ? "bg-primary/5 border border-primary/10 ml-4" : "bg-muted/50 mr-4"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-primary">{nameMap.get(note.createdBy) || note.createdBy}</span>
                  <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {note.content && <p className="whitespace-pre-wrap break-words">{note.content}</p>}
                {note.imageUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border">
                    <Image src={note.imageUrl} alt="Attached screenshot" fill className="object-cover" />
                  </div>
                )}
                <span className="text-[8px] text-muted-foreground mt-2 block">{format(new Date(note.createdAt), "MMM d, HH:mm")}</span>
              </div>
            </div>
          ))}
          {(!notes || notes.length === 0) && !isLoading && (
            <div className="py-20 text-center opacity-40">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">No project logs or comments yet.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card/80">
        {pastedImage && (
          <div className="mb-2 relative w-20 h-20 border rounded-md group">
            <Image src={pastedImage} alt="Pending paste" fill className="object-cover rounded-md" />
            <button onClick={() => setPastedImage(null)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-md">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="relative">
          <Textarea 
            placeholder="Type comment or paste screenshot (Ctrl+V)..." 
            className="min-h-[100px] resize-none pb-12 pr-12 text-xs"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <Button size="icon" className="h-8 w-8" onClick={handleSend} disabled={!content.trim() && !pastedImage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground flex items-center gap-1">
             <ImageIcon className="h-3 w-3" />
             <span>Paste Support Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
