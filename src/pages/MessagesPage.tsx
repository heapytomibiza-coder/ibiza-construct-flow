import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConversationList } from '@/hooks/useConversationList';
import { MessagingPanel } from '@/components/collaboration/MessagingPanel';
import ConversationsList from '@/components/collaboration/ConversationsList';
import { Card } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const MessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const conversationParam = searchParams.get('conversation');
  const professionalParam = searchParams.get('professional');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationParam);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  const { conversations, loading } = useConversationList(user?.id);

  // Update selected conversation when URL param changes
  useEffect(() => {
    if (conversationParam) {
      setSelectedConversationId(conversationParam);
    }
  }, [conversationParam]);

  // Handle professional parameter - create or find conversation
  useEffect(() => {
    const handleProfessionalParam = async () => {
      if (!professionalParam || !user?.id || isCreatingConversation) return;
      
      setIsCreatingConversation(true);
      
      try {
        // Check if conversation exists
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [user.id, professionalParam])
          .maybeSingle();

        if (existing) {
          // Conversation exists, select it
          setSelectedConversationId(existing.id);
          navigate(`/messages?conversation=${existing.id}`, { replace: true });
        } else {
          // Create new conversation
          const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({
              participants: [user.id, professionalParam],
              metadata: { created_from: 'job_applicant' }
            })
            .select()
            .single();

          if (error) throw error;
          
          setSelectedConversationId(newConv.id);
          navigate(`/messages?conversation=${newConv.id}`, { replace: true });
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start conversation. Please try again."
        });
      } finally {
        setIsCreatingConversation(false);
      }
    };

    handleProfessionalParam();
  }, [professionalParam, user?.id, navigate, isCreatingConversation, toast]);

  // Find the selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  // Get other participant info
  const otherUserId = selectedConversation?.participants.find(p => p !== user?.id);
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

  const handleConversationSelect = (conversationId: string) => {
    if (isMobile) {
      // On mobile, navigate to dedicated conversation page
      navigate(`/messages/${conversationId}`);
    } else {
      // On desktop, update state and URL
      setSelectedConversationId(conversationId);
      navigate(`/messages?conversation=${conversationId}`, { replace: true });
    }
  };

  if (loading || isCreatingConversation) {
    return (
      <div className="min-h-screen bg-sand pt-20 pb-20">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs 
            items={[
              { label: 'Dashboard', href: '/dashboard/client' },
              { label: 'Messages', href: '/messages' }
            ]} 
          />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">
                {isCreatingConversation ? 'Starting conversation...' : 'Loading conversations...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand pt-20 pb-20">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Dashboard', href: '/dashboard/client' },
            { label: 'Messages', href: '/messages' }
          ]} 
        />

        <div className="mt-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground mb-6">
            Communicate with professionals and manage your conversations
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Conversations List - Hide on mobile if conversation selected */}
            <div className={`lg:col-span-4 ${isMobile && selectedConversationId ? 'hidden' : ''}`}>
              <Card className="p-4 h-[calc(100vh-16rem)] overflow-hidden">
                <ConversationsList onConversationSelect={handleConversationSelect} />
              </Card>
            </div>

            {/* Chat Panel */}
            <div className={`lg:col-span-8 ${!selectedConversationId && isMobile ? 'hidden' : ''}`}>
              {selectedConversationId && user ? (
                <Card className="h-[calc(100vh-16rem)] overflow-hidden">
                  <MessagingPanel
                    conversationId={selectedConversationId}
                    currentUserId={user.id}
                    otherUser={otherUserProfile}
                  />
                </Card>
              ) : (
                <Card className="h-[calc(100vh-16rem)] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a conversation from the list to start messaging</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
