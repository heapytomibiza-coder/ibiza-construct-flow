import React, { useState } from 'react';
import { useApplicantTracking } from '@/hooks/useApplicantTracking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Eye, 
  Star, 
  Mail, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ApplicantTrackerProps {
  jobId: string;
  onMessageApplicant?: (professionalId: string) => void;
}

export const ApplicantTracker: React.FC<ApplicantTrackerProps> = ({
  jobId,
  onMessageApplicant
}) => {
  const { applicants, loading, updateApplicantStatus, stats, bulkUpdateStatus } = 
    useApplicantTracking(jobId);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());

  const handleStatusUpdate = async (applicantId: string, status: any) => {
    try {
      await updateApplicantStatus(applicantId, status);
      toast.success(`Applicant marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkAction = async (status: any) => {
    try {
      await bulkUpdateStatus(Array.from(selectedApplicants), status);
      toast.success(`${selectedApplicants.size} applicants updated`);
      setSelectedApplicants(new Set());
    } catch (error) {
      toast.error('Failed to update applicants');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedApplicants);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedApplicants(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500';
      case 'viewed': return 'bg-purple-500';
      case 'shortlisted': return 'bg-yellow-500';
      case 'invited': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-2xl font-bold">{stats.new}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-2xl font-bold">{stats.shortlisted}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Invited</p>
              <p className="text-2xl font-bold">{stats.invited}</p>
            </div>
            <Mail className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedApplicants.size > 0 && (
        <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">
            {selectedApplicants.size} applicant(s) selected
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('shortlisted')}
            >
              <Star className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('rejected')}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Applicants List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({applicants.length})</TabsTrigger>
          <TabsTrigger value="applied">New ({stats.new})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applicants.map((applicant) => (
            <Card key={applicant.id} className="p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedApplicants.has(applicant.id)}
                  onChange={() => toggleSelection(applicant.id)}
                  className="mt-1"
                />
                <Avatar>
                  <AvatarImage src={applicant.professional?.avatar_url || undefined} />
                  <AvatarFallback>
                    {applicant.professional?.full_name?.[0] || 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {applicant.professional?.full_name || 'Professional'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Applied {formatDistanceToNow(new Date(applicant.applied_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(applicant.availability_status)}`} />
                        <span className="text-xs capitalize">{applicant.availability_status}</span>
                      </div>
                      <Badge className={getStatusColor(applicant.status)}>
                        {applicant.status}
                      </Badge>
                    </div>
                  </div>
                  {applicant.notes && (
                    <p className="text-sm mt-2 text-muted-foreground">{applicant.notes}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(applicant.id, 'viewed')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMessageApplicant?.(applicant.professional_id)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applied">
          {applicants.filter(a => a.status === 'applied').map((applicant) => (
            <Card key={applicant.id} className="p-4 mb-4">
              {/* Same structure as above */}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="shortlisted">
          {applicants.filter(a => a.status === 'shortlisted').map((applicant) => (
            <Card key={applicant.id} className="p-4 mb-4">
              {/* Same structure as above */}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
