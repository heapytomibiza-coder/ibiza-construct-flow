import { SlideLayout } from "../SlideLayout";
import { Shield, Clock, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCounter } from "../StatCounter";

export const TitleSlide = () => {
  return (
    <SlideLayout background="gradient" className="flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-sage rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-copper rounded-full blur-3xl" />
      </div>

      <Badge className="mb-6 bg-copper text-white border-0 px-6 py-2 text-lg relative z-10">
        Constructive Solutions Ibiza
      </Badge>

      <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-sage via-copper to-sage bg-clip-text text-transparent leading-tight relative z-10">
        Building the Island.
        <br />
        Building Your Dreams.
      </h1>

      <p className="text-2xl text-muted-foreground mb-12 max-w-3xl relative z-10">
        Ibiza's Premier Construction Network - Connecting Property Owners with Elite
        Professionals
      </p>

      <div className="flex flex-wrap gap-6 justify-center mb-12 relative z-10">
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30 shadow-lg">
          <Shield className="h-5 w-5 text-copper" />
          <span className="font-semibold">SafePay Protected</span>
        </div>
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30 shadow-lg">
          <Clock className="h-5 w-5 text-copper" />
          <span className="font-semibold">24h Response</span>
        </div>
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-sage-muted/30 shadow-lg">
          <BadgeCheck className="h-5 w-5 text-copper" />
          <span className="font-semibold">Verified Pros Only</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 max-w-4xl relative z-10">
        <StatCounter value={500} label="Verified Professionals" suffix="+" duration={2000} />
        <StatCounter value={2000} label="Projects Completed" suffix="+" duration={2500} />
        <StatCounter value={20} label="Protected" prefix="€" suffix="M+" duration={2200} />
      </div>
    </SlideLayout>
  );
};
