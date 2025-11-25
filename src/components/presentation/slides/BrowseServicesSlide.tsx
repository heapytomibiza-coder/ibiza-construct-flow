import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Search, Filter, Star, Euro, BadgeCheck } from "lucide-react";
import { ScreenshotFrame } from "../ScreenshotFrame";
import { ImageGallery } from "../ImageGallery";

export const BrowseServicesSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Browse Services</SlideTitle>
      <SlideSubtitle>
        Shop like Amazon - Browse, compare, and book services instantly
      </SlideSubtitle>

      <div className="mt-12">
      <ScreenshotFrame url="constructive-solutions-ibiza.com/services">
        <img 
          src="/screenshots/services-grid.png" 
          alt="Browse Services"
          className="w-full h-auto"
        />
      </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
