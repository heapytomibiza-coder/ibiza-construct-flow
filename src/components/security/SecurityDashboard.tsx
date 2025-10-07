import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { Shield, AlertTriangle, Activity, Monitor, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const SecurityDashboard = () => {
  const { events, sessions, suspiciousActivity, isLoading, revokeSession } = useSecurityMonitor();

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-32" />
        </Card>
      ))}
    </div>;
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      {suspiciousActivity?.suspicious && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Suspicious Activity Detected</AlertTitle>
          <AlertDescription>
            We've detected unusual activity on your account. Please review your recent sessions below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85/100</div>
            <p className="text-xs text-muted-foreground">Good security posture</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Devices logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Activity and alerts from your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events && events.length > 0 ? (
                events.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{event.event_type}</p>
                        <Badge variant={severityColor(event.severity) as any}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.event_category} - {new Date(event.detected_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={event.status === 'resolved' ? 'default' : 'outline'}>
                      {event.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No security events recorded
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Devices and locations where you're signed in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {session.device_info?.os || 'Unknown Device'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip_address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(session.last_activity_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active sessions
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>Improve your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Enable Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Review Privacy Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Control how your data is used and shared
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>

                <div className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Update Password</p>
                    <p className="text-sm text-muted-foreground">
                      Change your password regularly for better security
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
