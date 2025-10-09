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
import { TrustMetricsCard } from '@/components/professionals/TrustMetricsCard';
import { WorkProcessTimeline } from '@/components/professionals/WorkProcessTimeline';
import { QuickStatsGrid } from '@/components/professionals/QuickStatsGrid';
import { FloatingCTABar } from '@/components/professionals/FloatingCTABar';
import { FeaturedTestimonial } from '@/components/professionals/FeaturedTestimonial';
import { AvailabilityPreview } from '@/components/professionals/AvailabilityPreview';
import { SocialProofBanner } from '@/components/professionals/SocialProofBanner';
import { ProfileActions } from '@/components/professionals/ProfileActions';
import { AchievementShowcase } from '@/components/professionals/AchievementShowcase';
import { ScrollProgress } from '@/components/professionals/ScrollProgress';
import { ProfessionalSEO } from '@/components/professionals/ProfessionalSEO';
import { VideoShowcase } from '@/components/professionals/VideoShowcase';
import { InteractiveCalendar } from '@/components/professionals/InteractiveCalendar';
import { PortfolioFilter } from '@/components/professionals/PortfolioFilter';
import { QuickChatWidget } from '@/components/professionals/QuickChatWidget';
import { TestimonialCarousel } from '@/components/professionals/TestimonialCarousel';
import { CertificationBadges } from '@/components/professionals/CertificationBadges';
import { FAQSection } from '@/components/professionals/FAQSection';
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

          {/* Profile Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center flex-wrap gap-3"
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

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <QuickStatsGrid
              avgProjectValue={2500}
              avgResponseTime={`${profile.response_time_hours}h`}
              repeatClientRate={85}
              projectsThisMonth={Math.floor(profile.stats.completed_bookings / 12) || 0}
            />
          </motion.div>

          {/* Performance Score & Live Activity - Two Column Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <PerformanceScore
              rating={profile.stats.average_rating}
              totalReviews={profile.stats.total_reviews}
              completedJobs={profile.stats.completed_bookings}
              onTimeRate={92}
              responseTime={profile.response_time_hours}
              repeatClientRate={85}
            />
            <LiveActivityFeed professionalName={profile.display_name} />
          </motion.div>

          {/* Trust & Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TrustMetricsCard
              completionRate={95}
              onTimeDelivery={92}
              responseRate={98}
              repeatClientRate={85}
              totalJobs={profile.stats.completed_bookings}
              yearsActive={profile.experience_years}
            />
          </motion.div>

          {/* Achievement Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <AchievementShowcase />
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <ProfessionalAboutSection
              bio={profile.bio}
              yearsOfExperience={profile.experience_years}
              certifications={[]}
              skills={profile.skills as string[]}
              coverageArea={profile.zones as string[]}
              primaryTrade={profile.primary_trade}
              workPhilosophy={profile.work_philosophy}
            />
          </motion.div>

          {/* Work Process Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <WorkProcessTimeline />
          </motion.div>

          {/* Video Showcase */}
          {profile.video_intro_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
            >
              <VideoShowcase
                videoUrl={profile.video_intro_url}
                thumbnailUrl={profile.cover_image_url}
                title="Meet the Professional"
                description="Watch a brief introduction video"
              />
            </motion.div>
          )}

          {/* Featured Testimonial */}
          {profile.reviews && profile.reviews.length > 0 && profile.reviews[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <FeaturedTestimonial
                clientName="Satisfied Client"
                rating={profile.reviews[0].rating || 5}
                comment={profile.reviews[0].comment || "Great work and professional service!"}
                projectType={profile.primary_trade}
                date={new Date(profile.reviews[0].created_at).toLocaleDateString()}
              />
            </motion.div>
          )}

          {/* Availability & Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
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

          {/* Interactive Booking Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.05 }}
          >
            <InteractiveCalendar
              onSelectSlot={(date, time) => {
                toast.success(`Selected: ${date.toLocaleDateString()} at ${time}`);
                handleRequestQuote();
              }}
            />
          </motion.div>

          {/* Services Showcase Section */}
          {profile.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <ServicesShowcase
                services={profile.services as any}
                onRequestQuote={handleRequestQuote}
              />
            </motion.div>
          )}

          {/* Portfolio Masonry Gallery */}
          {profile.new_portfolio_images && profile.new_portfolio_images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="space-y-4">
                <PortfolioFilter
                  onFilterChange={(category) => {
                    // Filter logic can be implemented here
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

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <ReviewsSection professionalId={professionalId!} />
          </motion.div>

          {/* Testimonial Carousel */}
          {profile.reviews && profile.reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.45 }}
            >
              <TestimonialCarousel
                testimonials={profile.reviews.slice(0, 5).map((review: any) => ({
                  id: review.id,
                  clientName: 'Satisfied Client',
                  rating: review.rating,
                  comment: review.comment,
                  projectType: profile.primary_trade,
                  date: new Date(review.created_at).toLocaleDateString()
                }))}
              />
            </motion.div>
          )}

          {/* Certification Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <CertificationBadges />
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.55 }}
          >
            <FAQSection professionalName={profile.display_name} />
          </motion.div>

          {/* Quick Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <QuickContactForm
              professionalId={professionalId!}
              professionalName={profile.display_name}
              onSubmit={async (data) => {
                console.log('Contact form submitted:', data);
                handleContact();
              }}
            />
          </motion.div>

          {/* Referral Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.63 }}
          >
            <ReferralCard
              professionalId={professionalId!}
              professionalName={profile.display_name}
            />
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.65 }}
          >
            <SocialLinks professionalName={profile.display_name} />
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
    </div>
  );
}
