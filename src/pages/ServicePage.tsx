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

interface ServicePageProps {}

const ServicePage: React.FC<ServicePageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  const proInboxEnabled = useFeature('ff.proInboxV1');

  const serviceData: Record<string, any> = {
    handyman: {
      icon: Wrench,
      title: "Handyman Services",
      description: "Quick fixes, small repairs, and maintenance tasks for your Ibiza property",
      category: "Handyman",
      popularTasks: [
        "Fix leaky tap", "Hang pictures", "Repair fence", "Install shelves", 
        "Fix door lock", "Paint touch-ups", "Replace light fixtures"
      ],
      packages: [
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
      ]
    },
    plumbing: {
      icon: Droplets,
      title: "Plumbing Services",
      description: "Professional plumbing installation, repairs, and maintenance",
      category: "Plumbing",
      popularTasks: [
        "Fix leaky tap", "Unblock drain", "Install toilet", "Repair shower", 
        "Replace pipes", "Fix water heater", "Install dishwasher"
      ],
      packages: [
        {
          name: "Essential",
          price: "€80-200",
          duration: "1-3 hours",
          features: ["Basic repairs", "Standard parts", "Call-out included"]
        },
        {
          name: "Premium",
          price: "€200-500", 
          duration: "Half day",
          features: ["Advanced repairs", "Quality parts", "Guarantee", "Emergency service"]
        },
        {
          name: "Bespoke",
          price: "€500+",
          duration: "1-3 days",
          features: ["Full installations", "Design consultation", "Premium materials", "Project warranty"]
        }
      ]
    },
    electrical: {
      icon: Zap,
      title: "Electrical Services",
      description: "Safe and certified electrical installation, repairs, and inspections",
      category: "Electrical",
      popularTasks: [
        "Install light fixture", "Fix power outlet", "Rewiring", "Fuse box upgrade",
        "Install ceiling fan", "Security lighting", "Smart home setup"
      ],
      packages: [
        {
          name: "Essential",
          price: "€100-250",
          duration: "2-4 hours", 
          features: ["Basic installations", "Safety testing", "Certified work"]
        },
        {
          name: "Premium",
          price: "€250-800",
          duration: "Full day",
          features: ["Complex installations", "Upgraded materials", "Compliance certificate", "Follow-up"]
        },
        {
          name: "Bespoke", 
          price: "€800+",
          duration: "2-5 days",
          features: ["Full rewiring", "Smart systems", "Design consultation", "Extended warranty"]
        }
      ]
    }
  };

  const currentService = serviceData[slug || ''] || serviceData.handyman;
  const IconComponent = currentService.icon;

  const handleTaskClick = (task: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentService.category)}&preset=${encodeURIComponent(task)}`);
    }
  };

  const handlePackageClick = (packageName: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentService.category)}&package=${encodeURIComponent(packageName)}`);
    }
  };

  const handleGetQuoteClick = () => {
    if (jobWizardEnabled) {
      navigate(`/post?category=${encodeURIComponent(currentService.category)}`);
    }
  };

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
                {currentService.title}
              </h1>
              
              <p className="text-body text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {currentService.description}
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
                {currentService.popularTasks.map((task: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleTaskClick(task)}
                    className="p-4 bg-white rounded-lg border border-sand-dark/20 hover:border-copper/30 hover:shadow-card transition-all text-sm text-center hover:scale-105"
                  >
                    {task}
                  </button>
                ))}
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
                {currentService.packages.map((pkg: any, index: number) => (
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