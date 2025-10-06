import { useState, useEffect } from 'react';
import { useContentModeration, FlaggedContent } from '@/hooks/useContentModeration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function ContentModerationPanel() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionType, setActionType] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const { 
    loading, 
    getFlaggedContent, 
    reviewContent, 
    takeModerationAction,
    getModerationStats 
  } = useContentModeration();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [content, statsData] = await Promise.all([
      getFlaggedContent(),
      getModerationStats(),
    ]);
    setFlaggedContent(content);
    setStats(statsData);
  };

  const handleReview = async (status: string) => {
    if (!selectedContent) return;

    const success = await reviewContent(
      selectedContent.id,
      status,
      reviewNotes
    );

    if (success) {
      if (actionType && selectedContent.flagged_by) {
        await takeModerationAction(
          actionType,
          reviewNotes,
          selectedContent.flagged_by,
          selectedContent.id
        );
      }
      setSelectedContent(null);
      setReviewNotes('');
      setActionType('');
      loadData();
    }
  };

  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive',
    };
    return colors[severity] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'dismissed': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_flags}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved_today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical_flags}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_actions}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            </TabsList>

            {['pending', 'reviewing', 'resolved', 'dismissed'].map((status) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {flaggedContent
                  .filter((content) => content.status === status)
                  .map((content) => (
                    <Card key={content.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(content.status)}
                              <Badge variant={getSeverityColor(content.severity)}>
                                {content.severity}
                              </Badge>
                              <Badge variant="outline">{content.content_type}</Badge>
                            </div>
                            <div>
                              <div className="font-medium">{content.reason}</div>
                              {content.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {content.description}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Flagged {format(new Date(content.created_at), 'PPp')}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedContent(content)}
                          >
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {flaggedContent.filter((c) => c.status === status).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No {status} content
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getSeverityColor(selectedContent.severity)}>
                    {selectedContent.severity}
                  </Badge>
                  <Badge variant="outline">{selectedContent.content_type}</Badge>
                </div>
                <div className="font-medium mb-1">{selectedContent.reason}</div>
                {selectedContent.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedContent.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dismiss">Dismiss</SelectItem>
                    <SelectItem value="warn_user">Warn User</SelectItem>
                    <SelectItem value="hide">Hide Content</SelectItem>
                    <SelectItem value="delete">Delete Content</SelectItem>
                    <SelectItem value="suspend_user">Suspend User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleReview('dismissed')}
              disabled={loading}
            >
              Dismiss
            </Button>
            <Button
              onClick={() => handleReview('resolved')}
              disabled={loading || !actionType}
            >
              Take Action & Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
