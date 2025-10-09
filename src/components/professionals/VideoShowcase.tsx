import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoShowcaseProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export const VideoShowcase = ({
  videoUrl,
  thumbnailUrl,
  title = "Watch My Introduction",
  description = "Get to know me and my work"
}: VideoShowcaseProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl) return null;

  return (
    <Card className="card-luxury overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {!isPlaying ? (
            <motion.div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => setIsPlaying(true)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Play className="w-16 h-16 text-primary" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-10 h-10 text-primary ml-1" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="relative w-full h-full">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors touch-target"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
