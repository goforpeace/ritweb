'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ControllerRenderProps } from 'react-hook-form';

type UserProfile = {
    id: string;
    name: string;
    email: string;
};

interface UserSelectProps {
    field: ControllerRenderProps<any, 'assignedTo'>;
}

const UNASSIGNED_SENTINEL = 'unassigned-sentinel-value';

export default function UserSelect({ field }: UserSelectProps) {
    const { firestore } = useFirebase();

    const usersRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersRef);

    const handleValueChange = (value: string) => {
        if (value === UNASSIGNED_SENTINEL) {
            field.onChange('');
        } else {
            field.onChange(value);
        }
    };

    const displayValue = field.value ? field.value : UNASSIGNED_SENTINEL;


    return (
        <Select
            onValueChange={handleValueChange}
            value={displayValue}
            disabled={isLoading}
        >
            <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading users..." : "Select a user"} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={UNASSIGNED_SENTINEL}>Unassigned</SelectItem>
                {users?.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                        {user.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
