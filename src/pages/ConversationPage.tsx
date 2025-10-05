import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversationList } from '@/hooks/useConversationList';
import { MessagingPanel } from '@/components/collaboration/MessagingPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversations, loading } = useConversationList(user?.id);

  if (loading) {
    return (
      <div className="h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const conversation = conversations.find(c => c.id === conversationId);
  const otherUserId = conversation?.participants.find(p => p !== user?.id);
  const [otherUserProfile, setOtherUserProfile] = useState<{ id: string; name: string } | undefined>();

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (otherUserId) {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, full_name')
          .eq('id', otherUserId)
          .single();
        
        if (data) {
          setOtherUserProfile({
            id: data.id,
            name: data.display_name || data.full_name || 'User'
          });
        }
      }
    };
    fetchOtherUser();
  }, [otherUserId]);
  
  if (!conversation || !user) {
    return (
      <div className="h-screen bg-sand flex flex-col items-center justify-center p-4">
        <MessageSquare className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <p className="text-lg font-medium text-center mb-4">Conversation not found</p>
        <Button onClick={() => navigate('/messages')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-sand flex flex-col">
      {/* Mobile Header */}
      <div className="bg-background border-b px-4 py-3 flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/messages')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">Conversation</h1>
      </div>

      {/* Full-screen Chat */}
      <div className="flex-1 overflow-hidden">
        <MessagingPanel
          conversationId={conversationId!}
          currentUserId={user.id}
          otherUser={otherUserProfile}
        />
      </div>
    </div>
  );
};
