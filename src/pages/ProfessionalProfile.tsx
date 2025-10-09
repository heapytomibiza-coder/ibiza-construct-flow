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
import { CompactServiceCards } from '@/components/professionals/CompactServiceCards';
import { ProfessionalPortfolioGallery } from '@/components/professionals/ProfessionalPortfolioGallery';
import { BeforeAfterGallery } from '@/components/professionals/BeforeAfterGallery';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { QuoteRequestModal } from '@/components/booking/QuoteRequestModal';
import { ProfessionalHeroSection } from '@/components/professionals/ProfessionalHeroSection';
import { PortfolioMasonry } from '@/components/professionals/PortfolioMasonry';
import { TrustMetricsCard } from '@/components/professionals/TrustMetricsCard';
import { WorkProcessTimeline } from '@/components/professionals/WorkProcessTimeline';
import { QuickStatsGrid } from '@/components/professionals/QuickStatsGrid';
import { FloatingCTABar } from '@/components/professionals/FloatingCTABar';
import { AvailabilityPreview } from '@/components/professionals/AvailabilityPreview';
import { SocialProofBanner } from '@/components/professionals/SocialProofBanner';
import { ProfileActions } from '@/components/professionals/ProfileActions';
import { ScrollProgress } from '@/components/professionals/ScrollProgress';
import { ProfessionalSEO } from '@/components/professionals/ProfessionalSEO';
import { VideoShowcase } from '@/components/professionals/VideoShowcase';
import { PortfolioFilter } from '@/components/professionals/PortfolioFilter';
import { QuickChatWidget } from '@/components/professionals/QuickChatWidget';
import { QuickContactForm } from '@/components/professionals/QuickContactForm';
import { SocialLinks } from '@/components/professionals/SocialLinks';
import { ProfileSkeleton } from '@/components/professionals/ProfileSkeleton';
import { ProfileError } from '@/components/professionals/ProfileError';
import { PrintView } from '@/components/professionals/PrintView';
import { AccessibilityToolbar } from '@/components/professionals/AccessibilityToolbar';
import { ComparisonButton } from '@/components/professionals/ComparisonButton';
import { ReferralCard } from '@/components/professionals/ReferralCard';
import { PerformanceScore } from '@/components/professionals/PerformanceScore';
import { LiveActivityFeed } from '@/components/professionals/LiveActivityFeed';
import { VerificationBadges } from '@/components/professionals/VerificationBadges';
import { MobileQuickActions } from '@/components/professionals/MobileQuickActions';
import { ComparisonFloatingButton } from '@/components/professionals/ComparisonFloatingButton';
import { motion } from 'framer-motion';
import { useProfileAnalytics } from '@/hooks/useProfileAnalytics';

export default function ProfessionalProfile() {
  const { id: professionalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  
  // Analytics tracking
  const { trackInteraction } = useProfileAnalytics(professionalId || '');

  // Track profile view
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('session_id', sid);
    }
    return sid;
  });

  const { data: profile, isLoading, error: queryError, refetch } = useQuery({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProfileSkeleton />
        <Footer />
      </div>
    );
  }

  if (queryError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ProfileError
          error={queryError?.message || 'Professional profile not found'}
          onRetry={() => refetch()}
        />
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
    trackInteraction('Request Quote', 'CTA Button');
    setQuoteModalOpen(true);
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    trackInteraction('Contact Professional', 'Message Button');
    
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

  return (
    <div className="min-h-screen bg-background">
      <ProfessionalSEO
        professionalName={profile.display_name}
        professionalId={professionalId!}
        bio={profile.bio}
        tagline={profile.tagline}
        rating={profile.stats.average_rating}
        totalReviews={profile.stats.total_reviews}
        primaryTrade={profile.primary_trade}
        location={(profile.zones as string[])?.[0]}
        imageUrl={profile.avatar_url}
      />
      <ScrollProgress />
      <Header />
      
      <main className="container pt-32 pb-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>

          {/* Social Proof Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SocialProofBanner
              totalClients={profile.stats.completed_bookings}
              satisfactionRate={95}
              yearsInBusiness={profile.experience_years}
              responseRate={98}
            />
          </motion.div>

          {/* Verification Badges - Inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center -mt-2 mb-2"
          >
            <VerificationBadges
              isVerified={profile.verification_status === 'verified'}
              hasInsurance={true}
              isBackgroundChecked={true}
              isLicensed={true}
            />
          </motion.div>

          {/* Enhanced Profile Header with Real-time Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
          </motion.div>

          {/* Compact Services Section - Prominent Position */}
          {profile.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CompactServiceCards
                services={profile.services as any}
                onRequestQuote={handleRequestQuote}
              />
            </motion.div>
          )}

          {/* Portfolio Gallery - Prominent Position */}
          {profile.new_portfolio_images && profile.new_portfolio_images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-muted/30 -mx-4 px-4 py-8 rounded-xl"
            >
              <div className="space-y-4">
                <PortfolioFilter
                  onFilterChange={(category) => {
                    console.log('Filter by:', category);
                  }}
                  onViewChange={(view) => {
                    console.log('View mode:', view);
                  }}
                />
                <PortfolioMasonry 
                  images={profile.new_portfolio_images.map((img: any) => ({
                    url: img.image_url,
                    title: img.title,
                    category: img.category,
                    description: img.description
                  }))} 
                  title="Portfolio Showcase"
                />
              </div>
            </motion.div>
          )}

          {/* About & Process - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            <div className="lg:col-span-3">
              <ProfessionalAboutSection
                bio={profile.bio}
                yearsOfExperience={profile.experience_years}
                certifications={[]}
                skills={profile.skills as string[]}
                coverageArea={profile.zones as string[]}
                primaryTrade={profile.primary_trade}
                workPhilosophy={profile.work_philosophy}
              />
            </div>
            <div className="lg:col-span-2">
              <WorkProcessTimeline />
            </div>
          </motion.div>

          {/* Performance Dashboard - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <PerformanceScore
                rating={profile.stats.average_rating}
                totalReviews={profile.stats.total_reviews}
                completedJobs={profile.stats.completed_bookings}
                onTimeRate={92}
                responseTime={profile.response_time_hours}
                repeatClientRate={85}
              />
            </div>
            <LiveActivityFeed professionalName={profile.display_name} />
          </motion.div>

          {/* Profile Actions - Compact Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="flex justify-center flex-wrap gap-2"
          >
            <ProfileActions
              professionalName={profile.display_name}
              professionalId={professionalId!}
            />
            <ComparisonButton
              professionalId={professionalId!}
              professionalName={profile.display_name}
              professionalData={{
                rating: profile.stats.average_rating,
                reviewCount: profile.stats.total_reviews,
                completedJobs: profile.stats.completed_bookings,
                responseTime: `${profile.response_time_hours}h`
              }}
            />
            <PrintView professionalName={profile.display_name} />
          </motion.div>

          {/* Video Showcase */}
          {profile.video_intro_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <VideoShowcase
                videoUrl={profile.video_intro_url}
                thumbnailUrl={profile.cover_image_url}
                title="Meet the Professional"
                description="Watch a brief introduction video"
              />
            </motion.div>
          )}

          {/* Availability & Booking - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <AvailabilityPreview
              isAvailable={true}
              nextAvailableDate="Tomorrow, 10:00 AM"
              responseTime={`${profile.response_time_hours}h`}
              workingHours="Mon-Fri: 9AM - 6PM"
              currentWorkload="moderate"
              onBookConsultation={handleRequestQuote}
            />
          </motion.div>

          {/* Before & After Gallery from Completed Jobs */}
          {profile.job_photos && profile.job_photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <BeforeAfterGallery photos={profile.job_photos as any} />
            </motion.div>
          )}

          {/* Reviews Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ReviewsSection professionalId={professionalId!} />
          </motion.div>

          {/* Contact & Referral - Side by Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <QuickContactForm
              professionalId={professionalId!}
              professionalName={profile.display_name}
              onSubmit={async (data) => {
                console.log('Contact form submitted:', data);
                handleContact();
              }}
            />
            <div className="space-y-6">
              <ReferralCard
                professionalId={professionalId!}
                professionalName={profile.display_name}
              />
              <SocialLinks professionalName={profile.display_name} />
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />

      {/* Floating CTA Bar */}
      <FloatingCTABar
        professionalName={profile.display_name}
        onMessage={handleContact}
        onRequestQuote={handleRequestQuote}
      />

      {/* Quick Chat Widget */}
      <QuickChatWidget
        professionalName={profile.display_name}
        professionalAvatar={profile.avatar_url}
        responseTime={`${profile.response_time_hours}h`}
        onSendMessage={(message) => {
          toast.success('Message sent! We\'ll connect you shortly.');
          handleContact();
        }}
      />

      {/* Quote Request Modal */}
      <QuoteRequestModal
        open={quoteModalOpen}
        onOpenChange={setQuoteModalOpen}
        professionalId={professionalId!}
        professionalName={profile.display_name}
        serviceId={profile.services[0]?.id}
        serviceName={profile.services[0]?.micro_service_id}
      />

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Mobile Quick Actions */}
      <MobileQuickActions
        onCall={() => window.location.href = 'tel:+34612345678'}
        onMessage={handleContact}
        onBooking={handleRequestQuote}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: `${profile.display_name} - Professional Profile`,
              url: window.location.href
            });
          } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
          }
        }}
      />

      {/* Comparison Floating Button */}
      <ComparisonFloatingButton />
    </div>
  );
}
