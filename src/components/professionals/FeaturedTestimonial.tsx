import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FeaturedTestimonialProps {
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  projectType?: string;
  date?: string;
}

export const FeaturedTestimonial = ({
  clientName,
  clientAvatar,
  rating,
  comment,
  projectType,
  date
}: FeaturedTestimonialProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/20">
      {/* Decorative Quote */}
      <Quote className="absolute top-4 right-4 w-20 h-20 text-primary/10" />
      
      <CardContent className="p-8 relative">
        <div className="flex items-start gap-2 mb-4">
          <span className="text-sm font-bold text-primary uppercase tracking-wider">
            Featured Review
          </span>
        </div>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Comment */}
        <blockquote className="text-lg leading-relaxed mb-6 text-foreground">
          "{comment}"
        </blockquote>

        {/* Client Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={clientAvatar} alt={clientName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {clientName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <p className="font-semibold text-foreground">{clientName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {projectType && <span>{projectType}</span>}
              {projectType && date && <span>•</span>}
              {date && <span>{date}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};