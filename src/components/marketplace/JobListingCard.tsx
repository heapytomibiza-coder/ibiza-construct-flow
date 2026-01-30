import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, Clock, Euro, User, Calendar, 
  MessageSquare, Heart, Share2, Sparkles, Eye, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobPaymentWidget } from '@/components/jobs/JobPaymentWidget';
import { JobDetailsModal } from './JobDetailsModal';
import { ServiceCategoryBadge } from './ServiceCategoryBadge';
import { JobMetadataBadges } from './JobMetadataBadges';
import { getServiceVisuals } from '@/data/serviceCategoryImages';
import { JobMatchScore } from './JobMatchScore';
import { JobIntelligenceBar } from './JobIntelligenceBar';
import { QuickApplyButton } from './QuickApplyButton';

interface JobListingCardProps {
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
    answers?: any;
    micro_id?: string;
    category?: string;
    subcategory?: string;
    micro?: string;
  };
  onSendOffer?: (jobId: string) => void;
  onMessage?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  className?: string;
  viewMode?: 'card' | 'compact';
  /** When true, hides professional actions (Apply/Message) for public visitors */
  previewMode?: boolean;
}

export const JobListingCard: React.FC<JobListingCardProps> = ({
  job,
  onSendOffer,
  onMessage,
  onSave,
  className,
  viewMode = 'card',
  previewMode = false
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const isNew = new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get service visuals
  const serviceVisuals = getServiceVisuals(job.category);
  const heroImage = job.answers?.extras?.photos?.[0] || serviceVisuals.hero;
  const photoCount = job.answers?.extras?.photos?.length || 0;
  const answerCount = job.answers?.microAnswers ? Object.keys(job.answers.microAnswers).length : 0;
  
  // Calculate match score (mock logic - replace with real matching algorithm)
  const matchScore = Math.floor(Math.random() * (95 - 60) + 60);
  const matchBreakdown = {
    skillMatch: Math.floor(Math.random() * (100 - 70) + 70),
    locationMatch: job.location ? Math.floor(Math.random() * (100 - 60) + 60) : undefined,
    budgetMatch: Math.floor(Math.random() * (100 - 50) + 50),
    availabilityMatch: Math.floor(Math.random() * (100 - 80) + 80)
  };
  
  // Intelligence data (mock - replace with real-time data)
  const viewCount = Math.floor(Math.random() * 10) + 1;
  const quoteCount = Math.floor(Math.random() * 5);
  const clientActivity = isNew ? 'active' : Math.random() > 0.5 ? 'recent' : 'inactive';
  const successProbability = matchScore > 75 ? Math.floor(Math.random() * (85 - 65) + 65) : undefined;
  const suggestedQuote = Math.round(job.budget_value * (0.9 + Math.random() * 0.2));
  
  if (viewMode === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                {isNew && (
                  <Badge className="bg-gradient-to-r from-copper to-copper-dark text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    NEW
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{job.status}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {job.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-medium">
                    €{job.budget_value}
                    {job.budget_type === 'hourly' && '/hr'}
                  </span>
                </div>
                
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location.area}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>

                {/* Payment status widget */}
                <JobPaymentWidget jobId={job.id} />
              </div>
            </div>
            
            {!previewMode && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSendOffer?.(job.id)}
                >
                  Send Offer
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col", className)}>
      {/* Hero Image Section */}
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", serviceVisuals.color, "opacity-60")} />
        
        {/* Floating badges on hero */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <ServiceCategoryBadge
              category={job.category}
              subcategory={job.subcategory}
              micro={job.micro}
              icon={serviceVisuals.icon}
            />
            <JobMatchScore 
              score={matchScore} 
              breakdown={matchBreakdown}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            {isNew && (
              <Badge className="backdrop-blur-md bg-background/90 border-2 border-background shadow-lg animate-pulse">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                NEW
              </Badge>
            )}
            <Badge 
              variant={job.status === 'open' ? 'default' : 'secondary'}
              className="backdrop-blur-md bg-background/90 border-2 border-background shadow-lg capitalize"
            >
              {job.status}
            </Badge>
          </div>
        </div>

        {/* Photo count indicator */}
        {photoCount > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-4 right-4 backdrop-blur-md bg-background/90 border-2 border-background shadow-lg"
          >
            📷 {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </Badge>
        )}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 leading-tight">
          {job.title}
        </h3>

        {/* Client Info */}
        <div className="flex items-center gap-3 mb-5 pb-5 border-b">
          <Avatar className="w-12 h-12 ring-2 ring-background">
            <AvatarImage src={job.client.avatar} alt={job.client.name} />
            <AvatarFallback className="bg-gradient-hero text-white">
              {job.client.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{job.client.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              {job.client.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">{job.client.rating.toFixed(1)}</span>
                </div>
              )}
              {job.client.jobs_completed && (
                <span>• {job.client.jobs_completed} jobs completed</span>
              )}
            </div>
          </div>
          <JobPaymentWidget jobId={job.id} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-5 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        {/* Intelligence Bar */}
        <JobIntelligenceBar
          viewCount={viewCount}
          quoteCount={quoteCount}
          clientActivity={clientActivity as any}
          successProbability={successProbability}
          averageQuote={suggestedQuote}
          className="mb-5"
        />

        {/* Project Details Section */}
        <div className="space-y-3 mb-5">
          <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Budget</span>
              <JobMetadataBadges
                startDate={job.answers?.logistics?.startDate || job.answers?.logistics?.preferredDate}
                photoCount={photoCount}
                answerCount={answerCount}
                className="flex-wrap justify-end gap-1"
              />
            </div>
            <p className="font-bold text-2xl text-primary">
              €{job.budget_value}
              {job.budget_type === 'hourly' && (
                <span className="text-sm font-normal text-muted-foreground ml-1">/hour</span>
              )}
            </p>
          </div>
          
          {job.location && (
            <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Location</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-base">{job.location.area}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 mt-auto border-t">
          {!previewMode && (
            <>
              <Button
                variant="ghost"
                size="default"
                onClick={() => onSave?.(job.id)}
                className="px-4"
              >
                <Heart className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="default"
                onClick={() => onMessage?.(job.id)}
                className="px-4"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowDetailsModal(true)}
            className="flex-1"
          >
            View Details
          </Button>
          
          {!previewMode && (
            <QuickApplyButton
              jobId={job.id}
              jobTitle={job.title}
              suggestedQuote={suggestedQuote}
              onSuccess={() => onSendOffer?.(job.id)}
              className="flex-1"
            />
          )}
        </div>
        
        <JobDetailsModal
          job={job}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onApply={onSendOffer}
          onMessage={onMessage}
        />
      </CardContent>
    </Card>
  );
};