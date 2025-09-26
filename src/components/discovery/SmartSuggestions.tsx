import React from 'react';
import { Lightbulb, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SmartSuggestionsProps {
  searchTerm: string;
  location: { lat: number; lng: number; address: string } | null;
  onSuggestionClick: (suggestion: any) => void;
}

export const SmartSuggestions = ({ 
  searchTerm, 
  location, 
  onSuggestionClick 
}: SmartSuggestionsProps) => {
  // Generate smart suggestions based on search term and location
  const generateSuggestions = () => {
    const suggestions = [];

    // Popular services in area
    if (location) {
      suggestions.push({
        type: 'popular',
        icon: <TrendingUp className="w-4 h-4" />,
        title: `Popular in ${location.address}`,
        items: [
          { title: 'House Cleaning', category: 'Cleaning' },
          { title: 'IKEA Assembly', category: 'Handyman' },
          { title: 'Dog Walking', category: 'Personal' }
        ]
      });
    }

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        type: 'time',
        icon: <Clock className="w-4 h-4" />,
        title: 'Morning Services',
        items: [
          { title: 'Grocery Shopping', category: 'Delivery' },
          { title: 'Dog Walking', category: 'Personal' },
          { title: 'House Cleaning', category: 'Cleaning' }
        ]
      });
    } else if (hour >= 17 && hour < 22) {
      suggestions.push({
        type: 'time',
        icon: <Clock className="w-4 h-4" />,
        title: 'Evening Services',
        items: [
          { title: 'Post-Party Cleanup', category: 'Cleaning' },
          { title: 'Pet Sitting', category: 'Personal' },
          { title: 'Furniture Assembly', category: 'Handyman' }
        ]
      });
    }

    // Search-based suggestions
    if (searchTerm) {
      const searchSuggestions = generateSearchSuggestions(searchTerm);
      if (searchSuggestions.length > 0) {
        suggestions.push({
          type: 'search',
          icon: <Lightbulb className="w-4 h-4" />,
          title: 'Related to your search',
          items: searchSuggestions
        });
      }
    }

    return suggestions;
  };

  const generateSearchSuggestions = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const suggestions = [];

    // Cleaning-related
    if (lowerTerm.includes('clean') || lowerTerm.includes('tidy')) {
      suggestions.push(
        { title: 'Deep Cleaning', category: 'Cleaning' },
        { title: 'Window Cleaning', category: 'Cleaning' },
        { title: 'Carpet Cleaning', category: 'Cleaning' }
      );
    }

    // Moving-related
    if (lowerTerm.includes('move') || lowerTerm.includes('transport')) {
      suggestions.push(
        { title: 'Help Moving', category: 'Moving' },
        { title: 'Heavy Lifting', category: 'Moving' },
        { title: 'Packing Services', category: 'Moving' }
      );
    }

    // Handyman-related
    if (lowerTerm.includes('fix') || lowerTerm.includes('repair') || lowerTerm.includes('install')) {
      suggestions.push(
        { title: 'TV Mounting', category: 'Handyman' },
        { title: 'IKEA Assembly', category: 'Handyman' },
        { title: 'Smart Home Installation', category: 'Handyman' }
      );
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = generateSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        Smart Suggestions
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {suggestion.icon}
                {suggestion.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {suggestion.items.map((item, itemIndex) => (
                  <Button
                    key={itemIndex}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSuggestionClick(item)}
                    className="w-full justify-between h-auto p-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};