'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export type Status = 'New' | 'Contacted' | 'Follow up' | 'Closed';

const statusConfig: Record<
  Status,
  {
    label: string;
    color: string;
  }
> = {
  New: {
    label: 'New',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  Contacted: {
    label: 'Contacted',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  'Follow up': {
    label: 'Follow up',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  Closed: {
    label: 'Closed',
    color: 'bg-green-500 hover:bg-green-600',
  },
};

interface StatusBadgeProps {
  currentStatus: Status;
  collectionPath: 'call_requests' | 'contact_form_submissions';
  documentId: string;
}

export function StatusBadge({
  currentStatus,
  collectionPath,
  documentId,
}: StatusBadgeProps) {
  const { firestore } = useFirebase();

  const handleStatusChange = (newStatus: Status) => {
    if (!firestore || newStatus === currentStatus) return;
    const docRef = doc(firestore, collectionPath, documentId);
    updateDocumentNonBlocking(docRef, { status: newStatus });
  };

  const currentConfig = statusConfig[currentStatus] || { label: 'Unknown', color: 'bg-gray-400' };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          className={cn(
            'cursor-pointer text-white transition-colors',
            currentConfig.color
          )}
        >
          {currentConfig.label}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(statusConfig).map((statusKey) => {
          const status = statusKey as Status;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={currentStatus === status}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusConfig[status].color.split(' ')[0] 
                  )}
                />
                {statusConfig[status].label}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
