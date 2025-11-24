import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { X } from "lucide-react";

const problems = [
  "Difficulty reaching international clients",
  "Seasonal income fluctuations",
  "Time wasted on unqualified leads",
  "Payment delays and disputes",
  "High marketing costs",
  "Administrative overhead",
];

export const ProblemProfessionals = () => {
  return (
    <SlideLayout>
      <SlideTitle>The Problem - For Professionals</SlideTitle>
      <SlideSubtitle>
        Professionals struggle to connect with serious clients and manage their
        business efficiently
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
