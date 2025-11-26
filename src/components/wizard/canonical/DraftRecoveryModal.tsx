/**
 * Draft Recovery Modal
 * Shows when user returns with an existing draft
 */
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface DraftRecoveryModalProps {
  open: boolean;
  draftAge: Date | null;
  onResume: () => void;
  onStartFresh: () => void;
}

export const DraftRecoveryModal: React.FC<DraftRecoveryModalProps> = ({
  open,
  draftAge,
  onResume,
  onStartFresh,
}) => {
  const isStale = draftAge && Date.now() - draftAge.getTime() > 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Your Draft?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You have an unsaved draft from{' '}
              {draftAge ? formatDistanceToNow(draftAge, { addSuffix: true }) : 'recently'}.
            </p>
            {isStale && (
              <p className="text-amber-600 text-sm">
                ⚠️ This draft is over a week old. You may want to start fresh.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartFresh}>
            Start Fresh
          </AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>
            Resume Draft
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
