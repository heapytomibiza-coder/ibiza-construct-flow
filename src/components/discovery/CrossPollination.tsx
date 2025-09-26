import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CrossPollinationProps {
  type: 'service' | 'professional';
  selectedItem: any;
  relatedItems: any[];
  onItemClick: (item: any) => void;
}

export const CrossPollination = ({ 
  type, 
  selectedItem, 
  relatedItems, 
  onItemClick 
}: CrossPollinationProps) => {
  const navigate = useNavigate();

  if (!selectedItem || relatedItems.length === 0) return null;

  const getTitle = () => {
    if (type === 'service') {
      return `Professionals offering "${selectedItem.title}"`;
    } else {
      return `Services by ${selectedItem.full_name}`;
    }
  };

  const getIcon = () => {
    return type === 'service' ? <Users className="w-5 h-5" /> : <Wrench className="w-5 h-5" />;
  };

  const handleViewAll = () => {
    if (type === 'service') {
      navigate(`/professionals?service=${encodeURIComponent(selectedItem.title)}`);
    } else {
      navigate(`/professional/${selectedItem.id}#services`);
    }
  };

  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </CardTitle>
          {relatedItems.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewAll}
              className="flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedItems.slice(0, 3).map((item, index) => (
            <Card 
              key={item.id || index}
              className="cursor-pointer hover:shadow-md transition-shadow bg-background"
              onClick={() => onItemClick(item)}
            >
              <CardContent className="p-4">
                {type === 'service' ? (
                  // Professional Card
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={item.profile_image_url} 
                        alt={item.full_name}
                      />
                      <AvatarFallback>
                        {item.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.full_name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.bio || 'Professional service provider'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          €{item.hourly_rate || 50}/hr
                        </Badge>
                        {item.rating && (
                          <span className="text-xs text-muted-foreground">
                            ⭐ {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Service Card
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-semibold text-sm truncate">
                        {item.title || item.micro}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs font-medium text-primary">
                        {item.priceRange}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {relatedItems.length > 3 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              +{relatedItems.length - 3} more {type === 'service' ? 'professionals' : 'services'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};