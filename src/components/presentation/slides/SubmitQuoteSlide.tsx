import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { FileText, Euro, Calendar, Image } from "lucide-react";

export const SubmitQuoteSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Submit Professional Quotes</SlideTitle>
      <SlideSubtitle>Win jobs with professional quotes that showcase your expertise</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-copper" />
              <h4 className="font-bold">Project Details</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Review client requirements and ask clarifying questions
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-copper" />
              <h4 className="font-bold">Timeline Estimation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Provide realistic start dates and completion timeframes
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <Euro className="h-6 w-6 text-copper" />
              <h4 className="font-bold">Itemized Pricing</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Break down costs transparently with materials and labor
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <Image className="h-6 w-6 text-copper" />
              <h4 className="font-bold">Portfolio Examples</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Attach photos of similar completed projects
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-copper/10 to-sage/10 border border-copper/30">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Average Quote Acceptance Rate</div>
          <div className="text-5xl font-bold text-copper">67%</div>
          <div className="text-muted-foreground mt-2">for verified professionals</div>
        </div>
      </div>
    </SlideLayout>
  );
};
