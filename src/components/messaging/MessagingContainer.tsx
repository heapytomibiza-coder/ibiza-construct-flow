import { useState } from 'react';
import { ConversationsList } from './ConversationsList';
import { MessageThread } from './MessageThread';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MessagingContainerProps {
  userId: string;
}

export const MessagingContainer = ({ userId }: MessagingContainerProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [recipientId, setRecipientId] = useState<string>();

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    
    // Fetch conversation to get recipient ID
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('participants')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return;
      }

      // Find the other participant (recipient)
      const otherParticipant = conversation?.participants?.find(
        (id: string) => id !== userId
      );
      
      if (otherParticipant) {
        setRecipientId(otherParticipant);
      }
    } catch (error) {
      console.error('Error resolving recipient:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <ConversationsList
          userId={userId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Message Thread */}
      <div className="md:col-span-2">
        {selectedConversationId && recipientId ? (
          <MessageThread
            conversationId={selectedConversationId}
            userId={userId}
            recipientId={recipientId}
          />
        ) : (
          <Card className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
            <p className="text-sm">
              Select a conversation from the list to start messaging
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
