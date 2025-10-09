import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminQueue } from "@/components/admin/shared/AdminQueue";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

type Job = {
  id: string;
  title: string;
  status: string;
  client_id: string;
  created_at: string;
  budget_range?: string;
  location_type?: string;
  client?: {
    full_name?: string;
    email?: string;
  };
};

export function JobsTable() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs", activeFilter],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          client:profiles!jobs_client_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (activeFilter !== "all") {
        query = query.eq("status", activeFilter);
      }

      const { data } = await query;
      return (data || []) as Job[];
    },
  });

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
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
    { id: "all", label: "All Jobs", count: jobs?.length || 0 },
    { 
      id: "open", 
      label: "Open", 
      count: jobs?.filter(j => j.status === "open").length || 0 
    },
    { 
      id: "in_progress", 
      label: "In Progress", 
      count: jobs?.filter(j => j.status === "in_progress").length || 0 
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: jobs?.filter(j => j.status === "completed").length || 0 
    },
    { 
      id: "cancelled", 
      label: "Cancelled", 
      count: jobs?.filter(j => j.status === "cancelled").length || 0 
    },
  ];

  const columns = [
    {
      key: "title",
      label: "Job Title",
      render: (job: Job) => (
        <div>
          <p className="font-medium">{job.title}</p>
          <p className="text-xs text-muted-foreground">
            {job.client?.full_name || "Unknown Client"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (job: Job) => getStatusBadge(job.status),
    },
    {
      key: "created_at",
      label: "Created",
      render: (job: Job) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminQueue
        title="Jobs"
        description="All platform jobs"
        data={jobs || []}
        columns={columns}
        isLoading={isLoading}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRowClick={handleViewDetails}
        emptyMessage="No jobs found"
      />

      <AdminDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Job Details"
        description="View job information"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
              <p className="text-base">{selectedJob.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Client</Label>
              <p className="text-base">{selectedJob.client?.full_name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground">{selectedJob.client?.email}</p>
            </div>
            {selectedJob.budget_range && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                <p className="text-base">{selectedJob.budget_range}</p>
              </div>
            )}
            {selectedJob.location_type && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location Type</Label>
                <p className="text-base capitalize">{selectedJob.location_type}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <p className="text-base">
                {formatDistanceToNow(new Date(selectedJob.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
      </AdminDrawer>
    </>
  );
}
