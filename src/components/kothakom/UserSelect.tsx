'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Users } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

type UserProfile = {
    id: string;
    name: string;
    email: string;
};

interface UserSelectProps {
    field: ControllerRenderProps<any, 'assignedTo'>;
}

export default function UserSelect({ field }: UserSelectProps) {
    const { firestore } = useFirebase();
    const [isOpen, setIsOpen] = useState(false);

    const usersRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersRef);

    const selectedEmails = field.value || [];

    const handleSelect = (email: string) => {
        const newSelectedEmails = selectedEmails.includes(email)
            ? selectedEmails.filter((e: string) => e !== email)
            : [...selectedEmails, email];
        field.onChange(newSelectedEmails);
    };

    return (
        <div className="space-y-2">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                        <Users className="mr-2 h-4 w-4" />
                        {selectedEmails.length > 0 ? `${selectedEmails.length} user(s) selected` : "Select users..."}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuLabel>{isLoading ? "Loading..." : "Assign to"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-48">
                        {users?.map(user => (
                            <DropdownMenuCheckboxItem
                                key={user.id}
                                checked={selectedEmails.includes(user.email)}
                                onSelect={(e) => e.preventDefault()} // prevent menu from closing on item click
                                onCheckedChange={() => handleSelect(user.email)}
                            >
                                {user.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </ScrollArea>
                    <DropdownMenuSeparator />
                     <div className="p-1">
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setIsOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedEmails.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 rounded-md border min-h-[40px]">
                    {users?.filter(u => selectedEmails.includes(u.email)).map(user => (
                        <Badge key={user.id} variant="secondary" className="gap-1.5 items-center">
                            {user.name}
                            <button
                                type="button"
                                aria-label={`Remove ${user.name}`}
                                onClick={() => handleSelect(user.email)}
                                className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
