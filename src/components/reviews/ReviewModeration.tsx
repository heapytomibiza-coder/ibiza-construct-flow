import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ReviewModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  const { data: reviewFlags, isLoading } = useQuery({
    queryKey: ['review-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const moderateFlag = useMutation({
    mutationFn: async ({
      flagId,
      action,
      notes
    }: {
      flagId: string;
      action: 'approve' | 'remove' | 'shadow_hide' | 'dismiss';
      notes?: string;
    }) => {
      const { data: flag } = await supabase
        .from('review_flags')
        .select('review_id')
        .eq('id', flagId)
        .single();

      if (!flag) throw new Error("Flag not found");

      await supabase.from('review_flags').update({
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        moderation_action: action,
        admin_notes: notes,
        reviewed_at: new Date().toISOString()
      }).eq('id', flagId);

      await supabase.rpc('log_admin_action', {
        p_action: `review_moderation_${action}`,
        p_entity_type: 'review',
        p_entity_id: flag.review_id,
        p_changes: { flag_id: flagId, action, notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-flags'] });
      toast({ title: "Review Moderated", description: "Action completed successfully" });
      setAdminNotes({});
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  const pendingFlags = reviewFlags?.filter(f => f.status === 'pending') || [];
  const resolvedFlags = reviewFlags?.filter(f => f.status !== 'pending') || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Manage flagged reviews and moderation actions</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending ({pendingFlags.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedFlags.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingFlags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Review Flagged</CardTitle>
                    <CardDescription>
                      {new Date(flag.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {flag.flag_reason.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Admin notes..."
                  value={adminNotes[flag.id] || ""}
                  onChange={(e) => setAdminNotes({ ...adminNotes, [flag.id]: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => moderateFlag.mutate({ flagId: flag.id, action: 'approve', notes: adminNotes[flag.id] })} variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />Approve
                  </Button>
                  <Button onClick={() => moderateFlag.mutate({ flagId: flag.id, action: 'dismiss', notes: adminNotes[flag.id] })} variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />Dismiss
                  </Button>
                  <Button onClick={() => moderateFlag.mutate({ flagId: flag.id, action: 'shadow_hide', notes: adminNotes[flag.id] })} variant="secondary">
                    <EyeOff className="h-4 w-4 mr-2" />Hide
                  </Button>
                  <Button onClick={() => moderateFlag.mutate({ flagId: flag.id, action: 'remove', notes: adminNotes[flag.id] })} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingFlags.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No pending flags</CardContent></Card>}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedFlags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <CardTitle className="text-lg">Resolved</CardTitle>
                <CardDescription>{flag.reviewed_at && new Date(flag.reviewed_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">{flag.moderation_action?.replace(/_/g, ' ')}</Badge>
                {flag.admin_notes && <p className="text-sm text-muted-foreground mt-2">{flag.admin_notes}</p>}
              </CardContent>
            </Card>
          ))}
          {resolvedFlags.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No resolved flags</CardContent></Card>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
