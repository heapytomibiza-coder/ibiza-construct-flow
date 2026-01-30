import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFeaturedProfessionals } from '@/hooks/useFeaturedProfessionals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeaturedProfessionalsSection = () => {
  const { t } = useTranslation('home');
  const { data: professionals, isLoading, error } = useFeaturedProfessionals(6);

  if (error) {
    console.error('Error loading featured professionals:', error);
    return null;
  }

  // Hide section if no verified professionals with complete profiles
  if (!isLoading && (!professionals || professionals.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('featuredPros.title', 'Verified Professionals')}
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featuredPros.subtitle', 'Trusted tradespeople ready to work on your Ibiza project')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            professionals?.map((pro) => (
              <Link key={pro.id} to={`/professionals/${pro.id}`} className="group">
                <Card className={cn(
                  "h-full hover:shadow-lg transition-all duration-200",
                  "border-2 border-transparent hover:border-primary/20"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={pro.avatar_url || '/placeholder.svg'}
                          alt={pro.business_name || pro.full_name || 'Professional'}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        {pro.verification_status === 'verified' && (
                          <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {pro.business_name || pro.full_name || t('featuredPros.professional', 'Professional')}
                          </h3>
                        </div>

                        {/* Rating */}
                        {pro.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{pro.rating.toFixed(1)}</span>
                            {pro.total_reviews && (
                              <span className="text-sm text-muted-foreground">
                                ({pro.total_reviews})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tagline */}
                        {pro.tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {pro.tagline}
                          </p>
                        )}

                        {/* Specializations */}
                        {pro.specializations && pro.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pro.specializations.slice(0, 2).map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {pro.specializations.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{pro.specializations.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/professionals" className="inline-flex items-center gap-2">
              {t('featuredPros.viewAll', 'View All Professionals')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProfessionalsSection;
