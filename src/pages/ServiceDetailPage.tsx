import { useParams } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ServiceConfigurator } from '@/components/services/ServiceConfigurator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, CheckCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Service Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{service.category}</Badge>
            {service.popular && <Badge variant="secondary">Popular</Badge>}
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">{service.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{service.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.8</span>
              <span>(2,847 reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Same day available</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Background checked</span>
            </div>
          </div>
        </div>

        {/* Service Configurator */}
        <ServiceConfigurator service={service} />
      </main>
      
      <Footer />
    </div>
  );
};