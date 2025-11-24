import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { TrendingUp, Home, Users, Euro } from "lucide-react";

export const MarketOpportunitySlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>Market Opportunity</SlideTitle>
      <SlideSubtitle>A €200M+ market with rapid growth potential</SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Euro className="h-12 w-12 text-copper mx-auto mb-4" />
          <div className="text-5xl font-bold text-copper mb-2">€200M+</div>
          <div className="text-lg font-medium mb-2">Ibiza Construction Market</div>
          <div className="text-muted-foreground">Annual construction spending</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Home className="h-12 w-12 text-sage mx-auto mb-4" />
          <div className="text-5xl font-bold text-sage mb-2">60,000+</div>
          <div className="text-lg font-medium mb-2">Property Owners</div>
          <div className="text-muted-foreground">Tourist and investment properties</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <TrendingUp className="h-12 w-12 text-copper mx-auto mb-4" />
          <div className="text-5xl font-bold text-copper mb-2">+15%</div>
          <div className="text-lg font-medium mb-2">Annual Growth</div>
          <div className="text-muted-foreground">Luxury villa market expansion</div>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30 text-center">
          <Users className="h-12 w-12 text-sage mx-auto mb-4" />
          <div className="text-5xl font-bold text-sage mb-2">2,500+</div>
          <div className="text-lg font-medium mb-2">Active Professionals</div>
          <div className="text-muted-foreground">Licensed contractors on island</div>
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
