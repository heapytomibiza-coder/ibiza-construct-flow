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
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 p-4 rounded-lg bg-muted/50 border border-sage-muted/30 flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Search services...</span>
              </div>
              <button className="px-6 py-4 rounded-lg bg-sage/10 border border-sage/30 flex items-center gap-2 hover:bg-sage/20 transition-colors">
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Multiroom Audio", price: 5000, rating: 4.9, reviews: 127 },
                { name: "Home Cinema", price: 8000, rating: 5.0, reviews: 89 },
                { name: "Pool Installation", price: 15000, rating: 4.8, reviews: 156 }
              ].map((service, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-card border border-sage-muted/30 hover:border-copper/50 transition-all hover:shadow-lg"
                >
                  <div className="h-24 rounded-lg bg-gradient-to-br from-sage/20 to-copper/20 mb-3 relative overflow-hidden">
                    <ImageGallery images={[{ id: i }]} columns={2} className="h-full" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-sm flex-1">{service.name}</h4>
                    <BadgeCheck className="h-4 w-4 text-copper" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{service.rating}</span>
                    <span className="text-xs text-muted-foreground">({service.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-copper font-bold text-sm">
                    <Euro className="h-3 w-3" />
                    From €{service.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScreenshotFrame>
      </div>
    </SlideLayout>
  );
};
