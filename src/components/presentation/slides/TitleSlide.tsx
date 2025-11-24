import { SlideLayout } from "../SlideLayout";
import { Shield, Clock, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TitleSlide = () => {
  return (
    <SlideLayout background="gradient" className="flex flex-col items-center justify-center text-center">
      <Badge className="mb-6 bg-copper text-white border-0 px-6 py-2 text-lg">
        Constructive Solutions Ibiza
      </Badge>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-sage via-copper to-sage bg-clip-text text-transparent leading-tight">
        Building the Island.
        <br />
        Building Your Dreams.
      </h1>

      <p className="text-2xl text-muted-foreground mb-12 max-w-3xl">
        Ibiza's Premier Construction Network - Connecting Property Owners with Elite
        Professionals
      </p>

      <div className="flex flex-wrap gap-6 justify-center mb-12">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30">
          <Shield className="h-5 w-5 text-copper" />
          <span className="font-semibold">SafePay Protected</span>
        </div>
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30">
          <Clock className="h-5 w-5 text-copper" />
          <span className="font-semibold">24h Response</span>
        </div>
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30">
          <BadgeCheck className="h-5 w-5 text-copper" />
          <span className="font-semibold">Verified Pros Only</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center">
          <div className="text-5xl font-bold text-copper mb-2">500+</div>
          <div className="text-muted-foreground">Verified Professionals</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-copper mb-2">2,000+</div>
          <div className="text-muted-foreground">Projects Completed</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-copper mb-2">€20M+</div>
          <div className="text-muted-foreground">Protected</div>
        </div>
      </div>
    </SlideLayout>
  );
};
