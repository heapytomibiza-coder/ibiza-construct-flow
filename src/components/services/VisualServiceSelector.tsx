import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Clock } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  icon: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  primary_image_url?: string;
  gallery_images?: string[];
  video_url?: string;
  image_alt_text?: string;
}

interface VisualServiceSelectorProps {
  options: ServiceOption[];
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
  multiSelect?: boolean;
}

export const VisualServiceSelector = ({ 
  options, 
  selectedOptions, 
  onSelectionChange, 
  multiSelect = true 
}: VisualServiceSelectorProps) => {
  const handleOptionClick = (optionId: string) => {
    if (multiSelect) {
      const newSelection = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([optionId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-sand text-charcoal border-sand-dark';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-display text-xl font-semibold text-charcoal mb-2">
          Select Your Services
        </h3>
        <p className="text-muted-foreground">
          Choose from our professional services. {multiSelect ? 'Select multiple options.' : 'Select one option.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg group overflow-hidden ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-md' 
                  : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => handleOptionClick(option.id)}
            >
              {/* Hero Image Section */}
              <div className="relative">
                <ImageCarousel
                  images={option.gallery_images || []}
                  primaryImage={option.primary_image_url}
                  videoUrl={option.video_url}
                  altText={option.image_alt_text || option.name}
                  aspectRatio="video"
                  showThumbnails={false}
                  className="rounded-none"
                />
                
                {/* Floating Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-charcoal border-0 font-bold text-lg px-3 py-1">
                    €{option.price}
                  </Badge>
                  {option.difficulty && (
                    <Badge 
                      variant="outline" 
                      className={`bg-white/90 border-0 ${getDifficultyColor(option.difficulty)}`}
                    >
                      {option.difficulty}
                    </Badge>
                  )}
                </div>
                
                {option.popular && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-500 text-white border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-white rounded-full p-2">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Service Name & Icon */}
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">{option.icon}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-charcoal group-hover:text-primary transition-colors text-lg">
                      {option.name}
                    </h3>
                  </div>

                  {/* Description */}
                  {option.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {option.description}
                    </p>
                  )}

                  {/* Footer with time estimate */}
                  {option.estimatedTime && (
                    <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{option.estimatedTime}</span>
                    </div>
                  )}

                  {/* Selection Button */}
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${isSelected ? 'btn-hero' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(option.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select Service'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};