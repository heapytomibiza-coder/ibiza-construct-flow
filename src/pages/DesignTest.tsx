import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Euro, Clock, Sparkles, Star, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignTest() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Design System Options</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three different design directions for you to choose from. Each showcases the same components with different styling approaches.
          </p>

          <div className="space-y-24">
            {/* OPTION A: Clean Professional Blue */}
            <OptionA />

            {/* OPTION B: Sophisticated Monochrome */}
            <OptionB />

            {/* OPTION C: Scandinavian Construction */}
            <OptionC />
          </div>
        </div>
      </div>
    </div>
  );
}

// OPTION A: Clean Professional Blue
function OptionA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
          Option A: Clean Professional Blue
        </h2>
        <p style={{ color: '#718096' }}>Airbnb / LinkedIn Style - Trust & Professionalism</p>
      </div>

      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB'
        }}
      >
        <div className="p-12 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: '#F7FAFC', border: '1px solid #E5E7EB' }}
          >
            <Star className="w-4 h-4" style={{ color: '#2563EB' }} />
            <span style={{ color: '#2D3748', fontSize: '14px', fontWeight: '500' }}>
              Ibiza's #1 Rated Network
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#1A202C' }}>
            Building the Island.<br />Building Your Dreams.
          </h1>
          
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#4A5568' }}>
            Connect with Ibiza's most trusted construction professionals
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: '#2563EB',
                color: '#FFFFFF'
              }}
            >
              Post Your Project
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: '#2563EB',
                border: '1px solid #E5E7EB'
              }}
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB'
            }}
          >
            <div 
              className="h-40"
              style={{ 
                background: 'linear-gradient(135deg, #EBF4FF 0%, #C7D2FE 100%)'
              }}
            />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg flex-1" style={{ color: '#2D3748' }}>
                  Swimming Pool Installation
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: '#F7FAFC',
                    color: '#4A5568',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  NEW
                </span>
              </div>
              
              <p className="text-sm mb-4" style={{ color: '#718096' }}>
                Looking for experienced pool installer for luxury villa project in Ibiza town.
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#4A5568' }}>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-semibold">€12,500</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Ibiza Town</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF'
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    border: '1px solid #E5E7EB',
                    color: '#4A5568'
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    border: '1px solid #E5E7EB',
                    color: '#4A5568'
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// OPTION B: Sophisticated Monochrome
function OptionB() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center pb-6 border-b" style={{ borderColor: '#E5E5E5' }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Option B: Sophisticated Monochrome
        </h2>
        <p style={{ color: '#737373' }}>Apple / Luxury Architecture Style - Modern & Sophisticated</p>
      </div>

      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#FAFAFA'
        }}
      >
        <div className="p-12 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: '#F5F1EB', border: 'none' }}
          >
            <Star className="w-4 h-4" style={{ color: '#0F172A' }} />
            <span style={{ color: '#525252', fontSize: '14px', fontWeight: '500' }}>
              Ibiza's #1 Rated Network
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#0A0A0A', letterSpacing: '-0.02em' }}>
            Building the Island.<br />Building Your Dreams.
          </h1>
          
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#525252' }}>
            Connect with Ibiza's most trusted construction professionals
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: '#0F172A',
                color: '#FFFFFF'
              }}
            >
              Post Your Project
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: '#0F172A',
                border: '1px solid #E5E5E5'
              }}
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-xl"
            style={{ 
              backgroundColor: '#F5F1EB'
            }}
          >
            <div 
              className="h-40"
              style={{ 
                backgroundColor: '#D4CFC7'
              }}
            />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-lg flex-1" style={{ color: '#0A0A0A' }}>
                  Swimming Pool Installation
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: '#E5E5E5',
                    color: '#0F172A'
                  }}
                >
                  NEW
                </span>
              </div>
              
              <p className="text-sm mb-4" style={{ color: '#525252' }}>
                Looking for experienced pool installer for luxury villa project in Ibiza town.
              </p>

              <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#525252' }}>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-semibold">€12,500</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Ibiza Town</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF'
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#FAFAFA',
                    color: '#525252'
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#FAFAFA',
                    color: '#525252'
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// OPTION C: Scandinavian Construction
function OptionC() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center pb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#374151' }}>
          Option C: Scandinavian Construction
        </h2>
        <p style={{ color: '#6B7280' }}>Nordic Minimalism - Warmth & Approachability</p>
      </div>

      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#F8F9FA'
        }}
      >
        <div className="p-12 text-center">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: '#FEF3E2', border: '1px solid #FDE68A' }}
          >
            <Star className="w-4 h-4" style={{ color: '#059669' }} />
            <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              Ibiza's #1 Rated Network
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#1F2937' }}>
            Building the Island.<br />Building Your Dreams.
          </h1>
          
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
            Connect with Ibiza's most trusted construction professionals
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: '#059669',
                color: '#FFFFFF'
              }}
            >
              Post Your Project
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: 'transparent',
                color: '#059669',
                border: '1px solid #D1D5DB'
              }}
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
            style={{ 
              backgroundColor: '#FEF3E2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div 
              className="h-40"
              style={{ 
                background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
              }}
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold text-lg flex-1" style={{ color: '#1F2937' }}>
                  Swimming Pool Installation
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: '#059669',
                    color: '#FFFFFF'
                  }}
                >
                  NEW
                </span>
              </div>
              
              <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
                Looking for experienced pool installer for luxury villa project in Ibiza town.
              </p>

              <div className="flex items-center gap-4 mb-5 text-sm" style={{ color: '#374151' }}>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-semibold">€12,500</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Ibiza Town</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ 
                    backgroundColor: '#059669',
                    color: '#FFFFFF'
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#F8F9FA',
                    color: '#6B7280',
                    border: '1px solid #D1D5DB'
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#F8F9FA',
                    color: '#6B7280',
                    border: '1px solid #D1D5DB'
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
