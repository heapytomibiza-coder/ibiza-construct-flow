/**
 * Comment Thread Component
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Display comment threads with replies
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui-enhanced';
import { Comment } from '@/lib/collaboration';
import { cn } from '@/lib/utils';
import { MessageSquare, Check, MoreVertical, Reply, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentThreadProps {
  comment: Comment;
  onReply?: (content: string) => void;
  onResolve?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function CommentThread({
  comment,
  onReply,
  onResolve,
  onDelete,
  className,
}: CommentThreadProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(replyContent);
      setReplyContent('');
      setShowReplyBox(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.userAvatar} alt={comment.userName} />
          <AvatarFallback>
            {comment.userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{comment.userName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {comment.resolved && (
                <Badge variant="success" size="sm">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!comment.resolved && onResolve && (
                    <DropdownMenuItem onClick={onResolve}>
                      <Check className="h-4 w-4 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm">{comment.content}</p>

          {!comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="h-7 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}

          {/* Reply Box */}
          {showReplyBox && (
            <div className="space-y-2 pt-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                <AvatarFallback className="text-xs">
                  {reply.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-xs">{reply.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm mt-1">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
