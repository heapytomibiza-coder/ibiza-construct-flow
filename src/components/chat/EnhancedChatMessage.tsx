import { useState } from 'react';
import { MoreVertical, Reply, Trash2, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageReactions } from './MessageReactions';
import { ReadReceipts } from './ReadReceipts';
import { PresenceIndicator } from './PresenceIndicator';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  attachments?: any[];
}

interface EnhancedChatMessageProps {
  message: Message;
  senderName: string;
  senderAvatar?: string;
  isOwnMessage: boolean;
  conversationParticipants: string[];
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  showReactions?: boolean;
  showReadReceipts?: boolean;
  showPresence?: boolean;
}

export const EnhancedChatMessage = ({
  message,
  senderName,
  senderAvatar,
  isOwnMessage,
  conversationParticipants,
  onReply,
  onEdit,
  onDelete,
  showReactions = true,
  showReadReceipts = true,
  showPresence = true
}: EnhancedChatMessageProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-2 hover:bg-accent/50 transition-colors',
        isOwnMessage && 'flex-row-reverse'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            {senderName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {showPresence && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <PresenceIndicator userId={message.sender_id} size="sm" showStatus />
          </div>
        )}
      </div>

      <div className={cn('flex-1 space-y-1', isOwnMessage && 'items-end')}>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">{senderName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        <div
          className={cn(
            'rounded-2xl px-4 py-2 max-w-2xl',
            isOwnMessage
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-background/10 rounded"
                >
                  📎 {attachment.name || 'Attachment'}
                </div>
              ))}
            </div>
          )}
        </div>

        {showReactions && (
          <div className={cn('flex gap-2', isOwnMessage && 'justify-end')}>
            <MessageReactions messageId={message.id} compact />
          </div>
        )}

        {showReadReceipts && isOwnMessage && (
          <div className="flex justify-end">
            <ReadReceipts
              messageId={message.id}
              conversationParticipants={conversationParticipants}
              senderId={message.sender_id}
            />
          </div>
        )}
      </div>

      {(showActions || isOwnMessage) && (
        <div className={cn(
          'flex items-start gap-1',
          !showActions && 'opacity-0 group-hover:opacity-100'
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwnMessage ? 'start' : 'end'}>
              {onReply && (
                <DropdownMenuItem onClick={() => onReply(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
              )}
              {isOwnMessage && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(message)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {isOwnMessage && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(message.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
