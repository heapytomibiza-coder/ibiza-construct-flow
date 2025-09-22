import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Shield, Clock, Briefcase, Hammer, Zap, Droplets, Paintbrush, Wrench, Home, PenTool } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useServices } from '@/hooks/useServices';

const Professionals = () => {
  const navigate = useNavigate();
  const { services, loading, getCategories } = useServices();
  
  // Map service categories to professional specializations
  const categoryMappings = {
    'Moving': {
      icon: Briefcase,
      title: 'Moving Specialists',
      description: 'Professional movers and logistics experts',
      count: '45+',
      rating: '4.8',
      responseTime: '2 hours'
    },
    'Cleaning': {
      icon: Home,
      title: 'Cleaning Professionals',
      description: 'Certified cleaning and maintenance specialists',
      count: '78+',
      rating: '4.9',
      responseTime: '1 hour'
    },
    'Delivery': {
      icon: Users,
      title: 'Delivery Experts',
      description: 'Reliable delivery and courier professionals',
      count: '32+',
      rating: '4.7',
      responseTime: '30 mins'
    },
    'Personal': {
      icon: Star,
      title: 'Personal Assistants',
      description: 'Skilled personal and lifestyle assistants',
      count: '24+',
      rating: '4.8',
      responseTime: '1 hour'
    },
    'Handyman': {
      icon: Hammer,
      title: 'Handyman Services',
      description: 'Experienced handymen and repair specialists',
      count: '89+',
      rating: '4.9',
      responseTime: '2 hours'
    },
    'Outdoor': {
      icon: PenTool,
      title: 'Outdoor Specialists',
      description: 'Landscaping and outdoor maintenance experts',
      count: '56+',
      rating: '4.6',
      responseTime: '4 hours'
    }
  };

  const handleViewProfiles = (category: string) => {
    navigate(`/services?category=${encodeURIComponent(category)}`);
  };

  const categories = getCategories();
  const professionalCategories = categories.map(category => ({
    category,
    ...categoryMappings[category as keyof typeof categoryMappings] || {
      icon: Wrench,
      title: `${category} Professionals`,
      description: `Expert ${category.toLowerCase()} service providers`,
      count: '25+',
      rating: '4.7',
      responseTime: '2 hours'
    }
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Our Professionals
            </h1>
            <p className="text-body text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet our network of skilled and verified professionals ready to help with your projects
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-copper mr-2" />
                <span className="text-display font-bold text-3xl text-charcoal">324+</span>
              </div>
              <p className="text-body text-sm text-muted-foreground">Verified Professionals</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="w-6 h-6 text-copper mr-2" />
                <span className="text-display font-bold text-3xl text-charcoal">2,100+</span>
              </div>
              <p className="text-body text-sm text-muted-foreground">Completed Projects</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-copper mr-2" />
                <span className="text-display font-bold text-3xl text-charcoal">4.8/5</span>
              </div>
              <p className="text-body text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-copper mr-2" />
                <span className="text-display font-bold text-3xl text-charcoal">100%</span>
              </div>
              <p className="text-body text-sm text-muted-foreground">SafePay Protected</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-body text-muted-foreground">Loading professional categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {professionalCategories.map((prof) => {
                const IconComponent = prof.icon;
                return (
                  <div key={prof.category} className="card-luxury text-center hover:scale-105 transition-luxury">
                    <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-display text-xl font-semibold mb-2 text-charcoal">{prof.title}</h3>
                    <p className="text-body text-muted-foreground mb-4">{prof.description}</p>
                    
                    {/* Professional Stats */}
                    <div className="flex justify-center items-center space-x-6 mb-6 text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-copper mr-1" />
                        <span className="text-body font-medium text-charcoal">{prof.count}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-copper mr-1" />
                        <span className="text-body font-medium text-charcoal">{prof.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-copper mr-1" />
                        <span className="text-body font-medium text-charcoal">{prof.responseTime}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="btn-hero w-full"
                      onClick={() => handleViewProfiles(prof.category)}
                    >
                      View Professionals
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Professionals;