import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, Home, Zap, Paintbrush, Hammer, Droplets, 
  Thermometer, Car, Clock, Shield, Star 
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useFeature } from '@/hooks/useFeature';
import { useServices } from '@/hooks/useServices';

interface ServicePageProps {}

const ServicePage: React.FC<ServicePageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');
  const { getServiceCards, getServicesByCategory, loading } = useServices();

  const iconMap = {
    'Wrench': Wrench,
    'Home': Home,
    'Zap': Zap,
    'Paintbrush': Paintbrush,
    'Hammer': Hammer,
    'Droplets': Droplets,
    'Thermometer': Thermometer,
    'Car': Car
  };

  // Find the service by slug
  const serviceCards = getServiceCards();
  const currentServiceCard = serviceCards.find(s => s.slug === slug) || serviceCards[0];
  const currentCategory = currentServiceCard?.category || 'Handyman';
  const categoryServices = getServicesByCategory(currentCategory);
  
  const IconComponent = iconMap[currentServiceCard?.icon as keyof typeof iconMap] || Wrench;

  // Get popular tasks from database services
  const popularTasks = categoryServices
    .slice(0, 8) // Limit to 8 tasks
    .map(service => service.micro);

  const packages = [
    {
      name: "Essential",
      price: "€50-150",
      duration: "2-4 hours",
      features: ["Basic repairs", "Standard tools included", "Clean-up"]
    },
    {
      name: "Premium", 
      price: "€150-350",
      duration: "Half day",
      features: ["Complex repairs", "Professional tools", "Parts sourcing", "Warranty"]
    },
    {
      name: "Bespoke",
      price: "€350+",
      duration: "Full day+",
      features: ["Custom solutions", "Multiple tasks", "Project planning", "Follow-up visits"]
    }
  ];

  const handleTaskClick = (task: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentCategory)}&preset=${encodeURIComponent(task)}`);
    }
  };

  const handlePackageClick = (packageName: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentCategory)}&package=${encodeURIComponent(packageName)}`);
    }
  };

  const handleGetQuoteClick = () => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentCategory)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
        <main className="pt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading service details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header jobWizardEnabled={jobWizardEnabled} proInboxEnabled={proInboxEnabled} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-hero rounded-2xl mb-6">
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
                {currentServiceCard?.title || 'Service'}
              </h1>
              
              <p className="text-body text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {currentServiceCard?.description || 'Professional services for your Ibiza property'}
              </p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-copper" />
                  <span className="text-sm font-medium">Verified Pros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-copper" />
                  <span className="text-sm font-medium">4.8+ Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-copper" />
                  <span className="text-sm font-medium">24h Response</span>
                </div>
              </div>

              <Button onClick={handleGetQuoteClick} className="btn-hero text-lg px-8 py-3">
                Get Instant Quote
              </Button>
            </div>
          </div>
        </section>

        {/* Popular Tasks */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-display text-3xl font-semibold text-center mb-8">
                Popular Tasks
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {popularTasks.length > 0 ? (
                  popularTasks.map((task: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleTaskClick(task)}
                      className="p-4 bg-white rounded-lg border border-sand-dark/20 hover:border-copper/30 hover:shadow-card transition-all text-sm text-center hover:scale-105"
                    >
                      {task}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground">
                    <p>Loading popular tasks...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 bg-sand-light/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-display text-3xl font-semibold text-center mb-12">
                Choose Your Package
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg: any, index: number) => (
                  <Card 
                    key={index}
                    className={`relative overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                      pkg.name === 'Premium' ? 'border-2 border-copper shadow-luxury' : ''
                    }`}
                    onClick={() => handlePackageClick(pkg.name)}
                  >
                    {pkg.name === 'Premium' && (
                      <div className="absolute top-0 right-0 bg-gradient-hero text-white px-4 py-1 text-sm">
                        Popular
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl font-semibold">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-copper">{pkg.price}</div>
                      <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3">
                        {pkg.features.map((feature: string, featureIndex: number) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-copper rounded-full"></div>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full mt-6"
                        variant={pkg.name === 'Premium' ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackageClick(pkg.name);
                        }}
                      >
                        Select {pkg.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicePage;