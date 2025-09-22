import { Badge } from '@/components/ui/badge';
import { ImageCarousel } from './ImageCarousel';
import { Star, Clock, CheckCircle } from 'lucide-react';

interface ServiceWithIcon {
  title: string;
  description: string;
  category: string;
  popular?: boolean;
}

interface ProfessionalStats {
  rating: number;
  reviewCount: number;
  responseTime: string;
  completedJobs: number;
}

interface ServiceHeroSectionProps {
  service: ServiceWithIcon;
  heroImages: string[];
  professionalStats: ProfessionalStats;
}

export const ServiceHeroSection = ({ 
  service, 
  heroImages, 
  professionalStats 
}: ServiceHeroSectionProps) => {
  return (
    <section className="relative">
      <div className="h-[60vh] relative overflow-hidden">
        <ImageCarousel
          images={heroImages}
          altText={service.title}
          className="h-full rounded-none"
          aspectRatio="video"
          showThumbnails={false}
          autoPlay={true}
        />
        
        {/* Hero Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-end">
            <div className="text-white mb-12 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {service.category}
                </Badge>
                {service.popular && (
                  <Badge className="bg-copper text-white border-0">
                    🔥 Popular Choice
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
              <p className="text-xl mb-6 text-white/90">{service.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{professionalStats.rating}</span>
                  <span className="text-white/80">({professionalStats.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>Responds in {professionalStats.responseTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span>{professionalStats.completedJobs}+ jobs completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};