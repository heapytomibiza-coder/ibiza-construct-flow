import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, CheckCircle, Clock, AlertTriangle, 
  Euro, Calendar, User, Building, ArrowRight,
  Play, Pause, Check, X, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscrowMilestone {
  id: string;
  contractId: string;
  milestoneNumber: number;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'disputed';
  completedDate?: string;
  dueDate?: string;
  requirements?: string[];
}

interface EscrowContract {
  id: string;
  jobTitle: string;
  professionalName: string;
  totalAmount: number;
  escrowStatus: 'none' | 'funded' | 'released' | 'refunded';
  milestones: EscrowMilestone[];
  fundedDate?: string;
  releaseDate?: string;
  disputeCount: number;
}

const mockContracts: EscrowContract[] = [
  {
    id: '1',
    jobTitle: 'Bathroom Renovation Project',
    professionalName: 'Maria Santos',
    totalAmount: 2850.00,
    escrowStatus: 'funded',
    fundedDate: '2024-01-10',
    disputeCount: 0,
    milestones: [
      {
        id: '1',
        contractId: '1',
        milestoneNumber: 1,
        title: 'Initial Deposit & Materials',
        description: 'Secure materials and begin demolition work',
        amount: 950.00,
        status: 'completed',
        completedDate: '2024-01-12',
        dueDate: '2024-01-15',
        requirements: ['Demolition completed', 'Materials delivered', 'Progress photos provided']
      },
      {
        id: '2',
        contractId: '1',
        milestoneNumber: 2,
        title: 'Plumbing & Electrical',
        description: 'Complete all plumbing and electrical installations',
        amount: 900.00,
        status: 'in_progress',
        dueDate: '2024-01-25',
        requirements: ['All pipes installed', 'Electrical wiring completed', 'Inspection passed']
      },
      {
        id: '3',
        contractId: '1',
        milestoneNumber: 3,
        title: 'Tiling & Fixtures',
        description: 'Install tiles, fixtures, and complete finishing work',
        amount: 1000.00,
        status: 'pending',
        dueDate: '2024-02-05',
        requirements: ['All tiles installed', 'Fixtures mounted', 'Final cleaning completed']
      }
    ]
  },
  {
    id: '2',
    jobTitle: 'Kitchen Renovation',
    professionalName: 'João Silva',
    totalAmount: 4200.00,
    escrowStatus: 'funded',
    fundedDate: '2024-01-08',
    disputeCount: 1,
    milestones: [
      {
        id: '4',
        contractId: '2',
        milestoneNumber: 1,
        title: 'Cabinet Installation',
        description: 'Install all kitchen cabinets and countertops',
        amount: 2100.00,
        status: 'disputed',
        dueDate: '2024-01-20',
        requirements: ['All cabinets installed', 'Countertops fitted', 'Hardware attached']
      },
      {
        id: '5',
        contractId: '2',
        milestoneNumber: 2,
        title: 'Appliance Integration',
        description: 'Install and integrate all kitchen appliances',
        amount: 2100.00,
        status: 'pending',
        dueDate: '2024-02-10',
        requirements: ['Appliances installed', 'All connections completed', 'Testing completed']
      }
    ]
  }
];

export const EscrowTimeline = () => {
  const [contracts, setContracts] = useState(mockContracts);
  const [selectedContract, setSelectedContract] = useState<EscrowContract | null>(null);

  const handleApproveMilestone = (milestoneId: string) => {
    setContracts(prevContracts =>
      prevContracts.map(contract => ({
        ...contract,
        milestones: contract.milestones.map(milestone =>
          milestone.id === milestoneId
            ? { ...milestone, status: 'completed', completedDate: new Date().toISOString() }
            : milestone
        )
      }))
    );
  };

  const handleDisputeMilestone = (milestoneId: string) => {
    setContracts(prevContracts =>
      prevContracts.map(contract => ({
        ...contract,
        milestones: contract.milestones.map(milestone =>
          milestone.id === milestoneId
            ? { ...milestone, status: 'disputed' }
            : milestone
        ),
        disputeCount: contract.milestones.some(m => m.id === milestoneId) ? contract.disputeCount + 1 : contract.disputeCount
      }))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 'pending': return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
      case 'disputed': return <Badge className="bg-red-100 text-red-700">Disputed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Play className="w-5 h-5 text-blue-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'disputed': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const calculateProgress = (milestones: EscrowMilestone[]) => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  };

  const getTotalCompleted = (milestones: EscrowMilestone[]) => {
    return milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const MilestoneTimeline = ({ contract }: { contract: EscrowContract }) => (
    <Card className="card-luxury">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-copper" />
              {contract.jobTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Professional: {contract.professionalName} • Total: €{contract.totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-copper text-white mb-2">
              {contract.escrowStatus.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Progress: {calculateProgress(contract.milestones).toFixed(0)}%
            </div>
          </div>
        </div>
        <Progress value={calculateProgress(contract.milestones)} className="mt-3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contract.milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline connector */}
              {index < contract.milestones.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-sand-dark/20" />
              )}
              
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white relative z-10",
                  milestone.status === 'completed' && "border-green-500 bg-green-50",
                  milestone.status === 'in_progress' && "border-blue-500 bg-blue-50",
                  milestone.status === 'pending' && "border-gray-300 bg-gray-50",
                  milestone.status === 'disputed' && "border-red-500 bg-red-50"
                )}>
                  {getStatusIcon(milestone.status)}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-charcoal">
                        Milestone {milestone.milestoneNumber}: {milestone.title}
                      </h4>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-charcoal">€{milestone.amount.toFixed(2)}</div>
                      {milestone.dueDate && (
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {milestone.description}
                  </p>

                  {milestone.requirements && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">REQUIREMENTS:</p>
                      <div className="space-y-1">
                        {milestone.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              milestone.status === 'completed' ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <span className={cn(
                              milestone.status === 'completed' ? "text-green-700" : "text-muted-foreground"
                            )}>
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {milestone.status === 'in_progress' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveMilestone(milestone.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve & Release
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDisputeMilestone(milestone.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dispute
                      </Button>
                    </div>
                  )}

                  {milestone.completedDate && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                    </div>
                  )}

                  {milestone.status === 'disputed' && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Milestone Disputed</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        This milestone is under dispute resolution. Expected resolution within 48-72 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-sand-light/20 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">TOTAL ESCROW</p>
              <p className="text-lg font-bold text-charcoal">€{contract.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">RELEASED</p>
              <p className="text-lg font-bold text-green-600">€{getTotalCompleted(contract.milestones).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PROGRESS</p>
              <p className="text-lg font-bold text-blue-600">{calculateProgress(contract.milestones).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DISPUTES</p>
              <p className="text-lg font-bold text-red-600">{contract.disputeCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-charcoal">Escrow Timeline</h2>
          <p className="text-muted-foreground">Track milestone progress and escrow releases</p>
        </div>
        <Button className="bg-gradient-hero text-white">
          <Info className="w-4 h-4 mr-2" />
          How Escrow Works
        </Button>
      </div>

      {/* Active Contracts */}
      {contracts.map(contract => (
        <MilestoneTimeline key={contract.id} contract={contract} />
      ))}

      {/* Escrow Protection Information */}
      <Card className="card-luxury border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Escrow Protection Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Milestone-Based Releases</p>
                  <p className="text-sm text-muted-foreground">
                    Payments released only when work is completed and approved
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Dispute Resolution</p>
                  <p className="text-sm text-muted-foreground">
                    Fair mediation process with 48-72 hour resolution guarantee
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-copper mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Full Refund Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Get your money back if work doesn't meet agreed standards
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal">Timeline Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Clear deadlines and progress tracking for all milestones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};