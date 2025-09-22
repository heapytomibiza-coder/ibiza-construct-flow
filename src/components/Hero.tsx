import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-construction.jpg';

const Hero = () => {
  const navigate = useNavigate();

  const handlePostProject = () => {
    navigate('/post');
  };

  const handleBrowseServices = () => {
    navigate('/services');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/80 via-charcoal/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-copper fill-current" />
              ))}
            </div>
            <span className="text-white/90 text-sm font-medium">Ibiza's #1 Rated Network</span>
          </div>

          <h1 className="text-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Elite Builders.<br />
            Elite Projects.<br />
            <span className="text-copper">Ibiza's Premier Network</span>
          </h1>

          <p className="text-body text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Connect with Ibiza's most trusted construction professionals. From €50 handyman jobs to million-euro luxury builds.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-copper" />
              <span className="text-white/90 text-sm font-medium">SafePay Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-copper" />
              <span className="text-white/90 text-sm font-medium">24h Response</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-copper" />
              <span className="text-white/90 text-sm font-medium">Verified Pros Only</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handlePostProject}
              className="btn-hero group"
            >
              Post Your Project
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleBrowseServices}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              Browse Services
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold text-white text-display">500+</div>
              <div className="text-white/70 text-sm">Verified Pros</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white text-display">2,000+</div>
              <div className="text-white/70 text-sm">Projects Done</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white text-display">€20M+</div>
              <div className="text-white/70 text-sm">Protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;