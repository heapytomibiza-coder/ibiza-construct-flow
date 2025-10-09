import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface QuickChatWidgetProps {
  professionalName: string;
  professionalAvatar?: string;
  responseTime?: string;
  onSendMessage?: (message: string) => void;
}

export const QuickChatWidget = ({
  professionalName,
  professionalAvatar,
  responseTime = '< 1 hour',
  onSendMessage
}: QuickChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const quickMessages = [
    "What's your availability?",
    "Can you provide a quote?",
    "Tell me about your experience",
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 touch-target"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-full max-w-sm z-50"
          >
            <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white/20">
                      <AvatarImage src={professionalAvatar} />
                      <AvatarFallback>
                        {professionalName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{professionalName}</p>
                      <p className="text-xs opacity-90">
                        Typically responds in {responseTime}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors touch-target"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Messages */}
              <div className="p-4 space-y-2 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Quick questions:
                </p>
                {quickMessages.map((msg, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setMessage(msg)}
                    className="w-full text-left p-3 rounded-lg bg-background hover:bg-accent text-sm transition-colors touch-target"
                    whileHover={{ x: 4 }}
                  >
                    {msg}
                  </motion.button>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 mobile-optimized-input"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="touch-target"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
