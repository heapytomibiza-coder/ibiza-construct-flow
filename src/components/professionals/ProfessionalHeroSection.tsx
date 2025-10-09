import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, TrendingUp, Zap } from 'lucide-react';

interface HeroSectionProps {
  coverImageUrl?: string;
  name: string;
  tagline?: string;
  rating: number;
  responseGuaranteeHours?: number;
  isTopRated?: boolean;
  isRisingStar?: boolean;
  onRequestQuote?: () => void;
}

export const ProfessionalHeroSection = ({
  coverImageUrl,
  name,
  tagline,
  rating,
  responseGuaranteeHours = 24,
  isTopRated,
  isRisingStar,
  onRequestQuote
}: HeroSectionProps) => {
  const defaultGradient = "bg-gradient-to-br from-primary/20 via-primary/10 to-background";
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl mb-6">
      {/* Background - Cover Image or Gradient */}
      <div className={`absolute inset-0 ${!coverImageUrl && defaultGradient}`}>
        {coverImageUrl && (
          <>
            <img 
              src={coverImageUrl} 
              alt={`${name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative px-6 py-12 md:py-16">
        <div className="max-w-4xl">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {isTopRated && (
              <Badge className="bg-yellow-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Top Rated Professional
              </Badge>
            )}
            {isRisingStar && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                Rising Star
              </Badge>
            )}
            {responseGuaranteeHours <= 24 && (
              <Badge className="bg-blue-500 text-white border-0 shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                {responseGuaranteeHours}h Response Guarantee
              </Badge>
            )}
            <Badge className="bg-green-500 text-white border-0 shadow-lg">
              <Shield className="w-3 h-3 mr-1" />
              Verified Professional
            </Badge>
          </div>

          {/* Name & Tagline */}
          <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
            {name}
          </h1>
          
          {tagline && (
            <p className={`text-lg md:text-xl mb-6 ${coverImageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
              {tagline}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className={`flex items-center gap-2 ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-bold">{rating}</span>
              <span className={coverImageUrl ? 'text-white/80' : 'text-muted-foreground'}>
                rating
              </span>
            </div>
            <div className={`flex items-center gap-2 ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Responds within {responseGuaranteeHours}h</span>
            </div>
          </div>

          {/* CTA */}
          <Button 
            size="lg" 
            onClick={onRequestQuote}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Get Your Free Quote
          </Button>
        </div>
      </div>
    </div>
  );
};