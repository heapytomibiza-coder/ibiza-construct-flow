import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Professionals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Our Professionals
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet our network of skilled and verified professionals ready to help with your projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Professional cards will be populated here */}
            <div className="bg-card rounded-lg p-6 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Construction Experts</h3>
              <p className="text-muted-foreground mb-4">Experienced builders and contractors</p>
              <button className="btn-secondary">View Profiles</button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Maintenance Specialists</h3>
              <p className="text-muted-foreground mb-4">Skilled maintenance professionals</p>
              <button className="btn-secondary">View Profiles</button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Installation Teams</h3>
              <p className="text-muted-foreground mb-4">Professional installation services</p>
              <button className="btn-secondary">View Profiles</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Professionals;