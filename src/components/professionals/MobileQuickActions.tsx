import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Calendar, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileQuickActionsProps {
  onCall?: () => void;
  onMessage?: () => void;
  onBooking?: () => void;
  onShare?: () => void;
}

export const MobileQuickActions = ({
  onCall,
  onMessage,
  onBooking,
  onShare
}: MobileQuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Phone, label: 'Call', onClick: onCall, color: 'bg-green-500 hover:bg-green-600' },
    { icon: MessageCircle, label: 'Message', onClick: onMessage, color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: Calendar, label: 'Book', onClick: onBooking, color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: Share2, label: 'Share', onClick: onShare, color: 'bg-orange-500 hover:bg-orange-600' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    size="lg"
                    className={`rounded-full w-14 h-14 shadow-lg ${action.color} text-white`}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-xl bg-primary hover:bg-primary/90"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-6 h-6" /> : <span className="text-2xl">+</span>}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};
