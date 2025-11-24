import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Brain, Zap, Target, Star } from "lucide-react";

export const AIMatchingSlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>AI-Powered Matching</SlideTitle>
      <SlideSubtitle>
        Smart algorithms connect the right professional with the right project
      </SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Brain className="h-12 w-12 text-copper mb-4" />
          <h4 className="font-bold text-xl mb-3">Service Taxonomy Matching</h4>
          <p className="text-muted-foreground">
            Analyzes project requirements and matches with professionals who have
            proven expertise
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Target className="h-12 w-12 text-copper mb-4" />
          <h4 className="font-bold text-xl mb-3">Location Optimization</h4>
          <p className="text-muted-foreground">
            Considers travel distance and service areas for optimal matches
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Zap className="h-12 w-12 text-copper mb-4" />
          <h4 className="font-bold text-xl mb-3">Availability Sync</h4>
          <p className="text-muted-foreground">
            Only suggests professionals available within your timeline
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-background/80 backdrop-blur border border-sage-muted/30">
          <Star className="h-12 w-12 text-copper mb-4" />
          <h4 className="font-bold text-xl mb-3">Review Scoring</h4>
          <p className="text-muted-foreground">
            Prioritizes highly-rated professionals with proven track records
          </p>
        </div>
      </div>

      <div className="mt-8 text-center p-6 rounded-xl bg-copper/10 border border-copper/30">
        <div className="text-3xl font-bold text-copper">
          92% of clients rate their AI match as "Excellent" or "Perfect"
        </div>
      </div>
    </SlideLayout>
  );
};
