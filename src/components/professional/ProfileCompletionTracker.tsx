import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Sparkles, Rocket, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionTrackerProps {
  profile: any;
}

export const ProfileCompletionTracker = ({ profile }: ProfileCompletionTrackerProps) => {
  const navigate = useNavigate();
  const [hasServices, setHasServices] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServices = async () => {
      if (!profile?.id) return;
      
      const { data, error } = await supabase
        .from('professional_services')
        .select('id')
        .eq('professional_id', profile.id)
        .eq('is_active', true)
        .limit(1);
      
      setHasServices((data?.length || 0) > 0);
    };

    checkServices();
  }, [profile?.id]);

  const completionItems = useMemo(() => {
    return [
      {
        id: 'services',
        label: 'Configure services you offer',
        completed: hasServices === true,
        required: true,
        loading: hasServices === null
      },
      {
        id: 'bio',
        label: 'Add professional bio',
        completed: !!profile?.bio && profile.bio.length > 20,
        required: true
      },
      {
        id: 'skills',
        label: 'Add skills',
        completed: !!profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0,
        required: true
      },
      {
        id: 'hourly_rate',
        label: 'Set hourly rate',
        completed: !!profile?.hourly_rate && profile.hourly_rate > 0,
        required: true
      },
      {
        id: 'zones',
        label: 'Set service areas',
        completed: !!profile?.zones && Array.isArray(profile.zones) && profile.zones.length > 0,
        required: true
      },
      {
        id: 'availability',
        label: 'Set availability',
        completed: !!profile?.availability && Array.isArray(profile.availability) && profile.availability.length > 0,
        required: true
      },
      {
        id: 'portfolio',
        label: 'Upload portfolio photos (at least 3)',
        completed: !!profile?.portfolio_images && Array.isArray(profile.portfolio_images) && profile.portfolio_images.length >= 3,
        required: false
      }
    ];
  }, [profile, hasServices]);

  const completionPercentage = useMemo(() => {
    const total = completionItems.length;
    const completed = completionItems.filter(item => item.completed).length;
    return Math.round((completed / total) * 100);
  }, [completionItems]);

  const incompleteRequired = completionItems.filter(
    item => item.required && !item.completed
  );

  // Don't show if profile is 100% complete
  if (completionPercentage === 100) {
    return null;
  }

  const getMilestoneMessage = () => {
    if (completionPercentage >= 80) return { icon: Trophy, text: "Almost there! You're crushing it!", color: "text-sage" };
    if (completionPercentage >= 60) return { icon: Rocket, text: "Great progress! Keep the momentum!", color: "text-sage-dark" };
    if (completionPercentage >= 40) return { icon: Sparkles, text: "You're on fire! Keep going!", color: "text-copper" };
    return { icon: Clock, text: "Let's get you set up for success!", color: "text-sage" };
  };

  const milestone = getMilestoneMessage();
  const MilestoneIcon = milestone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-primary rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-sage/10 via-copper/5 to-transparent"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <MilestoneIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${milestone.color}`} />
              </motion.div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                  {completionPercentage < 50 ? 'Welcome!' : 'Profile Setup'}
                </h3>
                <p className={`text-xs sm:text-sm font-medium ${milestone.color}`}>
                  {milestone.text}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-display font-bold text-sage-dark">
                {completionPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar with Glow */}
        <div className="relative mb-4 sm:mb-6 md:mb-8">
          <Progress value={completionPercentage} className="h-2 sm:h-3 bg-sage/10" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-sage/20 via-copper/20 to-sage/20 rounded-full blur-lg -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Completion Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {completionItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                group relative p-3 sm:p-4 rounded-xl border transition-all duration-300
                ${item.completed 
                  ? 'bg-sage/5 border-sage/30 active:border-sage/40' 
                  : 'bg-background/50 border-border/50 active:border-sage/40 active:bg-sage/5'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-sage" />
                  ) : (
                    <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-active:text-sage transition-colors" />
                  )}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`
                      text-xs sm:text-sm font-medium transition-all
                      ${item.completed 
                        ? 'text-muted-foreground line-through' 
                        : 'text-foreground group-active:text-sage-dark'
                      }
                    `}>
                      {item.label}
                    </p>
                    {item.required && !item.completed && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-copper/10 text-copper font-medium">
                        Required
                      </span>
                    )}
                  </div>
                </div>

                {item.loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-sage border-t-transparent rounded-full"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-sage/20">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {incompleteRequired.length > 0 ? (
              <span>
                <strong>{incompleteRequired.length}</strong> required {incompleteRequired.length === 1 ? 'step' : 'steps'} remaining to go live
              </span>
            ) : (
              <span className="text-sage font-medium">
                ✨ All required steps complete! Finish optional items for maximum impact.
              </span>
            )}
          </div>
          
          <Button
            onClick={() => navigate('/settings/professional')}
            className="glass-magnetic w-full sm:w-auto min-h-[44px]"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Continue Setup
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
