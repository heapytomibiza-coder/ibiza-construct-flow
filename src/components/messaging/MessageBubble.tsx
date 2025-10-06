import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Smile, Trash2, Reply, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  onReact: (reaction: string) => void;
  onDelete: () => void;
  onReply?: () => void;
}

export const MessageBubble = ({
  message,
  isOwn,
  onReact,
  onDelete,
  onReply,
}: MessageBubbleProps) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <div className={cn('flex gap-3 group', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground px-1">
            {message.sender?.full_name || 'User'}
          </span>
        )}

        <div className="relative">
          <div
            className={cn(
              'rounded-2xl px-4 py-2 break-words',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted rounded-bl-sm'
            )}
          >
            {message.parent_message_id && (
              <div className="mb-2 pb-2 border-l-2 border-border pl-2 opacity-70 text-sm">
                <p className="text-xs">Replying to message</p>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className="text-xs opacity-80 flex items-center gap-1"
                  >
                    📎 {attachment.name}
                  </div>
                ))}
              </div>
            )}

            {message.is_edited && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {message.reactions.reduce((acc: any[], reaction: any) => {
                const existing = acc.find((r) => r.reaction === reaction.reaction);
                if (existing) {
                  existing.count++;
                } else {
                  acc.push({ reaction: reaction.reaction, count: 1 });
                }
                return acc;
              }, []).map((group: any, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-background border rounded-full px-2 py-0.5"
                >
                  {group.reaction} {group.count}
                </span>
              ))}
            </div>
          )}

          {/* Message actions */}
          <div className="absolute -right-10 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReply}>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Smile className="w-4 h-4 mr-2" />
                      React
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    {reactions.map((reaction) => (
                      <DropdownMenuItem
                        key={reaction}
                        onClick={() => onReact(reaction)}
                      >
                        {reaction}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {isOwn && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className={cn('flex items-center gap-1 px-1', isOwn && 'justify-end')}>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwn && (
            <span className="text-xs">
              {message.read_at ? (
                <CheckCheck className="w-3 h-3 text-primary" />
              ) : (
                <Check className="w-3 h-3 text-muted-foreground" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
