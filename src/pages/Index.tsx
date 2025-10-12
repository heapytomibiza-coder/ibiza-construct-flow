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
      
      <main>
        <Hero />
        
        {(layout?.showBenefitsStrip ?? benefitsStripEnabled) && <BenefitsStrip />}
        {(layout?.showCarousel ?? featuredCarouselEnabled) ? <FeaturedServicesCarousel /> : <Services />}
        <ExpressModeSection />
        <HowItWorks />
        <ProfessionalNetwork />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
