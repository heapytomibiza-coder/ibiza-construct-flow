import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { 
  Star, MapPin, Clock, Award, MessageSquare, 
  Briefcase, Euro, CheckCircle, Mail
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfessionalProfile() {
  const { id: professionalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: async () => {
      // Fetch professional profile
      const { data: proProfile, error: proError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', professionalId)
        .single();

      if (proError) throw proError;

      // Fetch user profile for name and avatar
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', professionalId)
        .single();

      if (userError) throw userError;

      // Fetch services
      const { data: services } = await supabase
        .from('professional_services')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('is_active', true);

      // Fetch stats
      const { data: stats } = await supabase
        .from('professional_stats')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      return {
        ...proProfile,
        display_name: userProfile.display_name || userProfile.full_name,
        services: services || [],
        stats: stats || { average_rating: 0, total_reviews: 0, completed_bookings: 0 },
        zones: Array.isArray(proProfile.zones) ? proProfile.zones : [],
        skills: Array.isArray(proProfile.skills) ? proProfile.skills : [],
        portfolio_images: Array.isArray(proProfile.portfolio_images) ? proProfile.portfolio_images : []
      };
    },
    enabled: !!professionalId
  });

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      // Get or create conversation with this professional
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id, professionalId!])
        .single();

      if (existing) {
        navigate(`/messages?conversation=${existing.id}`);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participants: [user.id, professionalId!],
            metadata: { professional_profile: true }
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/messages?conversation=${newConv.id}`);
      }
    } catch (error) {
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Professional not found</h1>
          <Button onClick={() => navigate('/discovery')}>Browse Professionals</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = profile.display_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'P';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-display font-bold text-foreground">
                        {profile.display_name}
                      </h1>
                      <p className="text-lg text-muted-foreground">{profile.primary_trade}</p>
                    </div>
                    {profile.verification_status === 'verified' && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    {profile.stats.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{profile.stats.average_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({profile.stats.total_reviews} reviews)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.stats.completed_bookings} jobs completed</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Responds in {profile.response_time_hours}h</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(profile.zones as string[])?.map((zone: string) => (
                      <Badge key={zone} variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {zone}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleContact} className="flex-1 md:flex-none">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Request Quote
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {profile.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.services.map((service: any) => (
                    <div key={service.id} className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">{service.micro_service_id}</h4>
                      {service.pricing_structure && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Euro className="w-4 h-4" />
                          <span>From €{service.pricing_structure.base_price || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills && (profile.skills as string[]).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills as string[]).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      <Award className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {profile.portfolio_images && (profile.portfolio_images as string[]).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(profile.portfolio_images as string[]).map((image: string, index: number) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
