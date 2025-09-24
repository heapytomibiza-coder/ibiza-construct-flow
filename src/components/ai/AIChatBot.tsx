import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Minimize2, Maximize2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  action: () => void;
}

interface AIChatBotProps {
  className?: string;
  context?: {
    page?: string;
    job_id?: string;
    user_role?: string;
  };
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ className, context = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setQuickActions(['Browse Services', 'Post a Job', 'Help Center', 'Account Settings']);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText || loading) return;

    setInputMessage('');
    setLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chatbot', {
        body: {
          message: messageText,
          conversation_id: conversationId,
          user_id: user?.id,
          context: {
            ...context,
            user_role: user?.user_metadata?.role || 'client'
          }
        }
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation ID
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Update quick actions
      if (data.quick_actions) {
        setQuickActions(data.quick_actions);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact our support team.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(`Help me with: ${action}`);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setQuickActions([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 shadow-lg",
          className
        )}
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 z-50 w-96 shadow-2xl",
      isMinimized ? "h-16" : "h-[32rem]",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          {loading && (
            <div className="animate-pulse">
              <Badge variant="secondary">Typing...</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full p-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-64">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[80%]",
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs"
                  disabled={loading}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={loading || !inputMessage.trim()}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};