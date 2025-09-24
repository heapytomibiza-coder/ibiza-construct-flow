import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  TrendingUp,  
  TrendingDown,
  RefreshCw,
  Settings,
  Eye,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import AIResultModal from '../AIResultModal';

interface AIFunction {
  name: string;
  status: 'active' | 'inactive' | 'error';
  last_run: string;
  success_rate: number;
  avg_execution_time: number;
  total_runs: number;
  error_count: number;
  description: string;
}

interface AIRun {
  id: string;
  operation_type: string;
  status: string;
  execution_time_ms: number;
  tokens_used: number;
  created_at: string;
  completed_at: string;
  error_message?: string;
  confidence_score?: number;
  input_data: any;
  output_data: any;
}

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  total_functions: number;
  active_functions: number;
  error_functions: number;
  avg_response_time: number;
  success_rate: number;
  daily_runs: number;
}

export default function AISystemMonitor() {
  const [aiFunctions, setAIFunctions] = useState<AIFunction[]>([]);
  const [recentRuns, setRecentRuns] = useState<AIRun[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedRun, setSelectedRun] = useState<AIRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAISystemData();
    const interval = setInterval(loadAISystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAISystemData = async () => {
    setLoading(true);
    try {
      // Load AI runs data
      const { data: runsData, error } = await supabase
        .from('ai_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setRecentRuns(runsData || []);

      // Calculate function metrics from runs data
      const functionMetrics: Record<string, {
        runs: AIRun[];
        successCount: number;
        errorCount: number;
        avgTime: number;
      }> = {};

      runsData?.forEach(run => {
        if (!functionMetrics[run.operation_type]) {
          functionMetrics[run.operation_type] = {
            runs: [],
            successCount: 0,
            errorCount: 0,
            avgTime: 0
          };
        }
        
        functionMetrics[run.operation_type].runs.push(run);
        if (run.status === 'completed') {
          functionMetrics[run.operation_type].successCount++;
        } else if (run.status === 'error') {
          functionMetrics[run.operation_type].errorCount++;
        }
      });

      // Convert to AI functions format
      const functions: AIFunction[] = Object.entries(functionMetrics).map(([name, metrics]) => {
        const totalRuns = metrics.runs.length;
        const successRate = totalRuns > 0 ? (metrics.successCount / totalRuns) * 100 : 0;
        const avgTime = metrics.runs
          .filter(r => r.execution_time_ms)
          .reduce((acc, r) => acc + (r.execution_time_ms || 0), 0) / 
          Math.max(metrics.runs.filter(r => r.execution_time_ms).length, 1);

        const lastRun = metrics.runs[0];
        
        return {
          name,
          status: metrics.errorCount > metrics.successCount ? 'error' as const :
                  totalRuns > 0 ? 'active' as const : 'inactive' as const,
          last_run: lastRun?.created_at || '',
          success_rate: Math.round(successRate),
          avg_execution_time: Math.round(avgTime),
          total_runs: totalRuns,
          error_count: metrics.errorCount,
          description: getFunctionDescription(name)
        };
      });

      setAIFunctions(functions);

      // Calculate system health
      const totalFunctions = functions.length;
      const activeFunctions = functions.filter(f => f.status === 'active').length;
      const errorFunctions = functions.filter(f => f.status === 'error').length;
      const overallSuccessRate = functions.reduce((acc, f) => acc + f.success_rate, 0) / Math.max(totalFunctions, 1);
      const avgResponseTime = functions.reduce((acc, f) => acc + f.avg_execution_time, 0) / Math.max(totalFunctions, 1);
      const dailyRuns = runsData?.filter(r => 
        new Date(r.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      setSystemHealth({
        overall_status: errorFunctions > totalFunctions * 0.3 ? 'critical' :
                      errorFunctions > 0 || overallSuccessRate < 80 ? 'warning' : 'healthy',
        total_functions: totalFunctions,
        active_functions: activeFunctions,
        error_functions: errorFunctions,
        avg_response_time: Math.round(avgResponseTime),
        success_rate: Math.round(overallSuccessRate),
        daily_runs: dailyRuns
      });

    } catch (error) {
      console.error('Error loading AI system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFunctionDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'ai-professional-matcher': 'Matches professionals to jobs based on skills and requirements',
      'ai-price-validator': 'Validates pricing against market standards',
      'ai-communications-drafter': 'Drafts professional communications and messages',
      'ai-question-tester': 'Tests and validates service question flows',
      'ai-anomaly-detector': 'Detects anomalies and potential issues in operations',
      'ai-risk-analyzer': 'Analyzes risks associated with jobs and professionals'
    };
    return descriptions[name] || 'AI function for platform optimization';
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      inactive: { variant: 'secondary' as const, icon: <Pause className="w-3 h-3" /> },
      error: { variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> }
    };
    
    const { variant, icon } = config[status as keyof typeof config] || config.inactive;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getHealthStatus = (status: string) => {
    const config = {
      healthy: { color: 'text-green-600', icon: <CheckCircle className="h-5 w-5" /> },
      warning: { color: 'text-yellow-600', icon: <AlertTriangle className="h-5 w-5" /> },
      critical: { color: 'text-red-600', icon: <AlertCircle className="h-5 w-5" /> }
    };
    
    return config[status as keyof typeof config] || config.healthy;
  };

  const SystemOverview = () => (
    <div className="space-y-6">
      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className={`text-2xl font-bold ${getHealthStatus(systemHealth?.overall_status || 'healthy').color}`}>
                  {systemHealth?.overall_status?.toUpperCase() || 'HEALTHY'}
                </p>
              </div>
              {getHealthStatus(systemHealth?.overall_status || 'healthy').icon}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Functions</p>
                <p className="text-3xl font-bold">{systemHealth?.active_functions || 0}</p>
                <p className="text-xs text-muted-foreground">
                  of {systemHealth?.total_functions || 0} total
                </p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{systemHealth?.success_rate || 0}%</p>
                <Progress value={systemHealth?.success_rate || 0} className="mt-2" />
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Runs</p>
                <p className="text-3xl font-bold">{systemHealth?.daily_runs || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {Math.round((systemHealth?.avg_response_time || 0))}ms
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Functions Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Functions Status
          </CardTitle>
          <CardDescription>Monitor all AI functions and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Function</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Time</TableHead>
                <TableHead>Total Runs</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading AI functions...
                  </TableCell>
                </TableRow>
              ) : aiFunctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No AI functions found
                  </TableCell>
                </TableRow>
              ) : (
                aiFunctions.map((func) => (
                  <TableRow key={func.name}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{func.name}</p>
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(func.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={func.success_rate} className="w-16" />
                        <span className="text-sm">{func.success_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{func.avg_execution_time}ms</TableCell>
                    <TableCell>
                      <Badge variant="outline">{func.total_runs}</Badge>
                    </TableCell>
                    <TableCell>
                      {func.error_count > 0 ? (
                        <Badge variant="destructive">{func.error_count}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {func.last_run ? format(new Date(func.last_run), 'MMM d, HH:mm') : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const ExecutionLogs = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent AI Executions
          </CardTitle>
          <CardDescription>Detailed log of AI function executions and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Function</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Tokens Used</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRuns.map((run) => (
                <TableRow key={run.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="font-medium">{run.operation_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={run.status === 'completed' ? 'default' : 
                                   run.status === 'error' ? 'destructive' : 'secondary'}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {run.execution_time_ms ? `${run.execution_time_ms}ms` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{run.tokens_used || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    {run.confidence_score ? (
                      <div className="flex items-center gap-2">
                        <Progress value={run.confidence_score * 100} className="w-16" />
                        <span className="text-sm">{Math.round(run.confidence_score * 100)}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(run.created_at), 'MMM d, HH:mm:ss')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedRun(run)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
          <h2 className="text-2xl font-bold">AI System Monitor</h2>
          <p className="text-muted-foreground">
            Monitor AI function performance, execution logs, and system health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAISystemData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* AI System Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <SystemOverview />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <ExecutionLogs />
        </TabsContent>
      </Tabs>

      {/* AI Result Modal */}
      {selectedRun && (
        <AIResultModal
          isOpen={!!selectedRun}
          onClose={() => setSelectedRun(null)}
          runId={selectedRun.id}
        />
      )}
    </div>
  );
}