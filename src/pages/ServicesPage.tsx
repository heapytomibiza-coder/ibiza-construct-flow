import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Services from '@/components/Services';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { Helmet } from 'react-helmet-async';

const ServicesPage = () => {
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>All Services - CS Ibiza Construction & Renovation</title>
        <meta 
          name="description" 
          content="Browse all construction and renovation services available in Ibiza. Find professionals for any project need." 
        />
        <link rel="canonical" href="https://csibiza.com/services" />
      </Helmet>
      
      <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
              All Services
            </h1>
            <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Browse our complete range of professional construction and renovation services
            </p>
          </div>
          
          <Services />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesPage;
