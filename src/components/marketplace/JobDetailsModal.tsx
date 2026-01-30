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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  MapPin, Clock, Euro, User, Calendar, 
  Briefcase, FileText, CheckCircle, Send,
  Image, Phone, Video, Home, AlertCircle, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { JobPhotoGallery } from './JobPhotoGallery';
import { ServiceCategoryBadge } from './ServiceCategoryBadge';
import { getServiceVisuals } from '@/data/serviceCategoryImages';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';

interface JobDetailsModalProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget_type: 'fixed' | 'hourly';
    budget_value: number;
    location?: {
      address?: string;
      area?: string;
    };
    created_at: string;
    status: string;
    client: {
      name: string;
      avatar?: string;
      rating?: number;
      jobs_completed?: number;
    };
    answers?: {
      microAnswers?: Record<string, any>;
      logistics?: {
        location?: string;
        customLocation?: string;
        startDate?: string;
        completionDate?: string;
        preferredDate?: string;
        alternativeDate?: string;
        dateFlexibility?: string;
        consultationType?: 'site_visit' | 'phone_call' | 'video_call';
        consultationDate?: string;
        consultationTime?: string;
        accessDetails?: string[];
        budgetRange?: string;
      };
      extras?: {
        photos?: string[];
        notes?: string;
        permitsConcern?: boolean;
      };
    };
    micro_id?: string;
    category?: string;
    subcategory?: string;
    micro?: string;
  };
  open: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  onMessage?: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  open,
  onClose,
  onApply,
  onMessage
}) => {
  const { user, profile } = useAuth();
  const gate = useAuthGate();
  
  const daysPosted = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatAccessDetails = (details?: string[]) => {
    if (!details || details.length === 0) return null;
    return details;
  };

  const getConsultationIcon = (type?: string) => {
    switch (type) {
      case 'site_visit': return Home;
      case 'phone_call': return Phone;
      case 'video_call': return Video;
      default: return Calendar;
    }
  };

  const getConsultationLabel = (type?: string) => {
    switch (type) {
      case 'site_visit': return 'Site Visit';
      case 'phone_call': return 'Phone Call';
      case 'video_call': return 'Video Call';
      default: return 'Consultation';
    }
  };

  const microAnswers = job.answers?.microAnswers;
  const logistics = job.answers?.logistics;
  const extras = job.answers?.extras;
  const serviceVisuals = getServiceVisuals(job.category);

  const hasMicroAnswers = microAnswers && Object.keys(microAnswers).length > 0;
  const hasLogistics = logistics && (logistics.location || logistics.customLocation || logistics.accessDetails);
  const hasSchedule = logistics && (logistics.startDate || logistics.completionDate || logistics.preferredDate || logistics.consultationType);
  const hasExtras = extras && (extras.photos?.length || extras.notes || extras.permitsConcern);
  const hasPhotos = extras?.photos && extras.photos.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-0">
            {/* Photo Gallery */}
            {hasPhotos && (
              <JobPhotoGallery photos={extras.photos!} className="mb-0" />
            )}

            {/* Service Category Header */}
            {job.category && (
              <div className={cn(
                "p-6 bg-gradient-to-r",
                serviceVisuals.color,
                "text-white"
              )}>
                <ServiceCategoryBadge
                  category={job.category}
                  subcategory={job.subcategory}
                  micro={job.micro}
                  icon={serviceVisuals.icon}
                  className="mb-3 text-white border-white/20"
                />
                <h4 className="text-sm font-medium opacity-90">
                  {job.category} → {job.subcategory} → {job.micro}
                </h4>
              </div>
            )}

            <div className="p-8">
            {/* Header Section */}
            <DialogHeader className="space-y-5 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge 
                    variant={job.status === 'open' ? 'default' : 'secondary'}
                    className="capitalize font-semibold"
                  >
                    {job.status}
                  </Badge>
                  {daysPosted === 0 ? (
                    <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white font-semibold">
                      Posted Today
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-medium">
                      Posted {daysPosted} {daysPosted === 1 ? 'day' : 'days'} ago
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-3xl font-bold leading-tight">
                  {job.title}
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Client Info Card */}
            <Card className="mb-8 border-2 bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Client</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {job.client.avatar ? (
                      <img src={job.client.avatar} alt={job.client.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      job.client.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{job.client.name}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      {job.client.rating && (
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="text-yellow-500 text-base">★</span>
                          <span className="text-foreground">{job.client.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">rating</span>
                        </div>
                      )}
                      {job.client.jobs_completed && (
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-foreground">{job.client.jobs_completed}</span>
                          <span className="text-muted-foreground">jobs done</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Location Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-primary/30 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Euro className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-3xl font-bold text-primary leading-none">
                        €{job.budget_value}
                        {job.budget_type === 'hourly' && (
                          <span className="text-lg font-semibold text-muted-foreground ml-1">/hr</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize font-medium">
                    {job.budget_type} price
                  </Badge>
                </CardContent>
              </Card>

              {job.location && (
                <Card className="border-2 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                        <p className="text-xl font-bold leading-tight">{job.location.area}</p>
                      </div>
                    </div>
                    {job.location.address && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {job.location.address}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator className="my-8" />

            {/* Job Description */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">What the Client Needs</h3>
              </div>
              <Card className="bg-muted/30 border-0">
                <CardContent className="p-6">
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Requirements Accordion */}
            {(hasMicroAnswers || hasLogistics || hasSchedule || hasExtras) && (
              <>
                <Separator className="my-8" />
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-6">Project Details</h3>
                  <Accordion type="multiple" defaultValue={["scope", "logistics", "schedule", "extras"]} className="w-full space-y-4">
                    
                    {/* Scope & Specifications */}
                    {hasMicroAnswers && (
                      <AccordionItem value="scope" className="border-2 rounded-xl px-6 shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-lg">Scope & Specifications</h4>
                              <p className="text-sm text-muted-foreground font-normal">
                                Service-specific requirements
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-6">
                          <div className="space-y-3">
                            {Object.entries(microAnswers).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-semibold capitalize mb-1.5 text-base">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Site & Logistics */}
                    {hasLogistics && (
                      <AccordionItem value="logistics" className="border-2 rounded-xl px-6 shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-lg">Site & Logistics</h4>
                              <p className="text-sm text-muted-foreground font-normal">
                                Location and access details
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            {(logistics.location || logistics.customLocation) && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  Location
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {logistics.customLocation || logistics.location}
                                </p>
                              </div>
                            )}
                            {logistics.accessDetails && formatAccessDetails(logistics.accessDetails) && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Home className="w-4 h-4 text-primary" />
                                  Access Details
                                </h4>
                                <ul className="space-y-1">
                                  {formatAccessDetails(logistics.accessDetails)?.map((detail, idx) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      <span className="capitalize">{detail.replace(/_/g, ' ')}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {logistics.budgetRange && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Euro className="w-4 h-4 text-primary" />
                                  Budget Range
                                </h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {logistics.budgetRange.replace(/_/g, ' ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Schedule & Timeline */}
                    {hasSchedule && (
                      <AccordionItem value="schedule" className="border-2 rounded-xl px-6 shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-lg">Schedule & Timeline</h4>
                              <p className="text-sm text-muted-foreground font-normal">
                                Project timing and consultation
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            {(logistics.startDate || logistics.preferredDate) && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  Start Date
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(logistics.startDate || logistics.preferredDate)}
                                </p>
                                {logistics.dateFlexibility && (
                                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                                    Flexibility: {logistics.dateFlexibility.replace(/_/g, ' ')}
                                  </p>
                                )}
                              </div>
                            )}
                            {(logistics.completionDate || logistics.alternativeDate) && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-primary" />
                                  Completion Date
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(logistics.completionDate || logistics.alternativeDate)}
                                </p>
                              </div>
                            )}
                            {logistics.consultationType && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  {React.createElement(getConsultationIcon(logistics.consultationType), {
                                    className: "w-4 h-4 text-primary"
                                  })}
                                  Consultation
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {getConsultationLabel(logistics.consultationType)}
                                </p>
                                {logistics.consultationDate && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(logistics.consultationDate)}
                                    {logistics.consultationTime && ` at ${logistics.consultationTime}`}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {/* Photos & Additional Notes */}
                    {hasExtras && (
                      <AccordionItem value="extras" className="border rounded-lg mb-3 px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Image className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Photos & Additional Notes</h3>
                                {extras.photos && extras.photos.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {extras.photos.length} {extras.photos.length === 1 ? 'photo' : 'photos'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Reference images and extra information
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-4">
                            {extras.photos && extras.photos.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Image className="w-4 h-4 text-primary" />
                                  Reference Photos
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {extras.photos.map((photo, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors">
                                      <img
                                        src={photo}
                                        alt={`Reference photo ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {extras.notes && (
                              <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Additional Notes
                                </h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {extras.notes}
                                </p>
                              </div>
                            )}
                            {extras.permitsConcern && (
                              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-medium text-yellow-700 mb-1">
                                      Permits Required
                                    </h4>
                                    <p className="text-sm text-yellow-700/80">
                                      This project may require permits or regulatory approval
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
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
                variant="outline"
                onClick={() => {
                  // Gate: require professional role to message
                  const canProceed = gate(user, profile?.active_role, {
                    requiredRole: 'professional',
                    reason: 'Sign in as a professional to message clients',
                  });
                  if (!canProceed) return;
                  
                  onMessage?.(job.id);
                }}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button
                onClick={() => {
                  // Gate: require professional role to apply
                  const canProceed = gate(user, profile?.active_role, {
                    requiredRole: 'professional',
                    reason: 'Sign in as a professional to apply for jobs',
                  });
                  if (!canProceed) return;
                  
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
