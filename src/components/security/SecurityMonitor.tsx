import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock,
  Unlock,
  Key,
  Globe,
  Users,
  Activity,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  type: 'authentication' | 'authorization' | 'data_breach' | 'suspicious_activity' | 'system_vulnerability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  affected_users: number;
  source_ip?: string;
  user_agent?: string;
}

interface SecurityMetrics {
  total_threats_blocked: number;
  failed_login_attempts: number;
  suspicious_activities: number;
  data_breaches_prevented: number;
  security_score: number;
  last_security_scan: string;
}

interface RateLimitStatus {
  endpoint: string;
  current_requests: number;
  limit: number;
  reset_time: string;
  status: 'normal' | 'warning' | 'exceeded';
}

export const SecurityMonitor = () => {
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Mock security data - in real implementation, this would come from security monitoring service
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'suspicious_activity',
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          description: 'Unusual number of failed login attempts from IP 192.168.1.100',
          timestamp: '2024-01-16T10:30:00Z',
          status: 'active',
          affected_users: 1,
          source_ip: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: '2',
          type: 'authentication',
          severity: 'medium',
          title: 'Unusual Login Location',
          description: 'User login from new geographic location',
          timestamp: '2024-01-16T09:15:00Z',
          status: 'investigating',
          affected_users: 1,
          source_ip: '203.0.113.45'
        },
        {
          id: '3',
          type: 'system_vulnerability',
          severity: 'low',
          title: 'Outdated Dependency Detected',
          description: 'Non-critical security update available for npm package',
          timestamp: '2024-01-16T08:00:00Z',
          status: 'resolved',
          affected_users: 0
        }
      ];

      const mockMetrics: SecurityMetrics = {
        total_threats_blocked: 247,
        failed_login_attempts: 34,
        suspicious_activities: 12,
        data_breaches_prevented: 3,
        security_score: 94,
        last_security_scan: '2024-01-16T06:00:00Z'
      };

      const mockRateLimits: RateLimitStatus[] = [
        {
          endpoint: '/api/auth/login',
          current_requests: 45,
          limit: 100,
          reset_time: '2024-01-16T11:00:00Z',
          status: 'normal'
        },
        {
          endpoint: '/api/jobs/create',
          current_requests: 78,
          limit: 100,
          reset_time: '2024-01-16T11:00:00Z',
          status: 'warning'
        },
        {
          endpoint: '/api/payments/process',
          current_requests: 95,
          limit: 100,
          reset_time: '2024-01-16T11:00:00Z',
          status: 'exceeded'
        }
      ];

      setSecurityAlerts(mockAlerts);
      setMetrics(mockMetrics);
      setRateLimits(mockRateLimits);
      setLoading(false);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security monitoring data');
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="animate-pulse">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-orange-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'investigating':
        return <Badge variant="default" className="bg-yellow-500"><Eye className="w-3 h-3 mr-1" />Investigating</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRateLimitBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="default" className="bg-green-500">Normal</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Warning</Badge>;
      case 'exceeded':
        return <Badge variant="destructive">Exceeded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Security Monitor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Security Monitor</h2>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Live Monitoring
          </Badge>
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className={`text-3xl font-bold ${getSecurityScoreColor(metrics.security_score)}`}>
                    {metrics.security_score}%
                  </p>
                </div>
                <Shield className={`w-8 h-8 ${getSecurityScoreColor(metrics.security_score)}`} />
              </div>
              <Progress value={metrics.security_score} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Threats Blocked</p>
                  <p className="text-2xl font-bold">{metrics.total_threats_blocked}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed Logins</p>
                  <p className="text-2xl font-bold">{metrics.failed_login_attempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                  <p className="text-2xl font-bold">{metrics.suspicious_activities}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Breaches Prevented</p>
                  <p className="text-2xl font-bold">{metrics.data_breaches_prevented}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Security Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{alert.title}</h4>
                  <div className="flex space-x-2">
                    {getSeverityBadge(alert.severity)}
                    {getStatusBadge(alert.status)}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{alert.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-1">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected:</span>
                    <span className="ml-1">{alert.affected_users} users</span>
                  </div>
                  {alert.source_ip && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="ml-1">{alert.source_ip}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    Investigate
                  </Button>
                  <Button size="sm" variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rate Limit Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Rate Limit Monitor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rateLimits.map((limit, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{limit.endpoint}</span>
                  {getRateLimitBadge(limit.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {limit.current_requests} / {limit.limit} requests
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round((limit.current_requests / limit.limit) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(limit.current_requests / limit.limit) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Resets at {new Date(limit.reset_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Security Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Lock className="w-6 h-6" />
              <span>Force Password Reset</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6" />
              <span>Review User Sessions</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Shield className="w-6 h-6" />
              <span>Enable 2FA Requirement</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Activity className="w-6 h-6" />
              <span>Generate Security Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};