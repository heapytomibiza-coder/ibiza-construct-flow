import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { BadgeCheck, MapPin, Euro, Clock } from "lucide-react";

export const FindLeadsSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Find Quality Leads</SlideTitle>
      <SlideSubtitle>See only jobs that match YOUR services and availability</SlideSubtitle>

      <div className="mt-12 space-y-4">
        {[
          { title: "Multiroom Audio Installation", budget: "€8,000 - €12,000", location: "Santa Eulalia", urgent: true },
          { title: "Home Cinema Setup", budget: "€15,000+", location: "Ibiza Town", urgent: false },
          { title: "Outdoor Audio System", budget: "€5,000 - €8,000", location: "San Antonio", urgent: false },
        ].map((job, index) => (
          <div
            key={index}
            className="p-6 rounded-xl bg-card border border-sage-muted/30 hover:border-copper/50 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold">{job.title}</h4>
                  {job.urgent && (
                    <span className="px-3 py-1 rounded-full bg-copper/20 text-copper text-xs font-medium">
                      URGENT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    {job.budget}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted 2 hours ago
                  </div>
                </div>
              </div>
              <BadgeCheck className="h-6 w-6 text-copper" />
            </div>
            <button className="w-full py-3 rounded-lg bg-copper text-white hover:bg-copper/90 transition-colors font-medium">
              Submit Quote
            </button>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
};
