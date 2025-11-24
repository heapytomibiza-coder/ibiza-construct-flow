import { SlideLayout, SlideTitle, SlideSubtitle } from "../SlideLayout";
import { Settings, DollarSign, Calendar, MapPin } from "lucide-react";

export const ManageServicesSlide = () => {
  return (
    <SlideLayout>
      <SlideTitle>Manage Your Services</SlideTitle>
      <SlideSubtitle>
        Build your digital storefront with flexible pricing and availability
      </SlideSubtitle>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
          <Settings className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Service Catalog Builder</h4>
          <p className="text-muted-foreground">
            Create and manage your service offerings with custom descriptions and
            requirements
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
          <DollarSign className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Flexible Pricing</h4>
          <p className="text-muted-foreground">
            Set hourly rates, fixed prices, or custom quotes based on project scope
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
          <Calendar className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Availability Calendar</h4>
          <p className="text-muted-foreground">
            Control your schedule and let clients know when you're available
          </p>
        </div>

        <div className="p-6 rounded-xl bg-card border border-sage-muted/30">
          <MapPin className="h-10 w-10 text-copper mb-4" />
          <h4 className="font-bold text-lg mb-2">Service Areas</h4>
          <p className="text-muted-foreground">
            Define geographic coverage and travel fees for different locations
          </p>
        </div>
      </div>
    </SlideLayout>
  );
};
