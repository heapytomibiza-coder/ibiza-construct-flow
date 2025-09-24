import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  AlertCircle, 
  Shield, 
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MessageSquare,
  Users,
  MapPin,
  DollarSign,
  FileText,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface RiskFlag {
  id: string;
  job_id: string;
  flag_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggested_action: string;
  resolved_at: string | null;
  created_at: string;
  // Joined data
  job_title?: string;
  client_name?: string;
  professional_name?: string;
}

interface SafetyCompliance {
  professional_id: string;
  compliance_score: number;
  last_check: string;
  certifications: string[];
  expired_docs: number;
  missing_requirements: string[];
  // Joined data
  professional_name?: string;
  verification_status?: string;
}

interface DisputeCase {
  id: string;
  type: 'payment' | 'quality' | 'safety' | 'communication';
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  job_id: string;
  client_id: string;
  professional_id: string;
  description: string;
  created_at: string;
  resolved_at?: string;
  // Joined data
  job_title?: string;
  client_name?: string;
  professional_name?: string;
}

export default function RiskManagement() {
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [safetyCompliance, setSafetyCompliance] = useState<SafetyCompliance[]>([]);
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedFlag, setSelectedFlag] = useState<RiskFlag | null>(null);
  const [stats, setStats] = useState({
    total_flags: 0,
    critical_flags: 0,
    resolved_flags: 0,
    pending_disputes: 0,
    safety_violations: 0,
    compliance_rate: 0
  });

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      // Load risk flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('ai_risk_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (flagsError) throw flagsError;

      // Mock additional data for demonstration
      const enhancedFlags = flagsData?.map(flag => ({
        ...flag,
        severity: flag.severity as 'low' | 'medium' | 'high' | 'critical',
        job_title: `Job #${flag.job_id.slice(0, 8)}`,
        client_name: 'Client User',
        professional_name: 'Professional User'
      })) || [];

      setRiskFlags(enhancedFlags);

      // Mock safety compliance data
      const mockCompliance: SafetyCompliance[] = [
        {
          professional_id: '1',
          compliance_score: 85,
          last_check: new Date().toISOString(),
          certifications: ['First Aid', 'Safety Training'],
          expired_docs: 1,
          missing_requirements: ['Insurance Update'],
          professional_name: 'John Smith',
          verification_status: 'verified'
        },
        {
          professional_id: '2',
          compliance_score: 92,
          last_check: new Date().toISOString(),
          certifications: ['First Aid', 'Safety Training', 'Advanced Certification'],
          expired_docs: 0,
          missing_requirements: [],
          professional_name: 'Sarah Johnson',
          verification_status: 'verified'
        },
        {
          professional_id: '3',
          compliance_score: 65,
          last_check: new Date().toISOString(),
          certifications: ['Basic Training'],
          expired_docs: 2,
          missing_requirements: ['First Aid', 'Insurance'],
          professional_name: 'Mike Wilson',
          verification_status: 'pending'
        }
      ];

      setSafetyCompliance(mockCompliance);

      // Mock dispute cases
      const mockDisputes: DisputeCase[] = [
        {
          id: '1',
          type: 'quality',
          status: 'investigating',
          priority: 'high',
          job_id: 'job1',
          client_id: 'client1',
          professional_id: 'prof1',
          description: 'Work quality not meeting expectations',
          created_at: new Date().toISOString(),
          job_title: 'Kitchen Renovation',
          client_name: 'Alice Brown',
          professional_name: 'Bob Green'
        },
        {
          id: '2',
          type: 'payment',
          status: 'open',
          priority: 'medium',
          job_id: 'job2',
          client_id: 'client2',
          professional_id: 'prof2',
          description: 'Payment dispute over additional work',
          created_at: new Date().toISOString(),
          job_title: 'Bathroom Repair',
          client_name: 'Tom Davis',
          professional_name: 'Lisa White'
        }
      ];

      setDisputes(mockDisputes);

      // Calculate stats
      const criticalFlags = enhancedFlags.filter(f => f.severity === 'critical').length;
      const resolvedFlags = enhancedFlags.filter(f => f.resolved_at).length;
      const pendingDisputes = mockDisputes.filter(d => d.status !== 'resolved').length;
      const safetyViolations = mockCompliance.filter(c => c.compliance_score < 70).length;
      const avgCompliance = mockCompliance.reduce((acc, c) => acc + c.compliance_score, 0) / mockCompliance.length;

      setStats({
        total_flags: enhancedFlags.length,
        critical_flags: criticalFlags,
        resolved_flags: resolvedFlags,
        pending_disputes: pendingDisputes,
        safety_violations: safetyViolations,
        compliance_rate: Math.round(avgCompliance)
      });

    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      low: { variant: 'outline' as const, className: 'border-blue-500 text-blue-700' },
      medium: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      high: { variant: 'destructive' as const, className: 'bg-orange-100 text-orange-800' },
      critical: { variant: 'destructive' as const, className: 'bg-red-500 text-white' }
    };
    
    const { variant, className } = config[severity as keyof typeof config] || config.low;
    
    return (
      <Badge variant={variant} className={className}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const RiskFlagsTab = () => (
    <div className="space-y-6">
      {/* Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Risk Flags</p>
                <p className="text-3xl font-bold">{stats.total_flags}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.resolved_flags} resolved
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Flags</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical_flags}</p>
                <p className="text-xs text-red-600">Require immediate attention</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                <p className="text-3xl font-bold">
                  {stats.total_flags > 0 ? Math.round((stats.resolved_flags / stats.total_flags) * 100) : 0}%
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% this week
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Disputes</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending_disputes}</p>
                <p className="text-xs text-muted-foreground">Awaiting resolution</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Flags Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Flags Monitor
              </CardTitle>
              <CardDescription>AI-detected risks and safety concerns</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRiskData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Suggested Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskFlags
                .filter(flag => severityFilter === 'all' || flag.severity === severityFilter)
                .filter(flag => !searchTerm || 
                  flag.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  flag.flag_type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {flag.flag_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{getSeverityBadge(flag.severity)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{flag.job_title}</p>
                      <p className="text-sm text-muted-foreground">ID: {flag.job_id.slice(0, 8)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-xs truncate">{flag.message}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-xs truncate">{flag.suggested_action}</p>
                  </TableCell>
                  <TableCell>
                    {flag.resolved_at ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(flag.created_at), 'MMM d, HH:mm')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              Risk Flag Details
                            </DialogTitle>
                            <DialogDescription>
                              Detailed information about this risk flag
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Risk Type</label>
                                <p className="text-sm text-muted-foreground">{flag.flag_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Severity</label>
                                <div className="mt-1">{getSeverityBadge(flag.severity)}</div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Message</label>
                              <p className="text-sm text-muted-foreground mt-1">{flag.message}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Suggested Action</label>
                              <p className="text-sm text-muted-foreground mt-1">{flag.suggested_action}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline">Contact Professional</Button>
                              <Button>Mark as Resolved</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {!flag.resolved_at && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const SafetyComplianceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety Compliance Tracking
          </CardTitle>
          <CardDescription>Monitor professional safety compliance and certifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professional</TableHead>
                <TableHead>Compliance Score</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Expired Docs</TableHead>
                <TableHead>Missing Requirements</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safetyCompliance.map((compliance) => (
                <TableRow key={compliance.professional_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{compliance.professional_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {compliance.verification_status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getComplianceColor(compliance.compliance_score)}`}>
                        {compliance.compliance_score}%
                      </span>
                      <div className="w-16">
                        <div className={`h-2 rounded-full ${
                          compliance.compliance_score >= 90 ? 'bg-green-500' :
                          compliance.compliance_score >= 80 ? 'bg-yellow-500' :
                          compliance.compliance_score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${compliance.compliance_score}%` }} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {compliance.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {compliance.expired_docs > 0 ? (
                      <Badge variant="destructive">{compliance.expired_docs}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {compliance.missing_requirements.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {compliance.missing_requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-red-600">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-green-600">All requirements met</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(compliance.last_check), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Management Center</h2>
          <p className="text-muted-foreground">
            Monitor risks, safety compliance, and dispute resolution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Risk Management Tabs */}
      <Tabs defaultValue="flags">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flags">Risk Flags</TabsTrigger>
          <TabsTrigger value="safety">Safety Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flags" className="mt-6">
          <RiskFlagsTab />
        </TabsContent>
        
        <TabsContent value="safety" className="mt-6">
          <SafetyComplianceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}