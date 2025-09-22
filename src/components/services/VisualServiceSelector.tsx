import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, Clock } from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  icon: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 relative ${
                isSelected 
                  ? 'ring-2 ring-copper shadow-luxury bg-gradient-card' 
                  : 'card-luxury hover:shadow-card'
              }`}
              onClick={() => handleOptionClick(option.id)}
            >
              {option.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-hero text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                  <Star className="w-3 h-3 inline mr-1" />
                  Popular
                </div>
              )}
              
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-copper rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-hero rounded-xl flex items-center justify-center text-2xl mb-3">
                    {option.icon}
                  </div>
                  <h4 className="text-display font-semibold text-charcoal">
                    {option.name}
                  </h4>
                </div>

                <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
                  {option.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {option.estimatedTime}
                    </span>
                    <Badge className={`text-xs px-2 py-1 ${getDifficultyColor(option.difficulty)}`}>
                      {option.difficulty}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <span className="text-copper font-bold text-lg">
                      €{option.price}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      starting from
                    </span>
                  </div>

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