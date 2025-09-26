import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Search, MousePointer, MapPin } from 'lucide-react';
import { useDiscoveryAnalytics } from '@/hooks/useDiscoveryAnalytics';

export const DiscoveryAnalyticsDashboard = () => {
  const { getAnalyticsData } = useDiscoveryAnalytics();
  const analyticsData = getAnalyticsData();

  const analytics = useMemo(() => {
    const totalEvents = analyticsData.length;
    const uniqueSessions = new Set(analyticsData.map(e => e.sessionId)).size;
    
    // Search analytics
    const searchEvents = analyticsData.filter(e => e.event === 'discovery_search');
    const topSearches = searchEvents.reduce((acc, event) => {
      const query = event.properties.query;
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Mode switching analytics
    const modeSwitches = analyticsData.filter(e => e.event === 'discovery_mode_switch');
    const modePreferences = modeSwitches.reduce((acc, event) => {
      const toMode = event.properties.toMode;
      acc[toMode] = (acc[toMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Click analytics
    const clickEvents = analyticsData.filter(e => e.event === 'discovery_item_click');
    const clicksByType = clickEvents.reduce((acc, event) => {
      const type = event.properties.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Location usage
    const locationEvents = analyticsData.filter(e => e.event === 'discovery_location');
    const locationUsage = locationEvents.reduce((acc, event) => {
      const action = event.properties.action;
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Booking conversion
    const bookingEvents = analyticsData.filter(e => e.event === 'discovery_booking_start');
    const conversionRate = totalEvents > 0 ? (bookingEvents.length / totalEvents * 100).toFixed(2) : '0';

    return {
      totalEvents,
      uniqueSessions,
      topSearches: Object.entries(topSearches)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([query, count]) => ({ query, count })),
      modePreferences: Object.entries(modePreferences)
        .map(([mode, count]) => ({ mode, count })),
      clicksByType: Object.entries(clicksByType)
        .map(([type, count]) => ({ type, count })),
      locationUsage,
      bookingEvents: bookingEvents.length,
      conversionRate: parseFloat(conversionRate),
    };
  }, [analyticsData]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings Started</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bookingEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top Search Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSearches}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="query" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mode Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Discovery Mode Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.modePreferences}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({mode, count}) => `${mode}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.modePreferences.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Usage & Click Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.locationUsage).map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="capitalize">{action}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clicks by Content Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.clicksByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Discovery Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {analyticsData.slice(-20).reverse().map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {event.event.replace('discovery_', '')}
                  </Badge>
                  <span className="text-sm">
                    {event.properties.query || event.properties.type || event.properties.mode || 'Event'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};