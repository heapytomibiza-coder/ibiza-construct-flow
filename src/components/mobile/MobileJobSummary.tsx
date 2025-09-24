import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, MapPin, Euro, FileText, User, 
  Star, Phone, Mail, Settings, Camera 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MobileJobSummaryData {
  id: string;
  title: string;
  description?: string;
  category: string;
  
  // Schedule
  schedule: {
    type: 'exact' | 'flexible';
    date?: string;
    time?: string;
    window?: string;
    urgency: 'low' | 'medium' | 'high';
  };
  
  // Location
  location: {
    address: string;
    propertyType?: string;
    accessNotes?: string;
  };
  
  // Budget
  budget?: {
    type: 'range' | 'fixed' | 'hourly';
    value?: string;
    currency: string;
  };
  
  // Client (for professional view)
  client?: {
    name: string;
    email: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
  };
  
  // Status & Metadata
  status: 'draft' | 'posted' | 'in-progress' | 'completed';
  createdAt: string;
  urgency: 'low' | 'medium' | 'high';
  photos?: string[];
}

interface MobileJobSummaryProps {
  data: MobileJobSummaryData;
  variant?: 'client' | 'professional' | 'compact';
  className?: string;
  showActions?: boolean;
  onAction?: (action: string) => void;
}

export const MobileJobSummary = ({ 
  data, 
  variant = 'client', 
  className,
  showActions = false,
  onAction 
}: MobileJobSummaryProps) => {
  const isCompact = variant === 'compact';
  const isProfessional = variant === 'professional';

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': 
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': 
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default: 
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className={cn("w-full", className)}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground leading-tight">
              {data.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {data.category}
              </Badge>
              <Badge className={cn("text-xs border", getUrgencyColor(data.urgency))}>
                {data.urgency.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          {!isCompact && (
            <div className="flex flex-col items-end gap-1">
              <Badge className={cn("text-xs border", getStatusColor(data.status))}>
                {data.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                #{data.id.slice(-6)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {data.description && !isCompact && (
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.description}
            </p>
          </div>
        )}

        {/* Key Details Grid */}
        <div className="space-y-3">
          {/* Schedule */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Schedule</div>
              {data.schedule.type === 'exact' ? (
                <div className="text-sm text-muted-foreground">
                  {data.schedule.date && formatDate(data.schedule.date)}
                  {data.schedule.time && ` at ${data.schedule.time}`}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Flexible - {data.schedule.window || 'Open timing'}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground">Location</div>
              <div className="text-sm text-muted-foreground">
                {data.location.address}
                {data.location.propertyType && (
                  <span className="ml-1">({data.location.propertyType})</span>
                )}
              </div>
              {data.location.accessNotes && (
                <div className="text-xs text-muted-foreground mt-1">
                  Access: {data.location.accessNotes}
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          {data.budget && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Euro className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">Budget</div>
                <div className="text-sm text-muted-foreground">
                  {data.budget.value || 'Open to offers'}
                </div>
              </div>
            </div>
          )}

          {/* Client Info (Professional View) */}
          {isProfessional && data.client && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">Client</div>
                <div className="text-sm text-muted-foreground">
                  {data.client.name}
                  {data.client.rating && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{data.client.rating}</span>
                      <span>({data.client.reviewCount || 0})</span>
                    </span>
                  )}
                </div>
                
                {/* Contact Options */}
                <div className="flex items-center gap-3 mt-2">
                  {data.client.phone && (
                    <button
                      onClick={() => onAction?.('call')}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                  )}
                  <button
                    onClick={() => onAction?.('message')}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Photos */}
          {data.photos && data.photos.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">Photos</div>
                <div className="text-sm text-muted-foreground">
                  {data.photos.length} file{data.photos.length > 1 ? 's' : ''} attached
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="pt-3 border-t border-border">
            <div className="flex gap-2">
              {variant === 'professional' ? (
                <>
                  <button
                    onClick={() => onAction?.('quote')}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium min-h-[44px]"
                  >
                    Send Quote
                  </button>
                  <button
                    onClick={() => onAction?.('details')}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium min-h-[44px]"
                  >
                    Details
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onAction?.('edit')}
                    className="flex-1 border border-border py-2 px-4 rounded-lg text-sm font-medium min-h-[44px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onAction?.('view')}
                    className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg text-sm font-medium min-h-[44px]"
                  >
                    View Offers
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isCompact && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {formatDate(data.createdAt)}</span>
              <span>Job #{data.id.slice(-8)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};