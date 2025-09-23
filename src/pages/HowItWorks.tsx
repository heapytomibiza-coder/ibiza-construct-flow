import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, MessageSquare, CheckCircle, Wand2, Shield, Star, Users, Clock, MapPin, Camera, CreditCard, UserCheck, Settings, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const clientSteps = [
    {
      id: "describe",
      number: "01",
      icon: Wand2,
      title: "Smart Project Description",
      description: "Our AI-powered wizard guides you through describing your project in detail.",
      features: [
        "6-step interactive wizard with smart questions",
        "Photo upload for visual context",
        "Budget guidance based on similar projects",
        "Timeline planning with realistic estimates",
        "Location and access details"
      ],
      details: "The wizard adapts questions based on your project type, ensuring we capture all necessary details for accurate matching."
    },
    {
      id: "match",
      number: "02", 
      icon: Search,
      title: "AI-Powered Professional Matching",
      description: "Our algorithm instantly connects you with the most suitable verified professionals.",
      features: [
        "Smart matching based on skills, location, and availability",
        "Verified professional profiles with portfolios",
        "Instant price estimates using AI",
        "Review and rating system integration",
        "Specialization filters (handyman, luxury builds, etc.)"
      ],
      details: "We analyse your project requirements against professional capabilities, past work, and current availability to ensure perfect matches."
    },
    {
      id: "collaborate",
      number: "03",
      icon: MessageSquare,
      title: "Secure Collaboration Platform",
      description: "Work directly with professionals through our integrated communication and project management tools.",
      features: [
        "Direct messaging system",
        "Project milestone tracking",
        "Secure payment processing with SafePay",
        "Progress photo sharing",
        "Dispute resolution support"
      ],
      details: "Everything happens on our platform, ensuring transparency, security, and accountability throughout your project."
    }
  ];

  const professionalSteps = [
    {
      id: "profile",
      number: "01",
      icon: UserCheck,
      title: "Create Professional Profile",
      description: "Build a comprehensive profile showcasing your skills, experience, and portfolio.",
      features: [
        "Service specialization setup",
        "Portfolio gallery with project examples",
        "Pricing tier configuration",
        "Availability calendar integration",
        "Verification badge system"
      ]
    },
    {
      id: "discover",
      number: "02",
      icon: Bell,
      title: "Discover Project Opportunities",
      description: "Get matched with relevant projects and receive instant notifications.",
      features: [
        "Smart project recommendations",
        "Real-time job alerts",
        "Express mode quick jobs",
        "Territory-based matching",
        "Skill-specific filtering"
      ]
    },
    {
      id: "grow",
      number: "03",
      icon: Star,
      title: "Grow Your Business",
      description: "Build reputation, manage projects, and expand your client base.",
      features: [
        "Review and rating system",
        "Repeat client management",
        "Performance analytics",
        "Professional network access",
        "Business growth tools"
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Comprehensive verification, secure payments, and dispute resolution protect all users."
    },
    {
      icon: Clock,
      title: "Express Mode",
      description: "Quick fixes and small jobs can be booked instantly with pre-configured pricing."
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Access to Ibiza's largest network of verified construction professionals."
    },
    {
      icon: CreditCard,
      title: "SafePay Protection",
      description: "Escrow-based payment system ensures funds are secure until work completion."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-hero py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How CS Ibiza Works
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              A comprehensive platform connecting clients with Ibiza's finest construction professionals through AI-powered matching and secure collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/post')}
                className="btn-hero"
              >
                Post Your Project
              </button>
              <button 
                onClick={() => navigate('/professionals')}
                className="btn-secondary"
              >
                Browse Professionals
              </button>
            </div>
          </div>
        </div>

        {/* For Clients Section */}
        <section className="py-20 bg-sand-light/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
                For Clients
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From small repairs to luxury builds, our platform makes it easy to find and work with the right professionals.
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
              {clientSteps.map((step, index) => {
                const IconComponent = step.icon;
                const isExpanded = expandedSections.includes(step.id);
                
                return (
                  <div key={step.id} className="relative">
                    {/* Connector Line */}
                    {index < clientSteps.length - 1 && (
                      <div className="hidden lg:block absolute left-16 top-32 w-0.5 h-32 bg-gradient-to-b from-copper to-copper-light"></div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                        <div className="card-luxury">
                          {/* Step Number */}
                          <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center shadow-luxury mr-4">
                              <span className="text-white font-bold text-xl">
                                {step.number}
                              </span>
                            </div>
                            <div className="w-16 h-16 bg-sand-light rounded-2xl flex items-center justify-center">
                              <IconComponent className="w-8 h-8 text-copper" />
                            </div>
                          </div>

                          <h3 className="text-2xl font-semibold text-charcoal mb-4">
                            {step.title}
                          </h3>

                          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                            {step.description}
                          </p>

                          <button
                            onClick={() => toggleSection(step.id)}
                            className="flex items-center space-x-2 text-copper hover:text-copper-dark transition-colors mb-4"
                          >
                            <span className="font-medium">
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {isExpanded && (
                            <div className="space-y-4 pt-4 border-t border-sand">
                              <p className="text-muted-foreground italic">
                                {step.details}
                              </p>
                              <ul className="space-y-2">
                                {step.features.map((feature, featureIndex) => (
                                  <li key={featureIndex} className="flex items-start space-x-3">
                                    <CheckCircle className="w-5 h-5 text-copper mt-0.5 flex-shrink-0" />
                                    <span className="text-charcoal">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} text-center`}>
                        <div className="bg-gradient-subtle rounded-2xl p-8 shadow-elegant">
                          <div className="text-6xl mb-4">
                            {index === 0 ? '🎯' : index === 1 ? '🤝' : '✅'}
                          </div>
                          <h4 className="text-xl font-semibold text-charcoal mb-2">
                            {index === 0 ? 'Perfect Match' : index === 1 ? 'Quality Professionals' : 'Secure Completion'}
                          </h4>
                          <p className="text-muted-foreground">
                            {index === 0 ? 'AI analyses your needs for optimal matches' : index === 1 ? 'Verified experts with proven track records' : 'Protected payments and guaranteed satisfaction'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* For Professionals Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
                For Professionals
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join Ibiza's premier construction professional network and grow your business with qualified leads.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {professionalSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isExpanded = expandedSections.includes(step.id);
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Connector Line */}
                      {index < professionalSteps.length - 1 && (
                        <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-copper to-copper-light transform translate-x-6 z-0">
                          <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-copper rounded-full"></div>
                        </div>
                      )}

                      <div className="card-luxury text-center relative z-10">
                        {/* Step Number */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center shadow-luxury">
                            <span className="text-white font-bold text-lg">
                              {step.number}
                            </span>
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center mx-auto mb-6 mt-8">
                          <IconComponent className="w-10 h-10 text-copper" />
                        </div>

                        <h3 className="text-xl font-semibold text-charcoal mb-4">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {step.description}
                        </p>

                        <button
                          onClick={() => toggleSection(step.id)}
                          className="text-copper hover:text-copper-dark transition-colors mb-4"
                        >
                          {isExpanded ? 'Less Info' : 'More Info'}
                        </button>

                        {isExpanded && (
                          <ul className="space-y-2 pt-4 border-t border-sand">
                            {step.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center justify-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-copper rounded-full"></div>
                                <span className="text-sm text-charcoal">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="py-20 bg-sand-light/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
                Platform Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built-in tools and safeguards that make CS Ibiza the trusted choice for construction projects.
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {platformFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="card-luxury text-center hover:shadow-luxury transition-shadow">
                    <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Different User Paths */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
                Choose Your Path
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Whether you need a quick fix or a complex project, we have the right approach for you.
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Express Mode */}
              <div className="card-luxury">
                <div className="flex items-center mb-6">
                  <Clock className="w-12 h-12 text-copper mr-4" />
                  <div>
                    <h3 className="text-2xl font-semibold text-charcoal">Express Mode</h3>
                    <p className="text-copper font-medium">Quick fixes, same-day service</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Perfect for small repairs, maintenance tasks, and urgent fixes. Pre-configured pricing and instant booking.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>Instant price estimates</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>Same-day availability</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>Pre-vetted specialists</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/services')}
                  className="btn-hero w-full"
                >
                  Browse Express Services
                </button>
              </div>

              {/* Custom Projects */}
              <div className="card-luxury">
                <div className="flex items-center mb-6">
                  <Settings className="w-12 h-12 text-copper mr-4" />
                  <div>
                    <h3 className="text-2xl font-semibold text-charcoal">Custom Projects</h3>
                    <p className="text-copper font-medium">Detailed planning, perfect matches</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Ideal for renovations, constructions, and complex projects. Comprehensive planning and expert matching.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>AI-guided project planning</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>Multiple professional proposals</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-copper flex-shrink-0" />
                    <span>Project management tools</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/post')}
                  className="btn-hero w-full"
                >
                  Start Custom Project
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-premium">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of satisfied clients and professionals who trust CS Ibiza for their construction needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/post')}
                className="btn-hero bg-white text-copper hover:bg-white/90"
              >
                Post Your First Project
              </button>
              <button 
                onClick={() => navigate('/auth/sign-up')}
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                Join as Professional
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;