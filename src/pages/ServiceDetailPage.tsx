import { useParams } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ServiceConfigurator } from '@/components/services/ServiceConfigurator';
import { ServiceHeroSection } from '@/components/services/ServiceHeroSection';
import { ProfessionalProfileHeader } from '@/components/services/ProfessionalProfileHeader';
import { PortfolioGallery } from '@/components/services/PortfolioGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Award, Calendar } from 'lucide-react';

export const ServiceDetailPage = () => {
  const { micro, slug } = useParams();
  const { getServiceCards, loading } = useServices();
  const serviceCards = getServiceCards();

  const service = serviceCards.find(s => 
    s.slug === slug && s.micro === micro
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Service Not Found</h1>
          <p className="text-muted-foreground">The service you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Mock professional data - in real app this would come from useServiceOptions
  const mockProfessionalData = {
    name: "Elite Home Services",
    rating: 4.9,
    reviewCount: 2847,
    completedJobs: 1250,
    responseTime: "2 hours",
    location: "Amsterdam, Netherlands",
    heroImages: [
      "/placeholder.svg",
      "/placeholder.svg", 
      "/placeholder.svg"
    ],
    portfolioImages: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    certifications: ["Licensed Professional", "Insured", "Background Checked"],
    about: "Professional home services with over 10 years of experience. We specialize in high-quality workmanship and customer satisfaction.",
    workingHours: "Mon-Sat: 8:00 AM - 6:00 PM"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <ServiceHeroSection 
        service={service}
        heroImages={mockProfessionalData.heroImages}
        professionalStats={{
          rating: mockProfessionalData.rating,
          reviewCount: mockProfessionalData.reviewCount,
          responseTime: mockProfessionalData.responseTime,
          completedJobs: mockProfessionalData.completedJobs
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Professional Info */}
        <ProfessionalProfileHeader 
          professional={mockProfessionalData}
          showContactButtons={true}
        />

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Book Service
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="card-luxury p-6">
              <h3 className="text-xl font-semibold mb-4">Service Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Working Hours</h4>
                  <p className="text-muted-foreground">{mockProfessionalData.workingHours}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Service Area</h4>
                  <p className="text-muted-foreground">{mockProfessionalData.location} + 25km radius</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioGallery images={mockProfessionalData.portfolioImages} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="card-luxury p-6">
              <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">John D.</span>
                      <span className="text-sm text-muted-foreground">• 2 weeks ago</span>
                    </div>
                    <p className="text-muted-foreground">
                      Excellent service! Professional, on time, and great attention to detail. 
                      Would definitely recommend and hire again.
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="space-y-6">
            <ServiceConfigurator service={service} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};