
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

interface ProjectTaskNotesProps {
  projectId: string;
  taskId: string;
}

export function ProjectTaskNotes({ projectId, taskId }: ProjectTaskNotesProps) {
  const [content, setContent] = useState('');
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  const notesRef = useMemoFirebase(() => {
    if (!firestore || !projectId || !taskId) return null;
    return collection(firestore, 'projects', projectId, 'tasks', taskId, 'notes');
  }, [firestore, projectId, taskId]);

  const { data: notes, isLoading } = useCollection<Note>(
    useMemoFirebase(() => notesRef ? query(notesRef, orderBy('createdAt', 'asc')) : null, [notesRef])
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
             toast({ title: "Screenshot detected", description: "Ready to send." });
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
    deleteDocumentNonBlocking(doc(firestore, 'projects', projectId, 'tasks', taskId, 'notes', noteId));
  };

  return (
    <div className="flex flex-col h-full bg-muted/5 rounded-xl border border-border/40">
      <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Task Activity Log
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? <div className="text-center text-xs animate-pulse py-4">Syncing chat...</div> : null}
          {notes?.map((note) => {
            const isMe = note.createdBy === user?.email;
            return (
              <div key={note.id} className={cn(
                "flex flex-col max-w-[85%] group",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {nameMap.get(note.createdBy) || note.createdBy}
                  </span>
                  <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                
                <div className={cn(
                  "p-3 rounded-2xl text-sm relative shadow-sm",
                  isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border/40 rounded-tl-none"
                )}>
                  {note.content && <p className="whitespace-pre-wrap break-words">{note.content}</p>}
                  {note.imageUrl && (
                    <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border border-black/10">
                      <Image src={note.imageUrl} alt="Pasted screenshot" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-muted-foreground mt-1 px-1">
                  {format(new Date(note.createdAt), "HH:mm, MMM d")}
                </span>
              </div>
            );
          })}
          {(!notes || notes.length === 0) && !isLoading && (
            <div className="py-10 text-center opacity-40">
              <MessageSquare className="h-10 w-10 mx-auto mb-2" />
              <p className="text-xs">No updates yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card/40 backdrop-blur-sm">
        {pastedImage && (
          <div className="mb-2 relative w-24 h-24 border rounded-xl group shadow-lg">
            <Image src={pastedImage} alt="Paste preview" fill className="object-cover rounded-xl" />
            <button onClick={() => setPastedImage(null)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 relative">
          <Textarea 
            placeholder="Write an update or paste screenshot..." 
            className="min-h-[80px] max-h-[200px] resize-none pr-12 text-xs rounded-xl border-border/60 bg-background/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full" onClick={handleSend} disabled={!content.trim() && !pastedImage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-[9px] text-muted-foreground flex items-center justify-between">
           <div className="flex items-center gap-1.5">
             <ImageIcon className="h-3 w-3" />
             <span>Ctrl+V to paste images</span>
           </div>
           <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
