import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfessionalProfileHeader } from '@/components/services/ProfessionalProfileHeader';
import { ProfessionalAboutSection } from '@/components/professionals/ProfessionalAboutSection';
import { ServicesShowcase } from '@/components/professionals/ServicesShowcase';
import { ProfessionalPortfolioGallery } from '@/components/professionals/ProfessionalPortfolioGallery';
import { BeforeAfterGallery } from '@/components/professionals/BeforeAfterGallery';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { QuoteRequestModal } from '@/components/booking/QuoteRequestModal';
import { ProfessionalHeroSection } from '@/components/professionals/ProfessionalHeroSection';
import { PortfolioMasonry } from '@/components/professionals/PortfolioMasonry';

export default function ProfessionalProfile() {
  const { id: professionalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Track profile view
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('session_id', sid);
    }
    return sid;
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: async () => {
      // Fetch professional profile with new fields
      const { data: proProfile, error: proError } = await supabase
        .from('professional_profiles')
        .select('*, cover_image_url, tagline, video_intro_url, work_philosophy, response_guarantee_hours, instant_booking_enabled')
        .eq('user_id', professionalId)
        .single();

      if (proError) throw proError;

      // Fetch user profile for name and avatar
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('display_name, full_name, avatar_url')
        .eq('id', professionalId)
        .single();

      if (userError) throw userError;

      // Fetch services
      const { data: services } = await supabase
        .from('professional_services')
        .select('*')
        .eq('professional_id', professionalId);

      // Fetch stats
      const { data: stats } = await supabase
        .from('professional_stats')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('professional_reviews')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch portfolio images from new table
      const { data: portfolioImages } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('professional_id', professionalId)
        .order('display_order', { ascending: true });

      // Fetch job photos (before/after) for completed jobs
      const { data: jobPhotos } = await supabase
        .from('job_photos')
        .select('*')
        .eq('uploaded_by', professionalId)
        .in('photo_type', ['before', 'after']);

      // Get profile view count
      const { data: viewCountData } = await supabase
        .rpc('get_profile_view_count', { p_professional_id: professionalId });
      
      const viewCount = viewCountData || 0;

      // Transform old portfolio images from storage (backward compatibility)
      const legacyPortfolioItems = Array.isArray(proProfile.portfolio_images) 
        ? proProfile.portfolio_images.map((url: string) => ({ url }))
        : [];

      return {
        ...proProfile,
        display_name: userProfile.display_name || userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        services: services || [],
        stats: stats || { average_rating: 0, total_reviews: 0, completed_bookings: 0 },
        reviews: reviews || [],
        zones: Array.isArray(proProfile.zones) ? proProfile.zones : [],
        skills: Array.isArray(proProfile.skills) ? proProfile.skills : [],
        portfolio_images: legacyPortfolioItems,
        new_portfolio_images: portfolioImages || [],
        job_photos: jobPhotos || [],
        view_count: viewCount
      };
    },
    enabled: !!professionalId
  });

  // Track this view (only once per session)
  useState(() => {
    if (professionalId && sessionId) {
      // Track view asynchronously without blocking UI
      supabase
        .from('profile_views')
        .select('id')
        .eq('professional_id', professionalId)
        .eq('session_id', sessionId)
        .maybeSingle()
        .then(({ data: existingView }) => {
          if (!existingView) {
            // Only insert if this session hasn't viewed this profile yet
            supabase.from('profile_views').insert({
              professional_id: professionalId,
              viewer_id: user?.id || null,
              session_id: sessionId
            });
          }
        });
    }
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
        <main className="container pt-32 pb-8 px-4">
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
        <main className="container pt-32 pb-8 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Professional not found</h1>
          <Button onClick={() => navigate('/discovery')}>Browse Professionals</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRequestQuote = () => {
    if (!user) {
      toast.error('Please sign in to request a quote');
      navigate('/auth');
      return;
    }
    setQuoteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-32 pb-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero Section */}
          <ProfessionalHeroSection
            coverImageUrl={profile.cover_image_url}
            name={profile.display_name}
            tagline={profile.tagline}
            rating={profile.stats.average_rating}
            responseGuaranteeHours={profile.response_guarantee_hours || 24}
            isTopRated={profile.stats.average_rating >= 4.8 && profile.stats.total_reviews >= 50}
            isRisingStar={profile.stats.total_reviews >= 10 && profile.stats.total_reviews < 50 && profile.stats.average_rating >= 4.5}
            onRequestQuote={handleRequestQuote}
          />

          {/* Enhanced Profile Header with Real-time Availability */}
          <ProfessionalProfileHeader
            professional={{
              id: professionalId!,
              name: profile.display_name,
              rating: profile.stats.average_rating,
              reviewCount: profile.stats.total_reviews,
              completedJobs: profile.stats.completed_bookings,
              responseTime: `${profile.response_time_hours}h`,
              location: (profile.zones as string[])?.[0] || 'Ibiza',
              certifications: [],
              about: profile.bio || '',
              workingHours: '9:00 AM - 6:00 PM',
              avatarUrl: profile.avatar_url,
              verificationStatus: profile.verification_status,
              viewCount: profile.view_count
            }}
            onMessage={handleContact}
            onRequestQuote={handleRequestQuote}
          />

          {/* About Section */}
          <ProfessionalAboutSection
            bio={profile.bio}
            yearsOfExperience={profile.experience_years}
            certifications={[]}
            skills={profile.skills as string[]}
            coverageArea={profile.zones as string[]}
            primaryTrade={profile.primary_trade}
            workPhilosophy={profile.work_philosophy}
          />

          {/* Services Showcase Section */}
          {profile.services.length > 0 && (
            <ServicesShowcase
              services={profile.services as any}
              onRequestQuote={handleRequestQuote}
            />
          )}

          {/* Portfolio Masonry Gallery */}
          {profile.new_portfolio_images && profile.new_portfolio_images.length > 0 && (
            <PortfolioMasonry 
              images={profile.new_portfolio_images.map((img: any) => ({
                url: img.image_url,
                title: img.title,
                category: img.category,
                description: img.description
              }))} 
              title="Portfolio Showcase"
            />
          )}

          {/* Before & After Gallery from Completed Jobs */}
          {profile.job_photos && profile.job_photos.length > 0 && (
            <BeforeAfterGallery photos={profile.job_photos as any} />
          )}

          {/* Reviews Section */}
          <ReviewsSection professionalId={professionalId!} />
        </div>
      </main>
      
      <Footer />

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        professionalId={professionalId!}
        professionalName={profile.display_name}
        serviceId={profile.services[0]?.id}
        serviceName={profile.services[0]?.micro_service_id}
      />
    </div>
  );
}
