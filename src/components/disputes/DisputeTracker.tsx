import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, Clock, MessageSquare, FileText, 
  CheckCircle, User, Building, ArrowRight, 
  Calendar, Euro, Eye, Upload, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dispute {
  id: string;
  disputeNumber: string;
  type: string;
  title: string;
  description: string;
  status: 'open' | 'in_review' | 'escalated' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amountDisputed: number;
  jobTitle: string;
  professionalName: string;
  createdAt: string;
  dueDate: string;
  resolvedAt?: string;
  resolutionAmount?: number;
  lastUpdate: string;
  evidenceCount: number;
  messageCount: number;
  timeline: DisputeTimelineEvent[];
}

interface DisputeTimelineEvent {
  id: string;
  type: 'created' | 'evidence_added' | 'message_sent' | 'status_updated' | 'resolved';
  description: string;
  timestamp: string;
  actor: 'client' | 'professional' | 'mediator';
  actorName: string;
}

const mockDisputes: Dispute[] = [
  {
    id: '1',
    disputeNumber: 'DIS-2024-001',
    type: 'quality',
    title: 'Incomplete bathroom tiling work',
    description: 'The bathroom tiles were not properly aligned and several are already loose after one week.',
    status: 'in_review',
    priority: 'high',
    amountDisputed: 450.00,
    jobTitle: 'Bathroom Renovation',
    professionalName: 'Maria Santos',
    createdAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-01-18T10:30:00Z',
    lastUpdate: '2024-01-16T14:20:00Z',
    evidenceCount: 5,
    messageCount: 3,
    timeline: [
      {
        id: '1',
        type: 'created',
        description: 'Dispute filed for incomplete tiling work',
        timestamp: '2024-01-15T10:30:00Z',
        actor: 'client',
        actorName: 'You'
      },
      {
        id: '2',
        type: 'evidence_added',
        description: 'Photos of loose tiles uploaded',
        timestamp: '2024-01-15T10:35:00Z',
        actor: 'client',
        actorName: 'You'
      },
      {
        id: '3',
        type: 'message_sent',
        description: 'Professional provided explanation and offered to fix',
        timestamp: '2024-01-16T09:15:00Z',
        actor: 'professional',
        actorName: 'Maria Santos'
      },
      {
        id: '4',
        type: 'status_updated',
        description: 'Dispute moved to mediation review',
        timestamp: '2024-01-16T14:20:00Z',
        actor: 'mediator',
        actorName: 'Support Team'
      }
    ]
  },
  {
    id: '2',
    disputeNumber: 'DIS-2024-002',
    type: 'payment',
    title: 'Overcharged for materials',
    description: 'Invoice shows €200 more for materials than originally quoted.',
    status: 'resolved',
    priority: 'medium',
    amountDisputed: 200.00,
    resolutionAmount: 150.00,
    jobTitle: 'Kitchen Plumbing',
    professionalName: 'João Silva',
    createdAt: '2024-01-10T15:45:00Z',
    dueDate: '2024-01-13T15:45:00Z',
    resolvedAt: '2024-01-12T16:30:00Z',
    lastUpdate: '2024-01-12T16:30:00Z',
    evidenceCount: 3,
    messageCount: 7,
    timeline: [
      {
        id: '5',
        type: 'created',
        description: 'Dispute filed for incorrect billing',
        timestamp: '2024-01-10T15:45:00Z',
        actor: 'client',
        actorName: 'You'
      },
      {
        id: '6',
        type: 'resolved',
        description: 'Dispute resolved with €150 refund agreed',
        timestamp: '2024-01-12T16:30:00Z',
        actor: 'mediator',
        actorName: 'Support Team'
      }
    ]
  }
];

export const DisputeTracker = () => {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge className="bg-blue-100 text-blue-700">Open</Badge>;
      case 'in_review': return <Badge className="bg-orange-100 text-orange-700">In Review</Badge>;
      case 'escalated': return <Badge className="bg-red-100 text-red-700">Escalated</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-700">Resolved</Badge>;
      case 'closed': return <Badge className="bg-gray-100 text-gray-700">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="outline" className="text-green-600">Low</Badge>;
      case 'medium': return <Badge variant="outline" className="text-blue-600">Medium</Badge>;
      case 'high': return <Badge variant="outline" className="text-orange-600">High</Badge>;
      case 'urgent': return <Badge variant="outline" className="text-red-600">Urgent</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Overdue';
    if (diffHours <= 24) return `${diffHours}h remaining`;
    return `${Math.ceil(diffHours / 24)}d remaining`;
  };

  const getProgressPercentage = (dispute: Dispute) => {
    const statusProgress = {
      'open': 25,
      'in_review': 50,
      'escalated': 75,
      'resolved': 100,
      'closed': 100
    };
    return statusProgress[dispute.status] || 0;
  };

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'client': return <User className="w-4 h-4 text-blue-600" />;
      case 'professional': return <Building className="w-4 h-4 text-green-600" />;
      case 'mediator': return <CheckCircle className="w-4 h-4 text-orange-600" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const DisputeTimeline = ({ dispute }: { dispute: Dispute }) => (
    <div className="space-y-4">
      <h4 className="font-medium text-charcoal">Dispute Timeline</h4>
      <div className="space-y-4">
        {dispute.timeline.map((event, index) => (
          <div key={event.id} className="relative flex gap-3">
            {index < dispute.timeline.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-sand-dark/20" />
            )}
            
            <div className="w-6 h-6 rounded-full bg-white border-2 border-sand-dark/20 flex items-center justify-center relative z-10">
              {getActorIcon(event.actor)}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{event.description}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">by {event.actorName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Dispute Tracker</h2>
          <p className="text-muted-foreground">Monitor the status of your disputes and resolutions</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <AlertTriangle className="w-4 h-4 mr-2" />
          File New Dispute
        </Button>
      </div>

      {/* Active Disputes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-luxury border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Open Disputes</span>
            </div>
            <div className="text-2xl font-bold text-charcoal">
              {disputes.filter(d => d.status === 'open' || d.status === 'in_review').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">In Review</span>
            </div>
            <div className="text-2xl font-bold text-charcoal">
              {disputes.filter(d => d.status === 'in_review').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-charcoal">
              {disputes.filter(d => d.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-luxury border-copper/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-4 h-4 text-copper" />
              <span className="text-sm font-medium">In Dispute</span>
            </div>
            <div className="text-2xl font-bold text-charcoal">
              €{disputes.filter(d => d.status !== 'resolved' && d.status !== 'closed').reduce((sum, d) => sum + d.amountDisputed, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map(dispute => (
          <Card key={dispute.id} className="card-luxury">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-charcoal">{dispute.title}</h3>
                    {getStatusBadge(dispute.status)}
                    {getPriorityBadge(dispute.priority)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                    <div>
                      <span className="font-medium">Dispute #:</span> {dispute.disputeNumber}
                    </div>
                    <div>
                      <span className="font-medium">Job:</span> {dispute.jobTitle}
                    </div>
                    <div>
                      <span className="font-medium">Professional:</span> {dispute.professionalName}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{dispute.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4 text-muted-foreground" />
                      <span>€{dispute.amountDisputed.toFixed(2)} disputed</span>
                      {dispute.resolutionAmount && (
                        <span className="text-green-600">(€{dispute.resolutionAmount.toFixed(2)} resolved)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{dispute.evidenceCount} evidence files</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span>{dispute.messageCount} messages</span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-charcoal mb-1">
                    €{dispute.amountDisputed.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                      <span className="text-orange-600">{getTimeRemaining(dispute.dueDate)}</span>
                    )}
                    {dispute.resolvedAt && (
                      <span className="text-green-600">
                        Resolved {new Date(dispute.resolvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Resolution Progress</span>
                    <span>{getProgressPercentage(dispute)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(dispute)} />
                </div>
              )}

              {/* Timeline Preview */}
              {selectedDispute?.id === dispute.id && (
                <div className="mt-4 p-4 bg-sand-light/20 rounded-lg">
                  <DisputeTimeline dispute={dispute} />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-sand-dark/20">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDispute(selectedDispute?.id === dispute.id ? null : dispute)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {selectedDispute?.id === dispute.id ? 'Hide' : 'View'} Timeline
                </Button>
                
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Evidence
                </Button>

                {dispute.status === 'in_review' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Request Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resolution Guarantee */}
      <Card className="card-luxury border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Our Resolution Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-charcoal mb-1">24hr Response</h4>
            <p className="text-sm text-muted-foreground">
              Initial response and case assignment within 24 hours
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-charcoal mb-1">Fair Mediation</h4>
            <p className="text-sm text-muted-foreground">
              Neutral mediation process with experienced professionals
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-charcoal mb-1">72hr Resolution</h4>
            <p className="text-sm text-muted-foreground">
              Most disputes resolved within 48-72 hours
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};