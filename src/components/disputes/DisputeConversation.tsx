import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageComposer } from './MessageComposer';
import { ResponseTemplateLibrary } from './ResponseTemplateLibrary';
import { formatDistanceToNow } from 'date-fns';
import { Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  response_time_seconds?: number | null;
  template_used?: string | null;
  is_admin_note?: boolean | null;
  sender?: {
    full_name?: string;
    avatar_url?: string;
  } | null;
}

interface DisputeConversationProps {
  disputeId: string;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string, templateUsed?: string) => void;
  isSending: boolean;
}

export function DisputeConversation({
  disputeId,
  messages,
  currentUserId,
  onSendMessage,
  isSending,
}: DisputeConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const queryClient = useQueryClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel(`dispute-messages:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_messages',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dispute-messages', disputeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId, queryClient]);

  const handleTemplatePick = (template: { key: string; body: string }) => {
    onSendMessage(template.body, template.key);
  };

  const formatResponseTime = (seconds?: number | null) => {
    if (!seconds) return null;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr`;
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Conversation</span>
          <Badge variant="secondary">{messages.length} messages</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              const responseTime = formatResponseTime(msg.response_time_seconds);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback>
                      {msg.sender?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{msg.sender?.full_name || 'User'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(msg.created_at))} ago</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.is_admin_note
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.is_admin_note && (
                        <div className="flex items-center gap-1 mb-2 text-xs font-medium text-amber-600">
                          <ShieldCheck className="w-3 h-3" />
                          Admin Note
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {responseTime && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Response: {responseTime}
                          </Badge>
                        )}
                        {msg.template_used && (
                          <Badge variant="outline" className="text-xs">
                            Template: {msg.template_used}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No messages yet. Start the conversation.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <div className="mb-2">
            <ResponseTemplateLibrary onPick={handleTemplatePick} />
          </div>
          <MessageComposer
            onSend={(text) => onSendMessage(text)}
            disabled={isSending}
            onTemplatePick={() => setShowTemplates(true)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
