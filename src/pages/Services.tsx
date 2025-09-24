import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ServiceSearch } from '@/components/services/ServiceSearch';
import EnhancedServiceFilters from '@/components/services/EnhancedServiceFilters';
import { EnhancedServiceCard } from '@/components/services/EnhancedServiceCard';
import { ServicePackages } from '@/components/services/ServicePackages';
import { useServices } from '@/hooks/useServices';
import { useFeature } from '@/contexts/FeatureFlagsContext';

const Services = () => {
  const navigate = useNavigate();
  const { getServiceCards, getCategories, loading } = useServices();
  const jobWizardEnabled = useFeature('ff.jobWizardV2');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 100000] as [number, number],
    availability: []
  });

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

  const services = getServiceCards().map(service => ({
    ...service,
    icon: iconMap[service.icon as keyof typeof iconMap] || Wrench,
    rating: 4.8 + Math.random() * 0.4, // Mock rating
    completedJobs: Math.floor(Math.random() * 500) + 50,
    responseTime: ['2h avg', '4h avg', '1 day', 'Same day'][Math.floor(Math.random() * 4)]
  }));

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.categories.length === 0 || 
                           filters.categories.includes(service.category);
    
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (service: any) => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'service_card_click', {
        category: service.category,
        service_name: service.title
      });
    }
    
    if (jobWizardEnabled) {
      // Pass more context to wizard for better pre-filling
      const wizardParams = new URLSearchParams({
        category: service.category,
        preset: service.title,
        source: 'services'
      });
      navigate(`/post?${wizardParams.toString()}`);
    } else {
      navigate(`/service/${service.slug}`);
    }
  };

  const handleBookNow = (service: any) => {
    // Track analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'service_book_now', {
        category: service.category,
        service_name: service.title,
        value: service.price
      });
    }
    
    if (jobWizardEnabled) {
      // Use calendar-first wizard for booking
      const wizardParams = new URLSearchParams({
        category: service.category,
        preset: service.title,
        calendar: 'true',
        source: 'booking'
      });
      navigate(`/post?${wizardParams.toString()}`);
    } else {
      navigate(`/service/${service.slug}?book=true`);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    if (jobWizardEnabled) {
      navigate(`/post?package=${packageId}`);
    }
  };

  // Sample packages for demonstration
  const samplePackages = [
    {
      id: 'basic',
      name: 'Basic',
      price: '€150',
      duration: '2-3 hours',
      description: 'Essential repairs and maintenance',
      features: [
        'Up to 3 small repairs',
        'Basic tools included',
        '24h response time',
        'Quality guarantee'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '€350',
      duration: 'Half day',
      description: 'Comprehensive service package',
      popular: true,
      features: [
        'Up to 6 repairs/tasks',
        'Professional tools',
        'Same day service',
        'Photo documentation',
        '30-day warranty'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '€650',
      duration: 'Full day',
      description: 'Complete solution with extras',
      features: [
        'Unlimited small tasks',
        'Premium materials',
        'Priority booking',
        'Detailed report',
        '90-day warranty',
        'Follow-up service'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-card py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-display text-4xl md:text-6xl font-bold text-charcoal mb-6">
                Professional Services in <span className="text-copper">Ibiza</span>
              </h1>
              <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                From quick fixes to complete renovations, connect with verified professionals for all your property needs
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto" data-tour="service-search">
              <ServiceSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onFilterToggle={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
              />
            </div>
          </div>
        </section>

        {/* Specialized Categories Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Specialized Categories
              </h2>
              <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional and technical services for complex projects requiring specialized expertise
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Architects & Design */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Architects & Design</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Architect (Home Design, Renovations, Extensions, Permits)</li>
                  <li>• Technical Architect / Aparejador (Site Supervision, Compliance)</li>
                  <li>• Structural Engineer (Calculations, Reinforcements, Retrofitting)</li>
                  <li>• Civil Engineer (Drainage, Retaining Walls, Driveways)</li>
                  <li>• MEP Engineer (Plumbing, Electrical & HVAC Design)</li>
                  <li>• Interior Designer (Layouts, Kitchens, Bathrooms, Finishes)</li>
                  <li>• Land Surveyor / Topógrafo (Boundaries, Topographic Surveys)</li>
                  <li>• Geotechnical Specialist (Soil Testing, Foundations, Reports)</li>
                </ul>
              </div>

              {/* Builders & Structural Works */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Hammer className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Builders & Structural Works</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Groundworks & Excavation</li>
                  <li>• Foundations & Concrete</li>
                  <li>• Bricklaying & Masonry</li>
                  <li>• Stonework & Restoration</li>
                  <li>• Timber Framing & Roof Carpentry</li>
                  <li>• Structural Steel & Welding</li>
                  <li>• Formwork Carpentry</li>
                </ul>
              </div>

              {/* Floors, Doors & Windows */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Floors, Doors & Windows</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Tiling (Floors & Walls)</li>
                  <li>• Wood Flooring (Solid, Engineered, Laminate)</li>
                  <li>• Carpet & Vinyl Flooring</li>
                  <li>• Door Fitting (Wooden, Sliding, Security)</li>
                  <li>• Window Fitting & Glazing (PVC, Aluminium, Double/Triple)</li>
                  <li>• Skylights & Roof Windows</li>
                </ul>
              </div>

              {/* Kitchen & Bathroom Fitter */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Kitchen & Bathroom Fitter</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Kitchen Installation</li>
                  <li>• Kitchen Renovation</li>
                  <li>• Bathroom Installation & Fit-Out</li>
                  <li>• Wetrooms & Waterproofing</li>
                  <li>• Joinery & Cabinetry</li>
                </ul>
              </div>

              {/* Design & Planning */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Paintbrush className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Design & Planning</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Project Planning & Design</li>
                  <li>• Architectural Planning</li>
                  <li>• Interior Design Services</li>
                  <li>• Permit Applications</li>
                  <li>• Compliance & Regulations</li>
                </ul>
              </div>

              {/* Commercial Projects */}
              <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">Commercial Projects</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Design, Project Management & Cost Control</li>
                  <li>• Structural & Heavy Works (Earthworks, Piling, Steel, Concrete)</li>
                  <li>• MEP Systems (Commercial Electrical, HVAC, Plumbing, Fire Safety, ICT)</li>
                  <li>• Interior Fit-Out (Partitions, Flooring, Joinery, Painting)</li>
                  <li>• Exterior & Infrastructure (Facades, Roofing, Civils, Landscaping)</li>
                  <li>• Commissioning & Facilities Management</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-80 flex-shrink-0" data-tour="service-filters">
                <EnhancedServiceFilters
                  filters={{...filters, subcategories: [], specialists: [], location: ''}}
                  onFiltersChange={setFilters}
                  categories={getCategories()}
                  visible={showFilters || window.innerWidth >= 1024}
                />
              </div>

              {/* Services Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-display text-2xl font-semibold text-charcoal">
                    Available Services ({filteredServices.length})
                  </h2>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="card-luxury animate-pulse">
                        <div className="h-64 bg-sand/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredServices.map((service, index) => (
                      <EnhancedServiceCard
                        key={index}
                        service={service}
                        onViewService={() => handleServiceClick(service)}
                        onBookNow={() => handleBookNow(service)}
                      />
                    ))}
                  </div>
                )}

                {!loading && filteredServices.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      No services found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Service Packages Section */}
        <section className="py-16 bg-sand-light/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-display text-3xl md:text-4xl font-bold text-charcoal mb-6">
                Choose Your Service Package
              </h2>
              <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
                Select the package that best fits your needs. All packages include professional service and quality guarantee.
              </p>
            </div>
            
            <ServicePackages
              packages={samplePackages}
              onSelectPackage={handlePackageSelect}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;