import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Shield, TrendingUp, Zap, Upload } from 'lucide-react';

interface HeroSectionProps {
  coverImageUrl?: string;
  name: string;
  tagline?: string;
  rating: number;
  responseGuaranteeHours?: number;
  isTopRated?: boolean;
  isRisingStar?: boolean;
  onRequestQuote?: () => void;
  isOwner?: boolean;
  onUploadBackdrop?: () => void;
}

export const ProfessionalHeroSection = ({
  coverImageUrl,
  name,
  tagline,
  rating,
  responseGuaranteeHours = 24,
  isTopRated,
  isRisingStar,
  onRequestQuote,
  isOwner,
  onUploadBackdrop
}: HeroSectionProps) => {
  const defaultGradient = "bg-gradient-to-br from-primary/20 via-primary/10 to-background";
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl mb-4">
      {/* Background - Cover Image or Gradient */}
      <div className={`absolute inset-0 ${!coverImageUrl && defaultGradient}`}>
        {coverImageUrl && (
          <>
            <img 
              src={coverImageUrl} 
              alt={`${name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        )}
      </div>

      {/* Owner Upload Backdrop Button */}
      {isOwner && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-4 right-4 z-10"
          onClick={onUploadBackdrop}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Backdrop
        </Button>
      )}

      {/* Content - Compact Size */}
      <div className="relative px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-4xl">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isTopRated && (
              <Badge className="text-xs py-0.5 px-2 bg-yellow-500 text-white border-0">
                <Star className="w-3 h-3 mr-1" />
                Top-Rated
              </Badge>
            )}
            {isRisingStar && (
              <Badge className="text-xs py-0.5 px-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Rising Star
              </Badge>
            )}
            {responseGuaranteeHours <= 24 && (
              <Badge className="text-xs py-0.5 px-2 bg-blue-500 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                {responseGuaranteeHours}h
              </Badge>
            )}
            <Badge className="text-xs py-0.5 px-2 bg-green-500 text-white border-0">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>

          {/* Name & Tagline */}
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
            {name}
          </h1>
          
          {tagline && (
            <p className={`text-sm sm:text-base mb-4 ${coverImageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
              {tagline}
            </p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className={`flex items-center gap-1.5 ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-base font-bold">{rating}</span>
              <span className={`text-sm ${coverImageUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
                rating
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm ${coverImageUrl ? 'text-white' : 'text-foreground'}`}>
              <Clock className="w-4 h-4" />
              <span>Responds in {responseGuaranteeHours}h</span>
            </div>
          </div>

          {/* CTA */}
          <Button 
            size="default" 
            onClick={onRequestQuote}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Get Free Quote
          </Button>
        </div>
      </div>
    </div>
  );
};