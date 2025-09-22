import { Search, MessageSquare, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Describe Your Project",
      description: "Tell us what you need done using our simple wizard. Upload photos, set your budget, and specify your timeline.",
      details: ["5-minute setup", "Photo uploads", "Budget guidance", "Timeline planning"]
    },
    {
      number: "02", 
      icon: MessageSquare,
      title: "Get Matched & Compare",
      description: "Our AI connects you with verified professionals. Compare quotes, reviews, and portfolios to find your perfect match.",
      details: ["AI-powered matching", "Instant quotes", "Verified reviews", "Portfolio showcase"]
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Work Protected",
      description: "Collaborate safely with SafePay escrow protection. Track progress, communicate, and pay only when satisfied.",
      details: ["SafePay protection", "Progress tracking", "Direct messaging", "Satisfaction guarantee"]
    }
  ];

  return (
    <section className="py-20 bg-sand-light/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
            How It Works
          </h2>
          <p className="text-body text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to connect with Ibiza's finest construction professionals
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-copper to-copper-light transform translate-x-6 z-0">
                      <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-copper rounded-full"></div>
                    </div>
                  )}

                  {/* Step Card */}
                  <div className="card-luxury text-center relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center shadow-luxury">
                        <span className="text-white font-bold text-lg text-display">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-sand-light rounded-2xl flex items-center justify-center mx-auto mb-6 mt-8">
                      <IconComponent className="w-10 h-10 text-copper" />
                    </div>

                    {/* Content */}
                    <h3 className="text-display font-semibold text-charcoal mb-4 text-xl">
                      {step.title}
                    </h3>

                    <p className="text-body text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center justify-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-copper rounded-full"></div>
                          <span className="text-body text-sm text-charcoal">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-premium rounded-2xl p-8 shadow-elegant max-w-2xl mx-auto">
            <h3 className="text-display text-2xl font-semibold text-white mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-white/90 mb-6">
              Join thousands of satisfied clients who've found their perfect professionals through CS Ibiza
            </p>
            <button className="btn-hero">
              Post Your Project Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;