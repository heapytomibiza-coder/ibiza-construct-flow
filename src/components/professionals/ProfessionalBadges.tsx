import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Award, Shield, Star, TrendingUp, Zap, Trophy } from 'lucide-react';

interface ProfessionalBadgesProps {
  professionalUserId: string;
  className?: string;
}

const badgeIcons: Record<string, any> = {
  super_pro: Trophy,
  top_rated: Star,
  verified: Shield,
  rising_star: TrendingUp,
  fast_responder: Zap,
  default: Award
};

const badgeColors: Record<string, string> = {
  super_pro: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  top_rated: 'bg-yellow-500 text-white',
  verified: 'bg-green-500 text-white',
  rising_star: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  fast_responder: 'bg-blue-500 text-white',
  default: 'bg-gray-500 text-white'
};

export const ProfessionalBadges = ({ professionalUserId, className = '' }: ProfessionalBadgesProps) => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['professional-badges', professionalUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_badges')
        .select('*')
        .eq('professional_user_id', professionalUserId)
        .eq('is_active', true)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalUserId
  });

  if (isLoading || !badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => {
        const Icon = badgeIcons[badge.badge_type] || badgeIcons.default;
        const colorClass = badgeColors[badge.badge_type] || badgeColors.default;
        
        return (
          <Badge 
            key={badge.id} 
            className={`${colorClass} border-0 shadow-md`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {badge.badge_name}
          </Badge>
        );
      })}
    </div>
  );
};