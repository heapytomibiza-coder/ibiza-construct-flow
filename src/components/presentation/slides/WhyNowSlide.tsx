import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { TrendingUp } from "lucide-react";

export const WhyNowSlide = () => {
  return (
    <SlideLayout background="gradient">
      <SlideTitle>Why Now?</SlideTitle>
      <SlideSubtitle>Perfect timing to capture a transforming market</SlideSubtitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {[
          { title: "Post-COVID Construction Boom", desc: "Surge in property renovations and upgrades" },
          { title: "Digital Transformation", desc: "Construction industry embracing online platforms" },
          { title: "Remote Work Revolution", desc: "Property investment surge from remote workers" },
          { title: "Sustainable Building Trends", desc: "Growing demand for eco-friendly construction" },
          { title: "Smart Home Adoption", desc: "IoT and automation driving service demand" },
        ].map((factor, index) => (
          <div key={index} className="p-6 rounded-xl bg-background/80 backdrop-blur border border-sage-muted/30 hover:border-copper/50 transition-colors">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-6 w-6 text-copper flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-2">{factor.title}</h4>
                <p className="text-sm text-muted-foreground">{factor.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
