import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversationList } from '@/hooks/useConversationList';
import ConversationsList from '@/components/collaboration/ConversationsList';
import { MessagingPanel } from '@/components/collaboration/MessagingPanel';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const MessagesTab = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations, isLoading } = useConversationList(user?.id);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const otherUserId = selectedConversation?.client_id === user?.id 
    ? selectedConversation?.professional_id 
    : selectedConversation?.client_id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 p-4 overflow-hidden flex flex-col">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Messages
        </h2>
        <div className="flex-1 overflow-hidden">
          <ConversationsList
            onConversationSelect={setSelectedConversationId}
          />
        </div>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
        {selectedConversationId && user ? (
          <MessagingPanel
            conversationId={selectedConversationId}
            currentUserId={user.id}
            otherUser={otherUserId ? { id: otherUserId, name: 'User' } : undefined}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
