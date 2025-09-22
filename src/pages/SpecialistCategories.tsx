import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Hammer, Wrench, Droplets, Paintbrush, Zap, Scale } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SpecialistCategories = () => {
  const navigate = useNavigate();

  const specialistCategories = [
    {
      id: 'architects-design',
      title: 'Architects & Design',
      icon: Home,
      services: [
        'Architect (Home Design, Renovations, Extensions, Permits)',
        'Technical Architect / Aparejador (Site Supervision, Compliance)',
        'Structural Engineer (Calculations, Reinforcements, Retrofitting)',
        'Civil Engineer (Drainage, Retaining Walls, Driveways)',
        'MEP Engineer (Plumbing, Electrical & HVAC Design)',
        'Interior Designer (Layouts, Kitchens, Bathrooms, Finishes)',
        'Land Surveyor / Topógrafo (Boundaries, Topographic Surveys)',
        'Geotechnical Specialist (Soil Testing, Foundations, Reports)'
      ]
    },
    {
      id: 'builders-structural',
      title: 'Builders & Structural Works',
      icon: Hammer,
      services: [
        'Groundworks & Excavation',
        'Foundations & Concrete',
        'Bricklaying & Masonry',
        'Stonework & Restoration',
        'Timber Framing & Roof Carpentry',
        'Structural Steel & Welding',
        'Formwork Carpentry'
      ]
    },
    {
      id: 'floors-doors-windows',
      title: 'Floors, Doors & Windows',
      icon: Wrench,
      services: [
        'Tiling (Floors & Walls)',
        'Wood Flooring (Solid, Engineered, Laminate)',
        'Carpet & Vinyl Flooring',
        'Door Fitting (Wooden, Sliding, Security)',
        'Window Fitting & Glazing (PVC, Aluminium, Double/Triple)',
        'Skylights & Roof Windows'
      ]
    },
    {
      id: 'kitchen-bathroom',
      title: 'Kitchen & Bathroom Fitter',
      icon: Droplets,
      services: [
        'Kitchen Installation',
        'Kitchen Renovation',
        'Bathroom Installation & Fit-Out',
        'Wetrooms & Waterproofing',
        'Joinery & Cabinetry'
      ]
    },
    {
      id: 'design-planning',
      title: 'Design & Planning',
      icon: Paintbrush,
      services: [
        'Project Planning & Design',
        'Architectural Planning',
        'Interior Design Services',
        'Permit Applications',
        'Compliance & Regulations'
      ]
    },
    {
      id: 'commercial-projects',
      title: 'Commercial Projects',
      icon: Zap,
      services: [
        'Design, Project Management & Cost Control',
        'Structural & Heavy Works (Earthworks, Piling, Steel, Concrete)',
        'MEP Systems (Commercial Electrical, HVAC, Plumbing, Fire Safety, ICT)',
        'Interior Fit-Out (Partitions, Flooring, Joinery, Painting)',
        'Exterior & Infrastructure (Facades, Roofing, Civils, Landscaping)',
        'Commissioning & Facilities Management'
      ]
    },
    {
      id: 'legal-regulatory',
      title: 'Legal, Regulatory & Support Services',
      icon: Scale,
      services: [
        'Legal & Permitting (Lawyers, Town Hall, Licences)',
        'Compliance Inspectors & Certifiers',
        'Procurement & Logistics',
        'Health, Safety & Environmental (HSE)',
        'Finance & Insurance Advisory',
        'Testing, Labs & Certification'
      ]
    }
  ];

  const handleCategorySelect = (category: any) => {
    navigate(`/post?category=${encodeURIComponent(category.title)}&specialist=true`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Header Section */}
        <section className="bg-gradient-card py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/post')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job Posting
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-display text-4xl md:text-6xl font-bold text-charcoal mb-6">
                Specialist Categories
              </h1>
              <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto">
                Professional and technical services for complex projects requiring specialized expertise
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialistCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">Professional services</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SpecialistCategories;