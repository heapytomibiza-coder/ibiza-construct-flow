import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffViewer } from "./DiffViewer";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface JobEditModalProps {
  open: boolean;
  onClose: () => void;
  job: any;
}

export function JobEditModal({ open, onClose, job }: JobEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedJob, setEditedJob] = useState(job);
  const [changeReason, setChangeReason] = useState("");

  const editJob = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call edge function to handle versioning and update
      const { data, error } = await supabase.functions.invoke('admin-edit-job-version', {
        body: {
          jobId: job.id,
          newData: editedJob,
          changeReason,
          changedBy: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', job.id] });
      toast({
        title: "Job Updated",
        description: "Job has been updated successfully with version history"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!changeReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this change",
        variant: "destructive"
      });
      return;
    }

    editJob.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job: {job.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Fields</TabsTrigger>
            <TabsTrigger value="preview">Preview Changes</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Changes will be versioned and logged. All edits require a reason.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedJob.title || ""}
                  onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedJob.description || ""}
                  onChange={(e) => setEditedJob({ ...editedJob, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md"
                    value={editedJob.status || "open"}
                    onChange={(e) => setEditedJob({ ...editedJob, status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={editedJob.budget || ""}
                    onChange={(e) => setEditedJob({ ...editedJob, budget: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Change Reason (Required)</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this change is necessary..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Review the changes below before saving. Modified fields are highlighted.
                </AlertDescription>
              </Alert>

              <DiffViewer 
                before={job} 
                after={editedJob}
                highlightFields={['title', 'description', 'status', 'budget']}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={editJob.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={editJob.isPending}>
            {editJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
