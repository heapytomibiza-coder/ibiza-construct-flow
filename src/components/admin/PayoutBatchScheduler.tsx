import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Check, DollarSign, Send, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDualControl } from "@/hooks/useDualControl";

export function PayoutBatchScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const queryClient = useQueryClient();
  const { requiresDualControl, createRequest } = useDualControl();

  // Fetch pending payouts
  const { data: pendingPayouts } = useQuery({
    queryKey: ["pending-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_payouts" as any)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch existing batches
  const { data: batches, isLoading } = useQuery({
    queryKey: ["payout-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_batches" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Create batch
  const createBatch = useMutation({
    mutationFn: async () => {
      if (!pendingPayouts || pendingPayouts.length === 0) {
        throw new Error("No pending payouts to batch");
      }

      const payoutIds = pendingPayouts.map((p: any) => p.id);
      const totalAmount = pendingPayouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      const payload = {
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        payout_ids: payoutIds,
        total_amount: totalAmount,
        currency: "EUR",
      };

      // Check if dual approval required (>€1000)
      if (requiresDualControl("payout_batch", payload)) {
        await createRequest({
          action_type: "payout_batch",
          entity_type: "payout_batch",
          entity_id: crypto.randomUUID(),
          reason: `Payout batch for ${pendingPayouts.length} payouts totaling €${totalAmount.toFixed(2)}`,
          payload,
        });
        return null; // Will require approval
      }

      // Create batch directly if under threshold
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("payout_batches" as any)
        .insert({
          ...payload,
          created_by: user.data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log action
      await supabase.rpc("log_admin_action", {
        p_action: "payout_batch_created",
        p_entity_type: "payout_batch",
        p_entity_id: (data as any).id,
        p_changes: payload,
      });

      return data;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Payout batch created", {
          description: `Scheduled for ${format(selectedDate, "PP")}`,
        });
      } else {
        toast.info("Approval required", {
          description: "Payout batch exceeds €1000 and requires approval from another admin",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["payout-batches"] });
      queryClient.invalidateQueries({ queryKey: ["pending-payouts"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create batch", {
        description: error.message,
      });
    },
  });

  // Approve batch
  const approveBatch = useMutation({
    mutationFn: async (batchId: string) => {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from("payout_batches" as any)
        .update({
          status: "approved",
          approved_by: user.data.user?.id,
        })
        .eq("id", batchId);

      if (error) throw error;

      await supabase.rpc("log_admin_action", {
        p_action: "payout_batch_approved",
        p_entity_type: "payout_batch",
        p_entity_id: batchId,
        p_changes: { approved_by: user.data.user?.id },
      });
    },
    onSuccess: () => {
      toast.success("Batch approved");
      queryClient.invalidateQueries({ queryKey: ["payout-batches"] });
      setSelectedBatch(null);
    },
  });

  const statusColors: Record<string, any> = {
    draft: "secondary",
    approved: "default",
    sent: "outline",
    reconciled: "default",
    failed: "destructive",
  };

  return (
    <div className="space-y-6">
      {/* Create New Batch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Schedule Payout Batch
          </CardTitle>
          <CardDescription>
            {pendingPayouts?.length || 0} pending payouts ready for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal w-[240px]")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => createBatch.mutate()}
              disabled={!pendingPayouts || pendingPayouts.length === 0 || createBatch.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Create Batch ({pendingPayouts?.length || 0} payouts)
            </Button>
          </div>

          {pendingPayouts && pendingPayouts.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total amount:{" "}
              <span className="font-semibold">
                €{pendingPayouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
          <CardDescription>View and manage scheduled payout batches</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : !batches || batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No batches created yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((batch: any) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[batch.status]}>{batch.status}</Badge>
                      <span className="font-medium">
                        {format(new Date(batch.scheduled_date), "PP")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {batch.payout_ids?.length || 0} payouts • €{batch.total_amount.toFixed(2)}
                    </p>
                  </div>

                  {batch.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedBatch(batch)}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payout Batch</DialogTitle>
            <DialogDescription>
              Review and approve this payout batch for processing
            </DialogDescription>
          </DialogHeader>

          {selectedBatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Scheduled Date</p>
                  <p className="font-medium">{format(new Date(selectedBatch.scheduled_date), "PP")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-medium">€{selectedBatch.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payouts</p>
                  <p className="font-medium">{selectedBatch.payout_ids?.length || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedBatch.status]}>{selectedBatch.status}</Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBatch(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => approveBatch.mutate(selectedBatch.id)}
              disabled={approveBatch.isPending}
            >
              Approve Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
