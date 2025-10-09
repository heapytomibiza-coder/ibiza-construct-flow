import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminQueue } from "@/components/admin/shared/AdminQueue";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Label } from "@/components/ui/label";

type Service = {
  id: string;
  micro: string;
  category: string;
  subcategory: string;
  created_at: string;
  updated_at: string;
};

export function ServicesTable() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const query = supabase
        .from("services_catalog")
        .select("*")
        .order("micro");

      const { data } = await query;
      return (data || []) as Service[];
    },
  });

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setDrawerOpen(true);
  };

  const filters = [
    { id: "all", label: "All Services", count: services?.length || 0 },
  ];

  const columns = [
    {
      key: "micro",
      label: "Service Name",
      render: (service: Service) => (
        <div>
          <p className="font-medium">{service.micro}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {service.subcategory}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (service: Service) => (
        <span className="capitalize">{service.category}</span>
      ),
    },
  ];

  return (
    <>
      <AdminQueue
        title="Services"
        description="Manage platform service offerings"
        data={services || []}
        columns={columns}
        isLoading={isLoading}
        filters={filters}
        activeFilter="all"
        onFilterChange={() => {}}
        onRowClick={handleViewDetails}
        emptyMessage="No services found"
      />

      <AdminDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Service Details"
        description="View service information"
      >
        {selectedService && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Service</Label>
              <p className="text-base">{selectedService.micro}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Category</Label>
              <p className="text-base capitalize">{selectedService.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Subcategory</Label>
              <p className="text-base capitalize">{selectedService.subcategory}</p>
            </div>
          </div>
        )}
      </AdminDrawer>
    </>
  );
}
