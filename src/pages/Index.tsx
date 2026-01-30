import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import FeaturedServicesCarousel from '@/components/FeaturedServicesCarousel';
import BenefitsStrip from '@/components/BenefitsStrip';
import HowItWorks from '@/components/HowItWorks';
import ProfessionalNetwork from '@/components/ProfessionalNetwork';
import ExpressModeSection from '@/components/ExpressModeSection';
import Footer from '@/components/Footer';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Helmet } from 'react-helmet-async';
import { UserPlus, Shield, Settings } from 'lucide-react';
import { useTour } from '@/components/tours/InteractiveTour';
import { homepageTourSteps } from '@/config/tours';
import { TOURS_ENABLED } from '@/config/toursEnabled';

const Index = () => {
  const { t } = useTranslation(['common', 'navigation', 'home']);
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  const featuredCarouselEnabled = useFeature('enable_featured_services_carousel');
  const benefitsStripEnabled = useFeature('enable_home_benefits_strip');
  const { value: layout } = useSiteSettings('homepage', 'layout');
  
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
          <title>CS Ibiza - Professional Construction & Renovation Services in Ibiza</title>
          <meta 
            name="description" 
            content="Connect with verified construction professionals in Ibiza. Get instant quotes for renovations, repairs, and building projects. Trusted by homeowners and businesses." 
          />
          <link rel="canonical" href="https://csibiza.com/" />
        </Helmet>
        <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
        
        <main id="main-content" className="pt-0">
          <section id="hero-section">
            <Hero />
          </section>
        
        {/* Quick Access - Professional Onboarding Pages */}
        <section className="container py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">{t('home:professionalRegistration.title')}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/onboarding/professional">
                  <UserPlus className="w-8 h-8 text-primary" />
                  <span className="font-semibold">{t('home:professionalRegistration.step1')}</span>
                  <span className="text-xs text-muted-foreground">{t('home:professionalRegistration.step1Desc')}</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/professional/verification">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="font-semibold">{t('home:professionalRegistration.step2')}</span>
                  <span className="text-xs text-muted-foreground">{t('home:professionalRegistration.step2Desc')}</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/professional/service-setup">
                  <Settings className="w-8 h-8 text-primary" />
                  <span className="font-semibold">{t('home:professionalRegistration.step3')}</span>
                  <span className="text-xs text-muted-foreground">{t('home:professionalRegistration.step3Desc')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
          {(layout?.showBenefitsStrip ?? benefitsStripEnabled) && <BenefitsStrip />}
          
          
          
          <section id="how-it-works-section">
            <HowItWorks />
          </section>
          
          <section id="professional-network-section">
            <ProfessionalNetwork />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
