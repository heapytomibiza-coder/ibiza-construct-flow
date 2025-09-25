import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Award } from "lucide-react";
import { VisualPricingTiers } from "@/components/services/VisualPricingTiers";

const sampleTiers = [
  {
    id: "basic",
    name: "Basic",
    price: 299,
    duration: "Standard delivery",
    description: "Perfect for simple projects",
    features: ["1 revision", "48-hour delivery", "Basic support"],
    popular: false,
    recommended: false
  },
  {
    id: "pro",
    name: "Professional", 
    price: 599,
    duration: "Priority delivery",
    description: "Most popular choice for professionals",
    features: ["3 revisions", "24-hour delivery", "Priority support", "Advanced features"],
    popular: true,
    recommended: false
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    duration: "Express delivery",
    description: "Complete solution for large projects",
    features: ["Unlimited revisions", "12-hour delivery", "24/7 support", "Premium features", "Dedicated account manager"],
    popular: false,
    recommended: true
  }
];

export default function ColorPreview() {
  const [selectedTheme, setSelectedTheme] = useState<'mediterranean' | 'tech'>('mediterranean');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      selectedTheme === 'tech' 
        ? 'bg-gradient-to-br from-tech-navy via-deep-navy to-cool-slate' 
        : 'bg-gradient-to-br from-background via-sand-light/20 to-sand/30'
    }`}>
      {/* Theme Toggle Header */}
      <div className="sticky top-0 z-50 border-b backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Color Scheme Preview</h1>
            <div className="flex gap-2">
              <Button
                variant={selectedTheme === 'mediterranean' ? 'default' : 'outline'}
                onClick={() => setSelectedTheme('mediterranean')}
                className="transition-all duration-300"
              >
                Mediterranean
              </Button>
              <Button
                variant={selectedTheme === 'tech' ? 'default' : 'outline'}
                onClick={() => setSelectedTheme('tech')}
                className={selectedTheme === 'tech' ? 'bg-electric-blue hover:bg-tech-blue text-white' : ''}
              >
                Tech Modern
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section Comparison */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className={`text-4xl font-display font-bold ${
              selectedTheme === 'tech' ? 'text-white' : 'text-charcoal'
            }`}>
              Premium Service Platform
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              selectedTheme === 'tech' ? 'text-steel-gray' : 'text-muted-foreground'
            }`}>
              Experience the difference with our professional service marketplace
            </p>
          </div>

          {/* CTA Buttons Comparison */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className={selectedTheme === 'tech' 
                ? 'bg-golden-amber hover:bg-sandy-gold text-tech-navy shadow-golden font-semibold' 
                : 'bg-golden-amber hover:bg-sandy-gold text-tech-navy shadow-golden font-semibold'
              }
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className={selectedTheme === 'tech' 
                ? 'border-steel-gray text-white hover:bg-cool-slate hover:border-golden-amber' 
                : ''
              }
            >
              Learn More
            </Button>
            {selectedTheme === 'tech' && (
              <Badge className="bg-sandy-gold text-tech-navy font-semibold px-3 py-1 text-sm">
                7 DAY FREE TRIAL
              </Badge>
            )}
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "100% Secure", desc: "Bank-level security for all transactions" },
            { icon: Award, title: "Top Rated", desc: "4.9/5 stars from thousands of reviews" },
            { icon: Star, title: "Premium Quality", desc: "Hand-picked professionals only" }
          ].map((feature, idx) => (
            <Card key={idx} className={`transition-all duration-300 hover:scale-105 ${
              selectedTheme === 'tech' 
                ? 'bg-white border-cool-slate shadow-tech' 
                : 'card-luxury'
            }`}>
              <CardHeader className="text-center">
                <feature.icon className={`h-12 w-12 mx-auto mb-4 ${
                  selectedTheme === 'tech' ? 'text-sandy-gold' : 'text-sandy-gold'
                }`} />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Pricing Tiers with Theme */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className={`text-3xl font-display font-bold mb-4 ${
              selectedTheme === 'tech' ? 'text-white' : 'text-charcoal'
            }`}>
              Choose Your Package
            </h2>
            <p className={`text-lg ${
              selectedTheme === 'tech' ? 'text-steel-gray' : 'text-muted-foreground'
            }`}>
              Transparent pricing for professional services
            </p>
          </div>

          <div className={selectedTheme === 'tech' ? 'tech-pricing' : ''}>
            <VisualPricingTiers 
              tiers={sampleTiers} 
              onTierSelect={handleTierSelect}
            />
          </div>
        </section>

        {/* Color Palette Display */}
        <section className="space-y-6">
          <h2 className={`text-2xl font-display font-bold text-center ${
            selectedTheme === 'tech' ? 'text-white' : 'text-charcoal'
          }`}>
            Color Palette
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(selectedTheme === 'tech' ? [
              { name: 'Tech Navy', color: 'bg-tech-navy', text: 'text-white' },
              { name: 'Golden Amber', color: 'bg-golden-amber', text: 'text-tech-navy' },
              { name: 'Sandy Gold', color: 'bg-sandy-gold', text: 'text-tech-navy' },
              { name: 'Steel Gray', color: 'bg-steel-gray', text: 'text-charcoal' },
            ] : [
              { name: 'Golden Amber', color: 'bg-golden-amber', text: 'text-tech-navy' },
              { name: 'Sand', color: 'bg-sand', text: 'text-charcoal' },
              { name: 'Charcoal', color: 'bg-charcoal', text: 'text-white' },
              { name: 'Primary', color: 'bg-primary', text: 'text-primary-foreground' },
            ]).map((color, idx) => (
              <Card key={idx} className={`${color.color} ${color.text} border-none`}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="font-semibold">{color.name}</div>
                    <div className="text-sm opacity-80 mt-1">Sample Text</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className={`text-center py-8 ${
          selectedTheme === 'tech' ? 'text-steel-gray' : 'text-muted-foreground'
        }`}>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <Badge variant="outline" className={selectedTheme === 'tech' ? 'border-steel-gray text-white' : ''}>
              <Shield className="mr-2 h-4 w-4" />
              SSL Secured
            </Badge>
            <Badge variant="outline" className={selectedTheme === 'tech' ? 'border-steel-gray text-white' : ''}>
              <Award className="mr-2 h-4 w-4" />
              Award Winning
            </Badge>
            <Badge variant="outline" className={selectedTheme === 'tech' ? 'border-steel-gray text-white' : ''}>
              <Star className="mr-2 h-4 w-4" />
              5-Star Rated
            </Badge>
          </div>
        </section>
      </div>
    </div>
  );
}