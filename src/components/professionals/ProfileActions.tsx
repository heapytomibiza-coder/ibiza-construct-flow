import { Button } from '@/components/ui/button';
import { Share2, Heart, Bookmark, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileActionsProps {
  professionalName: string;
  professionalId: string;
}

export const ProfileActions = ({ professionalName, professionalId }: ProfileActionsProps) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${professionalName} - Professional Profile`,
          text: `Check out ${professionalName}'s professional profile`,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from favorites' : 'Saved to favorites!');
  };

  const handleRecommend = () => {
    toast.success('Recommendation sent!');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Profile
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className={`gap-2 ${isSaved ? 'bg-primary/10 border-primary text-primary' : ''}`}
        >
          {isSaved ? (
            <Heart className="w-4 h-4 fill-current" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRecommend}
          className="gap-2"
        >
          <Mail className="w-4 h-4" />
          Recommend
        </Button>
      </motion.div>
    </div>
  );
};