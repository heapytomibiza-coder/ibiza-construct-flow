import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Award, Target, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'award' | 'target' | 'crown';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
}

interface AchievementShowcaseProps {
  achievements?: Achievement[];
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  award: Award,
  target: Target,
  crown: Crown
};

const rarityConfig = {
  common: {
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
    borderColor: 'border-gray-300'
  },
  rare: {
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-300'
  },
  epic: {
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-300'
  },
  legendary: {
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20',
    borderColor: 'border-yellow-400'
  }
};

const defaultAchievements: Achievement[] = [
  {
    id: '1',
    title: '100+ Jobs Completed',
    description: 'Successfully completed over 100 projects',
    icon: 'trophy',
    rarity: 'epic',
    earnedDate: '2024'
  },
  {
    id: '2',
    title: 'Top Rated Professional',
    description: 'Maintained 4.8+ rating with 50+ reviews',
    icon: 'star',
    rarity: 'legendary',
    earnedDate: '2024'
  },
  {
    id: '3',
    title: 'Quick Responder',
    description: 'Responds within 1 hour consistently',
    icon: 'zap',
    rarity: 'rare',
    earnedDate: '2024'
  }
];

export const AchievementShowcase = ({ achievements = defaultAchievements }: AchievementShowcaseProps) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <Card className="card-luxury overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Achievements & Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon];
            const config = rarityConfig[achievement.rarity];
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-4 cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-3 mx-auto shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-center mb-1">{achievement.title}</h4>
                <p className="text-xs text-center text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                <div className="flex justify-center">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs capitalize ${config.bgColor}`}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};