import { Wrench, Home, Zap, Paintbrush, Hammer, Droplets, Thermometer, Car } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Wrench,
      title: "Handyman Services",
      description: "Quick fixes, small repairs, and maintenance tasks",
      priceRange: "€50 - €500",
      popular: true
    },
    {
      icon: Home,
      title: "Home Renovations", 
      description: "Kitchen, bathroom, and complete home makeovers",
      priceRange: "€2K - €50K",
      popular: false
    },
    {
      icon: Zap,
      title: "Electrical Work",
      description: "Installation, repairs, and safety inspections",
      priceRange: "€100 - €5K",
      popular: false
    },
    {
      icon: Paintbrush,
      title: "Painting & Decorating",
      description: "Interior and exterior painting, wallpaper, finishes",
      priceRange: "€200 - €3K",
      popular: true
    },
    {
      icon: Hammer,
      title: "Construction",
      description: "New builds, extensions, and structural work",
      priceRange: "€10K - €1M+",
      popular: false
    },
    {
      icon: Droplets,
      title: "Plumbing",
      description: "Installation, repairs, and bathroom fitting",
      priceRange: "€80 - €2K",
      popular: true
    },
    {
      icon: Thermometer,
      title: "HVAC Systems",
      description: "Air conditioning, heating, and ventilation",
      priceRange: "€300 - €8K",
      popular: false
    },
    {
      icon: Car,
      title: "Pool & Outdoor",
      description: "Pool maintenance, garden landscaping, patios",
      priceRange: "€150 - €15K",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-display text-4xl md:text-5xl font-bold text-charcoal mb-6">
            No Job Too Small,<br />
            <span className="text-copper">No Dream Too Big</span>
          </h2>
          <p className="text-body text-xl text-muted-foreground max-w-3xl mx-auto">
            From quick €50 fixes to million-euro luxury builds, our verified professionals deliver excellence at every scale. Your Ibiza property deserves the best.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="card-luxury hover:scale-105 group cursor-pointer relative"
              >
                {service.popular && (
                  <div className="absolute -top-3 -right-3 bg-gradient-hero text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-display font-semibold text-charcoal mb-2 text-lg">
                    {service.title}
                  </h3>
                  
                  <p className="text-body text-muted-foreground text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="text-copper font-semibold text-sm">
                      {service.priceRange}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="btn-hero">
            Get Instant Quote
          </button>
          <p className="text-body text-muted-foreground mt-4">
            Free estimates • No commitment • 24h response
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;