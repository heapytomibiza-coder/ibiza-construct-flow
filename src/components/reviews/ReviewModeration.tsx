import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, XCircle, Flag, Loader2 } from 'lucide-react';
import { useReviewManagement } from '@/hooks/useReviewManagement';
import { useState } from 'react';

export const ReviewModeration = () => {
  const { reports, moderationQueue, loading, resolveReport, moderateReview } = useReviewManagement();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading && reports.length === 0 && moderationQueue.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Moderation</h2>
        <p className="text-muted-foreground">
          Manage reported reviews and moderation queue
        </p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="h-4 w-4" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Moderation Queue ({moderationQueue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending reports</p>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          report.status === 'pending' ? 'default' :
                          report.status === 'resolved' ? 'secondary' : 'outline'
                        }>
                          {report.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">Reason: {report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="space-y-3 pt-3 border-t">
                      {selectedReport === report.id ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Resolution notes (optional)"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                resolveReport(report.id, 'resolved', resolutionNotes);
                                setSelectedReport(null);
                                setResolutionNotes('');
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                resolveReport(report.id, 'dismissed', resolutionNotes);
                                setSelectedReport(null);
                                setResolutionNotes('');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReport(null);
                                setResolutionNotes('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(report.id)}
                        >
                          Take Action
                        </Button>
                      )}
                    </div>
                  )}

                  {report.resolution_notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium">Resolution Notes:</p>
                      <p className="text-sm text-muted-foreground">{report.resolution_notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          {moderationQueue.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Moderation queue is empty</p>
            </Card>
          ) : (
            moderationQueue.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                        {item.auto_flagged && (
                          <Badge variant="outline">Auto-flagged</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.flags.map((flag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {flag.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Flagged {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <Textarea
                      placeholder="Moderator notes (optional)"
                      value={moderatorNotes}
                      onChange={(e) => setModeratorNotes(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          moderateReview(item.id, 'approved', moderatorNotes);
                          setModeratorNotes('');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          moderateReview(item.id, 'rejected', moderatorNotes);
                          setModeratorNotes('');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
