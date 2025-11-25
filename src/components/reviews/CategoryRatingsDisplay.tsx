import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { CategoryRatings, RatingBreakdown } from '@/types/review';

interface CategoryRatingsDisplayProps {
  ratings: Partial<CategoryRatings>;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: RatingBreakdown[] = [
  { category: 'timeliness', rating: 0, label: 'Timeliness', icon: '⏱️' },
  { category: 'communication', rating: 0, label: 'Communication', icon: '💬' },
  { category: 'value', rating: 0, label: 'Value', icon: '💰' },
  { category: 'quality', rating: 0, label: 'Quality', icon: '⭐' },
  { category: 'professionalism', rating: 0, label: 'Professionalism', icon: '👔' },
];

export function CategoryRatingsDisplay({ 
  ratings, 
  showLabels = true,
  size = 'md' 
}: CategoryRatingsDisplayProps) {
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className="space-y-3">
      {categoryConfig.map(({ category, label, icon }) => {
        const rating = ratings[category] || 0;
        const percentage = (rating / 5) * 100;

        return (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between">
              {showLabels && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className={`font-medium ${textSize}`}>{label}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className={`font-semibold ${textSize}`}>{rating.toFixed(1)}</span>
                <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}
