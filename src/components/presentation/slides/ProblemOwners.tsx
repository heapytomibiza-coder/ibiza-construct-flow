import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { X } from "lucide-react";

const problems = [
  "Hard to find trusted professionals",
  "Language barriers (English/Spanish)",
  "No price transparency",
  "Payment risks and disputes",
  "Seasonal availability challenges",
  "Quality concerns with tourist-focused service",
];

export const ProblemOwners = () => {
  return (
    <SlideLayout>
      <SlideTitle>The Problem - For Property Owners</SlideTitle>
      <SlideSubtitle>
        Finding reliable construction professionals in Ibiza has always been a
        challenge
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {problems.map((problem, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-6 rounded-xl bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <div className="text-lg font-medium">{problem}</div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
