import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { QuoteRequestModal } from '@/components/booking/QuoteRequestModal';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MessageSquare, 
  Bookmark,
  CheckCircle,
  Package,
  MapPin,
  Award,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function ServiceDetailPage() {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('session_id', sid);
    }
    return sid;
  });

  // Fetch service details with professional info
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      // Get service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('professional_service_items')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Get professional profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', serviceData.professional_id)
        .single();

      // Get professional details
      const { data: proProfile } = await supabase
        .from('professional_profiles')
        .select('primary_trade, experience_years, bio')
        .eq('user_id', serviceData.professional_id)
        .maybeSingle();

      // Get professional stats
      const { data: stats } = await supabase
        .from('professional_stats')
        .select('average_rating, total_reviews, completed_bookings')
        .eq('professional_id', serviceData.professional_id)
        .maybeSingle();

      return {
        ...serviceData,
        professional: profile,
        professional_profile: proProfile,
        professional_stats: stats
      };
    },
    enabled: !!serviceId
  });

  // Check if bookmarked
  useQuery({
    queryKey: ['bookmark', serviceId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('service_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', serviceId!)
        .maybeSingle();
      
      setIsBookmarked(!!data);
      return data;
    },
    enabled: !!user && !!serviceId
  });

  // Track view
  useEffect(() => {
    if (serviceId && sessionId) {
      supabase.from('service_views').insert({
        service_id: serviceId,
        viewer_id: user?.id || null,
        session_id: sessionId
      });
    }
  }, [serviceId, sessionId, user?.id]);

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to save services');
      navigate('/auth');
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('service_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId!);
        setIsBookmarked(false);
        toast.success('Removed from saved services');
      } else {
        await supabase
          .from('service_bookmarks')
          .insert({ user_id: user.id, service_id: serviceId! });
        setIsBookmarked(true);
        toast.success('Saved to your collection');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleRequestQuote = () => {
    if (!user) {
      toast.error('Please sign in to request a quote');
      navigate('/auth');
      return;
    }
    setQuoteModalOpen(true);
  };

  const handleMessage = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const professionalId = service?.professional_id;
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${professionalId}),and(participant_1_id.eq.${professionalId},participant_2_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        navigate(`/messages?conversation=${existing.id}`);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: user.id,
            participant_2_id: professionalId!
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/messages?conversation=${newConv.id}`);
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container pt-32 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-40 bg-muted rounded-lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container pt-32 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Button onClick={() => navigate('/discovery')}>Back to Discovery</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = () => {
    if (service.pricing_type === 'quote_required') return 'Quote Required';
    if (service.pricing_type === 'flat_rate') return `€${service.base_price}`;
    if (service.pricing_type === 'per_hour') return `€${service.base_price}/hr`;
    if (service.pricing_type === 'per_unit') return `€${service.base_price}/${service.unit_type}`;
    return 'Contact for pricing';
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{service.name} | Professional Services</title>
        <meta name="description" content={service.description || `Book ${service.name} with verified professionals`} />
      </Helmet>

      <Header />
      
      <main className="container pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image Section */}
              <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                {service.primary_image_url ? (
                  <img
                    src={service.primary_image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">{service.category === 'Electrical' ? '⚡' : '🔧'}</span>
                  </div>
                )}
                
                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                    {service.category}
                  </Badge>
                  {service.difficulty_level && (
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                      {service.difficulty_level}
                    </Badge>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleBookmark}
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm"
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Service Title & Price */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-semibold text-primary">{formatPrice()}</span>
                  {service.estimated_duration_minutes && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(service.estimated_duration_minutes / 60)}h duration</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Service Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description || 'Professional service with quality guaranteed.'}
                </p>
              </div>

              {/* Bulk Pricing */}
              {service.bulk_discount_threshold && service.bulk_discount_price && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Bulk Pricing Available
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Save more with bulk orders!
                  </p>
                  <p className="text-sm">
                    Order {service.bulk_discount_threshold}+ units and pay only <span className="font-semibold text-primary">€{service.bulk_discount_price}</span> per unit
                  </p>
                </Card>
              )}
            </div>

            {/* Sidebar - Professional Info */}
            <div className="space-y-6">
              {/* Professional Card */}
              <Card className="p-6 sticky top-24">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={service.professional?.avatar_url} />
                    <AvatarFallback>
                      {service.professional?.full_name?.split(' ').map(n => n[0]).join('') || 'PR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.professional?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.professional_profile?.primary_trade}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {service.professional_stats && (
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        Rating
                      </span>
                      <span className="font-medium">
                        {service.professional_stats.average_rating?.toFixed(1) || 'N/A'} 
                        ({service.professional_stats.total_reviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Jobs Completed
                      </span>
                      <span className="font-medium">
                        {service.professional_stats.completed_bookings || 0}+
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Experience
                      </span>
                      <span className="font-medium">
                        {service.professional_profile?.experience_years || 0} years
                      </span>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleRequestQuote}
                    className="w-full"
                    size="lg"
                  >
                    Request Quote
                  </Button>
                  <Button
                    onClick={handleMessage}
                    variant="outline"
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Professional
                  </Button>
                  <Button
                    onClick={() => navigate(`/professional/${service.professional_id}`)}
                    variant="ghost"
                    className="w-full"
                  >
                    View Full Profile
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        professionalId={service.professional_id}
        professionalName={service.professional?.full_name || 'Professional'}
        serviceId={service.service_id}
        serviceName={service.name}
        preSelectedServiceId={service.id}
      />
    </div>
  );
}
