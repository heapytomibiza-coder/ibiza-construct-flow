import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Search, Filter, Star, Euro } from "lucide-react";

export const BrowseServicesSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Browse Services</SlideTitle>
      <SlideSubtitle>
        Shop like Amazon - Browse, compare, and book services instantly
      </SlideSubtitle>

      <div className="mt-12 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-sage-muted/30 hover:border-copper/50 transition-all hover:shadow-lg"
            >
              <div className="h-32 rounded-lg bg-gradient-to-br from-sage/20 to-copper/20 mb-4" />
              <h4 className="font-bold mb-2">Premium Service {i}</h4>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-sm text-muted-foreground">(127)</span>
              </div>
              <div className="flex items-center gap-2 text-copper font-bold">
                <Euro className="h-4 w-4" />
                From €{i * 500}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
};
