import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ChatJobHeader } from "./ChatJobHeader";
import { ChatActionBar } from "./ChatActionBar";
import { ChatSidebar } from "./ChatSidebar";
import { StructuredMessageCard } from "./StructuredMessageCard";
import { MessageInput } from "./MessageInput";
import { Loader2 } from "lucide-react";

interface MessageThreadProps {
  conversationId: string;
  recipientId: string;
  recipientName?: string;
  recipientAvatar?: string;
  jobId?: string | null;
  jobTitle?: string;
  category?: string;
  microService?: string;
  contractStatus?: 'pending' | 'quoted' | 'in_progress' | 'completed' | 'cancelled';
  agreedPrice?: number;
  userRole?: 'client' | 'professional';
}

export const MessageThread = ({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  jobId,
  jobTitle,
  category,
  microService,
  contractStatus,
  agreedPrice,
  userRole = 'client',
}: MessageThreadProps) => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, attachments: any[] = []) => {
    if (!content.trim() && attachments.length === 0) return;

    await sendMessage.mutateAsync({
      content: content.trim(),
    });
  };

  const handleSendStructuredMessage = (
    type: string,
    content: string,
    metadata?: any
  ) => {
    sendMessage.mutate({
      content,
      message_type: type as any,
    });
  };

  const handleTyping = (isTyping: boolean) => {
    // Handle typing indicator
    console.log('Typing:', isTyping);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full">
        {/* Job Header (if job context exists) */}
        {jobId && jobTitle && (
          <ChatJobHeader
            jobId={jobId}
            jobTitle={jobTitle}
            category={category}
            microService={microService}
            contractStatus={contractStatus}
            agreedPrice={agreedPrice}
          />
        )}

        {/* User Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>
                {recipientName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{recipientName || "User"}</h3>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const isStructured = message.message_type && 
                message.message_type !== 'text' && 
                message.message_type !== 'file' && 
                message.message_type !== 'image';

              if (isStructured) {
                return (
                  <div key={message.id} className="space-y-2">
                    <StructuredMessageCard
                      type={message.message_type as any}
                      metadata={message.metadata}
                      content={message.content}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Bar */}
        {jobId && (
          <ChatActionBar
            conversationId={conversationId}
            jobId={jobId}
            contractStatus={contractStatus}
            userRole={userRole}
            onSendStructuredMessage={handleSendStructuredMessage}
          />
        )}

        {/* Input */}
        <div className="border-t px-6 py-4">
          <MessageInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={sendMessage.isPending}
          />
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && jobId && (
        <ChatSidebar jobId={jobId} agreedPrice={agreedPrice} />
      )}
    </div>
  );
};
