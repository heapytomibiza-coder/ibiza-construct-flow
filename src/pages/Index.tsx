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

const Index = () => {
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  const featuredCarouselEnabled = useFeature('enable_featured_services_carousel');
  const benefitsStripEnabled = useFeature('enable_home_benefits_strip');
  
  return (
    <div className="min-h-screen">
      <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
      
      <main>
        <Hero />
        
        {/* Testing Section - Remove in production */}
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="container mx-auto">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🧪 Testing Dashboard Implementation</h3>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/pro">Test Professional Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/admin">Test Admin Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/client">Test Client Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
        {benefitsStripEnabled && <BenefitsStrip />}
        {featuredCarouselEnabled ? <FeaturedServicesCarousel /> : <Services />}
        <ExpressModeSection />
        <HowItWorks />
        <ProfessionalNetwork />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
