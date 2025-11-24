import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Zap, FileText } from "lucide-react";

export const PostProjectSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Post a Project - Two Ways</SlideTitle>
      <SlideSubtitle>
        Choose your speed: Express checkout for simple jobs, or detailed wizard for
        complex projects
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border-2 border-copper/30">
          <div className="h-16 w-16 rounded-full bg-copper/20 flex items-center justify-center mb-6">
            <Zap className="h-8 w-8 text-copper" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Express Mode</h3>
          <p className="text-muted-foreground mb-6">
            Quick service selection for standard jobs
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Browse service catalog</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Select service & details</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Get instant quotes</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-copper mt-2" />
              <span>Book in minutes</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-sage/10 to-sage/5 border-2 border-sage/30">
          <div className="h-16 w-16 rounded-full bg-sage/20 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-sage" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Detailed Wizard</h3>
          <p className="text-muted-foreground mb-6">
            Custom project description for complex work
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Describe your project</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Upload photos & plans</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Set budget & timeline</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-sage mt-2" />
              <span>Get custom quotes</span>
            </li>
          </ul>
        </div>
      </div>
    </SlideLayout>
  );
};
