import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHomepageFeaturedServices } from '@/hooks/useHomepageFeaturedServices';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const HomepageServiceTiles = () => {
  const { t } = useTranslation('home');
  const { data: services, isLoading, error } = useHomepageFeaturedServices();

  if (error) {
    console.error('Error loading service tiles:', error);
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('serviceTiles.title', 'Find the Right Service')}
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('serviceTiles.subtitle', 'Browse our most popular construction and property service categories')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            services?.map((service) => (
              <Link 
                key={service.id} 
                to={`/services/${service.slug}`}
                className="group"
              >
                <Card className={cn(
                  "h-full hover:shadow-lg transition-all duration-200",
                  "border-2 border-transparent hover:border-primary/20",
                  "group-focus-visible:ring-2 group-focus-visible:ring-primary"
                )}>
                  <CardContent className="p-6 text-center">
                    {/* Icon/Emoji */}
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <span className="text-2xl" role="img" aria-label={service.name}>
                        {service.icon_emoji || '🔧'}
                      </span>
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link 
            to="/services" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
          >
            {t('serviceTiles.viewAll', 'View All Services')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomepageServiceTiles;
