import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Zap, Droplet, Hammer, Palette, Trees, Waves, Sparkles, Shield } from "lucide-react";

const categories = [
  { icon: Zap, name: "Electrical & Smart Home", color: "text-yellow-500" },
  { icon: Droplet, name: "Plumbing & HVAC", color: "text-blue-500" },
  { icon: Hammer, name: "Construction & Renovation", color: "text-orange-500" },
  { icon: Palette, name: "Interior Design", color: "text-purple-500" },
  { icon: Trees, name: "Landscaping & Outdoor", color: "text-green-500" },
  { icon: Waves, name: "Pool Maintenance", color: "text-cyan-500" },
  { icon: Sparkles, name: "Cleaning Services", color: "text-pink-500" },
  { icon: Shield, name: "Security Systems", color: "text-red-500" },
];

export const ServiceCategoriesSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Service Categories</SlideTitle>
      <SlideSubtitle>
        150+ specialized services covering every property need in Ibiza
      </SlideSubtitle>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {categories.map((category, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-card border border-sage-muted/30 hover:border-copper/50 transition-all hover:shadow-lg text-center group"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sage/10 to-copper/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <category.icon className={`h-8 w-8 ${category.color}`} />
            </div>
            <div className="font-semibold text-sm">{category.name}</div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
