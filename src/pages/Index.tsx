import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { Helmet } from 'react-helmet-async';
import { useTour } from '@/components/tours/InteractiveTour';
import { homepageTourSteps } from '@/config/tours';
import { TOURS_ENABLED } from '@/config/toursEnabled';
import {
  HomepageServiceTiles,
  LatestJobsSection,
  FeaturedProfessionalsSection,
  ValuePropsSection,
  SEOContentBlock,
  FinalCTASection,
} from '@/components/home';

const Index = () => {
  const { t } = useTranslation(['common', 'navigation', 'home']);
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  
  // Tour system integration
  const { TourComponent, startTour } = useTour('homepage-tour', homepageTourSteps);

  // Safety fallback: Forward users who land here from email verification links
  useEffect(() => {
    try {
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      const looksLikeSupabaseCallback =
        hash.includes("access_token") ||
        hash.includes("refresh_token") ||
        search.includes("code=");

      if (looksLikeSupabaseCallback) {
        // Tokens/code exist, send to the route built to handle it
        navigate("/auth/callback", { replace: true });
      }
    } catch {
      // fail silently - homepage must never crash
    }
  }, [navigate]);

  // Register tour triggers for header button
  useEffect(() => {
    if (!TOURS_ENABLED) return;

    window.dispatchEvent(
      new CustomEvent('register-tour-trigger', {
        detail: { key: 'startHomeTour', trigger: startTour },
      })
    );

    // Reset all tours function
    const resetAllTours = () => {
      localStorage.removeItem('tour-homepage-tour');
      localStorage.removeItem('tour-job-wizard-tour');
      window.location.reload();
    };

    window.dispatchEvent(
      new CustomEvent('register-tour-trigger', {
        detail: { key: 'resetAllTours', trigger: resetAllTours },
      })
    );
  }, [startTour]);
  
  return (
    <>
      {TourComponent}
      <div className="min-h-screen">
        <Helmet>
          <title>Construction & Property Professionals in Ibiza | CS Ibiza</title>
          <meta 
            name="description" 
            content="Find trusted builders, tradespeople, and construction professionals in Ibiza. Compare quotes, reviews, and portfolios on CS Ibiza." 
          />
          <link rel="canonical" href="https://csibiza.com/" />
        </Helmet>
        <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
        
        <main id="main-content" className="pt-0">
          {/* Hero Section - Updated SEO copy */}
          <section id="hero-section">
            <Hero />
          </section>
          
          {/* Service Category Tiles - DB-driven, links to /services/:slug */}
          <HomepageServiceTiles />
          
          {/* Latest Jobs - Shows platform activity */}
          <LatestJobsSection />
          
          {/* Featured Professionals - Verified pros with complete profiles */}
          <FeaturedProfessionalsSection />
          
          {/* How It Works - Simplified */}
          <section id="how-it-works-section">
            <HowItWorks />
          </section>
          
          {/* Trust Indicators */}
          <ValuePropsSection />
          
          {/* SEO Content Block - Crawlable, keyword-rich */}
          <SEOContentBlock />
          
          {/* Final CTA */}
          <FinalCTASection />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
