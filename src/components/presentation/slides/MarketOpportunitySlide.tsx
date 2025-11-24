import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { TrendingUp, Home, Users, Euro } from "lucide-react";
import { StatCounter } from "../StatCounter";

export const MarketOpportunitySlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>Market Opportunity</SlideTitle>
      <SlideSubtitle>A €200M+ market with rapid growth potential</SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Euro className="h-12 w-12 text-copper mx-auto mb-4" />
          <StatCounter 
            value={200} 
            label="Ibiza Construction Market" 
            prefix="€" 
            suffix="M+" 
            duration={2500}
          />
          <div className="text-sm text-muted-foreground mt-2">Annual construction spending</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Home className="h-12 w-12 text-sage mx-auto mb-4" />
          <StatCounter 
            value={60000} 
            label="Property Owners" 
            suffix="+" 
            duration={2800}
            valueColor="text-sage"
          />
          <div className="text-sm text-muted-foreground mt-2">Tourist and investment properties</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <TrendingUp className="h-12 w-12 text-copper mx-auto mb-4" />
          <StatCounter 
            value={15} 
            label="Annual Growth" 
            suffix="%" 
            prefix="+" 
            duration={2000}
          />
          <div className="text-sm text-muted-foreground mt-2">Luxury villa market expansion</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Users className="h-12 w-12 text-sage mx-auto mb-4" />
          <StatCounter 
            value={2500} 
            label="Active Professionals" 
            suffix="+" 
            duration={2300}
            valueColor="text-sage"
          />
          <div className="text-sm text-muted-foreground mt-2">Licensed contractors on island</div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-copper/10 border border-copper/30 text-center">
        <p className="text-xl font-medium">
          🌴 Seasonal demand creates consistent year-round opportunities
        </p>
      </div>
    </SlideLayout>
  );
};
