import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MapPin, Briefcase, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalFilters } from '@/components/discovery/ProfessionalFilters';

export default function BrowseProfessionalsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    services: [] as string[],
    location: '',
    minRating: 0,
    verified: false,
  });

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', searchTerm, filters],
    queryFn: async () => {
      let query = supabase
        .from('professional_profiles')
        .select(`
          *,
          user:profiles!professional_profiles_user_id_fkey(
            id,
            full_name,
            display_name,
            avatar_url,
            location
          ),
          services:professional_services(
            micro_service:services_micro(name)
          ),
          stats:professional_stats(
            average_rating,
            total_reviews,
            completion_rate
          )
        `)
        .eq('is_active', true);

      if (filters.verified) {
        query = query.eq('verification_status', 'verified');
      }

      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,tagline.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.filter(prof => {
        if (filters.minRating > 0) {
          const stats = Array.isArray(prof.stats) ? prof.stats[0] : null;
          const rating = (stats as any)?.average_rating || 0;
          if (rating < filters.minRating) return false;
        }
        return true;
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Professionals</h1>
          <p className="text-muted-foreground">
            Browse verified professionals and find the perfect match for your needs
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, service, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <ProfessionalFilters filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-32 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals?.map((prof) => {
              const user = Array.isArray(prof.user) ? prof.user[0] : prof.user;
              const stats = Array.isArray(prof.stats) ? prof.stats[0] : null;
              const services = prof.services?.slice(0, 3) || [];

              return (
                <Card
                  key={prof.user_id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/professional/${prof.user_id}`)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback>
                        {user?.full_name?.[0] || user?.display_name?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {prof.business_name || user?.full_name || user?.display_name}
                      </h3>
                      {prof.verification_status === 'verified' && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {prof.tagline && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {prof.tagline}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {stats && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {(stats as any).average_rating?.toFixed(1) || 'New'}
                        </span>
                        <span className="text-muted-foreground">
                          {(stats as any).total_reviews} reviews
                        </span>
                      </div>
                    )}
                    {user?.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {typeof user.location === 'string' ? user.location : user.location.city}
                      </div>
                    )}
                  </div>

                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {services.map((s: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {s.micro_service?.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && professionals?.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No professionals found. Try adjusting your filters.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
