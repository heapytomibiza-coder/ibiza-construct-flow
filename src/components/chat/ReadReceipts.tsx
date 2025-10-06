import { Check, CheckCheck } from 'lucide-react';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProfiles } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReadReceiptsProps {
  messageId: string;
  conversationParticipants: string[];
  senderId: string;
  className?: string;
}

export const ReadReceipts = ({
  messageId,
  conversationParticipants,
  senderId,
  className
}: ReadReceiptsProps) => {
  const { getReadByUsers, receipts } = useReadReceipts([messageId]);
  const readByUserIds = getReadByUsers(messageId);
  const { profiles } = useProfiles(readByUserIds);

  // Filter out the sender from read receipts
  const readByOthers = readByUserIds.filter(id => id !== senderId);
  const readCount = readByOthers.length;
  const totalOtherParticipants = conversationParticipants.filter(id => id !== senderId).length;

  if (readCount === 0) {
    // Message sent but not read
    return (
      <Check className={cn('h-3 w-3 text-muted-foreground', className)} />
    );
  }

  const readReceipt = receipts.find(r => r.message_id === messageId && readByOthers.includes(r.user_id));

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCheck
            className={cn(
              'h-3 w-3',
              readCount === totalOtherParticipants ? 'text-primary' : 'text-muted-foreground',
              className
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {readCount === totalOtherParticipants ? (
              <div className="text-sm">Read by everyone</div>
            ) : (
              <div className="text-sm">
                Read by {readCount} of {totalOtherParticipants}
              </div>
            )}
            {readByOthers.slice(0, 3).map(userId => (
              <div key={userId} className="text-xs text-muted-foreground">
                {profiles[userId]?.full_name || 'Unknown'}
              </div>
            ))}
            {readByOthers.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{readByOthers.length - 3} more
              </div>
            )}
            {readReceipt && (
              <div className="text-xs text-muted-foreground border-t pt-1 mt-1">
                {formatDistanceToNow(new Date(readReceipt.read_at))} ago
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
