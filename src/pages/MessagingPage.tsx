import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Paperclip, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagingPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversationId || null
  );

  // Fetch conversations
  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(
            id,
            full_name,
            display_name,
            avatar_url
          ),
          participant2:profiles!conversations_participant2_id_fkey(
            id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch messages for selected conversation
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            id,
            full_name,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      if (data && data.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', selectedConversation)
          .eq('recipient_id', user?.id)
          .is('read_at', null);
      }

      return data;
    },
    enabled: !!selectedConversation,
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`conversation:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        () => {
          refetchMessages();
          refetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user?.id) return;

    const conversation = conversations?.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const recipientId =
      conversation.participant_1_id === user.id
        ? conversation.participant_2_id
        : conversation.participant_1_id;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        recipient_id: recipientId,
        content: messageText,
      });

      if (error) throw error;

      setMessageText('');
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    const p1 = Array.isArray(conversation.participant1) ? conversation.participant1[0] : conversation.participant1;
    const p2 = Array.isArray(conversation.participant2) ? conversation.participant2[0] : conversation.participant2;
    
    return conversation.participant_1_id === user?.id ? p2 : p1;
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-bold">Messages</h2>
        </div>

        <ScrollArea className="flex-1">
          {conversations?.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const isSelected = conversation.id === selectedConversation;
            const displayName =
              otherParticipant?.full_name ||
              otherParticipant?.display_name ||
              'Unknown';

            return (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherParticipant?.avatar_url} />
                    <AvatarFallback>{displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{displayName}</h3>
                      {conversation.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    {conversation.job_id && (
                      <Badge variant="outline" className="text-xs">
                        Job Related
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      getOtherParticipant(
                        conversations?.find(c => c.id === selectedConversation)
                      )?.avatar_url
                    }
                  />
                  <AvatarFallback>
                    {getOtherParticipant(
                      conversations?.find(c => c.id === selectedConversation)
                    )?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {getOtherParticipant(
                      conversations?.find(c => c.id === selectedConversation)
                    )?.full_name ||
                      getOtherParticipant(
                        conversations?.find(c => c.id === selectedConversation)
                      )?.display_name ||
                      'Unknown'}
                  </h3>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.map((message) => {
                  const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                  const isOwn = message.sender_id === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Card className="m-auto p-12 text-center">
            <p className="text-muted-foreground">
              Select a conversation to start messaging
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
