import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, MessageSquare, Phone, Video, Paperclip, Send, Smile, 
  MoreHorizontal, Star, Users, CheckCheck, FileText, Image,
  Mic, Camera, Plus, Filter, AlertCircle, Clock, ThumbsUp,
  Zap, Info, Edit, Archive, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobContext {
  id: string;
  title: string;
  status: 'draft' | 'posted' | 'in_progress' | 'completed';
  progress: number;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'client' | 'professional';
  type: 'text' | 'image' | 'file' | 'voice' | 'request_info' | 'change_order' | 'quick_reply';
  read: boolean;
  readAt?: string;
  metadata?: {
    fileName?: string;
    duration?: number;
    requestType?: string;
    changeOrderId?: string;
  };
}

interface QuickReply {
  id: string;
  text: string;
  context: 'schedule' | 'materials' | 'payment' | 'general';
}

interface Conversation {
  id: string;
  professionalName: string;
  jobContext: JobContext;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
  professional: {
    avatar: string;
    online: boolean;
    rating: number;
    lastSeen?: string;
  };
  messages: Message[];
}

const quickReplies: QuickReply[] = [
  { id: '1', text: 'When can you start?', context: 'schedule' },
  { id: '2', text: 'Sounds good!', context: 'general' },
  { id: '3', text: 'Can you send more details?', context: 'general' },
  { id: '4', text: 'What about materials?', context: 'materials' },
  { id: '5', text: 'How much will this cost?', context: 'payment' },
  { id: '6', text: 'Thank you!', context: 'general' }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    professionalName: 'Maria Santos',
    jobContext: { id: 'job-1', title: 'Bathroom Renovation', status: 'in_progress', progress: 65 },
    lastMessage: 'I can start next Monday. The materials will arrive on Friday.',
    lastMessageTime: '2 hours ago',
    unreadCount: 2,
    priority: 'high',
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
        read: true,
        readAt: '10:32 AM'
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
        read: false,
        metadata: { fileName: 'tile-samples.jpg' }
      }
    ]
  }
];

export const EnhancedMessagingSystem = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>(mockConversations[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.jobContext.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPriority === 'all' || conv.priority === filterPriority;
    return matchesSearch && matchesFilter;
  });

  const activeConversation = mockConversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = (message?: string) => {
    const messageText = message || newMessage;
    if (messageText.trim()) {
      // Send message logic here
      setNewMessage('');
      setShowQuickReplies(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
  };

  const handleFileUpload = (type: 'image' | 'file' | 'voice') => {
    if (type === 'voice') {
      setIsRecording(!isRecording);
    } else {
      fileInputRef.current?.click();
    }
  };

  const createInfoRequest = (type: string) => {
    const requests = {
      timeline: 'Could you provide a detailed timeline for this project?',
      materials: 'What materials will you be using? Can you share the specifications?',
      permits: 'Do we need any permits for this work? Can you handle the applications?',
      insurance: 'Can you provide proof of insurance and bonding?'
    };
    handleSendMessage(requests[type as keyof typeof requests]);
    setShowRequestInfo(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-amber-500 bg-amber-50';  
      default: return 'text-green-500 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'posted': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Enhanced Conversations List */}
        <Card className="card-luxury lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-copper" />
                Messages
              </div>
              <div className="flex gap-1">
                <Button
                  variant={filterPriority === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPriority('all')}
                  className="text-xs px-2"
                >
                  All
                </Button>
                <Button
                  variant={filterPriority === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPriority('high')}
                  className="text-xs px-2"
                >
                  <AlertCircle className="w-3 h-3" />
                </Button>
              </div>
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
                      <div className={cn(
                        "absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white",
                        getPriorityColor(conversation.priority)
                      )}></div>
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
                      
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(conversation.jobContext.status)
                        )}></div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.jobContext.title}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate flex-1">{conversation.lastMessage}</p>
                        <div className="text-xs text-muted-foreground">
                          {conversation.jobContext.progress}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Chat Area */}
        <Card className="card-luxury lg:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              {/* Enhanced Chat Header */}
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
                        <span className="text-sm text-muted-foreground">{activeConversation.jobContext.title}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {activeConversation.jobContext.progress}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRequestInfo(!showRequestInfo)}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
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

                {/* Job Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Project Progress</span>
                    <span>{activeConversation.jobContext.progress}%</span>
                  </div>
                  <div className="w-full bg-sand-light rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        getStatusColor(activeConversation.jobContext.status)
                      )}
                      style={{ width: `${activeConversation.jobContext.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardHeader>

              {/* Request Info Panel */}
              {showRequestInfo && (
                <div className="border-b border-border p-4 bg-sand-light/30">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-copper" />
                    Request Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'timeline', label: 'Project Timeline', icon: Clock },
                      { key: 'materials', label: 'Materials List', icon: FileText },
                      { key: 'permits', label: 'Permits & Licenses', icon: Shield },
                      { key: 'insurance', label: 'Insurance Info', icon: Shield }
                    ].map(({ key, label, icon: Icon }) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => createInfoRequest(key)}
                        className="justify-start h-auto p-2"
                      >
                        <Icon className="w-3 h-3 mr-2" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Messages */}
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
                          <span className="text-sm">{message.metadata?.fileName || 'document.pdf'}</span>
                        </div>
                      )}

                      {message.type === 'voice' && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded">
                          <Mic className="w-4 h-4" />
                          <span className="text-sm">Voice message • {message.metadata?.duration || '0:30'}</span>
                          <Button size="sm" variant="ghost" className="p-1">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      <div className={cn(
                        "flex items-center justify-between mt-1 text-xs",
                        message.sender === 'client' ? "text-white/70" : "text-muted-foreground"
                      )}>
                        <span>{message.timestamp}</span>
                        {message.sender === 'client' && (
                          <div className="flex items-center gap-1">
                            <CheckCheck className={cn(
                              "w-3 h-3",
                              message.read ? "text-green-300" : "text-white/50"
                            )} />
                            {message.readAt && (
                              <span className="text-xs">Read {message.readAt}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="border-t border-border p-3 bg-sand-light/30">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleFileUpload('image')}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleFileUpload('file')}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleFileUpload('voice')}
                      className={isRecording ? 'bg-red-100 text-red-600' : ''}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="pr-20 min-h-[40px] resize-none"
                      rows={1}
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSendMessage()}
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

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={() => {}}
      />
    </div>
  );
};