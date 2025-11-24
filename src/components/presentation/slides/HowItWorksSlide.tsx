import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Search, Users, Shield } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Describe Your Project",
    description:
      "5-minute setup, photo uploads, budget guidance, timeline planning",
  },
  {
    icon: Users,
    title: "Get Matched & Compare",
    description:
      "AI-powered matching, instant quotes, verified reviews, portfolio showcase",
  },
  {
    icon: Shield,
    title: "Work Protected",
    description:
      "SafePay protection, progress tracking, direct messaging, satisfaction guarantee",
  },
];

export const HowItWorksSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>How It Works</SlideTitle>
      <SlideSubtitle>
        From project posting to completion in three simple steps
      </SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-copper to-sage -translate-x-1/2 z-0" />
            )}

            <div className="relative bg-card p-8 rounded-2xl border border-sage-muted/30 hover:border-copper/50 transition-colors shadow-lg">
              <div className="text-6xl font-bold text-copper/20 mb-4">{index + 1}</div>

              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-copper/20 to-sage/20 flex items-center justify-center mb-6">
                <step.icon className="h-8 w-8 text-copper" />
              </div>

              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
