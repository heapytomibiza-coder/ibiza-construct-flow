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
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Helmet } from 'react-helmet-async';
import { UserPlus, Shield, Settings } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation('components');
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  const featuredCarouselEnabled = useFeature('enable_featured_services_carousel');
  const benefitsStripEnabled = useFeature('enable_home_benefits_strip');
  const { value: layout } = useSiteSettings('homepage', 'layout');
  
  return (
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
      
      <main className="pt-0">
        <Hero />
        
        {/* Quick Access - Professional Onboarding Pages */}
        <section className="container py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Professional Registration</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/onboarding/professional">
                  <UserPlus className="w-8 h-8 text-primary" />
                  <span className="font-semibold">Step 1: Registration</span>
                  <span className="text-xs text-muted-foreground">Sign up as a professional</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/professional/verification">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="font-semibold">Step 2: Verification</span>
                  <span className="text-xs text-muted-foreground">Upload documents</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full h-auto flex-col gap-3 py-6 hover:bg-accent" asChild>
                <Link to="/professional/service-setup">
                  <Settings className="w-8 h-8 text-primary" />
                  <span className="font-semibold">Step 3: Services</span>
                  <span className="text-xs text-muted-foreground">Configure your offerings</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {(layout?.showBenefitsStrip ?? benefitsStripEnabled) && <BenefitsStrip />}
        {(layout?.showCarousel ?? featuredCarouselEnabled) ? <FeaturedServicesCarousel /> : <Services maxServices={8} />}
        <ExpressModeSection />
        <HowItWorks />
        <ProfessionalNetwork />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
