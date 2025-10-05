import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface CompletionCelebrationProps {
  isComplete: boolean;
  onDismiss: () => void;
}

export function CompletionCelebration({ isComplete, onDismiss }: CompletionCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShow(true);
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md mx-4 border-2 border-primary shadow-2xl">
              <CardContent className="pt-6 pb-8">
                <div className="text-center space-y-6">
                  {/* Trophy Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      <Trophy className="h-24 w-24 text-primary" />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Sparkles className="h-12 w-12 text-primary/30" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Completion Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                      <CheckCircle className="h-8 w-8" />
                      Profile Complete!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Congratulations! You've completed all onboarding steps.
                    </p>
                  </motion.div>

                  {/* Achievement Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-accent/50 rounded-lg p-4 space-y-2"
                  >
                    <p className="text-sm font-medium">Your professional profile is now live!</p>
                    <p className="text-xs text-muted-foreground">
                      You can now start receiving job opportunities from clients.
                    </p>
                  </motion.div>

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleDismiss}
                    >
                      Start Exploring
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
