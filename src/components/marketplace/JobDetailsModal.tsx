import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, Clock, Euro, User, Calendar, 
  Briefcase, FileText, CheckCircle, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobDetailsModalProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget_type: 'fixed' | 'hourly';
    budget_value: number;
    location?: {
      address: string;
      area: string;
    };
    created_at: string;
    status: string;
    client: {
      name: string;
      avatar?: string;
      rating?: number;
      jobs_completed?: number;
    };
    answers?: any;
    micro_id?: string;
  };
  open: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  open,
  onClose,
  onApply
}) => {
  const daysPosted = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Header Section */}
            <DialogHeader className="space-y-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-2">
                    {job.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={job.status === 'open' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {job.status}
                    </Badge>
                    {daysPosted === 0 ? (
                      <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white">
                        Posted Today
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Posted {daysPosted} {daysPosted === 1 ? 'day' : 'days'} ago
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Client Info Card */}
            <Card className="mb-6 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-white text-2xl font-bold">
                    {job.client.avatar ? (
                      <img src={job.client.avatar} alt={job.client.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      job.client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.client.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {job.client.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{job.client.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {job.client.jobs_completed && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{job.client.jobs_completed} jobs completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Location Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Euro className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-2xl font-bold text-primary">
                        €{job.budget_value}
                        {job.budget_type === 'hourly' && (
                          <span className="text-sm font-normal">/hour</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {job.budget_type} price
                  </Badge>
                </CardContent>
              </Card>

              {job.location && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-lg font-semibold">{job.location.area}</p>
                      </div>
                    </div>
                    {job.location.address && (
                      <p className="text-sm text-muted-foreground">
                        {job.location.address}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator className="my-6" />

            {/* Job Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Job Description</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements & Details */}
            {job.answers && Object.keys(job.answers).length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Additional Requirements</h3>
                  </div>
                  <div className="grid gap-3">
                    {Object.entries(job.answers).map(([key, value]) => (
                      <Card key={key} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium capitalize mb-1">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {String(value)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator className="my-6" />

            {/* Timeline Info */}
            <div className="mb-6">
              <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="font-semibold">
                        {new Date(job.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{job.status}</p>
                    </div>
                    <div>
                      <User className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Applicants</p>
                      <p className="font-semibold">View offers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onApply?.(job.id);
                  onClose();
                }}
                className="flex-1 bg-gradient-hero text-white"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
