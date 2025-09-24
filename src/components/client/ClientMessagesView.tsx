import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, MessageSquare, Phone, Video, Paperclip,
  Send, Smile, MoreHorizontal, Star, Users,
  Clock, CheckCheck, FileText, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'client' | 'professional';
  type: 'text' | 'image' | 'file';
  read: boolean;
}

interface Conversation {
  id: string;
  professionalName: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  professional: {
    avatar: string;
    online: boolean;
    rating: number;
  };
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    professionalName: 'Maria Santos',
    projectTitle: 'Bathroom Renovation',
    lastMessage: 'I can start next Monday. The materials will arrive on Friday.',
    lastMessageTime: '2 hours ago',
    unreadCount: 2,
    professional: {
      avatar: '/api/placeholder/40/40',
      online: true,
      rating: 4.9
    },
    messages: [
      {
        id: '1',
        content: 'Hi Maria, thanks for your quote. When can you start?',
        timestamp: '10:30 AM',
        sender: 'client',
        type: 'text',
        read: true
      },
      {
        id: '2',
        content: 'Hello! I can start next Monday. The materials will arrive on Friday.',
        timestamp: '11:15 AM',
        sender: 'professional',
        type: 'text',
        read: false
      },
      {
        id: '3',
        content: 'Here are the tile samples I mentioned',
        timestamp: '11:16 AM',
        sender: 'professional',
        type: 'image',
        read: false
      }
    ]
  },
  {
    id: '2',
    professionalName: 'João Silva',
    projectTitle: 'Kitchen Plumbing',
    lastMessage: 'Perfect! See you tomorrow at 9 AM.',
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    professional: {
      avatar: '/api/placeholder/40/40',
      online: false,
      rating: 4.8
    },
    messages: [
      {
        id: '1',
        content: 'The plumbing inspection is scheduled for tomorrow at 9 AM.',
        timestamp: 'Yesterday 2:30 PM',
        sender: 'professional',
        type: 'text',
        read: true
      },
      {
        id: '2',
        content: 'Perfect! See you tomorrow at 9 AM.',
        timestamp: 'Yesterday 3:45 PM',
        sender: 'client',
        type: 'text',
        read: true
      }
    ]
  }
];

export const ClientMessagesView = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>(mockConversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = mockConversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle message sending logic
      setNewMessage('');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <Card className="card-luxury lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-copper" />
              Messages
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-sand-light/50",
                    selectedConversation === conversation.id && "bg-sand-light border-r-2 border-copper"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      {conversation.professional.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-charcoal truncate">{conversation.professionalName}</h4>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-copper text-white text-xs px-1.5 py-0.5 min-w-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">{conversation.projectTitle}</p>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="card-luxury lg:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      {activeConversation.professional.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-charcoal">
                        {activeConversation.professionalName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-muted-foreground">{activeConversation.professional.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{activeConversation.projectTitle}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === 'client' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        message.sender === 'client'
                          ? "bg-gradient-hero text-white"
                          : "bg-sand-light text-charcoal"
                      )}
                    >
                      {message.type === 'image' && (
                        <div className="mb-2">
                          <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      
                      {message.type === 'file' && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">document.pdf</span>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      <div className={cn(
                        "flex items-center justify-between mt-1 text-xs",
                        message.sender === 'client' ? "text-white/70" : "text-muted-foreground"
                      )}>
                        <span>{message.timestamp}</span>
                        {message.sender === 'client' && (
                          <CheckCheck className={cn(
                            "w-3 h-3 ml-2",
                            message.read ? "text-green-300" : "text-white/50"
                          )} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-hero text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-display font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};