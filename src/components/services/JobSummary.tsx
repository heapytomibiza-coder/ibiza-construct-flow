import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Clock, Euro, FileText, Camera, 
  Calendar, User, Phone, Mail, Wrench 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobSummaryData {
  // Service & Scope
  service: {
    category: string;
    subcategory: string;
    micro: string;
  };
  title: string;
  description?: string;
  
  // Line Items
  lineItems: Array<{
    name: string;
    quantity: number;
    unit: string;
    options?: string[];
  }>;
  
  // Location & Schedule
  location: {
    address: string;
    coordinates?: [number, number];
    accessNotes?: string;
    parkingNotes?: string;
  };
  schedule: {
    type: 'exact' | 'flexible';
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    window?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
  
  // Budget & Pricing
  budget: {
    type: 'fixed' | 'estimate' | 'hourly';
    value?: number;
    range?: { min: number; max: number };
    currency: string;
  };
  
  // Files & Photos
  files?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  
  // Client Info
  client: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  
  // Additional Notes
  notes?: string;
  requirements?: string[];
  
  // Metadata
  jobId: string;
  createdAt: string;
  urgency: 'low' | 'medium' | 'high';
}

interface JobSummaryProps {
  data: JobSummaryData;
  variant?: 'client' | 'professional' | 'compact';
  className?: string;
}

export const JobSummary: React.FC<JobSummaryProps> = ({ 
  data, 
  variant = 'client', 
  className 
}) => {
  const isCompact = variant === 'compact';
  const isProfessional = variant === 'professional';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ES', {
      style: 'currency',
      currency: data.budget.currency || 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      {!isCompact && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-display text-charcoal mb-2">
                {data.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="w-4 h-4" />
                <span>{data.service.category} → {data.service.subcategory} → {data.service.micro}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={cn("text-xs", getUrgencyColor(data.urgency))}>
                {data.urgency.toUpperCase()} PRIORITY
              </Badge>
              <span className="text-xs text-muted-foreground">
                Job #{data.jobId.slice(-8)}
              </span>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn("space-y-6", isCompact && "pt-6")}>
        {isCompact && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">{data.title}</h3>
            <Badge className={cn("text-xs", getUrgencyColor(data.urgency))}>
              {data.urgency.toUpperCase()}
            </Badge>
          </div>
        )}

        {/* Service Scope */}
        {data.description && (
          <div>
            <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-copper" />
              Project Description
            </h4>
            <p className="text-sm text-muted-foreground bg-sand-light p-3 rounded-lg">
              {data.description}
            </p>
          </div>
        )}

        {/* Line Items */}
        {data.lineItems.length > 0 && (
          <div>
            <h4 className="font-medium text-charcoal mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-copper" />
              Work Items
            </h4>
            <div className="space-y-2">
              {data.lineItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-sand-light rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-charcoal">{item.name}</span>
                    {item.options && item.options.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Options: {item.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-charcoal">
                    {item.quantity} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-copper" />
              Location
            </h4>
            <div className="bg-sand-light p-3 rounded-lg space-y-2">
              <p className="text-sm font-medium text-charcoal">{data.location.address}</p>
              {data.location.accessNotes && (
                <p className="text-xs text-muted-foreground">
                  <strong>Access:</strong> {data.location.accessNotes}
                </p>
              )}
              {data.location.parkingNotes && (
                <p className="text-xs text-muted-foreground">
                  <strong>Parking:</strong> {data.location.parkingNotes}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-copper" />
              Schedule
            </h4>
            <div className="bg-sand-light p-3 rounded-lg space-y-2">
              {data.schedule.type === 'exact' ? (
                <>
                  <p className="text-sm font-medium text-charcoal">
                    {data.schedule.startDate && formatDate(data.schedule.startDate)}
                  </p>
                  {data.schedule.startTime && (
                    <p className="text-xs text-muted-foreground">
                      Time: {data.schedule.startTime}
                      {data.schedule.endTime && ` - ${data.schedule.endTime}`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-charcoal">
                  <Badge variant="outline" className="mr-2">FLEXIBLE</Badge>
                  {data.schedule.window || 'Within 2 weeks'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
            <Euro className="w-4 h-4 text-copper" />
            Budget & Pricing
          </h4>
          <div className="bg-sand-light p-3 rounded-lg">
            {data.budget.type === 'fixed' && data.budget.value && (
              <p className="text-lg font-semibold text-charcoal">
                {formatCurrency(data.budget.value)}
                <span className="text-sm font-normal ml-2 text-muted-foreground">Fixed Budget</span>
              </p>
            )}
            {data.budget.type === 'estimate' && data.budget.range && (
              <p className="text-lg font-semibold text-charcoal">
                {formatCurrency(data.budget.range.min)} - {formatCurrency(data.budget.range.max)}
                <span className="text-sm font-normal ml-2 text-muted-foreground">Estimate Range</span>
              </p>
            )}
            {data.budget.type === 'hourly' && data.budget.value && (
              <p className="text-lg font-semibold text-charcoal">
                {formatCurrency(data.budget.value)}/hour
                <span className="text-sm font-normal ml-2 text-muted-foreground">Hourly Rate</span>
              </p>
            )}
          </div>
        </div>

        {/* Files & Photos */}
        {data.files && data.files.length > 0 && (
          <div>
            <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-copper" />
              Files & Photos ({data.files.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.files.map((file, index) => (
                <div 
                  key={index}
                  className="bg-sand-light p-2 rounded-lg text-center"
                >
                  <div className="w-8 h-8 bg-copper/10 rounded mx-auto mb-1 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-copper" />
                  </div>
                  <p className="text-xs text-charcoal font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)}KB
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Info (Professional View Only) */}
        {isProfessional && (
          <div>
            <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-copper" />
              Client Information
            </h4>
            <div className="bg-sand-light p-3 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {data.client.profileImage ? (
                  <img 
                    src={data.client.profileImage} 
                    alt={data.client.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-copper/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-copper" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-charcoal">{data.client.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {data.client.email}
                    </span>
                    {data.client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {data.client.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {(data.notes || data.requirements) && (
          <div>
            <h4 className="font-medium text-charcoal mb-2">Additional Information</h4>
            <div className="space-y-3">
              {data.notes && (
                <div className="bg-sand-light p-3 rounded-lg">
                  <p className="text-sm font-medium text-charcoal mb-1">Special Notes</p>
                  <p className="text-sm text-muted-foreground">{data.notes}</p>
                </div>
              )}
              {data.requirements && data.requirements.length > 0 && (
                <div className="bg-sand-light p-3 rounded-lg">
                  <p className="text-sm font-medium text-charcoal mb-2">Requirements</p>
                  <ul className="space-y-1">
                    {data.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-copper rounded-full mt-1.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!isCompact && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {formatDate(data.createdAt)}</span>
              <span>Job ID: {data.jobId}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};