import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Camera,
  FileText,
  Star,
  Clock,
  Users,
  TrendingUp,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QualityCheck {
  id: string;
  job_id: string;
  job_title: string;
  professional_name: string;
  check_type: 'photo_verification' | 'document_review' | 'client_feedback' | 'compliance_check';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'requires_attention';
  score: number;
  max_score: number;
  issues_found: string[];
  recommendations: string[];
  created_at: string;
  completed_at?: string;
  ai_confidence: number;
}

interface QualityMetrics {
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  avg_score: number;
  avg_processing_time: number;
  ai_accuracy: number;
}

interface ComplianceAlert {
  id: string;
  alert_type: 'safety_violation' | 'quality_issue' | 'documentation_missing' | 'policy_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  job_id: string;
  job_title: string;
  professional_id: string;
  professional_name: string;
  description: string;
  action_required: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export const QualityAssurance = () => {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadQualityData();
  }, []);

  const loadQualityData = async () => {
    try {
      // Mock quality data - in real implementation, this would come from database
      const mockQualityChecks: QualityCheck[] = [
        {
          id: '1',
          job_id: 'job_001',
          job_title: 'Kitchen Cabinet Installation',
          professional_name: 'John Smith',
          check_type: 'photo_verification',
          status: 'passed',
          score: 92,
          max_score: 100,
          issues_found: [],
          recommendations: ['Excellent craftsmanship', 'Clean work area'],
          created_at: '2024-01-15T10:30:00Z',
          completed_at: '2024-01-15T10:45:00Z',
          ai_confidence: 94
        },
        {
          id: '2',
          job_id: 'job_002',
          job_title: 'Emergency Plumbing Repair',
          professional_name: 'Sarah Johnson',
          check_type: 'compliance_check',
          status: 'requires_attention',
          score: 78,
          max_score: 100,
          issues_found: ['Missing safety equipment documentation', 'Water damage assessment incomplete'],
          recommendations: ['Upload safety equipment photos', 'Complete damage assessment form'],
          created_at: '2024-01-15T09:15:00Z',
          ai_confidence: 87
        },
        {
          id: '3',
          job_id: 'job_003',
          job_title: 'HVAC System Maintenance',
          professional_name: 'Mike Williams',
          check_type: 'document_review',
          status: 'in_progress',
          score: 0,
          max_score: 100,
          issues_found: [],
          recommendations: [],
          created_at: '2024-01-15T11:00:00Z',
          ai_confidence: 0
        },
        {
          id: '4',
          job_id: 'job_004',
          job_title: 'Electrical Panel Upgrade',
          professional_name: 'Lisa Chen',
          check_type: 'client_feedback',
          status: 'failed',
          score: 45,
          max_score: 100,
          issues_found: ['Client reported incomplete work', 'Missing permit documentation'],
          recommendations: ['Schedule follow-up visit', 'Obtain required permits'],
          created_at: '2024-01-14T16:30:00Z',
          completed_at: '2024-01-14T17:15:00Z',
          ai_confidence: 89
        }
      ];

      const mockMetrics: QualityMetrics = {
        total_checks: 1247,
        passed_checks: 1089,
        failed_checks: 158,
        avg_score: 87.3,
        avg_processing_time: 12.5,
        ai_accuracy: 94.2
      };

      const mockComplianceAlerts: ComplianceAlert[] = [
        {
          id: '1',
          alert_type: 'safety_violation',
          severity: 'high',
          job_id: 'job_005',
          job_title: 'Electrical Wiring Installation',
          professional_id: 'pro_001',
          professional_name: 'Bob Anderson',
          description: 'Work performed without proper electrical permit',
          action_required: 'Obtain electrical permit and schedule inspection',
          deadline: '2024-01-18T00:00:00Z',
          status: 'open'
        },
        {
          id: '2',
          alert_type: 'quality_issue',
          severity: 'medium',
          job_id: 'job_006',
          job_title: 'Bathroom Renovation',
          professional_id: 'pro_002',
          professional_name: 'Alice Cooper',
          description: 'Client reported water leakage after completion',
          action_required: 'Schedule follow-up repair visit',
          deadline: '2024-01-17T00:00:00Z',
          status: 'in_progress'
        },
        {
          id: '3',
          alert_type: 'documentation_missing',
          severity: 'low',
          job_id: 'job_007',
          job_title: 'Garden Landscaping',
          professional_id: 'pro_003',
          professional_name: 'David Green',
          description: 'Before/after photos not uploaded',
          action_required: 'Upload required documentation photos',
          deadline: '2024-01-19T00:00:00Z',
          status: 'open'
        }
      ];

      setQualityChecks(mockQualityChecks);
      setMetrics(mockMetrics);
      setComplianceAlerts(mockComplianceAlerts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading quality data:', error);
      toast.error('Failed to load quality assurance data');
      setLoading(false);
    }
  };

  const runQualityCheck = async (checkId: string) => {
    setIsProcessing(true);
    try {
      // Simulate AI quality check process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the check status
      setQualityChecks(prev => 
        prev.map(check => 
          check.id === checkId 
            ? { 
                ...check, 
                status: 'passed',
                score: Math.floor(Math.random() * 30) + 70,
                completed_at: new Date().toISOString(),
                ai_confidence: Math.floor(Math.random() * 20) + 80
              }
            : check
        )
      );
      
      toast.success('Quality check completed');
    } catch (error) {
      console.error('Error running quality check:', error);
      toast.error('Failed to run quality check');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'requires_attention':
        return <Badge variant="default" className="bg-orange-500"><AlertTriangle className="w-3 h-3 mr-1" />Attention</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getCheckTypeIcon = (type: string) => {
    switch (type) {
      case 'photo_verification':
        return <Camera className="w-4 h-4" />;
      case 'document_review':
        return <FileText className="w-4 h-4" />;
      case 'client_feedback':
        return <Star className="w-4 h-4" />;
      case 'compliance_check':
        return <Shield className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Quality Assurance...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Quality Assurance</h2>
          <p className="text-muted-foreground">AI-powered quality monitoring and compliance management</p>
        </div>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Processing...</span>
            </div>
          )}
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Run Batch Check
          </Button>
        </div>
      </div>

      {/* Quality Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Checks</p>
                  <p className="text-2xl font-bold">{metrics.total_checks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold">{metrics.passed_checks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{metrics.failed_checks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{metrics.avg_score}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Time (min)</p>
                  <p className="text-2xl font-bold">{metrics.avg_processing_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Accuracy</p>
                  <p className="text-2xl font-bold">{metrics.ai_accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Quality Checks</TabsTrigger>
          <TabsTrigger value="alerts">Compliance Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Quality Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <div className="grid gap-4">
            {qualityChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        {getCheckTypeIcon(check.check_type)}
                        <h3 className="font-semibold">{check.job_title}</h3>
                        {getStatusBadge(check.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional: {check.professional_name} • Type: {check.check_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {check.score > 0 ? `${check.score}/${check.max_score}` : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {check.ai_confidence > 0 && `AI Confidence: ${check.ai_confidence}%`}
                      </div>
                    </div>
                  </div>

                  {check.score > 0 && (
                    <div className="mb-4">
                      <Progress value={(check.score / check.max_score) * 100} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {check.issues_found.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Issues Found:</p>
                        <ul className="text-sm space-y-1">
                          {check.issues_found.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <AlertTriangle className="w-3 h-3 mr-1 text-orange-500 mt-0.5" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {check.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Recommendations:</p>
                        <ul className="text-sm space-y-1">
                          {check.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-3 h-3 mr-1 text-green-500 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(check.created_at).toLocaleDateString()}
                      {check.completed_at && (
                        <span> • Completed: {new Date(check.completed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {check.status === 'in_progress' || check.status === 'pending' ? (
                        <Button 
                          size="sm" 
                          onClick={() => runQualityCheck(check.id)}
                          disabled={isProcessing}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Run Check
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {complianceAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold">{alert.job_title}</h3>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional: {alert.professional_name} • Type: {alert.alert_type.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant={alert.status === 'resolved' ? 'default' : 'secondary'}>
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm mb-2"><strong>Description:</strong> {alert.description}</p>
                    <p className="text-sm mb-2"><strong>Action Required:</strong> {alert.action_required}</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Deadline:</strong> {new Date(alert.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Resolved
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quality analytics and trending data will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};