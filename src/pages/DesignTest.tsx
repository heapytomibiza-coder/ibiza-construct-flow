import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Euro, Clock, Sparkles, Star, Heart, MessageSquare, Moon, Sun } from 'lucide-react';
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
            Five different design directions for you to choose from. Each showcases the same components with different styling approaches.
          </p>

          <div className="space-y-24">
            {/* OPTION A: Clean Professional Blue */}
            <OptionA />

            {/* OPTION B: Sophisticated Monochrome */}
            <OptionB />

            {/* OPTION C: Scandinavian Construction */}
            <OptionC />

            {/* OPTION D: Gradient Glassmorphism */}
            <OptionD />

            {/* OPTION E: Light Glassmorphism */}
            <OptionE />
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

// OPTION D: Gradient Glassmorphism
function OptionD() {
  const [isLightMode, setIsLightMode] = useState(false);

  const colors = isLightMode ? {
    bg: '#F8F9FA',
    bgOverlay: '#FFFFFF',
    text: '#1A1729',
    textMuted: '#4A5568',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'linear-gradient(135deg, rgba(38, 181, 206, 0.3), rgba(159, 81, 243, 0.3))',
    cardBg: 'rgba(255, 255, 255, 0.8)',
  } : {
    bg: '#13111F',
    bgOverlay: '#1A1729',
    text: '#FAFAFA',
    textMuted: '#A0AEC0',
    glass: 'rgba(26, 23, 41, 0.4)',
    glassBorder: 'linear-gradient(135deg, rgba(38, 181, 206, 0.2), rgba(159, 81, 243, 0.2))',
    cardBg: 'rgba(26, 23, 41, 0.6)',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-8"
      style={{ backgroundColor: colors.bg, padding: '2rem', borderRadius: '1.5rem' }}
    >
      {/* Header with Mode Toggle */}
      <div className="text-center pb-6 border-b" style={{ borderColor: isLightMode ? '#E5E7EB' : 'rgba(159, 81, 243, 0.2)' }}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-3xl font-bold" style={{ color: colors.text }}>
            Option D: Gradient Glassmorphism
          </h2>
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="p-2 rounded-lg transition-all"
            style={{
              background: colors.glass,
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(159, 81, 243, 0.2)',
              color: colors.text,
            }}
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
        <p style={{ color: colors.textMuted }}>Modern Premium - Ethereal Glassmorphism with Gradients</p>
      </div>

      {/* Hero Section */}
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{ 
          backgroundColor: colors.bgOverlay,
          background: isLightMode 
            ? 'linear-gradient(135deg, #F8F9FA 0%, #EDF2F7 100%)'
            : 'linear-gradient(135deg, #1A1729 0%, #13111F 100%)',
        }}
      >
        <div 
          className="p-12 text-center"
          style={{
            background: colors.glass,
            backdropFilter: 'blur(24px)',
            border: '1px solid transparent',
            borderImage: colors.glassBorder,
            borderImageSlice: 1,
          }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-all"
            style={{ 
              background: colors.glass,
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(38, 181, 206, 0.3)',
              boxShadow: isLightMode 
                ? '0 4px 16px rgba(38, 181, 206, 0.15)'
                : '0 4px 16px rgba(38, 181, 206, 0.3), 0 0 40px rgba(38, 181, 206, 0.2)',
            }}
          >
            <Star className="w-4 h-4" style={{ color: '#26B5CE' }} />
            <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
              Ibiza's #1 Rated Network
            </span>
          </div>
          
          <h1 
            className="text-6xl font-bold mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Building the Island.<br />Building Your Dreams.
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            Connect with Ibiza's most trusted construction professionals
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
                color: '#FFFFFF',
                boxShadow: isLightMode
                  ? '0 8px 24px rgba(38, 181, 206, 0.3)'
                  : '0 8px 24px rgba(38, 181, 206, 0.4), 0 0 40px rgba(159, 81, 243, 0.3)',
                border: 'none',
              }}
            >
              Post Your Project
            </button>
            <button 
              className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105"
              style={{ 
                background: colors.glass,
                backdropFilter: 'blur(24px)',
                color: colors.text,
                border: '1px solid transparent',
                borderImage: colors.glassBorder,
                borderImageSlice: 1,
                boxShadow: isLightMode
                  ? '0 4px 16px rgba(159, 81, 243, 0.1)'
                  : '0 4px 16px rgba(159, 81, 243, 0.2)',
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
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
            style={{ 
              background: colors.cardBg,
              backdropFilter: 'blur(24px)',
              border: '1px solid transparent',
              borderImage: colors.glassBorder,
              borderImageSlice: 1,
              boxShadow: isLightMode
                ? '0 8px 32px rgba(0, 0, 0, 0.08)'
                : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(159, 81, 243, 0.1)',
            }}
          >
            <div 
              className="h-40 relative"
              style={{ 
                background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 50%, #3F2B99 100%)',
                opacity: isLightMode ? 0.4 : 0.6,
              }}
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-xl flex-1" style={{ color: colors.text }}>
                  Swimming Pool Installation
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ 
                    backgroundColor: '#26B5CE',
                    color: '#FFFFFF',
                    boxShadow: isLightMode
                      ? '0 4px 12px rgba(38, 181, 206, 0.25)'
                      : '0 4px 12px rgba(38, 181, 206, 0.4), 0 0 20px rgba(38, 181, 206, 0.3)',
                  }}
                >
                  NEW
                </span>
              </div>
              
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                Looking for experienced pool installer for luxury villa project in Ibiza town.
              </p>

              <div className="flex items-center gap-4 mb-5 text-sm font-medium" style={{ color: colors.text }}>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" style={{ color: '#26B5CE' }} />
                  <span className="font-bold">€12,500</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" style={{ color: '#9F51F3' }} />
                  <span>Ibiza Town</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                  style={{ 
                    background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
                    color: '#FFFFFF',
                    boxShadow: isLightMode
                      ? '0 6px 20px rgba(38, 181, 206, 0.3)'
                      : '0 6px 20px rgba(38, 181, 206, 0.4), 0 0 30px rgba(159, 81, 243, 0.3)',
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2.5 rounded-xl transition-all hover:scale-110"
                  style={{ 
                    background: colors.glass,
                    backdropFilter: 'blur(24px)',
                    color: colors.text,
                    border: '1px solid rgba(159, 81, 243, 0.2)',
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  className="px-4 py-2.5 rounded-xl transition-all hover:scale-110"
                  style={{ 
                    background: colors.glass,
                    backdropFilter: 'blur(24px)',
                    color: colors.text,
                    border: '1px solid rgba(159, 81, 243, 0.2)',
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

// OPTION E: Light Glassmorphism with Shadows
function OptionE() {
  const colors = {
    bg: '#F8F9FA',
    bgOverlay: '#FFFFFF',
    text: '#1A1729',
    textMuted: '#4A5568',
    glass: 'rgba(255, 255, 255, 0.85)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="space-y-8"
      style={{ backgroundColor: colors.bg, padding: '2rem', borderRadius: '1.5rem' }}
    >
      {/* Header */}
      <div className="text-center pb-6 border-b" style={{ borderColor: 'rgba(38, 181, 206, 0.2)' }}>
        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
          Option E: Light Glassmorphism
        </h2>
        <p style={{ color: colors.textMuted }}>Airy & Premium - Light Glass with Elegant Shadows</p>
      </div>

      {/* Hero Section */}
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{ 
          backgroundColor: colors.bgOverlay,
          boxShadow: '0 20px 60px rgba(38, 181, 206, 0.15), 0 8px 24px rgba(159, 81, 243, 0.1)',
        }}
      >
        <div 
          className="p-12 text-center"
          style={{
            background: colors.glass,
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(38, 181, 206, 0.2)',
          }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-all"
            style={{ 
              background: colors.glass,
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(38, 181, 206, 0.3)',
              boxShadow: '0 4px 16px rgba(38, 181, 206, 0.2), 0 2px 8px rgba(159, 81, 243, 0.15)',
            }}
          >
            <Star className="w-4 h-4" style={{ color: '#26B5CE' }} />
            <span style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
              Ibiza's #1 Rated Network
            </span>
          </div>
          
          <h1 
            className="text-6xl font-bold mb-4"
            style={{ 
              background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Building the Island.<br />Building Your Dreams.
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            Connect with Ibiza's most trusted construction professionals
          </p>

          <div className="flex gap-3 justify-center">
            <button 
              className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-2xl"
              style={{ 
                background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(38, 181, 206, 0.35), 0 4px 12px rgba(159, 81, 243, 0.25)',
                border: 'none',
              }}
            >
              Post Your Project
            </button>
            <button 
              className="px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl"
              style={{ 
                background: colors.glass,
                backdropFilter: 'blur(24px)',
                color: colors.text,
                border: '1px solid rgba(159, 81, 243, 0.3)',
                boxShadow: '0 4px 16px rgba(159, 81, 243, 0.15)',
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
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl"
            style={{ 
              background: colors.cardBg,
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(38, 181, 206, 0.2)',
              boxShadow: '0 10px 40px rgba(38, 181, 206, 0.12), 0 4px 16px rgba(159, 81, 243, 0.08)',
            }}
          >
            <div 
              className="h-40 relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(38, 181, 206, 0.3) 0%, rgba(159, 81, 243, 0.3) 50%, rgba(63, 43, 153, 0.3) 100%)',
              }}
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-xl flex-1" style={{ color: colors.text }}>
                  Swimming Pool Installation
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{ 
                    backgroundColor: '#26B5CE',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(38, 181, 206, 0.3)',
                  }}
                >
                  NEW
                </span>
              </div>
              
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                Looking for experienced pool installer for luxury villa project in Ibiza town.
              </p>

              <div className="flex items-center gap-4 mb-5 text-sm font-medium" style={{ color: colors.text }}>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" style={{ color: '#26B5CE' }} />
                  <span className="font-bold">€12,500</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" style={{ color: '#9F51F3' }} />
                  <span>Ibiza Town</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 hover:shadow-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #26B5CE 0%, #9F51F3 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 6px 20px rgba(38, 181, 206, 0.35), 0 3px 10px rgba(159, 81, 243, 0.25)',
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2.5 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                  style={{ 
                    background: colors.glass,
                    backdropFilter: 'blur(24px)',
                    color: colors.text,
                    border: '1px solid rgba(159, 81, 243, 0.2)',
                    boxShadow: '0 2px 8px rgba(159, 81, 243, 0.1)',
                  }}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button 
                  className="px-4 py-2.5 rounded-xl transition-all hover:scale-110 hover:shadow-lg"
                  style={{ 
                    background: colors.glass,
                    backdropFilter: 'blur(24px)',
                    color: colors.text,
                    border: '1px solid rgba(159, 81, 243, 0.2)',
                    boxShadow: '0 2px 8px rgba(159, 81, 243, 0.1)',
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
