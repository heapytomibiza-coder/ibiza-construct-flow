import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Our Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our comprehensive range of professional services designed to meet all your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service cards will be populated here */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Home Renovation</h3>
              <p className="text-muted-foreground mb-4">Complete home renovation and remodeling services</p>
              <button className="btn-primary">Learn More</button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Maintenance</h3>
              <p className="text-muted-foreground mb-4">Regular maintenance and repair services</p>
              <button className="btn-primary">Learn More</button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Installation</h3>
              <p className="text-muted-foreground mb-4">Professional installation services</p>
              <button className="btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;