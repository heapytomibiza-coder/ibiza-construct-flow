import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminQueue } from "@/components/admin/shared/AdminQueue";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, AlertCircle } from "lucide-react";
import type { Pack } from "@/types/packs";

type Service = {
  id: string;
  micro: string;
  category: string;
  subcategory: string;
  created_at: string;
  updated_at: string;
};

type ServiceWithPack = Service & {
  activePack?: Pack | null;
  draftPack?: Pack | null;
};

export function ServicesTable() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceWithPack | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      // Fetch services
      const { data: servicesData } = await supabase
        .from("services_catalog")
        .select("*")
        .order("micro");

      if (!servicesData) return [];

      // Fetch all question packs
      const { data: packsData } = await supabase
        .from("question_packs")
        .select("*")
        .order("created_at", { ascending: false });

      // Match services with their packs
      const servicesWithPacks: ServiceWithPack[] = servicesData.map((service) => {
        const servicePacks = (packsData || []).filter(
          (pack) => pack.micro_slug === service.micro
        );

        const activePack = servicePacks.find((p) => p.is_active && p.status === "approved") as unknown as Pack | undefined;
        const draftPack = servicePacks.find((p) => p.status === "draft") as unknown as Pack | undefined;

        return {
          ...service,
          activePack: activePack || null,
          draftPack: draftPack || null,
        };
      });

      return servicesWithPacks;
    },
  });

  const handleViewDetails = (service: ServiceWithPack) => {
    setSelectedService(service);
    setDrawerOpen(true);
  };

  const handleEditQuestions = (packId: string) => {
    navigate(`/admin/questions?edit=${packId}`);
  };

  const getPackStatusBadge = (service: ServiceWithPack) => {
    if (service.activePack) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active v{service.activePack.version}
        </Badge>
      );
    }
    if (service.draftPack) {
      return (
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          Draft v{service.draftPack.version}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        No Pack
      </Badge>
    );
  };

  const filters = [
    { id: "all", label: "All Services", count: services?.length || 0 },
  ];

  const columns = [
    {
      key: "micro",
      label: "Service Name",
      render: (service: ServiceWithPack) => (
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
      render: (service: ServiceWithPack) => (
        <span className="capitalize">{service.category}</span>
      ),
    },
    {
      key: "pack_status",
      label: "Question Pack",
      render: (service: ServiceWithPack) => getPackStatusBadge(service),
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
          <div className="space-y-6">
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

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium text-muted-foreground">Question Pack Status</Label>
              <div className="flex items-center gap-2">
                {getPackStatusBadge(selectedService)}
              </div>

              {selectedService.activePack && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Questions</Label>
                    <p className="text-sm">
                      {selectedService.activePack.content?.questions?.length || 0} questions configured
                    </p>
                  </div>
                  {selectedService.activePack.content?.questions && (
                    <div className="space-y-2">
                      {selectedService.activePack.content.questions.slice(0, 3).map((q, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted/50 rounded">
                          <p className="font-medium">{q.key}</p>
                          <p className="text-xs text-muted-foreground capitalize">{q.type}</p>
                        </div>
                      ))}
                      {selectedService.activePack.content.questions.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{selectedService.activePack.content.questions.length - 3} more questions
                        </p>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={() => handleEditQuestions(selectedService.activePack!.pack_id)}
                    className="w-full"
                  >
                    Edit Questions
                  </Button>
                </div>
              )}

              {!selectedService.activePack && selectedService.draftPack && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    A draft pack is available but not yet active
                  </p>
                  <Button
                    onClick={() => handleEditQuestions(selectedService.draftPack!.pack_id)}
                    variant="secondary"
                    className="w-full"
                  >
                    View Draft
                  </Button>
                </div>
              )}

              {!selectedService.activePack && !selectedService.draftPack && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No question pack configured for this service
                  </p>
                  <Button
                    onClick={() => navigate("/admin/questions")}
                    variant="secondary"
                    className="w-full"
                  >
                    Create Question Pack
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>
    </>
  );
}
