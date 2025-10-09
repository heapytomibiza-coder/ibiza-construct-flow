import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminQueue } from "@/components/admin/shared/AdminQueue";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

type Booking = {
  id: string;
  title: string;
  status: string;
  client_id: string;
  created_at: string;
  budget_range?: string;
  locale?: string;
  client?: {
    full_name?: string;
    email?: string;
  };
};

export function BookingsTable() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings", activeFilter],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (activeFilter !== "all") {
        query = query.eq("status", activeFilter as any);
      }

      const { data } = await query;
      return (data || []) as Booking[];
    },
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      posted: "default",
      matched: "secondary",
      in_progress: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filters = [
    { id: "all", label: "All Bookings", count: bookings?.length || 0 },
    { 
      id: "draft", 
      label: "Draft", 
      count: bookings?.filter(b => b.status === "draft").length || 0 
    },
    { 
      id: "posted", 
      label: "Posted", 
      count: bookings?.filter(b => b.status === "posted").length || 0 
    },
    { 
      id: "matched", 
      label: "Matched", 
      count: bookings?.filter(b => b.status === "matched").length || 0 
    },
    { 
      id: "in_progress", 
      label: "In Progress", 
      count: bookings?.filter(b => b.status === "in_progress").length || 0 
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: bookings?.filter(b => b.status === "completed").length || 0 
    },
    { 
      id: "cancelled", 
      label: "Cancelled", 
      count: bookings?.filter(b => b.status === "cancelled").length || 0 
    },
  ];

  const columns = [
    {
      key: "title",
      label: "Booking Title",
      render: (booking: Booking) => (
        <div>
          <p className="font-medium">{booking.title}</p>
          <p className="text-xs text-muted-foreground">
            {booking.client?.full_name || "Unknown Client"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (booking: Booking) => getStatusBadge(booking.status),
    },
    {
      key: "created_at",
      label: "Created",
      render: (booking: Booking) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminQueue
        title="Bookings"
        description="All platform bookings"
        data={bookings || []}
        columns={columns}
        isLoading={isLoading}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRowClick={handleViewDetails}
        emptyMessage="No bookings found"
      />

      <AdminDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Booking Details"
        description="View booking information"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
              <p className="text-base">{selectedBooking.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Client</Label>
              <p className="text-base">{selectedBooking.client?.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{selectedBooking.client?.email}</p>
            </div>
            {selectedBooking.budget_range && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                <p className="text-base">{selectedBooking.budget_range}</p>
              </div>
            )}
            {selectedBooking.locale && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Language</Label>
                <p className="text-base uppercase">{selectedBooking.locale}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-base">
                {formatDistanceToNow(new Date(selectedBooking.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
      </AdminDrawer>
    </>
  );
}
